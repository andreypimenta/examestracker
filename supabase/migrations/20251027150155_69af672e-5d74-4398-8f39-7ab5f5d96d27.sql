
-- Adicionar coluna birth_date na tabela exams para armazenar data de nascimento extraída
ALTER TABLE exams ADD COLUMN IF NOT EXISTS birth_date date;

COMMENT ON COLUMN exams.birth_date IS 'Data de nascimento do paciente extraída do PDF do exame';
