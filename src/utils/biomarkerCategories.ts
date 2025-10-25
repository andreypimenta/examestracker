export const BIOMARKER_CATEGORIES = {
  metabolico: {
    name: 'Metabólico',
    biomarkers: [
      'Glicose',
      'Hemoglobina Glicada',
      'Insulina',
      'Peptídeo C',
      'Colesterol Total',
      'Colesterol LDL',
      'HDL',
      'Colesterol VLDL',
      'Triglicérides',
      'Apolipoproteína A',
      'Apolipoproteína A1',
      'Apolipoproteína B',
      'Lipoproteína (a)',
      'Ácido Úrico'
    ]
  },
  hematologico: {
    name: 'Hemograma',
    biomarkers: [
      'Hemácias',
      'Hemoglobina',
      'Hematócrito',
      'Leucócitos',
      'Plaquetas',
      'VCM',
      'HCM',
      'CHCM',
      'RDW',
      'Neutrófilos',
      'Linfócitos',
      'Monócitos',
      'Eosinófilos',
      'Basófilos',
      'Eritrograma',
      'Serie Vermelha',
      'Serie Branca',
      'Leucograma'
    ]
  },
  hormonal: {
    name: 'Hormonal',
    biomarkers: [
      'TSH',
      'T4 Livre',
      'T3',
      'Paratormônio',
      'Cortisol',
      'Testosterona'
    ]
  },
  renal: {
    name: 'Renal',
    biomarkers: [
      'Creatinina',
      'Ureia',
      'Ácido Úrico',
      'Clearance de Creatinina'
    ]
  },
  hepatico: {
    name: 'Hepático',
    biomarkers: [
      'TGO',
      'TGP',
      'Gama GT',
      'Fosfatase Alcalina',
      'Bilirrubina Total',
      'Bilirrubina Direta',
      'Bilirrubina Indireta'
    ]
  },
  ions: {
    name: 'Íons',
    biomarkers: [
      'Sódio',
      'Potássio',
      'Cálcio',
      'Cálcio Iônico',
      'Magnésio',
      'Fósforo'
    ]
  },
  vitaminas_minerais: {
    name: 'Vitaminas e Minerais',
    biomarkers: [
      'Alumínio',
      'Capacidade Latente de Ligação de Ferro',
      'Capacidade Total de Ligação de Ferro',
      'Cobre',
      'Ferritina',
      'Ferro',
      'Ferro Sérico',
      'Selênio',
      'Transferrina',
      'Vitamina B12',
      'Vitamina D',
      'Vitamina D (25-OH)',
      'Zinco',
      'Ácido Fólico',
      'Índice de Saturação de Transferrina'
    ]
  },
  marcadores_inflamatorios: {
    name: 'Marcadores Inflamatórios',
    biomarkers: [
      'Homocisteína',
      'PCR',
      'Proteína C Reativa',
      'Proteína C Reativa (PCR) Ultrassensível',
      'VHS',
      'VHS 1ª Hora'
    ]
  },
  marcadores_musculares: {
    name: 'Marcadores Musculares',
    biomarkers: [
      'CPK',
      'CPK - Creatina Fosfoquinase',
      'Creatina Fosfoquinase',
      'LDH'
    ]
  },
  marcadores_prostaticos: {
    name: 'Marcadores Prostáticos',
    biomarkers: [
      'PSA Total',
      'PSA Livre'
    ]
  }
};

export type CategoryKey = keyof typeof BIOMARKER_CATEGORIES;

export function categorizeBiomarker(biomarkerName: string): CategoryKey {
  for (const [key, category] of Object.entries(BIOMARKER_CATEGORIES)) {
    if (category.biomarkers.some(b => 
      biomarkerName.toLowerCase().includes(b.toLowerCase()) ||
      b.toLowerCase().includes(biomarkerName.toLowerCase())
    )) {
      return key as CategoryKey;
    }
  }
  return 'outros' as CategoryKey; // fallback
}

export function getCategoryColor(category: CategoryKey): string {
  const colors: Record<CategoryKey, string> = {
    metabolico: 'hsl(var(--chart-2))',
    hematologico: 'hsl(var(--chart-3))',
    hormonal: 'hsl(var(--chart-4))',
    renal: 'hsl(var(--chart-5))',
    hepatico: 'hsl(var(--chart-1))',
    ions: 'hsl(var(--chart-3))',
    vitaminas_minerais: 'hsl(var(--chart-2))',
    marcadores_inflamatorios: 'hsl(var(--chart-4))',
    marcadores_musculares: 'hsl(var(--chart-5))',
    marcadores_prostaticos: 'hsl(var(--chart-1))'
  };
  return colors[category] || 'hsl(var(--chart-1))';
}
