const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const IMAGE_LIBRARY = require('../data/imageLibrary');

// ── Helpers ──────────────────────────────────────────────────
const getImageById = (id) => IMAGE_LIBRARY.find((img) => img.id === id);

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getRandomImages = (count, excludeIds = [], category = 'mixed') => {
  let pool = IMAGE_LIBRARY;
  
  if (category && category !== 'mixed') {
    pool = pool.filter(img => img.category === category);
  }

  let availablePool = pool.filter(img => !excludeIds.includes(img.id));
  
  if (availablePool.length < count) {
    const needed = count - availablePool.length;
    const excludedPool = pool.filter(img => excludeIds.includes(img.id));
    const reused = shuffleArray(excludedPool).slice(0, needed);
    availablePool = [...availablePool, ...reused];
  }

  return shuffleArray(availablePool).slice(0, count);
};

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || null;

// ── Check Account Lock ────────────────────────────────────────
const checkAccountLock = async (userId) => {
  const result = await query(
    'SELECT account_status, locked_until, failed_attempt_count FROM users WHERE id=$1',
    [userId]
  );
  if (!result.rows.length) return { locked: false };
  const user = result.rows[0];

  if (user.account_status === 'locked') {
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remaining = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return { locked: true, remaining };
    }
    // Unlock if duration passed
    await query(
      `UPDATE users SET account_status='active', failed_attempt_count=0, locked_until=NULL WHERE id=$1`,
      [userId]
    );
  }
  return { locked: false };
};

// ── Handle Failed Attempt ─────────────────────────────────────
const handleFailedAttempt = async (userId, ip) => {
  const threshold = parseInt(process.env.ACCOUNT_LOCK_THRESHOLD) || 3;
  const lockMs = parseInt(process.env.ACCOUNT_LOCK_DURATION_MS) || 900000;

  const result = await query(
    `UPDATE users SET failed_attempt_count = failed_attempt_count + 1 WHERE id=$1
     RETURNING failed_attempt_count`,
    [userId]
  );
  const count = result.rows[0]?.failed_attempt_count || 0;

  // Lock check
  if (count >= threshold) {
    const lockedUntil = new Date(Date.now() + lockMs);
    await query(
      `UPDATE users SET account_status='locked', locked_until=$1 WHERE id=$2`,
      [lockedUntil, userId]
    );
    await query(
      `INSERT INTO security_alerts (user_id, alert_type, severity, message, ip_address)
       VALUES ($1, 'account_locked', 'critical', $2, $3)`,
      [userId, `Account locked after ${count} failed login attempts`, ip]
    );
    return { locked: true, lockDurationMinutes: Math.ceil(lockMs / 60000) };
  }

  // Generate alert at intervals
  if (count === 2) {
    await query(
      `INSERT INTO security_alerts (user_id, alert_type, severity, message, ip_address)
       VALUES ($1, 'repeated_failures', 'medium', $2, $3)`,
      [userId, `2 consecutive failed login attempts detected`, ip]
    );
  }

  return { locked: false, failedCount: count };
};

// ══════════════════════════════════════════════════════════════
// POST /auth/register
// ══════════════════════════════════════════════════════════════
const register = async (req, res, next) => {
  const client = await require('../config/db').getClient();
  try {
    const { name, email, cues, imageSequence, imageCategory = 'mixed' } = req.body;

    // Validate cues array
    if (!Array.isArray(cues) || cues.length < 3 || cues.length > 5) {
      return res.status(400).json({ success: false, message: 'You must provide between 3 and 5 memory cues.' });
    }

    // Validate each cue: 1-6 chars, alphanumeric only
    const cueRegex = /^[a-zA-Z0-9!@#$%^&*_+=\-?.,]{1,6}$/;
    for (let i = 0; i < cues.length; i++) {
      if (!cueRegex.test(cues[i])) {
        return res.status(400).json({
          success: false,
          message: `Cue ${i + 1} is invalid. Use 1–6 alphanumeric characters only (letters and numbers, no spaces or special characters).`,
        });
      }
    }

    // Validate imageSequence array matches cues length
    if (!Array.isArray(imageSequence) || imageSequence.length !== cues.length) {
      return res.status(400).json({
        success: false,
        message: `You must select exactly one image for each of your ${cues.length} memory cues.`,
      });
    }

    // Validate each image exists in library
    for (const imgId of imageSequence) {
      if (!getImageById(imgId)) {
        return res.status(400).json({ success: false, message: `Invalid image ID: ${imgId}` });
      }
    }

    // Prevent duplicate image selections
    const uniqueImages = new Set(imageSequence);
    if (uniqueImages.size !== imageSequence.length) {
      return res.status(400).json({ success: false, message: 'Duplicate image selections are not allowed.' });
    }

    // Check email exists
    const existing = await client.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash the image sequence (join image IDs into ordered string, then bcrypt)
    const sequenceString = imageSequence.join(':');
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const sequenceHash = await bcrypt.hash(sequenceString, bcryptRounds);

    await client.query('BEGIN');

    // 1. Create user
    const userResult = await client.query(
      `INSERT INTO users (name, email, image_category) VALUES ($1, $2, $3) RETURNING id, name, email, image_category, created_at`,
      [name.trim(), email.toLowerCase().trim(), imageCategory]
    );
    const user = userResult.rows[0];

    // 2. Insert memory cues
    const cueIds = [];
    for (let i = 0; i < cues.length; i++) {
      const cueResult = await client.query(
        `INSERT INTO user_memory_cues (user_id, cue_value, cue_order) VALUES ($1, $2, $3) RETURNING id`,
        [user.id, cues[i], i + 1]
      );
      cueIds.push(cueResult.rows[0].id);
    }

    // 3. Insert image mappings
    for (let i = 0; i < imageSequence.length; i++) {
      await client.query(
        `INSERT INTO user_image_mappings (user_id, cue_id, image_id, image_order)
         VALUES ($1, $2, $3, $4)`,
        [user.id, cueIds[i], imageSequence[i], i + 1]
      );
    }

    // 4. Store hashed auth sequence
    await client.query(
      `INSERT INTO auth_sequences (user_id, sequence_hash, sequence_length)
       VALUES ($1, $2, $3)`,
      [user.id, sequenceHash, imageSequence.length]
    );

    await client.query('COMMIT');

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your graphical password has been created.',
      token,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ══════════════════════════════════════════════════════════════
// GET /auth/image-options?cueIndex=0&alreadySelected=img1,img2
// Returns 6 random image options for a given cue
// ══════════════════════════════════════════════════════════════
const getImageOptions = async (req, res, next) => {
  try {
    const alreadySelected = req.query.alreadySelected
      ? req.query.alreadySelected.split(',').filter(Boolean)
      : [];
    const category = req.query.category || 'mixed';

    const options = getRandomImages(6, alreadySelected, category);

    res.json({
      success: true,
      options: options.map((img) => ({
        id: img.id,
        name: img.name,
        category: img.category,
        emoji: img.emoji,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// POST /auth/login
// ══════════════════════════════════════════════════════════════
const login = async (req, res, next) => {
  try {
    const { email, selectedSequence } = req.body;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Fetch user
    const userResult = await query(
      `SELECT id, name, email, account_status, failed_attempt_count, locked_until, image_category
       FROM users WHERE email=$1`,
      [email.toLowerCase().trim()]
    );

    // Log attempt (even for unknown emails)
    const logAttempt = async (userId, success) => {
      await query(
        `INSERT INTO login_attempts (user_id, email_attempted, attempted_sequence, success, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, email.toLowerCase(), selectedSequence?.join(':') || null, success, ip, userAgent]
      );
    };

    if (!userResult.rows.length) {
      await logAttempt(null, false);
      // Timing-safe: don't reveal whether email exists
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    // Check account lock
    const lockStatus = await checkAccountLock(user.id);
    if (lockStatus.locked) {
      await logAttempt(user.id, false);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to too many failed attempts. Please try again in ${lockStatus.remaining} minute(s).`,
        lockedFor: lockStatus.remaining,
      });
    }

    // Phase 1: Just email — return grid data
    if (!selectedSequence) {
      const authSeq = await query(
        `SELECT sequence_length FROM auth_sequences WHERE user_id=$1`,
        [user.id]
      );
      if (!authSeq.rows.length) {
        return res.status(400).json({ success: false, message: 'No graphical password configured for this account.' });
      }

      const mappings = await query(
        `SELECT image_id FROM user_image_mappings WHERE user_id=$1 ORDER BY image_order ASC`,
        [user.id]
      );
      const correctIds = mappings.rows.map((r) => r.image_id);

      // Build shuffled 4x4 grid (correct + decoys)
      const decoysNeeded = 16 - correctIds.length;
      let availableDecoys = IMAGE_LIBRARY.filter(img => !correctIds.includes(img.id));
      let decoys = [];

      if (user.image_category && user.image_category !== 'mixed') {
        const categoryDecoys = shuffleArray(availableDecoys.filter(img => img.category === user.image_category));
        decoys = [...categoryDecoys.slice(0, decoysNeeded)];
        if (decoys.length < decoysNeeded) {
          const paddingPool = shuffleArray(availableDecoys.filter(img => img.category !== user.image_category));
          decoys = [...decoys, ...paddingPool.slice(0, decoysNeeded - decoys.length)];
        }
      } else {
        decoys = shuffleArray(availableDecoys).slice(0, decoysNeeded);
      }

      const correctImages = correctIds.map(getImageById).filter(Boolean);
      const grid = shuffleArray([...correctImages, ...decoys]);

      return res.json({
        success: true,
        gridImages: grid.map((img) => ({
          id: img.id,
          name: img.name,
          category: img.category,
          emoji: img.emoji,
        })),
        sequenceLength: authSeq.rows[0].sequence_length,
        userId: user.id,
      });
    }

    // Phase 2: Verify selected sequence
    if (!Array.isArray(selectedSequence) || selectedSequence.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select your image sequence.' });
    }

    const authSeqResult = await query(
      `SELECT sequence_hash, sequence_length FROM auth_sequences WHERE user_id=$1`,
      [user.id]
    );
    if (!authSeqResult.rows.length) {
      return res.status(400).json({ success: false, message: 'Authentication data not found.' });
    }

    const { sequence_hash, sequence_length } = authSeqResult.rows[0];

    if (selectedSequence.length !== sequence_length) {
      await logAttempt(user.id, false);
      await handleFailedAttempt(user.id, ip);
      return res.status(401).json({
        success: false,
        message: `Please select exactly ${sequence_length} images in your registered order.`,
      });
    }

    const inputSequenceString = selectedSequence.join(':');
    const isMatch = await bcrypt.compare(inputSequenceString, sequence_hash);

    if (!isMatch) {
      await logAttempt(user.id, false);
      const lockResult = await handleFailedAttempt(user.id, ip);
      if (lockResult.locked) {
        return res.status(423).json({
          success: false,
          message: `Too many failed attempts. Account locked for ${lockResult.lockDurationMinutes} minutes.`,
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Incorrect image sequence. Please try again.',
        attemptsLeft: Math.max(0, (parseInt(process.env.ACCOUNT_LOCK_THRESHOLD) || 3) - (lockResult.failedCount || 0)),
      });
    }

    // Success!
    await logAttempt(user.id, true);
    await query(
      `UPDATE users SET failed_attempt_count=0, locked_until=NULL WHERE id=$1`,
      [user.id]
    );

    const token = signToken(user.id);

    res.json({
      success: true,
      message: 'Login successful! Welcome back.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// GET /auth/me — Protected
// ══════════════════════════════════════════════════════════════
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.account_status, u.created_at,
              umc.cue_value, umc.cue_order,
              uim.image_id, uim.image_order
       FROM users u
       LEFT JOIN user_memory_cues umc ON umc.user_id = u.id
       LEFT JOIN user_image_mappings uim ON uim.user_id = u.id AND uim.cue_id = umc.id
       WHERE u.id=$1
       ORDER BY umc.cue_order`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const row = result.rows[0];
    const cues = result.rows
      .filter((r) => r.cue_order)
      .map((r) => ({ order: r.cue_order, cue: r.cue_value, imageId: r.image_id }))
      .sort((a, b) => a.order - b.order);

    res.json({
      success: true,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        status: row.account_status,
        createdAt: row.created_at,
        sequenceLength: cues.length,
        cueCount: cues.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, getImageOptions, login, getMe };
