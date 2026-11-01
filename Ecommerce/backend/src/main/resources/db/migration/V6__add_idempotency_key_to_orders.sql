-- ==============================================================================
-- Flyway Migration V6: Add Idempotency Key to Orders Table
-- Ensures durable duplicate-order prevention across distributed cluster nodes.
-- ==============================================================================

ALTER TABLE orders ADD COLUMN idempotency_key VARCHAR(100) NULL;
ALTER TABLE orders ADD CONSTRAINT uk_orders_idempotency_key UNIQUE (idempotency_key);

