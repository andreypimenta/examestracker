-- 1. Adicionar data de nascimento em patients (se ainda não existir)
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS birth_date DATE;

COMMENT ON COLUMN public.patients.birth_date IS 'Data de nascimento do paciente, extraída dos exames';

-- 2. Criar tabela de correções para feedback do usuário
CREATE TABLE IF NOT EXISTS public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  
  -- Campo que foi corrigido
  field_name TEXT NOT NULL CHECK (field_name IN ('paciente', 'laboratorio', 'data_exame', 'data_nascimento')),
  
  -- Valores: O que a IA extraiu (errado) vs o que o usuário corrigiu (certo)
  ai_value TEXT,
  user_value TEXT NOT NULL,
  
  -- Metadados
  correction_type TEXT, -- 'nome_virou_lab', 'lab_virou_nome', 'data_errada', etc
  text_sample TEXT, -- Amostra do texto original (para análise futura)
  used_for_training BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_corrections_user_id ON public.corrections(user_id);
CREATE INDEX IF NOT EXISTS idx_corrections_exam_id ON public.corrections(exam_id);
CREATE INDEX IF NOT EXISTS idx_corrections_field_name ON public.corrections(field_name);
CREATE INDEX IF NOT EXISTS idx_corrections_created_at ON public.corrections(created_at DESC);

-- RLS Policies
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

-- Usuários podem inserir suas próprias correções
CREATE POLICY "Users can insert own corrections"
ON public.corrections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver suas próprias correções
CREATE POLICY "Users can view own corrections"
ON public.corrections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins podem ver todas as correções (para análise)
CREATE POLICY "Admins can view all corrections"
ON public.corrections
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_corrections_updated_at
BEFORE UPDATE ON public.corrections
FOR EACH ROW
EXECUTE FUNCTION update_corrections_updated_at();