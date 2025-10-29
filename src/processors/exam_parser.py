"""
Parser de Exames com Claude Haiku
Extrai, normaliza e deduplica resultados de exames
Economia estimada: ~66% vs Claude Sonnet
"""

import re
import json
import uuid
from typing import List, Dict, Any
from src.config import (
    CLAUDE_HAIKU_MODEL,
    CLAUDE_MAX_TOKENS,
    CLAUDE_TEMPERATURE,
    EXAM_NAME_SIMILARITY_THRESHOLD
)


def parse_exams_from_text(extracted_text: str, anthropic_client) -> List[Dict[str, Any]]:
    """
    Parseia exames usando Claude Haiku com prompt otimizado
    Processa documentos completos com chunking automático
    
    Args:
        extracted_text: Texto extraído do PDF
        anthropic_client: Cliente Anthropic
        
    Returns:
        Lista de exames estruturados
    """
    # Processar texto completo em chunks se necessário
    max_chunk_size = 12000  # ~3000 tokens
    
    if len(extracted_text) > max_chunk_size:
        print(f'📄 Documento longo detectado: {len(extracted_text)} caracteres')
        return _parse_long_document(extracted_text, anthropic_client, max_chunk_size)
    else:
        return _parse_single_chunk(extracted_text, anthropic_client)


def _parse_single_chunk(text: str, anthropic_client) -> List[Dict[str, Any]]:
    """Parseia um único chunk de texto"""
    
    # Lista de biomarcadores válidos (top 80 mais comuns)
    valid_biomarkers = """
BIOMARCADORES VÁLIDOS (use nomes padronizados):
- GLICEMIA JEJUM, HbA1c, INSULINA, HOMA IR, PEPTÍDEO C
- CT (Colesterol Total), LDL, HDL, VLDL, TG (Triglicérides)
- CREATININA, URÉIA, TFG CKD-EPI, ÁCIDO ÚRICO
- TGO/AST, TGP/ALT, GGT, FA (Fosfatase Alcalina), ALBUMINA
- TSH, T3 LIVRE, T4 LIVRE, T3 TOTAL, T4 TOTAL
- TESTOSTERONA TOTAL, TESTOSTERONA LIVRE, ESTRADIOL, PROGESTERONA
- CORTISOL, DHEA-S, PROLACTINA, LH, FSH
- 25-OH VIT D, VIT B12, ÁCIDO FÓLICO, FERRITINA, FERRO
- PCR ULTRA SENSÍVEL, VHS, HOMOCISTEÍNA, FIBRINOGÊNIO
- HEMOGLOBINA, HEMATÓCRITO, HEMÁCIAS, LEUCÓCITOS, PLAQUETAS
- NEUTRÓFILOS, LINFÓCITOS, MONÓCITOS, EOSINÓFILOS, BASÓFILOS
- VCM, HCM, CHCM, RDW
- PSA TOTAL, PSA LIVRE, CEA, CA 125, CA 19-9
- SÓDIO, POTÁSSIO, CÁLCIO, MAGNÉSIO, FÓSFORO, CLORO
- PROTEÍNAS TOTAIS, BILIRRUBINA TOTAL, BBD, BBI
"""
    
    prompt = f"""Você é um extrator especializado de laudos laboratoriais brasileiros.

═══════════════════════════════════════
🎯 TAREFA: EXTRAIR VALORES DE TABELAS
═══════════════════════════════════════

TABELAS VERTICAIS (90% dos casos brasileiros):
┌────────────────────────┬────────────┐
│ Valor de Referência    │ Resultado  │  ← EXTRAIA DESTA COLUNA
├────────────────────────┼────────────┤
│ 0 - 20 mm/h           │ 38,0 mm/h  │  → value: "38.0", unit: "mm/h"
│ até 5 mg/L            │ 2,90 mg/L  │  → value: "2.90", unit: "mg/L"
│ 70 - 99 mg/dL         │ 95 mg/dL   │  → value: "95", unit: "mg/dL"
└────────────────────────┴────────────┘

OPERADORES (valores não-detectáveis):
│ Inferior a 8 UI/mL │  → value: "< 8", unit: "UI/mL"
│ Superior a 1000    │  → value: "> 1000"

TABELAS HORIZONTAIS (10% dos casos):
Glicemia de Jejum: 95 mg/dL (VR: 70-99)
→ value: "95", unit: "mg/dL"

═══════════════════════════════════════
⚠️ REGRAS CRÍTICAS
═══════════════════════════════════════

1. **SEMPRE extraia o valor da coluna "Resultado"**
2. **Converta vírgula → ponto**: "38,0" → "38.0"
3. **Remova unidades do valor**: "95 mg/dL" → value: "95", unit: "mg/dL"
4. **Preserve operadores**: "Inferior a X" → "< X", "Superior a X" → "> X"
5. **Se não encontrar valor numérico, deixe campo vazio (não invente)**
6. **Ignore cabeçalhos de tabela** (não são biomarcadores)
7. **NUNCA extraia nomes de laboratórios ou cabeçalhos como biomarcadores**

═══════════════════════════════════════
EXPANSÃO DE EXAMES COMPOSTOS
═══════════════════════════════════════

- **Hemograma Completo**: Extraia 13+ biomarcadores individuais:
  Hemácias, Hemoglobina, Hematócrito, VCM, HCM, CHCM, RDW,
  Leucócitos, Neutrófilos, Linfócitos, Monócitos, Eosinófilos, Basófilos, Plaquetas

- **Lipidograma**: Extraia 5 biomarcadores:
  CT (Colesterol Total), LDL, HDL, VLDL, TG (Triglicérides)

- **Função Renal**: Creatinina, Ureia, TFG CKD-EPI, Ácido Úrico

- **Função Hepática**: TGO/AST, TGP/ALT, GGT, Fosfatase Alcalina, Bilirrubinas, Albumina

{valid_biomarkers}

═══════════════════════════════════════
📋 FORMATO JSON (SOMENTE ISSO)
═══════════════════════════════════════

[
  {{
    "exam_name": "VHS",
    "value": "38.0",
    "unit": "mm/h",
    "reference_min": "0",
    "reference_max": "20",
    "status": "alto",
    "method": null,
    "observation": null
  }},
  {{
    "exam_name": "FATOR REUMATÓIDE",
    "value": "< 8",
    "unit": "UI/mL",
    "reference_min": null,
    "reference_max": "8",
    "status": "normal",
    "method": null,
    "observation": null
  }},
  {{
    "exam_name": "GLICEMIA JEJUM",
    "value": "95",
    "unit": "mg/dL",
    "reference_min": "70",
    "reference_max": "99",
    "status": "normal",
    "method": null,
    "observation": null
  }}
]

═══════════════════════════════════════
📄 LAUDO A PROCESSAR
═══════════════════════════════════════

{text[:12000]}

═══════════════════════════════════════
✅ RESPOSTA (SOMENTE JSON, SEM TEXTO)
═══════════════════════════════════════"""
    
    try:
        message = anthropic_client.messages.create(
            model=CLAUDE_HAIKU_MODEL,
            max_tokens=CLAUDE_MAX_TOKENS,
            temperature=CLAUDE_TEMPERATURE,
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = message.content[0].text
        
        # Extrair JSON da resposta
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            exams = json.loads(json_match.group(0))
            print(f'✅ Claude Haiku: {len(exams)} biomarcadores extraídos')
            return exams
        else:
            print('⚠️ Claude Haiku: Resposta sem JSON válido')
            return []
        
    except Exception as e:
        print(f'❌ Claude Haiku falhou: {e}')
        import traceback
        traceback.print_exc()
        return []


def _parse_long_document(text: str, anthropic_client, chunk_size: int) -> List[Dict[str, Any]]:
    """
    Parseia documentos longos dividindo em chunks com overlap
    Evita perder biomarcadores nas bordas dos chunks
    """
    overlap = 1000  # 1000 chars de overlap entre chunks
    chunks = []
    
    # Dividir texto em chunks com overlap
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        chunks.append(chunk)
    
    print(f'📦 Processando {len(chunks)} chunks com overlap...')
    
    all_exams = []
    seen_exams = set()  # Para deduplicar entre chunks
    
    for idx, chunk in enumerate(chunks):
        print(f'🔄 Processando chunk {idx + 1}/{len(chunks)}...')
        chunk_exams = _parse_single_chunk(chunk, anthropic_client)
        
        # Adicionar apenas exames únicos (evitar duplicatas do overlap)
        for exam in chunk_exams:
            exam_key = f"{exam.get('exam_name', '')}-{exam.get('value', '')}"
            if exam_key not in seen_exams:
                all_exams.append(exam)
                seen_exams.add(exam_key)
    
    print(f'✅ Total de biomarcadores extraídos de todos os chunks: {len(all_exams)}')
    return all_exams


def clean_reference_values(exames: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Normaliza valores de referência (min/max)
    
    Args:
        exames: Lista de exames brutos
        
    Returns:
        Lista de exames com referências normalizadas
    """
    for exam in exames:
        # Garantir que reference_min e reference_max sejam float ou None
        for field in ['reference_min', 'reference_max']:
            value = exam.get(field)
            
            if value is None or value == '':
                exam[field] = None
            elif isinstance(value, str):
                # Limpar string e converter
                clean_value = value.strip().replace(',', '.')
                try:
                    exam[field] = float(clean_value)
                except ValueError:
                    exam[field] = None
            elif isinstance(value, (int, float)):
                exam[field] = float(value)
        
        # Garantir que value seja numérico quando possível
        value = exam.get('value')
        if isinstance(value, str):
            clean_value = value.strip().replace(',', '.')
            # Remover unidades que possam estar grudadas
            clean_value = re.sub(r'[a-zA-Z/%]+$', '', clean_value).strip()
            try:
                exam['value'] = float(clean_value)
            except ValueError:
                pass  # Manter como string se não for conversível
    
    return exames


def deduplicate_exams(exames: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove exames duplicados, mantendo o mais completo
    
    Args:
        exames: Lista de exames (pode ter duplicatas)
        
    Returns:
        Lista dedupilcada
    """
    from difflib import SequenceMatcher
    
    def are_similar(name1: str, name2: str, threshold: float = EXAM_NAME_SIMILARITY_THRESHOLD) -> bool:
        """Verifica se dois nomes de exames são similares"""
        n1 = name1.lower().strip()
        n2 = name2.lower().strip()
        return SequenceMatcher(None, n1, n2).ratio() >= threshold
    
    def completeness_score(exam: Dict[str, Any]) -> int:
        """Calcula pontuação de completude de um exame"""
        score = 0
        if exam.get('value') not in [None, '']:
            score += 10
        if exam.get('reference_min') is not None:
            score += 5
        if exam.get('reference_max') is not None:
            score += 5
        if exam.get('unit'):
            score += 3
        if exam.get('status'):
            score += 2
        if exam.get('method'):
            score += 1
        return score
    
    # Agrupar exames similares
    groups = []
    for exam in exames:
        exam_name = exam.get('exam_name', '')
        
        # Tentar adicionar a um grupo existente
        added = False
        for group in groups:
            if are_similar(group[0]['exam_name'], exam_name):
                group.append(exam)
                added = True
                break
        
        # Criar novo grupo se necessário
        if not added:
            groups.append([exam])
    
    # Manter o mais completo de cada grupo
    deduplicated = []
    for group in groups:
        if len(group) == 1:
            deduplicated.append(group[0])
        else:
            # Ordenar por completude e pegar o melhor
            sorted_group = sorted(group, key=completeness_score, reverse=True)
            deduplicated.append(sorted_group[0])
            print(f'🔄 Deduplicado: {sorted_group[0]["exam_name"]} ({len(group)} versões)')
    
    print(f'✅ Deduplicação: {len(exames)} -> {len(deduplicated)} exames')
    return deduplicated


def assign_biomarker_ids(exames: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Adiciona IDs únicos a cada exame
    
    Args:
        exames: Lista de exames
        
    Returns:
        Lista de exames com biomarker_id
    """
    for exam in exames:
        if 'biomarker_id' not in exam:
            exam['biomarker_id'] = str(uuid.uuid4())
    
    return exames
