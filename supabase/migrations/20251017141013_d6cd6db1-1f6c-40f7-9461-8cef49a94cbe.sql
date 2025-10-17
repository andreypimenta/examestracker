-- Corrigir RLS da tabela exam_results para permitir inserção durante auto-matching
-- Isso é necessário pois o exam pode ter patient_id NULL temporariamente

-- Remover políticas existentes
DROP POLICY IF EXISTS "Manage results of own patients" ON exam_results;
DROP POLICY IF EXISTS "View results of own patients" ON exam_results;

-- Nova política para INSERT
-- Permite inserir se o exame pertence ao profissional (via uploaded_by)
CREATE POLICY "Professionals can create exam results"
ON exam_results
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = exam_results.exam_id 
    AND (
      exams.uploaded_by = auth.uid()
      OR
      (exams.patient_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = exams.patient_id 
        AND patients.professional_id = auth.uid()
      ))
    )
  )
);

-- Política para UPDATE
CREATE POLICY "Professionals can update exam results"
ON exam_results
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = exam_results.exam_id 
    AND (
      exams.uploaded_by = auth.uid()
      OR
      (exams.patient_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = exams.patient_id 
        AND patients.professional_id = auth.uid()
      ))
    )
  )
);

-- Política para SELECT
CREATE POLICY "Professionals can view exam results"
ON exam_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = exam_results.exam_id 
    AND (
      exams.uploaded_by = auth.uid()
      OR
      (exams.patient_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = exams.patient_id 
        AND patients.professional_id = auth.uid()
      ))
    )
  )
);

-- Política para DELETE
CREATE POLICY "Professionals can delete exam results"
ON exam_results
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = exam_results.exam_id 
    AND (
      exams.uploaded_by = auth.uid()
      OR
      (exams.patient_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM patients
        WHERE patients.id = exams.patient_id 
        AND patients.professional_id = auth.uid()
      ))
    )
  )
);