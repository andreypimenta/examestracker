import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BiomarkerCategoryCardProps {
  category: string;
  categoryName: string;
  icon: React.ReactNode;
  totalCount: number;
  normalCount: number;
  alteredCount: number;
  patientId: string;
}

export function BiomarkerCategoryCard({
  category,
  categoryName,
  icon,
  totalCount,
  normalCount,
  alteredCount,
  patientId,
}: BiomarkerCategoryCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/patients/${patientId}/dashboard?category=${category}`);
  };

  const isAllNormal = alteredCount === 0 && normalCount > 0;
  const statusColor = isAllNormal ? 'from-green-500 via-green-400 to-emerald-500' : 'from-amber-500 via-orange-400 to-orange-500';

  return (
    <Card className="group bg-white border-0 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
      {/* Status Bar no topo */}
      <div className={`h-1.5 bg-gradient-to-r ${statusColor}`} />
      
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-start justify-between mb-4">
          {/* Ícone com animação */}
          <div className="relative">
            <div className="absolute inset-0 bg-medical-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative p-4 bg-gradient-to-br from-medical-purple-600 to-purple-600 rounded-2xl shadow-lg">
              <div className="text-white w-7 h-7 flex items-center justify-center">
                {icon}
              </div>
            </div>
          </div>
          
          {/* Badge com animação */}
          <Badge className={`px-3 py-1.5 font-bold text-sm rounded-full ${
            isAllNormal 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
              : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200'
          }`}>
            {isAllNormal ? '✓ Todos normais' : `⚠ ${alteredCount} alterado${alteredCount > 1 ? 's' : ''}`}
          </Badge>
        </div>
        
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
          {categoryName}
        </CardTitle>
        
        <p className="text-gray-500 text-sm">
          {totalCount} biomarcadores monitorados
        </p>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        {/* Mini estatísticas */}
        <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status Geral
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (normalCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
        
        {/* Status com ícones maiores */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Normais</div>
                <div className="text-xs text-gray-500">Sem preocupações</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-700">{normalCount}</div>
          </div>
          
          {alteredCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Atenção</div>
                  <div className="text-xs text-gray-500">Monitorar de perto</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-700">{alteredCount}</div>
            </div>
          )}
        </div>
        
        {/* CTA */}
        <Button
          onClick={handleViewDetails}
          className="w-full mt-4 bg-gradient-to-r from-medical-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Ver Detalhes
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
