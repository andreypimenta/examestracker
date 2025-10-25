import { CATEGORY_DISPLAY_ORDER } from './biomarkerDisplayOrder';
import { BIOMARKER_CATEGORIES } from './biomarkerCategories';

/**
 * Categorias oficiais do sistema (10 + outros)
 */
export const OFFICIAL_CATEGORIES = [
  'hematologico',
  'metabolico',
  'hepatico',
  'renal',
  'ions',
  'hormonal',
  'vitaminas_minerais',
  'marcadores_inflamatorios',
  'marcadores_musculares',
  'marcadores_prostaticos',
  'outros'
] as const;

export type OfficialCategory = typeof OFFICIAL_CATEGORIES[number];

/**
 * Valida se uma categoria é oficial
 */
export function isOfficialCategory(category: string): category is OfficialCategory {
  return OFFICIAL_CATEGORIES.includes(category as OfficialCategory);
}

/**
 * Valida a consistência entre os arquivos de categoria
 */
export function validateCategoryConsistency(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Verificar se CATEGORY_DISPLAY_ORDER está sincronizado com OFFICIAL_CATEGORIES
  const displayOrderSet = new Set(CATEGORY_DISPLAY_ORDER);
  const officialSet = new Set(OFFICIAL_CATEGORIES);

  // Remover 'outros' da comparação pois não está em CATEGORY_DISPLAY_ORDER
  officialSet.delete('outros');

  for (const cat of officialSet) {
    if (!displayOrderSet.has(cat)) {
      errors.push(`Categoria oficial '${cat}' não está em CATEGORY_DISPLAY_ORDER`);
    }
  }

  for (const cat of displayOrderSet) {
    if (!officialSet.has(cat as OfficialCategory) && cat !== 'outros') {
      warnings.push(`Categoria '${cat}' em CATEGORY_DISPLAY_ORDER não é oficial`);
    }
  }

  // 2. Verificar se BIOMARKER_CATEGORIES usa apenas categorias oficiais
  const biomarkerCats = Object.keys(BIOMARKER_CATEGORIES) as OfficialCategory[];
  for (const cat of biomarkerCats) {
    if (!isOfficialCategory(cat)) {
      errors.push(`BIOMARKER_CATEGORIES contém categoria não oficial: '${cat}'`);
    }
  }

  // 3. Verificar se todas as categorias oficiais têm definição em BIOMARKER_CATEGORIES
  for (const cat of OFFICIAL_CATEGORIES) {
    if (cat === 'outros') continue; // 'outros' não precisa estar definido
    if (!BIOMARKER_CATEGORIES[cat as keyof typeof BIOMARKER_CATEGORIES]) {
      warnings.push(`Categoria oficial '${cat}' não tem definição em BIOMARKER_CATEGORIES`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Retorna o nome amigável de uma categoria
 */
export function getCategoryFriendlyName(category: OfficialCategory): string {
  const names: Record<OfficialCategory, string> = {
    hematologico: 'Hematológico',
    metabolico: 'Metabólico',
    hepatico: 'Hepático',
    renal: 'Renal',
    ions: 'Íons',
    hormonal: 'Hormonal',
    vitaminas_minerais: 'Vitaminas e Minerais',
    marcadores_inflamatorios: 'Marcadores Inflamatórios',
    marcadores_musculares: 'Marcadores Musculares',
    marcadores_prostaticos: 'Marcadores Prostáticos',
    outros: 'Outros'
  };
  
  return names[category] || category;
}
