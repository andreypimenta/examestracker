import { categorizeBiomarker } from '@/utils/biomarkerCategories';
import { normalizeBiomarkerWithTable } from '@/utils/biomarkerNormalization';

/**
 * Normaliza nome da categoria para unificar variações
 */
export function normalizeCategoryName(category: string | null): string {
  if (!category) return 'outros';
  
  const normalized = category.toLowerCase().trim();
  
  const categoryMap: Record<string, string> = {
    // Hematológico
    'hemograma': 'hematologico',
    'hematológico': 'hematologico',
    'hematologia': 'hematologico',
    'sangue': 'hematologico',
    'serie vermelha': 'hematologico',
    'série vermelha': 'hematologico',
    'serie branca': 'hematologico',
    'série branca': 'hematologico',
    'eritrograma': 'hematologico',
    'leucograma': 'hematologico',
    'série plaquetária': 'hematologico',
    'serie plaquetaria': 'hematologico',
    
    // Metabólico
    'metabolismo': 'metabolico',
    'metabólico': 'metabolico',
    'lipídico': 'metabolico',
    'lipidico': 'metabolico',
    'perfil lipídico': 'metabolico',
    'perfil lipidico': 'metabolico',
    'glicemia': 'metabolico',
    'bioquímica': 'metabolico',
    'bioquimica': 'metabolico',
    'risco cardiovascular': 'metabolico',
    'fator cardiovascular': 'metabolico',
    'cardiovascular': 'metabolico',
    'glicemia e diabetes': 'metabolico',
    'metabolismo da glicose': 'metabolico',
    
    // Hepático
    'fígado': 'hepatico',
    'figado': 'hepatico',
    'hepático': 'hepatico',
    'hepatico': 'hepatico',
    'função hepática': 'hepatico',
    'funcao hepatica': 'hepatico',
    
    // Renal
    'rim': 'renal',
    'rins': 'renal',
    'função renal': 'renal',
    'funcao renal': 'renal',
    
    // Íons
    'eletrólitos': 'ions',
    'eletrolitos': 'ions',
    'íons': 'ions',
    'ionograma': 'ions',
    
    // Hormonal
    'hormônio': 'hormonal',
    'hormonio': 'hormonal',
    'hormônios': 'hormonal',
    'hormonios': 'hormonal',
    'tireoide': 'hormonal',
    'tireóide': 'hormonal',
    'hormônios sexuais': 'hormonal',
    'hormonios sexuais': 'hormonal',
    'hormônios tireoidianos': 'hormonal',
    'hormonios tireoidianos': 'hormonal',
    'função tireoideana': 'hormonal',
    'funcao tireoideana': 'hormonal',
    
    // Vitaminas e Minerais
    'vitamina': 'vitaminas_minerais',
    'vitaminas': 'vitaminas_minerais',
    'mineral': 'vitaminas_minerais',
    'minerais': 'vitaminas_minerais',
    'ferro': 'vitaminas_minerais',
    'minerais e vitaminas': 'vitaminas_minerais',
    'vitaminas e minerais': 'vitaminas_minerais',
    'metabolismo do ferro': 'vitaminas_minerais',
    'metais': 'vitaminas_minerais',
    'metais pesados': 'vitaminas_minerais',
    
    // Marcadores Inflamatórios
    'inflamação': 'marcadores_inflamatorios',
    'inflamacao': 'marcadores_inflamatorios',
    'inflamatório': 'marcadores_inflamatorios',
    'inflamatorio': 'marcadores_inflamatorios',
    'marcadores inflamatórios': 'marcadores_inflamatorios',
    'marcadores inflamatorios': 'marcadores_inflamatorios',
    'imunologia': 'marcadores_inflamatorios',
    
    // Marcadores Musculares
    'músculo': 'marcadores_musculares',
    'musculo': 'marcadores_musculares',
    'músculos': 'marcadores_musculares',
    'musculos': 'marcadores_musculares',
    'muscular': 'marcadores_musculares',
    'marcadores musculares': 'marcadores_musculares',
    
    // Marcadores Prostáticos
    'próstata': 'marcadores_prostaticos',
    'prostata': 'marcadores_prostaticos',
    'prostático': 'marcadores_prostaticos',
    'prostatico': 'marcadores_prostaticos',
    'marcadores prostáticos': 'marcadores_prostaticos',
    'marcadores prostaticos': 'marcadores_prostaticos'
  };
  
  return categoryMap[normalized] || normalized;
}

/**
 * Serviço centralizado para obter a categoria de um biomarcador
 * 
 * Ordem de prioridade:
 * 1. Tabela de Normalização (normalizeBiomarkerWithTable)
 * 2. Banco de Dados (dbCategory)
 * 3. Função Heurística (categorizeBiomarker)
 * 4. Normalização Final (normalizeCategoryName)
 * 
 * @param biomarkerName - Nome do biomarcador
 * @param dbCategory - Categoria do banco de dados (opcional)
 * @returns Categoria normalizada
 */
export function getBiomarkerCategory(biomarkerName: string, dbCategory?: string | null): string {
  // 1️⃣ Tentar tabela de normalização primeiro (fonte mais confiável)
  const tableMatch = normalizeBiomarkerWithTable(biomarkerName);
  if (tableMatch?.category) {
    return normalizeCategoryName(tableMatch.category);
  }
  
  // 2️⃣ Se não encontrou, usar categoria do banco de dados
  if (dbCategory) {
    return normalizeCategoryName(dbCategory);
  }
  
  // 3️⃣ Última alternativa: função heurística
  const heuristicCategory = categorizeBiomarker(biomarkerName);
  return normalizeCategoryName(heuristicCategory);
}

/**
 * Retorna informações sobre a fonte da categoria
 * Útil para debugging e validação
 */
export function getBiomarkerCategoryWithSource(biomarkerName: string, dbCategory?: string | null): {
  category: string;
  source: 'normalization_table' | 'database' | 'heuristic';
} {
  const tableMatch = normalizeBiomarkerWithTable(biomarkerName);
  if (tableMatch?.category) {
    return {
      category: normalizeCategoryName(tableMatch.category),
      source: 'normalization_table'
    };
  }
  
  if (dbCategory) {
    return {
      category: normalizeCategoryName(dbCategory),
      source: 'database'
    };
  }
  
  const heuristicCategory = categorizeBiomarker(biomarkerName);
  return {
    category: normalizeCategoryName(heuristicCategory),
    source: 'heuristic'
  };
}
