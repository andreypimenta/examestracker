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
      className="bg-white/90 backdrop-blur-md border-2 border-rest-blue/20 hover:border-rest-blue/40 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: categoryColor }}
            />
            <span className="bg-rest-lightblue/30 px-3 py-1 rounded-md font-bold text-rest-darkblue">
              {categoryName}
            </span>
          </CardTitle>
          <TrendingUp className="w-5 h-5 text-rest-blue" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-medical-success/20 px-3 py-1.5 rounded-md border border-medical-success/30">
            <CheckCircle className="w-4 h-4 text-medical-success" />
            <span className="text-sm font-semibold text-rest-darkblue">
              {normalCount} normal{normalCount !== 1 ? 'is' : ''}
            </span>
          </div>
          
          {alteredCount > 0 && (
            <div className="flex items-center gap-2 bg-destructive/20 px-3 py-1.5 rounded-md border border-destructive/30">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-rest-darkblue">
                {alteredCount} alterado{alteredCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs bg-white border-2 border-rest-darkblue/20 text-rest-darkblue font-bold px-3 py-1">
            {totalBiomarkers} biomarcador{totalBiomarkers !== 1 ? 'es' : ''}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
