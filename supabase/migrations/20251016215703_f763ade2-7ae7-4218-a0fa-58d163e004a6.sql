-- Criar ENUMs
CREATE TYPE public.app_role AS ENUM ('admin', 'professional', 'assistant');
CREATE TYPE public.processing_status AS ENUM ('uploading', 'processing', 'completed', 'error');
CREATE TYPE public.biomarker_status AS ENUM ('normal', 'alto', 'baixo', 'alterado');

-- Tabela de perfis de profissionais
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialty TEXT,
  crm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de roles (SEPARADA por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Tabela de pacientes
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  cpf TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  medical_conditions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de exames (metadata)
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  
  -- Dados do AWS
  aws_file_key TEXT UNIQUE NOT NULL,
  aws_file_name TEXT NOT NULL,
  
  -- Metadados
  exam_date DATE,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  processing_status processing_status DEFAULT 'uploading',
  processed_at TIMESTAMPTZ,
  
  -- Dados extraídos
  laboratory TEXT,
  patient_name_extracted TEXT,
  total_biomarkers INTEGER,
  
  -- JSON bruto da API AWS (backup)
  raw_aws_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de resultados (biomarcadores individuais)
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do biomarcador
  biomarker_name TEXT NOT NULL,
  category TEXT,
  value TEXT NOT NULL,
  value_numeric NUMERIC,
  unit TEXT,
  
  -- Valores de referência
  reference_min NUMERIC,
  reference_max NUMERIC,
  
  -- Status
  status biomarker_status NOT NULL,
  observation TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_patients_professional ON public.patients(professional_id);
CREATE INDEX idx_patients_cpf ON public.patients(cpf);
CREATE INDEX idx_exams_patient ON public.exams(patient_id);
CREATE INDEX idx_exams_status ON public.exams(processing_status);
CREATE INDEX idx_exams_date ON public.exams(exam_date DESC);
CREATE INDEX idx_exam_results_exam ON public.exam_results(exam_id);
CREATE INDEX idx_exam_results_biomarker ON public.exam_results(biomarker_name);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Função para verificar roles (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para user_roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas para patients
CREATE POLICY "Professionals can view own patients"
  ON public.patients FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can manage own patients"
  ON public.patients FOR ALL
  USING (auth.uid() = professional_id);

-- Políticas para exams
CREATE POLICY "View exams of own patients"
  ON public.exams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = exams.patient_id
      AND patients.professional_id = auth.uid()
    )
  );

CREATE POLICY "Manage exams of own patients"
  ON public.exams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = exams.patient_id
      AND patients.professional_id = auth.uid()
    )
  );

-- Políticas para exam_results
CREATE POLICY "View results of own patients"
  ON public.exam_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exams
      JOIN public.patients ON patients.id = exams.patient_id
      WHERE exams.id = exam_results.exam_id
      AND patients.professional_id = auth.uid()
    )
  );

CREATE POLICY "Manage results of own patients"
  ON public.exam_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.exams
      JOIN public.patients ON patients.id = exams.patient_id
      WHERE exams.id = exam_results.exam_id
      AND patients.professional_id = auth.uid()
    )
  );

-- Trigger para criar profile quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Profissional')
  );
  
  -- Primeiro usuário vira admin automaticamente
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Demais usuários começam como 'professional'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'professional');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();