"""
Processamento de Header do Exame
Extração com cache S3 + Gemini Flash Vision (mais rápido e barato)
Economia estimada: ~97% em custos de visão comparado ao Claude
"""

import re
import io
import json
import fitz  # PyMuPDF
from typing import Dict, Any, Optional
from src.config import GEMINI_API_KEY, GEMINI_VISION_MODEL, GEMINI_MAX_TOKENS, GEMINI_TEMPERATURE
import google.generativeai as genai


def extract_patient_identifiers_from_text(text: str) -> Dict[str, Optional[str]]:
    """
    Extração rápida via regex (sem IA)
    
    Args:
        text: Texto extraído do PDF
        
    Returns:
        Dict com nome e data_nascimento (ou None)
    """
    # ✅ PROTEÇÃO: Validar entrada
    if not text or not isinstance(text, str):
        print("⚠️ extract_patient_identifiers_from_text recebeu texto inválido")
        return {'nome': None, 'data_nascimento': None}
    
    identifiers = {
        'nome': None,
        'data_nascimento': None
    }
    
    # Regex para data de nascimento (DD/MM/YYYY)
    date_pattern = r'\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b'
    dates = re.findall(date_pattern, text)
    if dates:
        identifiers['data_nascimento'] = dates[0].replace('-', '/')
    
    # Regex para nome (linhas com 2+ palavras capitalizadas)
    name_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b'
    names = re.findall(name_pattern, text)
    
    # Pegar o primeiro nome válido
    for name in names:
        if len(name) >= 8 and len(name.split()) >= 2:
            identifiers['nome'] = name
            break
    
    return identifiers


def extract_lab_hint_from_text(text: str) -> str:
    """
    Detecta nome do laboratório no texto (dica para cache)
    
    Args:
        text: Texto extraído
        
    Returns:
        str: Nome do laboratório ou vazio
    """
    # Regex para laboratórios comuns
    lab_patterns = [
        r'Laborat[óo]rio\s+([A-Z][a-zA-Z\s]+)',
        r'LAB\s+([A-Z][a-zA-Z\s]+)',
        r'([A-Z][a-zA-Z]+)\s+Laborat[óo]rio'
    ]
    
    for pattern in lab_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
    
    return ''


def extract_header_with_vision(pdf_path: str, gemini_client=None) -> Dict[str, Any]:
    """
    Extração com Gemini Flash Vision (mais barato e rápido que Claude)
    
    Args:
        pdf_path: Caminho do PDF
        gemini_client: Cliente Gemini (opcional, será criado se None)
        
    Returns:
        Dict com dados do header extraídos
    """
    try:
        # Configurar Gemini (se ainda não foi configurado)
        if not gemini_client:
            if not GEMINI_API_KEY:
                raise Exception('GEMINI_API_KEY não configurada')
            genai.configure(api_key=GEMINI_API_KEY)
        
        # Converter primeira página para imagem usando PyMuPDF
        doc = fitz.open(pdf_path)
        
        if len(doc) == 0:
            raise Exception('PDF não possui páginas')
        
        # Renderizar primeira página em alta resolução
        page = doc[0]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom para melhor qualidade
        img_bytes = pix.tobytes("png")
        doc.close()
        
        # Preparar imagem para Gemini
        import PIL.Image
        image = PIL.Image.open(io.BytesIO(img_bytes))
        
        # Prompt otimizado para Gemini
        prompt = """Analise esta primeira página de um laudo de exames médicos e extraia:

1. **Nome do Paciente**: Nome completo do paciente (mínimo 2 palavras)
2. **Data de Nascimento**: No formato DD/MM/YYYY
3. **Data do Exame**: Data em que o exame foi realizado (DD/MM/YYYY)
4. **Laboratório**: Nome do laboratório que emitiu o laudo

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional:
{
  "paciente": "Nome Completo do Paciente",
  "data_nascimento": "DD/MM/YYYY",
  "data_exame": "DD/MM/YYYY",
  "laboratorio": "Nome do Laboratório"
}

Se não encontrar algum campo, use null."""
        
        # Chamar Gemini Flash Vision
        model = genai.GenerativeModel(
            model_name=GEMINI_VISION_MODEL,
            generation_config={
                'temperature': GEMINI_TEMPERATURE,
                'max_output_tokens': GEMINI_MAX_TOKENS,
            }
        )
        
        response = model.generate_content([prompt, image])
        response_text = response.text.strip()
        
        # Remover markdown se presente
        if response_text.startswith('```'):
            response_text = re.sub(r'^```json\s*|\s*```$', '', response_text, flags=re.MULTILINE)
        
        json_match = re.search(r'\{[^}]+\}', response_text, re.DOTALL)
        if json_match:
            header_data = json.loads(json_match.group(0))
            print(f'✅ Gemini Flash Vision: Header extraído')
            return header_data
        else:
            print('⚠️ Gemini Flash Vision: Resposta sem JSON válido')
            print(f'Resposta recebida: {response_text[:200]}')
            return {}
        
    except Exception as e:
        print(f'❌ Gemini Flash Vision falhou: {e}')
        return {}


def extract_header_with_cache(
    pdf_path: str,
    extracted_text: str,
    vision_client,
    cache
) -> Dict[str, Any]:
    """
    Orquestrador: tenta identificação rápida -> cache -> visão
    
    Args:
        pdf_path: Caminho do PDF
        extracted_text: Texto já extraído
        vision_client: Cliente de visão (Gemini ou Claude)
        cache: Instância de HeaderCacheS3
        
    Returns:
        Dict com header completo
    """
    # Passo 1: Identificação rápida (regex)
    identifiers = extract_patient_identifiers_from_text(extracted_text)
    lab_hint = extract_lab_hint_from_text(extracted_text)
    
    nome = identifiers.get('nome')
    data_nasc = identifiers.get('data_nascimento')
    
    # Passo 2: Tentar cache (se temos identificadores)
    if nome and data_nasc:
        cached_header = cache.get(nome, data_nasc, lab_hint)
        if cached_header:
            return cached_header
    
    # Passo 3: Usar Gemini Flash Vision (cache miss)
    print('🔍 Cache miss, usando Gemini Flash Vision...')
    header = extract_header_with_vision(pdf_path, vision_client)
    
    # Passo 4: Salvar no cache (se válido)
    # Suporta tanto 'nome' quanto 'paciente' no retorno
    patient_name = header.get('paciente') or header.get('nome')
    birth_date = header.get('data_nascimento')
    
    if patient_name and birth_date:
        cache.put(patient_name, birth_date, header)
    
    return header
