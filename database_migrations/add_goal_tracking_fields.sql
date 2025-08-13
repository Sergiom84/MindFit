-- =====================================================
-- ADD GOAL TRACKING FIELDS TO USERS TABLE
-- Adds fields for enhanced goal tracking functionality
-- =====================================================

-- Add new goal tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS fecha_inicio_objetivo DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fecha_meta_objetivo DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notas_progreso TEXT;

-- Add indexes for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_users_fecha_inicio_objetivo ON users(fecha_inicio_objetivo);
CREATE INDEX IF NOT EXISTS idx_users_fecha_meta_objetivo ON users(fecha_meta_objetivo);

-- Update the updated_at timestamp
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Verify the new columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('fecha_inicio_objetivo', 'fecha_meta_objetivo', 'notas_progreso')
ORDER BY column_name;

-- Show success message
SELECT 'Goal tracking fields added successfully to users table' as result;
