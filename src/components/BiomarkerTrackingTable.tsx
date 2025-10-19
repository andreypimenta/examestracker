import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BiomarkerValue {
  exam_date: string;
  value: string;
  value_numeric: number | null;
  status: 'normal' | 'alto' | 'baixo';
}

interface BiomarkerRow {
  biomarker_name: string;
  unit: string | null;
  reference_min: number | null;
  reference_max: number | null;
  category: string;
  values: BiomarkerValue[];
}

interface BiomarkerTrackingTableProps {
  data: BiomarkerRow[];
  examDates: string[];
  patientName?: string;
}

export function BiomarkerTrackingTable({ data, examDates, patientName }: BiomarkerTrackingTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Obter categorias únicas
  const categories = Array.from(new Set(data.map(d => d.category).filter(Boolean)));

  // Filtrar dados por categoria
  const filteredData = categoryFilter === 'all' 
    ? data 
    : data.filter(d => d.category === categoryFilter);

  // Exportar para PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.setTextColor(0, 146, 204); // rest-blue
    doc.text('HealthTrack - Relatório de Acompanhamento', 14, 20);
    
    // Dados do paciente
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    if (patientName) {
      doc.text(`Paciente: ${patientName}`, 14, 30);
    }
    doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 37);
    
    // Preparar dados da tabela
    const headers = [
      'Biomarcador',
      'Unidade',
      'Referência',
      ...examDates.map(d => format(new Date(d), 'dd/MM/yy', { locale: ptBR }))
    ];

    const rows = filteredData.map(row => {
      const refText = row.reference_min !== null && row.reference_max !== null
        ? `${row.reference_min}-${row.reference_max}`
        : '-';
      
      const values = examDates.map(date => {
        const value = row.values.find(v => v.exam_date === date);
        return value ? value.value : '-';
      });

      return [
        row.biomarker_name,
        row.unit || '-',
        refText,
        ...values
      ];
    });
    
    // Tabela
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 45,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 146, 204], // rest-blue
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      },
      styles: {
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Biomarcador
        1: { cellWidth: 20 }, // Unidade
        2: { cellWidth: 25 }, // Referência
      }
    });
    
    doc.save(`acompanhamento-${patientName || 'paciente'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Calcular tendência
  const getTrend = (values: BiomarkerValue[]) => {
    if (values.length < 2) return null;
    
    const sortedValues = [...values].sort((a, b) => 
      new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
    );
    
    const last = sortedValues[sortedValues.length - 1]?.value_numeric;
    const previous = sortedValues[sortedValues.length - 2]?.value_numeric;
    
    if (last === null || previous === null || previous === 0) return null;
    
    const percentChange = ((last - previous) / previous) * 100;
    
    if (Math.abs(percentChange) < 5) {
      return { type: 'stable', change: percentChange };
    }
    
    return { 
      type: percentChange > 0 ? 'up' : 'down', 
      change: percentChange 
    };
  };

  // Cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-medical-success bg-medical-success/10';
      case 'alto':
        return 'text-medical-critical bg-medical-critical/10';
      case 'baixo':
        return 'text-medical-warning bg-medical-warning/10';
      default:
        return 'text-muted-foreground';
    }
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="border-b border-rest-blue/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-rest-blue text-xl">
              Tabela de Acompanhamento Longitudinal
            </CardTitle>
            <CardDescription className="text-rest-gray">
              Evolução completa de todos os biomarcadores ao longo do tempo
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px] bg-card/50 border-rest-blue/30">
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button 
              onClick={exportToPDF}
              className="bg-gradient-to-r from-rest-blue to-rest-cyan text-white hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-rest-darkblue/20 hover:bg-rest-darkblue/30">
                <TableHead className="sticky left-0 z-20 bg-rest-darkblue/90 backdrop-blur-sm text-rest-lightblue font-semibold min-w-[180px]">
                  Biomarcador
                </TableHead>
                <TableHead className="text-rest-lightblue font-semibold min-w-[80px]">
                  Unidade
                </TableHead>
                <TableHead className="text-rest-lightblue font-semibold min-w-[120px]">
                  Referência
                </TableHead>
                {examDates.map((date, index) => (
                  <TableHead 
                    key={date} 
                    className={cn(
                      "text-center text-rest-lightblue font-semibold min-w-[100px]",
                      index === examDates.length - 1 && "bg-rest-blue/10"
                    )}
                  >
                    {format(new Date(date), 'dd/MM/yy', { locale: ptBR })}
                  </TableHead>
                ))}
                <TableHead className="text-center text-rest-lightblue font-semibold min-w-[100px]">
                  Tendência
                </TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {filteredData.map((row, rowIndex) => {
                const trend = getTrend(row.values);
                
                return (
                  <TableRow 
                    key={row.biomarker_name}
                    className={cn(
                      "hover:bg-rest-blue/5",
                      rowIndex % 2 === 0 ? "bg-card/30" : "bg-card/10"
                    )}
                  >
                    <TableCell className="sticky left-0 z-10 bg-rest-charcoal/95 backdrop-blur-sm font-medium text-white border-r border-border">
                      {row.biomarker_name}
                    </TableCell>
                    
                    <TableCell className="text-rest-gray">
                      {row.unit || '-'}
                    </TableCell>
                    
                    <TableCell className="text-rest-gray text-sm">
                      {row.reference_min !== null && row.reference_max !== null
                        ? `${row.reference_min}-${row.reference_max}`
                        : '-'}
                    </TableCell>
                    
                    {examDates.map((date, index) => {
                      const value = row.values.find(v => v.exam_date === date);
                      const isLatestExam = index === examDates.length - 1;
                      
                      return (
                        <TableCell 
                          key={date}
                          className={cn(
                            "text-center font-medium",
                            value && getStatusColor(value.status),
                            isLatestExam && "ring-2 ring-inset ring-rest-cyan/50"
                          )}
                        >
                          {value ? value.value : '-'}
                        </TableCell>
                      );
                    })}
                    
                    <TableCell className="text-center">
                      {trend ? (
                        <div className={cn(
                          "flex items-center justify-center gap-1",
                          trend.type === 'stable' && "text-muted-foreground",
                          trend.type === 'up' && "text-medical-critical",
                          trend.type === 'down' && "text-medical-success"
                        )}>
                          {trend.type === 'up' && <TrendingUp className="w-4 h-4" />}
                          {trend.type === 'down' && <TrendingDown className="w-4 h-4" />}
                          {trend.type === 'stable' && <Minus className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {trend.type === 'stable' 
                              ? 'Estável' 
                              : `${Math.abs(trend.change).toFixed(1)}%`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {examDates.length > 5 && (
          <div className="md:hidden text-center text-xs text-rest-gray py-3 border-t border-border">
            ← Arraste para ver mais datas →
          </div>
        )}
      </CardContent>
    </Card>
  );
}
