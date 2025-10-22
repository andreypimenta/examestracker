import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useExamDateUpdate } from "@/hooks/useExamDateUpdate";

interface ExamDateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  currentDate: string;
  isEstimated: boolean;
}

export const ExamDateEditDialog = ({
  open,
  onOpenChange,
  examId,
  currentDate,
  isEstimated,
}: ExamDateEditDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate ? new Date(currentDate) : undefined
  );
  const { updateExamDate, isUpdating } = useExamDateUpdate();

  const handleSave = () => {
    if (!selectedDate) return;
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    updateExamDate(
      { examId, newDate: formattedDate },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Data do Exame</DialogTitle>
          <DialogDescription>
            Atualize a data do exame para refletir a data correta do laudo.
          </DialogDescription>
        </DialogHeader>

        {isEstimated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta data foi estimada com base no upload. Insira a data correta do laudo.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Data do Exame</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!selectedDate || isUpdating}
          >
            {isUpdating ? "Salvando..." : "Salvar Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
