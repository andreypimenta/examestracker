import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useExamAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeExam = async (examId: string) => {
    setAnalyzing(true);
    
    try {
      console.log(`[useExamAnalysis] 🔍 Iniciando análise do exame ${examId}...`);
      
      const { data, error } = await supabase.functions.invoke('analyze-exam', {
        body: { examId },
      });

      if (error) {
        console.error('[useExamAnalysis] ❌ Erro:', error);
        throw error;
      }

      console.log('[useExamAnalysis] ✅ Análise concluída:', data);

      toast.success('Análise clínica gerada com sucesso!', {
        description: `Score de saúde: ${data.data.clinical_analysis.score_saude_geral}/100`,
        duration: 5000,
      });

      return data;
    } catch (error) {
      console.error('[useExamAnalysis] ❌ Erro ao analisar exame:', error);
      
      toast.error('Falha ao gerar análise clínica', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        duration: 6000,
      });
      
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return { analyzeExam, analyzing };
}
