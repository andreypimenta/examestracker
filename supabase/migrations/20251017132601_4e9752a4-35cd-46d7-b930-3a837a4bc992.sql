-- Permitir patient_id NULL temporariamente durante processamento automático
ALTER TABLE exams 
ALTER COLUMN patient_id DROP NOT NULL;

-- Adicionar campo para rastrear tipo de matching
ALTER TABLE exams 
ADD COLUMN matching_type TEXT DEFAULT 'manual' 
CHECK (matching_type IN ('manual', 'auto_exact', 'auto_created', 'auto_selected'));

-- Adicionar índice para melhorar performance de matching
CREATE INDEX idx_patients_name ON patients (LOWER(full_name));

-- Comentários para documentação
COMMENT ON COLUMN exams.matching_type IS 'Tipo de matching usado: manual (usuário selecionou), auto_exact (match automático único), auto_created (paciente criado automaticamente), auto_selected (usuário escolheu entre candidatos)';
COMMENT ON COLUMN exams.patient_id IS 'ID do paciente. Pode ser NULL temporariamente durante processamento com auto-matching';