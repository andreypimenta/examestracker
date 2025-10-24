import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamInsightsPanel } from "@/components/ExamInsightsPanel";
import type { ExamWithInsights } from "@/types/exam-insights";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, TrendingDown, CheckCircle, Brain, Loader2 } from "lucide-react";
import { categorizeBiomarker, getCategoryColor } from "@/utils/biomarkerCategories";
import { useExamAnalysis } from "@/hooks/useExamAnalysis";

interface ExamResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string | null;
}

export function ExamResultsDialog({ open, onOpenChange, examId }: ExamResultsDialogProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { analyzeExam, analyzing } = useExamAnalysis();

  const { data: examData, isLoading } = useQuery({
    queryKey: ["exam-results", examId],
    queryFn: async () => {
      if (!examId) return null;

      const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("*, exam_date, laboratory, health_score, risk_category, clinical_analysis, alerts, trends, recommendations")
        .eq("id", examId)
        .single();

      if (examError) throw examError;

      const { data: results, error: resultsError } = await supabase
        .from("exam_results")
        .select("*")
        .eq("exam_id", examId)
        .order("biomarker_name");

      if (resultsError) throw resultsError;

      return { exam, results };
    },
    enabled: !!examId && open,
  });

  const filteredResults = useMemo(() => {
    if (!examData?.results) return [];

    return examData.results.filter((result) => {
      // Filtro de categoria
      if (categoryFilter !== "all") {
        const resultCategory = categorizeBiomarker(result.biomarker_name);
        if (resultCategory !== categoryFilter) return false;
      }

      // Filtro de status
      if (statusFilter === "normal" && result.status !== "normal") return false;
      if (statusFilter === "altered" && result.status === "normal") return false;

      // Busca por nome
      if (
        searchQuery &&
        !result.biomarker_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [examData, categoryFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    if (!examData?.results) return { total: 0, normal: 0, altered: 0 };
    
    return {
      total: examData.results.length,
      normal: examData.results.filter((r) => r.status === "normal").length,
      altered: examData.results.filter((r) => r.status !== "normal").length,
    };
  }, [examData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Normal
          </Badge>
        );
      case "alto":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            Alto
          </Badge>
        );
      case "baixo":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <TrendingDown className="w-3 h-3 mr-1" />
            Baixo
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-rest-black via-rest-charcoal to-rest-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            📊 Resultados do Exame
          </DialogTitle>
          {examData?.exam && (
            <div className="text-sm text-white/70 space-y-1">
              <p>
                {examData.exam.laboratory} | {new Date(examData.exam.exam_date).toLocaleDateString("pt-BR")}
              </p>
              <p>
                {stats.total} biomarcadores | {stats.normal} normais | {stats.altered} alterados
              </p>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="results" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="results" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">
              📊 Resultados
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">
              🧠 Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="flex-1 overflow-hidden flex flex-col space-y-4 mt-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Buscar biomarcador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-rest-charcoal border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">Todas as categorias</SelectItem>
                  <SelectItem value="cardiovascular" className="text-white hover:bg-white/10 focus:bg-white/10">Cardiovascular</SelectItem>
                  <SelectItem value="metabolico" className="text-white hover:bg-white/10 focus:bg-white/10">Metabólico</SelectItem>
                  <SelectItem value="hematologico" className="text-white hover:bg-white/10 focus:bg-white/10">Hematológico</SelectItem>
                  <SelectItem value="hormonal" className="text-white hover:bg-white/10 focus:bg-white/10">Hormonal</SelectItem>
                  <SelectItem value="renal" className="text-white hover:bg-white/10 focus:bg-white/10">Renal</SelectItem>
                  <SelectItem value="hepatico" className="text-white hover:bg-white/10 focus:bg-white/10">Hepático</SelectItem>
                  <SelectItem value="minerais" className="text-white hover:bg-white/10 focus:bg-white/10">Minerais/Vitaminas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-rest-charcoal border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">Todos os status</SelectItem>
                  <SelectItem value="normal" className="text-white hover:bg-white/10 focus:bg-white/10">Apenas normais</SelectItem>
                  <SelectItem value="altered" className="text-white hover:bg-white/10 focus:bg-white/10">Apenas alterados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabela */}
            <div className="flex-1 overflow-y-auto border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-white/10 backdrop-blur-sm z-10">
                    <TableRow>
                      <TableHead className="text-white font-bold">Biomarcador</TableHead>
                      <TableHead className="text-right text-white font-bold">Valor</TableHead>
                      <TableHead className="text-right text-white font-bold">Referência</TableHead>
                      <TableHead className="text-center text-white font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-white/70 py-8">
                          Nenhum resultado encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResults.map((result) => {
                        return (
                          <TableRow key={result.id} className="border-b border-white/5 hover:bg-white/5">
                            <TableCell className="font-medium text-white">
                              {result.biomarker_name}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-white font-mono">
                                {result.value}
                              </span>
                              {result.unit && (
                                <span className="text-white/50 ml-1 text-xs">
                                  {result.unit}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`font-mono text-sm ${
                                result.reference_min !== null && result.reference_max !== null
                                  ? 'text-white/70'
                                  : 'text-white/40 italic'
                              }`}>
                                {result.reference_min !== null && result.reference_max !== null
                                  ? `${result.reference_min} - ${result.reference_max}`
                                  : "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(result.status)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="text-xs text-white/70 text-center">
              Mostrando {filteredResults.length} de {stats.total} biomarcadores
            </div>
          </TabsContent>

          <TabsContent value="insights" className="flex-1 overflow-auto mt-4">
            {examData?.exam && !examData.exam.health_score && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <CardContent className="py-8 text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    Insights Clínicos Não Gerados
                  </h3>
                  <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
                    Os biomarcadores foram extraídos com sucesso. Clique abaixo para gerar uma análise clínica detalhada com IA.
                  </p>
                  <Button 
                    onClick={async () => {
                      if (examId) {
                        const result = await analyzeExam(examId);
                        if (result) {
                          queryClient.invalidateQueries({ queryKey: ["exam-results", examId] });
                        }
                      }
                    }} 
                    disabled={analyzing}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-5 w-5" />
                        Gerar Análise Clínica
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {examData?.exam && examData.exam.health_score && (
              <ExamInsightsPanel exam={examData.exam as unknown as ExamWithInsights} />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
