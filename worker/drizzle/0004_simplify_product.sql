-- Remove historical emails and tables used only by the retired public API and stats.
DELETE FROM emails;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS mailboxes;
DROP TABLE IF EXISTS site_stats;
DROP TABLE IF EXISTS daily_stats;
DROP TABLE IF EXISTS api_rate_limits;

-- Keep per-mailbox and per-IP limits for the core email-sending flow.
CREATE TABLE IF NOT EXISTS send_rate_limits (
  identifier text NOT NULL,
  window_start_epoch_sec integer NOT NULL,
  request_count integer DEFAULT 0 NOT NULL,
  PRIMARY KEY (identifier, window_start_epoch_sec)
);

CREATE INDEX IF NOT EXISTS idx_send_rate_limits_window
ON send_rate_limits (window_start_epoch_sec);
