-- ============================================================
-- Memory-Assisted Graphical Password Authentication System
-- Database Schema — PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table 1: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(100) NOT NULL,
  email               VARCHAR(255) NOT NULL UNIQUE,
  account_status      VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (account_status IN ('active', 'locked', 'suspended')),
  failed_attempt_count INTEGER NOT NULL DEFAULT 0,
  locked_until        TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(account_status);

-- ============================================================
-- Table 2: user_memory_cues
-- Stores the alphanumeric memory cues in order
-- ============================================================
CREATE TABLE IF NOT EXISTS user_memory_cues (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cue_value   VARCHAR(6) NOT NULL,
  cue_order   INTEGER NOT NULL CHECK (cue_order BETWEEN 1 AND 5),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cue_order)
);

CREATE INDEX IF NOT EXISTS idx_cues_user ON user_memory_cues(user_id);

-- ============================================================
-- Table 3: user_image_mappings
-- Maps each cue to the selected image_id
-- ============================================================
CREATE TABLE IF NOT EXISTS user_image_mappings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cue_id      UUID NOT NULL REFERENCES user_memory_cues(id) ON DELETE CASCADE,
  image_id    VARCHAR(20) NOT NULL,
  image_order INTEGER NOT NULL CHECK (image_order BETWEEN 1 AND 5),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, image_id),
  UNIQUE (user_id, image_order)
);

CREATE INDEX IF NOT EXISTS idx_mappings_user ON user_image_mappings(user_id);

-- ============================================================
-- Table 4: auth_sequences
-- Stores the bcrypt-hashed graphical password sequence
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_sequences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sequence_hash   TEXT NOT NULL,
  sequence_length INTEGER NOT NULL CHECK (sequence_length BETWEEN 3 AND 5),
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_user ON auth_sequences(user_id);

-- ============================================================
-- Table 5: login_attempts
-- Logs every login attempt
-- ============================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  email_attempted     VARCHAR(255),
  attempted_sequence  TEXT,
  success             BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address          INET,
  user_agent          TEXT,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_user   ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_email  ON login_attempts(email_attempted);
CREATE INDEX IF NOT EXISTS idx_attempts_time   ON login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_ip     ON login_attempts(ip_address);

-- ============================================================
-- Table 6: security_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS security_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  alert_type  VARCHAR(50) NOT NULL
                CHECK (alert_type IN (
                  'repeated_failures',
                  'rapid_attempts',
                  'account_locked',
                  'multiple_ips',
                  'suspicious_pattern'
                )),
  severity    VARCHAR(10) NOT NULL DEFAULT 'medium'
                CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message     TEXT NOT NULL,
  ip_address  INET,
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user     ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type     ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_time     ON security_alerts(created_at DESC);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER auth_seq_updated_at
  BEFORE UPDATE ON auth_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
