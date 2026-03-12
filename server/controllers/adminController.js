const { query } = require('../config/db');

// ══════════════════════════════════════════════════════════════
// GET /admin/logs — Recent login attempts
// ══════════════════════════════════════════════════════════════
const getLogs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT la.id, la.email_attempted, u.name as user_name,
              la.success, la.ip_address, la.user_agent, la.created_at,
              CASE WHEN la.attempted_sequence IS NOT NULL THEN 'sequence_provided' ELSE 'no_sequence' END as phase
       FROM login_attempts la
       LEFT JOIN users u ON u.id = la.user_id
       ORDER BY la.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM login_attempts');

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
      logs: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// GET /admin/alerts — Security alerts
// ══════════════════════════════════════════════════════════════
const getAlerts = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const severity = req.query.severity;

    let sql = `
      SELECT sa.id, sa.alert_type, sa.severity, sa.message, sa.ip_address,
             sa.resolved, sa.created_at, u.name as user_name, u.email as user_email
      FROM security_alerts sa
      LEFT JOIN users u ON u.id = sa.user_id
    `;
    const params = [];
    if (severity) {
      sql += ` WHERE sa.severity=$1`;
      params.push(severity);
    }
    sql += ` ORDER BY sa.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);
    const countResult = await query('SELECT COUNT(*) FROM security_alerts');

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      alerts: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// GET /admin/stats — Dashboard summary stats
// ══════════════════════════════════════════════════════════════
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, lockedUsers, totalAttempts, failedAttempts, recentAlerts] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query(`SELECT COUNT(*) FROM users WHERE account_status='locked'`),
      query('SELECT COUNT(*) FROM login_attempts'),
      query(`SELECT COUNT(*) FROM login_attempts WHERE success=false`),
      query(`SELECT COUNT(*) FROM security_alerts WHERE resolved=false`),
    ]);

    const recentActivity = await query(
      `SELECT DATE(created_at) as date,
              COUNT(*) as total,
              SUM(CASE WHEN success THEN 1 ELSE 0 END) as successes,
              SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failures
       FROM login_attempts
       WHERE created_at > NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    const lockedUsersList = await query(
      `SELECT id, name, email, failed_attempt_count, locked_until
       FROM users WHERE account_status='locked' ORDER BY locked_until DESC`
    );

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        lockedUsers: parseInt(lockedUsers.rows[0].count),
        totalAttempts: parseInt(totalAttempts.rows[0].count),
        failedAttempts: parseInt(failedAttempts.rows[0].count),
        unresolvedAlerts: parseInt(recentAlerts.rows[0].count),
        successRate:
          parseInt(totalAttempts.rows[0].count) > 0
            ? (
                ((parseInt(totalAttempts.rows[0].count) - parseInt(failedAttempts.rows[0].count)) /
                  parseInt(totalAttempts.rows[0].count)) *
                100
              ).toFixed(1)
            : 0,
      },
      recentActivity: recentActivity.rows,
      lockedUsers: lockedUsersList.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// PATCH /admin/users/:id/unlock — Unlock a user account
// ══════════════════════════════════════════════════════════════
const unlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE users SET account_status='active', failed_attempt_count=0, locked_until=NULL
       WHERE id=$1 RETURNING id, name, email`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'User account unlocked.', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs, getAlerts, getStats, unlockUser };
