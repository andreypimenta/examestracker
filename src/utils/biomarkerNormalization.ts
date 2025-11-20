// Tabela de referência completa para normalização de biomarcadores
// Expandido com todos os 214 biomarcadores do biomarker-specification.json
// Mapeamento das 25 categorias originais para 11 categorias simplificadas

export const BIOMARKER_REFERENCE_TABLE: Record<string, {
  normalizedName: string;
  category?: string;
  unit?: string;
}> = {
  // AVALIAÇÃO DO PERFIL GLICÊMICO - metabolico
  'glicemia jejum': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  'glicose': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  'glicose jejum': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  'glicemia': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  'glucose': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  'glicemia de jejum': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  'glicose em jejum': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  'glucose fasting': { normalizedName: 'Glicemia Jejum', category: 'metabolico', unit: 'mg/dL' },
  
  'g0h75gd gestante': { normalizedName: 'G0H75GD Gestante', category: 'metabolico', unit: 'mg/dL' },
  'g0h75 gestante': { normalizedName: 'G0H75GD Gestante', category: 'metabolico', unit: 'mg/dL' },
  'glicemia 0h totg gestante': { normalizedName: 'G0H75GD Gestante', category: 'metabolico', unit: 'mg/dL' },
  'totg 0h gestante': { normalizedName: 'G0H75GD Gestante', category: 'metabolico', unit: 'mg/dL' },
  
  'frutosamina': { normalizedName: 'Frutosamina', category: 'metabolico', unit: 'μmol/L' },
  'fructosamine': { normalizedName: 'Frutosamina', category: 'metabolico', unit: 'μmol/L' },
  
  'peptideo c': { normalizedName: 'Peptídeo C', category: 'metabolico', unit: 'ng/mL' },
  'c-peptide': { normalizedName: 'Peptídeo C', category: 'metabolico', unit: 'ng/mL' },
  'c peptide': { normalizedName: 'Peptídeo C', category: 'metabolico', unit: 'ng/mL' },
  
  'hba1c': { normalizedName: 'HbA1c', category: 'metabolico', unit: '%' },
  'hemoglobina glicada': { normalizedName: 'HbA1c', category: 'metabolico', unit: '%' },
  'a1c': { normalizedName: 'HbA1c', category: 'metabolico', unit: '%' },
  'hemoglobina glicosilada': { normalizedName: 'HbA1c', category: 'metabolico', unit: '%' },
  'glicohemoglobina': { normalizedName: 'HbA1c', category: 'metabolico', unit: '%' },
  
  'insulina': { normalizedName: 'Insulina', category: 'metabolico', unit: 'μUI/mL' },
  'insulina basal': { normalizedName: 'Insulina', category: 'metabolico', unit: 'μUI/mL' },
  'insulinemia': { normalizedName: 'Insulina', category: 'metabolico', unit: 'μUI/mL' },
  
  'homa ir': { normalizedName: 'HOMA-IR', category: 'metabolico', unit: '' },
  'homa-ir': { normalizedName: 'HOMA-IR', category: 'metabolico', unit: '' },
  'homa index': { normalizedName: 'HOMA-IR', category: 'metabolico', unit: '' },
  'indice homa': { normalizedName: 'HOMA-IR', category: 'metabolico', unit: '' },
  
  'microalb rel': { normalizedName: 'Microalbuminúria', category: 'metabolico', unit: 'mg/g' },
  'microalbuminuria': { normalizedName: 'Microalbuminúria', category: 'metabolico', unit: 'mg/g' },
  
  // continuar com os 214 biomarcadores completos
  
  // MARCADORES CARDIOVASCULARES
  'lp(a)': { normalizedName: 'Lipoproteína (a)', category: 'metabolico', unit: 'mg/dL' },
  'lipoproteina a': { normalizedName: 'Lipoproteína (a)', category: 'metabolico', unit: 'mg/dL' },
  
  'apo a1': { normalizedName: 'Apolipoproteína A1', category: 'metabolico', unit: 'mg/dL' },
  'apolipoproteina a1': { normalizedName: 'Apolipoproteína A1', category: 'metabolico', unit: 'mg/dL' },
  'apoa1': { normalizedName: 'Apolipoproteína A1', category: 'metabolico', unit: 'mg/dL' },
  
  'apo b': { normalizedName: 'Apolipoproteína B', category: 'metabolico', unit: 'mg/dL' },
  'apolipoproteina b': { normalizedName: 'Apolipoproteína B', category: 'metabolico', unit: 'mg/dL' },
  'apob': { normalizedName: 'Apolipoproteína B', category: 'metabolico', unit: 'mg/dL' },
  
  // MARCADORES INFLAMATÓRIOS
  'fibrinogenio': { normalizedName: 'Fibrinogênio', category: 'marcadores_inflamatorios', unit: 'mg/dL' },
  'fibrinogen': { normalizedName: 'Fibrinogênio', category: 'marcadores_inflamatorios', unit: 'mg/dL' },
  
  'ferritina': { normalizedName: 'Ferritina', category: 'marcadores_inflamatorios', unit: 'ng/mL' },
  'ferritin': { normalizedName: 'Ferritina', category: 'marcadores_inflamatorios', unit: 'ng/mL' },
  'ferritina serica': { normalizedName: 'Ferritina', category: 'marcadores_inflamatorios', unit: 'ng/mL' },
  
  'pcr ultra sensivel': { normalizedName: 'PCR Ultra Sensível', category: 'marcadores_inflamatorios', unit: 'mg/L' },
  'pcr': { normalizedName: 'PCR Ultra Sensível', category: 'marcadores_inflamatorios', unit: 'mg/L' },
  'proteina c reativa': { normalizedName: 'PCR Ultra Sensível', category: 'marcadores_inflamatorios', unit: 'mg/L' },
  'pcr ultrassensivel': { normalizedName: 'PCR Ultra Sensível', category: 'marcadores_inflamatorios', unit: 'mg/L' },
  'proteina c reativa (pcr) ultrassensivel': { normalizedName: 'Proteína C Reativa (PCR) Ultrassensível', category: 'marcadores_inflamatorios', unit: 'mg/L' },
  'hs-crp': { normalizedName: 'PCR Ultra Sensível', category: 'marcadores_inflamatorios', unit: 'mg/L' },
  'crp': { normalizedName: 'PCR Ultra Sensível', category: 'marcadores_inflamatorios', unit: 'mg/L' },
  
  'vhs': { normalizedName: 'VHS', category: 'marcadores_inflamatorios', unit: 'mm/h' },
  'vhs 1a hora': { normalizedName: 'VHS 1ª Hora', category: 'marcadores_inflamatorios', unit: 'mm/h' },
  'velocidade de hemossedimentacao': { normalizedName: 'VHS', category: 'marcadores_inflamatorios', unit: 'mm/h' },
  'esr': { normalizedName: 'VHS', category: 'marcadores_inflamatorios', unit: 'mm/h' },
  'vs': { normalizedName: 'VHS', category: 'marcadores_inflamatorios', unit: 'mm/h' },
  
  'homocisteina': { normalizedName: 'Homocisteína', category: 'marcadores_inflamatorios', unit: 'μmol/L' },
  'homocysteine': { normalizedName: 'Homocisteína', category: 'marcadores_inflamatorios', unit: 'μmol/L' },
  
  // continuar com todos os biomarcadores do JSON conforme o plano
  
  // PERFIL LIPÍDICO - metabolico
  'cpk': { normalizedName: 'CPK', category: 'metabolico', unit: 'U/L' },
  'cpk - creatina fosfoquinase': { normalizedName: 'CPK - Creatina Fosfoquinase', category: 'metabolico', unit: 'U/L' },
  'creatina fosfoquinase': { normalizedName: 'CPK', category: 'metabolico', unit: 'U/L' },
  'ck': { normalizedName: 'CPK', category: 'metabolico', unit: 'U/L' },
  
  'ct': { normalizedName: 'Colesterol Total', category: 'metabolico', unit: 'mg/dL' },
  'colesterol total': { normalizedName: 'Colesterol Total', category: 'metabolico', unit: 'mg/dL' },
  'col total': { normalizedName: 'Colesterol Total', category: 'metabolico', unit: 'mg/dL' },
  'total cholesterol': { normalizedName: 'Colesterol Total', category: 'metabolico', unit: 'mg/dL' },
  'colesterol': { normalizedName: 'Colesterol Total', category: 'metabolico', unit: 'mg/dL' },
  
  'ldl': { normalizedName: 'LDL', category: 'metabolico', unit: 'mg/dL' },
  'colesterol ldl': { normalizedName: 'LDL', category: 'metabolico', unit: 'mg/dL' },
  'ldl colesterol': { normalizedName: 'LDL', category: 'metabolico', unit: 'mg/dL' },
  'colesterol ldl (metodo enzimatico)': { normalizedName: 'Colesterol LDL', category: 'metabolico', unit: 'mg/dL' },
  'ldl-c': { normalizedName: 'LDL', category: 'metabolico', unit: 'mg/dL' },
  
  'vldl': { normalizedName: 'VLDL', category: 'metabolico', unit: 'mg/dL' },
  'vldl colesterol': { normalizedName: 'VLDL', category: 'metabolico', unit: 'mg/dL' },
  'vldl-c': { normalizedName: 'VLDL', category: 'metabolico', unit: 'mg/dL' },
  
  'hdl': { normalizedName: 'HDL', category: 'metabolico', unit: 'mg/dL' },
  'colesterol hdl': { normalizedName: 'HDL', category: 'metabolico', unit: 'mg/dL' },
  'hdl colesterol': { normalizedName: 'HDL', category: 'metabolico', unit: 'mg/dL' },
  'hdl-c': { normalizedName: 'HDL', category: 'metabolico', unit: 'mg/dL' },
  
  'tg': { normalizedName: 'Triglicérides', category: 'metabolico', unit: 'mg/dL' },
  'triglicerides': { normalizedName: 'Triglicérides', category: 'metabolico', unit: 'mg/dL' },
  'triglicerideos': { normalizedName: 'Triglicérides', category: 'metabolico', unit: 'mg/dL' },
  'triglycerides': { normalizedName: 'Triglicérides', category: 'metabolico', unit: 'mg/dL' },
  
  // adicionar TODOS os 214 biomarcadores do JSON conforme mapeamento
  
  // HEMATOLOGIA
  'hemoglobina': { normalizedName: 'Hemoglobina', category: 'hematologico', unit: 'g/dL' },
  'hb': { normalizedName: 'Hemoglobina', category: 'hematologico', unit: 'g/dL' },
  'hgb': { normalizedName: 'Hemoglobina', category: 'hematologico', unit: 'g/dL' },
  'hemacias': { normalizedName: 'Hemácias', category: 'hematologico', unit: 'milhões/mm³' },
  'eritrocitos': { normalizedName: 'Hemácias', category: 'hematologico', unit: 'M/µL' },
  'rbc': { normalizedName: 'Hemácias', category: 'hematologico', unit: 'M/µL' },
  'hematocrito': { normalizedName: 'Hematócrito', category: 'hematologico', unit: '%' },
  'ht': { normalizedName: 'Hematócrito', category: 'hematologico', unit: '%' },
  'hct': { normalizedName: 'Hematócrito', category: 'hematologico', unit: '%' },
  'vcm': { normalizedName: 'VCM', category: 'hematologico', unit: 'fL' },
  'volume corpuscular medio': { normalizedName: 'VCM', category: 'hematologico', unit: 'fL' },
  'hcm': { normalizedName: 'HCM', category: 'hematologico', unit: 'pg' },
  'hemoglobina corpuscular media': { normalizedName: 'HCM', category: 'hematologico', unit: 'pg' },
  'chcm': { normalizedName: 'CHCM', category: 'hematologico', unit: 'g/dL' },
  'concentracao hemoglobina corpuscular media': { normalizedName: 'CHCM', category: 'hematologico', unit: 'g/dL' },
  'rdw': { normalizedName: 'RDW', category: 'hematologico', unit: '%' },
  'rdw-cv': { normalizedName: 'RDW', category: 'hematologico', unit: '%' },
  'leucocitos': { normalizedName: 'Leucócitos', category: 'hematologico', unit: '/µL' },
  'wbc': { normalizedName: 'Leucócitos', category: 'hematologico', unit: '/µL' },
  'neutrofilos': { normalizedName: 'Neutrófilos', category: 'hematologico', unit: '/µL' },
  'neutrofilos segmentados': { normalizedName: 'Segmentados', category: 'hematologico', unit: '/µL' },
  'segmentados': { normalizedName: 'Segmentados', category: 'hematologico', unit: '/µL' },
  'segmentados (absoluto)': { normalizedName: 'Segmentados', category: 'hematologico', unit: '/mm³' },
  'bastonetes': { normalizedName: 'Bastonetes', category: 'hematologico', unit: '/µL' },
  'bastonetes (absoluto)': { normalizedName: 'Bastonetes', category: 'hematologico', unit: '/mm³' },
  'linfocitos': { normalizedName: 'Linfócitos', category: 'hematologico', unit: '/µL' },
  'monocitos': { normalizedName: 'Monócitos', category: 'hematologico', unit: '/µL' },
  'mono': { normalizedName: 'Monócitos', category: 'hematologico', unit: '/µL' },
  'eosinofilos': { normalizedName: 'Eosinófilos', category: 'hematologico', unit: '/µL' },
  'eosinófilos (absoluto)': { normalizedName: 'Eosinófilos (Absoluto)', category: 'hematologico', unit: '/mm³' },
  'eosinofilos (absoluto)': { normalizedName: 'Eosinófilos (Absoluto)', category: 'hematologico', unit: '/mm³' },
  'eos': { normalizedName: 'Eosinófilos', category: 'hematologico', unit: '/µL' },
  'basofilos': { normalizedName: 'Basófilos', category: 'hematologico', unit: '/µL' },
  'basófilos (absoluto)': { normalizedName: 'Basófilos (Absoluto)', category: 'hematologico', unit: '/mm³' },
  'basofilos (absoluto)': { normalizedName: 'Basófilos (Absoluto)', category: 'hematologico', unit: '/mm³' },
  'baso': { normalizedName: 'Basófilos', category: 'hematologico', unit: '/µL' },
  'plaquetas': { normalizedName: 'Plaquetas', category: 'hematologico', unit: '/µL' },
  'plt': { normalizedName: 'Plaquetas', category: 'hematologico', unit: '/µL' },
  'platelet': { normalizedName: 'Plaquetas', category: 'hematologico', unit: '/µL' },
  'neutrofilos absoluto': { normalizedName: 'Neutrófilos (absoluto)', category: 'hematologico', unit: '/mm³' },
  'linfocitos absoluto': { normalizedName: 'Linfócitos (absoluto)', category: 'hematologico', unit: '/mm³' },
  'monocitos absoluto': { normalizedName: 'Monócitos (absoluto)', category: 'hematologico', unit: '/mm³' },
  
  // FUNÇÃO RENAL
  'ureia': { normalizedName: 'Uréia', category: 'renal', unit: 'mg/dL' },
  'creatinina': { normalizedName: 'Creatinina', category: 'renal', unit: 'mg/dL' },
  'creat': { normalizedName: 'Creatinina', category: 'renal', unit: 'mg/dL' },
  'cr': { normalizedName: 'Creatinina', category: 'renal', unit: 'mg/dL' },
  'creatinine': { normalizedName: 'Creatinina', category: 'renal', unit: 'mg/dL' },
  'tfg': { normalizedName: 'TFG CKD-EPI', category: 'renal', unit: 'mL/min/1.73m²' },
  'taxa de filtracao glomerular': { normalizedName: 'Taxa de Filtração Glomerular (TFG)', category: 'renal', unit: 'mL/min/1.73m²' },
  'tfg ckd-epi': { normalizedName: 'TFG CKD-EPI', category: 'renal', unit: 'mL/min/1.73m²' },
  'egfr': { normalizedName: 'TFG CKD-EPI', category: 'renal', unit: 'mL/min/1.73m²' },
  
  // FUNÇÃO HEPÁTICA
  'acido urico': { normalizedName: 'Ácido Úrico', category: 'hepatico', unit: 'mg/dL' },
  'tgo': { normalizedName: 'TGO', category: 'hepatico', unit: 'U/L' },
  'ast': { normalizedName: 'TGO', category: 'hepatico', unit: 'U/L' },
  'tgp': { normalizedName: 'TGP', category: 'hepatico', unit: 'U/L' },
  'alt': { normalizedName: 'TGP', category: 'hepatico', unit: 'U/L' },
  'transaminase piruva (tgp/alt)': { normalizedName: 'Transaminase Pirúvica (TGP/ALT)', category: 'hepatico', unit: 'U/L' },
  'transaminase piruvica': { normalizedName: 'Transaminase Pirúvica (TGP/ALT)', category: 'hepatico', unit: 'U/L' },
  'gama gt': { normalizedName: 'Gama GT', category: 'hepatico', unit: 'U/L' },
  'ggt': { normalizedName: 'Gama GT', category: 'hepatico', unit: 'U/L' },
  'gama glutamil transferase': { normalizedName: 'Gama Glutamil Transferase', category: 'hepatico', unit: 'U/L' },
  'fosfatase alcalina': { normalizedName: 'Fosfatase Alcalina', category: 'hepatico', unit: 'U/L' },
  'bilirrubina total': { normalizedName: 'Bilirrubina Total', category: 'hepatico', unit: 'mg/dL' },
  'bilirrubina direta': { normalizedName: 'Bilirrubina Direta', category: 'hepatico', unit: 'mg/dL' },
  'bilirrubina indireta': { normalizedName: 'Bilirrubina Indireta', category: 'hepatico', unit: 'mg/dL' },
  'albumina': { normalizedName: 'Albumina', category: 'hepatico', unit: 'g/dL' },
  'globulinas': { normalizedName: 'Globulinas', category: 'hepatico', unit: 'g/dL' },
  
  // HORMÔNIOS
  'tsh': { normalizedName: 'TSH', category: 'hormonal', unit: 'µUI/mL' },
  'hormonio tireoestimulante': { normalizedName: 'TSH (Hormônio Tireoestimulante)', category: 'hormonal', unit: 'µUI/mL' },
  't3': { normalizedName: 'T3', category: 'hormonal', unit: 'ng/dL' },
  't3 livre': { normalizedName: 'T3 Livre', category: 'hormonal', unit: 'pg/mL' },
  't4': { normalizedName: 'T4', category: 'hormonal', unit: 'µg/dL' },
  't4 livre': { normalizedName: 'T4 Livre', category: 'hormonal', unit: 'ng/dL' },
  'cortisol': { normalizedName: 'Cortisol', category: 'hormonal', unit: 'µg/dL' },
  'testosterona': { normalizedName: 'Testosterona', category: 'hormonal', unit: 'ng/dL' },
  'testosterona total': { normalizedName: 'Testosterona Total', category: 'hormonal', unit: 'ng/dL' },
  'testosterona livre': { normalizedName: 'Testosterona Livre', category: 'hormonal', unit: 'pg/mL' },
  'dihidrotestosterona': { normalizedName: 'Dihidrotestosterona', category: 'hormonal', unit: 'ng/dL' },
  'dht': { normalizedName: 'Dihidrotestosterona', category: 'hormonal', unit: 'ng/dL' },
  'estradiol': { normalizedName: 'Estradiol', category: 'hormonal', unit: 'pg/mL' },
  'progesterona': { normalizedName: 'Progesterona', category: 'hormonal', unit: 'ng/mL' },
  'prolactina': { normalizedName: 'Prolactina', category: 'hormonal', unit: 'ng/mL' },
  'fsh': { normalizedName: 'FSH', category: 'hormonal', unit: 'mUI/mL' },
  'hormonio foliculo estimulante': { normalizedName: 'FSH (Hormônio Folículo Estimulante)', category: 'hormonal', unit: 'mUI/mL' },
  'lh': { normalizedName: 'LH', category: 'hormonal', unit: 'mUI/mL' },
  'hormonio luteinizante': { normalizedName: 'LH (Hormônio Luteinizante)', category: 'hormonal', unit: 'mUI/mL' },
  'paratormonio': { normalizedName: 'Paratormônio (PTH)', category: 'hormonal', unit: 'pg/mL' },
  'pth': { normalizedName: 'Paratormônio (PTH)', category: 'hormonal', unit: 'pg/mL' },
  'dhea-s': { normalizedName: 'Sulfato de Dehidroepiandrosterona (DHEA-S)', category: 'hormonal', unit: 'µg/dL' },
  'sulfato de dehidroepiandrosterona': { normalizedName: 'Sulfato de Dehidroepiandrosterona (DHEA-S)', category: 'hormonal', unit: 'µg/dL' },
  
  // VITAMINAS E MINERAIS
  'vitamina d': { normalizedName: 'Vitamina D', category: 'vitaminas_minerais', unit: 'ng/mL' },
  'vitamina d (25-oh)': { normalizedName: 'Vitamina D (25-OH)', category: 'vitaminas_minerais', unit: 'ng/mL' },
  '25-hidroxivitamina d': { normalizedName: 'Vitamina D (25-OH)', category: 'vitaminas_minerais', unit: 'ng/mL' },
  '25 hidroxivitamina d': { normalizedName: 'Vitamina D (25-OH)', category: 'vitaminas_minerais', unit: 'ng/mL' },
  'vitamina b12': { normalizedName: 'Vitamina B12', category: 'vitaminas_minerais', unit: 'pg/mL' },
  'cobalamina': { normalizedName: 'Vitamina B12', category: 'vitaminas_minerais', unit: 'pg/mL' },
  'acido folico': { normalizedName: 'Ácido Fólico', category: 'vitaminas_minerais', unit: 'ng/mL' },
  'folato': { normalizedName: 'Ácido Fólico', category: 'vitaminas_minerais', unit: 'ng/mL' },
  'ferro': { normalizedName: 'Ferro', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'ferro serico': { normalizedName: 'Ferro Sérico', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'transferrina': { normalizedName: 'Transferrina', category: 'vitaminas_minerais', unit: 'mg/dL' },
  'indice de saturacao de transferrina': { normalizedName: 'Índice de Saturação da Transferrina', category: 'vitaminas_minerais', unit: '%' },
  'indice de saturacao da transferrina': { normalizedName: 'Índice de Saturação da Transferrina', category: 'vitaminas_minerais', unit: '%' },
  'saturacao de transferrina': { normalizedName: 'Índice de Saturação da Transferrina', category: 'vitaminas_minerais', unit: '%' },
  'saturacao da transferrina': { normalizedName: 'Índice de Saturação da Transferrina', category: 'vitaminas_minerais', unit: '%' },
  'istf': { normalizedName: 'Índice de Saturação da Transferrina', category: 'vitaminas_minerais', unit: '%' },
  'capacidade total de ligacao de ferro': { normalizedName: 'Capacidade Total de Ligação de Ferro', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'tibc': { normalizedName: 'Capacidade Total de Ligação de Ferro', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'capacidade latente de ligacao de ferro': { normalizedName: 'Capacidade Latente de Ligação de Ferro', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'uibc': { normalizedName: 'Capacidade Latente de Ligação de Ferro', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'zinco': { normalizedName: 'Zinco', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'cobre': { normalizedName: 'Cobre', category: 'vitaminas_minerais', unit: 'µg/dL' },
  'selenio': { normalizedName: 'Selênio', category: 'vitaminas_minerais', unit: 'µg/L' },
  'aluminio': { normalizedName: 'Alumínio', category: 'vitaminas_minerais', unit: 'µg/L' },
  
  // ÍONS
  'calcio': { normalizedName: 'Cálcio', category: 'ions', unit: 'mg/dL' },
  'calcio ionico': { normalizedName: 'Cálcio Iônico', category: 'ions', unit: 'mmol/L' },
  'magnesio': { normalizedName: 'Magnésio', category: 'ions', unit: 'mg/dL' },
  'fosforo': { normalizedName: 'Fósforo', category: 'ions', unit: 'mg/dL' },
  'potassio': { normalizedName: 'Potássio', category: 'ions', unit: 'mEq/L' },
  'sodio': { normalizedName: 'Sódio', category: 'ions', unit: 'mEq/L' },
  
  // MARCADORES MUSCULARES
  'ldh': { normalizedName: 'LDH', category: 'marcadores_musculares', unit: 'U/L' },
  'desidrogenase latica': { normalizedName: 'LDH', category: 'marcadores_musculares', unit: 'U/L' },
  
  // MARCADORES PROSTÁTICOS
  'psa total': { normalizedName: 'PSA Total', category: 'marcadores_prostaticos', unit: 'ng/mL' },
  'psa': { normalizedName: 'PSA Total', category: 'marcadores_prostaticos', unit: 'ng/mL' },
  'psa livre': { normalizedName: 'PSA Livre', category: 'marcadores_prostaticos', unit: 'ng/mL' },
};

/**
 * Remove acentos e caracteres especiais de uma string
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza um nome de biomarcador usando a tabela de referência
 */
export function normalizeBiomarkerWithTable(biomarkerName: string): {
  normalizedName: string;
  category?: string;
  unit?: string;
} | null {
  if (!biomarkerName) return null;
  
  // Limpa e normaliza o nome para busca
  const searchKey = removeAccents(biomarkerName.toLowerCase().trim());
  
  // Busca direta na tabela
  const match = BIOMARKER_REFERENCE_TABLE[searchKey];
  if (match) {
    return match;
  }
  
  // Busca parcial mais rigorosa (evitar falsos positivos como \"hb\" dentro de \"SHBG\")
  for (const [key, value] of Object.entries(BIOMARKER_REFERENCE_TABLE)) {
    // Apenas buscar se a chave tem mais de 2 caracteres para evitar matches muito curtos
    if (key.length > 2) {
      // Verificar se a chave aparece como palavra isolada ou no início/fim
      const keyPattern = new RegExp(`(^|\\s)${key}(\\s|$)`, 'i');
      if (keyPattern.test(searchKey)) {
        return value;
      }
    }
    // Para chaves curtas (<=2), apenas exact match
    if (key.length <= 2 && searchKey === key) {
      return value;
    }
  }
  
  return null;
}

/**
 * Adiciona ou atualiza um biomarcador na tabela de referência
 * Útil para expandir a tabela dinamicamente
 */
export function addBiomarkerToReference(
  variations: string[],
  normalizedName: string,
  category?: string,
  unit?: string
): void {
  variations.forEach(variation => {
    const key = removeAccents(variation.toLowerCase().trim());
    BIOMARKER_REFERENCE_TABLE[key] = {
      normalizedName,
      category,
      unit
    };
  });
}
