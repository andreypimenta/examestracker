import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BiomarkerChart } from "@/components/BiomarkerChart";

interface BiomarkerOption {
  biomarker_name: string;
  unit: string | null;
  reference_min: number | null;
  reference_max: number | null;
  category: string;
  total_measurements: number;
  last_value: number | null;
  last_date: string;
}

interface BiomarkerDataPoint {
  exam_date: string;
  value_numeric: number;
  status: string;
  laboratory: string | null;
}

const PatientCharts = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);

  // Buscar dados do paciente
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .eq("professional_id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  // Buscar lista de biomarcadores disponíveis
  const { data: biomarkers, isLoading: biomarkersLoading } = useQuery({
    queryKey: ["patient-biomarkers-list", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_results")
        .select(`
          biomarker_name,
          unit,
          reference_min,
          reference_max,
          category,
          value_numeric,
          exams!inner(patient_id, exam_date)
        `)
        .eq("exams.patient_id", id)
        .not("value_numeric", "is", null)
        .order("biomarker_name", { ascending: true });

      if (error) throw error;

      // Agrupar por biomarcador e calcular estatísticas
      const biomarkerMap = new Map<string, BiomarkerOption>();

      data?.forEach((item: any) => {
        const key = item.biomarker_name;
        if (!biomarkerMap.has(key)) {
          biomarkerMap.set(key, {
            biomarker_name: item.biomarker_name,
            unit: item.unit,
            reference_min: item.reference_min,
            reference_max: item.reference_max,
            category: item.category || "Outros",
            total_measurements: 0,
            last_value: null,
            last_date: "",
          });
        }

        const biomarker = biomarkerMap.get(key)!;
        biomarker.total_measurements += 1;
        
        // Atualizar último valor se for mais recente
        if (!biomarker.last_date || item.exams.exam_date > biomarker.last_date) {
          biomarker.last_date = item.exams.exam_date;
          biomarker.last_value = item.value_numeric;
        }
      });

      return Array.from(biomarkerMap.values());
    },
    enabled: !!id,
  });

  // Buscar histórico do biomarcador selecionado
  const { data: biomarkerHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["biomarker-history", id, selectedBiomarker],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_results")
        .select(`
          value_numeric,
          status,
          exams!inner(exam_date, laboratory, patient_id)
        `)
        .eq("exams.patient_id", id)
        .eq("biomarker_name", selectedBiomarker)
        .not("value_numeric", "is", null)
        .order("exam_date", { ascending: true, foreignTable: "exams" });

      if (error) throw error;

      return data?.map((item: any) => ({
        exam_date: item.exams.exam_date,
        value_numeric: item.value_numeric,
        status: item.status,
        laboratory: item.exams.laboratory,
      })) as BiomarkerDataPoint[];
    },
    enabled: !!selectedBiomarker && !!id,
  });

  // Calcular estatísticas do biomarcador selecionado
  const selectedBiomarkerData = biomarkers?.find(b => b.biomarker_name === selectedBiomarker);
  
  const stats = biomarkerHistory && selectedBiomarkerData ? {
    total: biomarkerHistory.length,
    average: biomarkerHistory.reduce((acc, curr) => acc + curr.value_numeric, 0) / biomarkerHistory.length,
    trend: calculateTrend(biomarkerHistory.map(h => h.value_numeric)),
    inRange: biomarkerHistory.filter(h => {
      const { reference_min, reference_max } = selectedBiomarkerData;
      if (!reference_min || !reference_max) return true;
      return h.value_numeric >= reference_min && h.value_numeric <= reference_max;
    }).length,
  } : null;

  // Agrupar biomarcadores por categoria
  const biomarkersByCategory = biomarkers?.reduce((acc, biomarker) => {
    const category = biomarker.category || "Outros";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(biomarker);
    return acc;
  }, {} as Record<string, BiomarkerOption[]>);

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rest-black via-rest-charcoal to-rest-black p-6">
        <Skeleton className="h-96 bg-white/10" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rest-black via-rest-charcoal to-rest-black p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Paciente não encontrado</h2>
          <Button onClick={() => navigate("/patients")} className="mt-4">
            Voltar para pacientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rest-black via-rest-charcoal to-rest-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/patients/${id}`)}
            className="border-rest-blue text-rest-blue hover:bg-rest-blue/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Activity className="w-8 h-8 text-rest-green" />
              Gráficos Personalizados
            </h1>
            <p className="text-rest-gray mt-1">
              {patient.full_name}
            </p>
          </div>
        </div>

        {/* Seleção de Biomarcador */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Selecione um Biomarcador</CardTitle>
            <CardDescription>
              Escolha qual variável deseja acompanhar ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {biomarkersLoading ? (
              <Skeleton className="h-10 w-full bg-white/10" />
            ) : (
              <Select value={selectedBiomarker || ""} onValueChange={setSelectedBiomarker}>
                <SelectTrigger className="w-full bg-card/50 border-border">
                  <SelectValue placeholder="Selecione um biomarcador..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-[400px]">
                  {biomarkersByCategory && Object.entries(biomarkersByCategory).map(([category, items]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-rest-lightblue font-semibold">{category}</SelectLabel>
                      {items.map((biomarker) => (
                        <SelectItem key={biomarker.biomarker_name} value={biomarker.biomarker_name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{biomarker.biomarker_name}</span>
                            <span className="text-muted-foreground ml-4 text-xs">
                              {biomarker.unit && `(${biomarker.unit})`}
                              {biomarker.last_value !== null && ` - ${biomarker.last_value.toFixed(2)}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Visualização do Gráfico */}
        {selectedBiomarker && selectedBiomarkerData && (
          <>
            {historyLoading ? (
              <Skeleton className="h-[400px] bg-white/10" />
            ) : biomarkerHistory && biomarkerHistory.length > 0 ? (
              <>
                {/* Gráfico */}
                <BiomarkerChart
                  biomarkerName={selectedBiomarkerData.biomarker_name}
                  data={biomarkerHistory}
                  unit={selectedBiomarkerData.unit}
                  referenceMin={selectedBiomarkerData.reference_min}
                  referenceMax={selectedBiomarkerData.reference_max}
                />

                {/* Estatísticas */}
                {stats && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-rest-green" />
                        Estatísticas
                      </CardTitle>
                      <CardDescription>
                        Resumo das medições de {selectedBiomarkerData.biomarker_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-muted-foreground mb-1">Total de Medições</p>
                          <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-muted-foreground mb-1">Valor Médio</p>
                          <p className="text-2xl font-bold text-white">
                            {stats.average.toFixed(2)} {selectedBiomarkerData.unit}
                          </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-muted-foreground mb-1">Tendência</p>
                          <div className="flex items-center gap-2 mt-1">
                            {stats.trend === 'up' && (
                              <>
                                <TrendingUp className="w-5 h-5 text-red-500" />
                                <span className="text-xl font-bold text-red-500">Aumentando</span>
                              </>
                            )}
                            {stats.trend === 'down' && (
                              <>
                                <TrendingDown className="w-5 h-5 text-green-500" />
                                <span className="text-xl font-bold text-green-500">Diminuindo</span>
                              </>
                            )}
                            {stats.trend === 'stable' && (
                              <>
                                <Minus className="w-5 h-5 text-yellow-500" />
                                <span className="text-xl font-bold text-yellow-500">Estável</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-muted-foreground mb-1">Dentro da Faixa</p>
                          <p className="text-2xl font-bold text-white">
                            {((stats.inRange / stats.total) * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stats.inRange} de {stats.total} medições
                          </p>
                        </div>
                      </div>

                      {selectedBiomarkerData.last_value !== null && (
                        <div className="mt-4 p-4 bg-rest-blue/10 border border-rest-blue/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Última Medição</p>
                          <p className="text-2xl font-bold text-rest-lightblue">
                            {selectedBiomarkerData.last_value.toFixed(2)} {selectedBiomarkerData.unit}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(selectedBiomarkerData.last_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum dado disponível para este biomarcador
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Estado vazio */}
        {!selectedBiomarker && !biomarkersLoading && (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="text-center py-16">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Selecione um biomarcador para começar
              </h3>
              <p className="text-muted-foreground">
                Escolha uma variável acima para visualizar seu histórico ao longo do tempo
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Helper function para calcular tendência
function calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-3);
  const avg = recent.reduce((a, b) => a + b) / recent.length;
  const lastValue = recent[recent.length - 1];
  
  const diff = ((lastValue - avg) / avg) * 100;
  
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

export default PatientCharts;
