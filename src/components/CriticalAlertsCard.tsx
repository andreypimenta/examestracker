import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CriticalAlert {
  biomarkerName: string;
  value: string;
  status: 'alto' | 'baixo' | 'crítico';
  reference: string;
}

interface CriticalAlertsCardProps {
  alerts: CriticalAlert[];
}

export function CriticalAlertsCard({ alerts }: CriticalAlertsCardProps) {
  if (alerts.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'crítico':
        return 'bg-red-500';
      case 'alto':
        return 'bg-red-500';
      case 'baixo':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'crítico':
        return 'Crítico';
      case 'alto':
        return 'Alto';
      case 'baixo':
        return 'Baixo';
      default:
        return status;
    }
  };

  return (
    <Alert className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-l-4 border-red-500 rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <AlertTitle className="text-lg font-bold text-red-900 mb-2">
            {alerts.length} {alerts.length === 1 ? 'biomarcador requer' : 'biomarcadores requerem'} atenção
          </AlertTitle>
          <AlertDescription className="text-red-800 mb-4">
            Os seguintes valores estão fora da faixa de referência e podem necessitar intervenção médica:
          </AlertDescription>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl flex-wrap">
                <Badge className={`${getStatusColor(alert.status)} text-white`}>
                  {getStatusLabel(alert.status)}
                </Badge>
                <span className="font-semibold text-gray-900">{alert.biomarkerName}</span>
                <span className="text-gray-600">→</span>
                <span className={`font-bold ${alert.status === 'crítico' || alert.status === 'alto' ? 'text-red-600' : 'text-amber-600'}`}>
                  {alert.value}
                </span>
                <span className="text-xs text-gray-500">(ref: {alert.reference})</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl">
            Ver Recomendações
          </Button>
        </div>
      </div>
    </Alert>
  );
}
