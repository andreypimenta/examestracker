import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { CategoryKey, getCategoryColor } from '@/utils/biomarkerCategories';

interface BiomarkerCategoryCardProps {
  category: CategoryKey;
  categoryName: string;
  totalBiomarkers: number;
  normalCount: number;
  alteredCount: number;
  onClick: () => void;
}

export function BiomarkerCategoryCard({
  category,
  categoryName,
  totalBiomarkers,
  normalCount,
  alteredCount,
  onClick
}: BiomarkerCategoryCardProps) {
  const categoryColor = getCategoryColor(category);

  return (
    <Card 
      className="bg-white/5 backdrop-blur-lg border-white/10 cursor-pointer transition-all hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,173,238,0.3)] group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)` }}
            >
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </div>
            <span className="bg-rest-blue/80 backdrop-blur-sm px-4 py-1.5 rounded-lg font-semibold text-white border border-rest-blue/40 shadow-md">
              {categoryName}
            </span>
          </CardTitle>
          <TrendingUp className="w-5 h-5 text-white/60" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-medical-success/10 px-3 py-1.5 rounded-md border border-medical-success/20">
            <CheckCircle className="w-4 h-4 text-medical-success" />
            <span className="text-sm font-semibold text-white">
              {normalCount} normal{normalCount !== 1 ? 'is' : ''}
            </span>
          </div>
          
          {alteredCount > 0 && (
            <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-md border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-white">
                {alteredCount} alterado{alteredCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs bg-white/10 border border-white/20 text-white font-semibold px-3 py-1">
            {totalBiomarkers} biomarcador{totalBiomarkers !== 1 ? 'es' : ''}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
