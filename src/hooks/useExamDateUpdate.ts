import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useExamDateUpdate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateExamDate = useMutation({
    mutationFn: async ({ examId, newDate }: { examId: string; newDate: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update({ exam_date: newDate })
        .eq('id', examId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biomarker-history'] });
      queryClient.invalidateQueries({ queryKey: ['tracking-table-data'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      
      toast({
        title: "Data atualizada",
        description: "A data do exame foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a data do exame.",
        variant: "destructive",
      });
      console.error('Error updating exam date:', error);
    },
  });

  return {
    updateExamDate: updateExamDate.mutate,
    isUpdating: updateExamDate.isPending,
  };
};
