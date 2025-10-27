"""
Validadores de Dados
Valida nomes de pacientes, datas, estruturas de exames e extração de texto
"""

import re
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from src.config import (
    PATIENT_NAME_BLACKLIST,
    MIN_NAME_LENGTH,
    MAX_NAME_LENGTH,
    MIN_NAME_WORDS,
    MIN_WORD_LENGTH,
    MIN_PATIENT_AGE,
    MAX_PATIENT_AGE
)


# ========================================
# VALIDAÇÃO DE NOME DO PACIENTE
# ========================================

def is_valid_patient_name(name: str) -> bool:
    """
    Validação rigorosa de nome do paciente
    
    Args:
        name: Nome do paciente a ser validado
        
    Returns:
        True se o nome é válido, False caso contrário
    """
    if not name:
        return False
        
    name = ' '.join(name.split())  # Normalizar espaços
    
    # Verificações básicas (usando constantes)
    if len(name) < MIN_NAME_LENGTH or len(name) > MAX_NAME_LENGTH:
        return False
    
    words = name.split()
    if len(words) < MIN_NAME_WORDS:
        return False
    
    if any(len(word) < MIN_WORD_LENGTH for word in words):
        return False
    
    # Blacklist (usando constante importada)
    name_lower = name.lower()
    for term in PATIENT_NAME_BLACKLIST:
        if re.search(r'\b' + re.escape(term) + r'\b', name_lower):
            return False
    
    return True


# Alias para compatibilidade
validate_patient_name = is_valid_patient_name


def extract_patient_name_from_text(extracted_text: str) -> Optional[str]:
    """
    Extrai nome do paciente usando padrões específicos para laudos brasileiros
    
    Args:
        extracted_text: Texto extraído do laudo
        
    Returns:
        Nome do paciente ou None se não encontrado
    """
    if not extracted_text:
        return None
        
    # Padrões ordenados por especificidade
    patterns = [
        # 1. Padrão explícito com separador claro (: ou |)
        r'(?:Paciente|Nome\s+do\s+Paciente|Nome)\s*[:\|]\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ\s]{7,80})(?=\s*(?:\n|Data|CPF|RG|Idade|Sexo|\d{2}/\d{2}/\d{4}))',
        # 2. Nome em linha própria (formato comum em cabeçalhos)
        r'(?:^|\n)([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{3,}(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}){1,5})(?=\s*\n)',
        # 3. Formato tabular com pipes
        r'\|\s*(?:Paciente|Nome)\s*\|\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][^|\n]{7,60}?)\s*\|'
    ]
    
    for i, pattern in enumerate(patterns, 1):
        matches = re.finditer(pattern, extracted_text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            candidate = match.group(1).strip()
            if is_valid_patient_name(candidate):
                print(f'✅ Nome extraído (padrão {i}): {candidate}')
                return candidate
    
    print('⚠️ Regex falhou - Claude extrairá o nome')
    return None


# ========================================
# EXTRAÇÃO DE DATA DE NASCIMENTO
# ========================================

def extract_birth_date_from_text(extracted_text: str) -> Optional[str]:
    """
    Extrai data de nascimento usando padrões específicos
    
    Args:
        extracted_text: Texto extraído do laudo
        
    Returns:
        Data de nascimento no formato DD/MM/YYYY ou None
    """
    if not extracted_text:
        return None
        
    patterns = [
        # Data de Nascimento: 01/01/1990
        r'(?:Data\s+de\s+)?Nascimento\s*[:\|]?\s*(\d{2}/\d{2}/\d{4})',
        # Nasc.: 01/01/1990
        r'Nasc\.?\s*[:\|]?\s*(\d{2}/\d{2}/\d{4})',
        # DN: 01/01/1990
        r'DN\s*[:\|]?\s*(\d{2}/\d{2}/\d{4})',
        # |Data Nasc.| 01/01/1990|
        r'\|\s*Data\s+Nasc\.?\s*\|\s*(\d{2}/\d{2}/\d{4})',
        # Nascimento\n01/01/1990
        r'\|\s*Nascimento\s*\|\s*(\d{2}/\d{2}/\d{4})',
    ]
    
    current_year = datetime.now().year
    
    for pattern in patterns:
        match = re.search(pattern, extracted_text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            # Validar se é data válida
            try:
                day, month, year = map(int, date_str.split('/'))
                if (1 <= day <= 31 and 
                    1 <= month <= 12 and 
                    1900 <= year <= current_year):
                    
                    # Validar idade razoável
                    age = current_year - year
                    if MIN_PATIENT_AGE <= age <= MAX_PATIENT_AGE:
                        print(f'✅ Data de nascimento extraída: {date_str}')
                        return date_str
            except:
                continue
    
    print('⚠️ Data de nascimento não encontrada')
    return None


# ========================================
# EXTRAÇÃO DE NOME DO LABORATÓRIO
# ========================================

def extract_lab_name_from_text(extracted_text: str) -> Optional[str]:
    """
    Extrai nome do laboratório (geralmente no topo do documento)
    
    Args:
        extracted_text: Texto extraído do laudo
        
    Returns:
        Nome do laboratório ou None
    """
    if not extracted_text:
        return None
        
    # Pegar as primeiras 500 caracteres (cabeçalho)
    header = extracted_text[:500]
    
    patterns = [
        # Laboratório explícito
        r'Laborat[oó]rio\s*[:\|]?\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][A-Za-záàâãéèêíïóôõöúçñ\s]{5,60})(?=\s*(?:\n|CNPJ|Endere))',
        # Nome em MAIÚSCULAS no topo (geralmente laboratório)
        r'^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]{10,60})(?=\s*\n)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, header, re.MULTILINE | re.IGNORECASE)
        if match:
            lab_name = match.group(1).strip()
            # Validar que não é nome de pessoa
            if not is_valid_patient_name(lab_name):
                print(f'✅ Laboratório extraído: {lab_name}')
                return lab_name
    
    print('⚠️ Nome do laboratório não encontrado')
    return None


# ========================================
# VALIDAÇÃO DE DATA DE NASCIMENTO
# ========================================

def validate_birth_date(data: str) -> bool:
    """
    Valida data de nascimento
    
    Args:
        data: Data no formato DD/MM/YYYY
        
    Returns:
        bool: True se data é válida
    """
    if not data or not isinstance(data, str):
        return False
    
    try:
        # Tentar parsear data brasileira
        date_obj = datetime.strptime(data.strip(), '%d/%m/%Y')
        
        # Calcular idade
        today = datetime.now()
        age = today.year - date_obj.year - ((today.month, today.day) < (date_obj.month, date_obj.day))
        
        # Validar idade
        if age < MIN_PATIENT_AGE or age > MAX_PATIENT_AGE:
            print(f'⚠️ Idade fora do range: {age} anos')
            return False
        
        # Verificar se não é data futura
        if date_obj > today:
            print('⚠️ Data de nascimento no futuro')
            return False
        
        return True
        
    except ValueError:
        return False


# ========================================
# VALIDAÇÃO DE ESTRUTURA DE EXAMES
# ========================================


def validate_exam_data(exam: Dict[str, Any]) -> bool:
    """
    Valida estrutura básica de um exame
    
    Args:
        exam: Dicionário com dados do exame
        
    Returns:
        bool: True se estrutura é válida
    """
    required_fields = ['exam_name', 'value']
    
    # Verificar campos obrigatórios
    for field in required_fields:
        if field not in exam or not exam[field]:
            return False
    
    # Validar nome do exame
    exam_name = exam.get('exam_name', '').strip()
    if len(exam_name) < 3:
        return False
    
    # Validar valor
    value = exam.get('value')
    if value is None or value == '':
        return False
    
    return True


# ========================================
# DEDUPLICAÇÃO DE EXAMES
# ========================================

def normalize_exam_name(name: str) -> str:
    """
    Normaliza nome do exame para facilitar deduplicação
    
    Args:
        name: Nome do exame
        
    Returns:
        Nome normalizado
    """
    if not name:
        return ""
    
    # Converter para minúsculas
    name = name.lower()
    
    # Remover parênteses e conteúdo
    name = re.sub(r'\([^)]*\)', '', name)
    
    # Remover pontuação
    name = re.sub(r'[^\w\s]', '', name)
    
    # Remover espaços extras
    name = ' '.join(name.split())
    
    return name


def calculate_exam_completeness(exam: dict) -> int:
    """
    Calcula score de completude do exame (0-100)
    
    Args:
        exam: Dicionário com dados do exame
        
    Returns:
        Score de completude (0-100)
    """
    score = 0
    
    if exam.get('exam_name'):
        score += 30
    if exam.get('value') not in [None, '']:
        score += 30
    if exam.get('unit'):
        score += 15
    if exam.get('reference_min') is not None or exam.get('reference_max') is not None:
        score += 15
    if exam.get('status'):
        score += 10
    
    return score


def validate_and_deduplicate_exams(exames_list: List[dict]) -> List[dict]:
    """
    Remove exames duplicados, mantendo o mais completo
    
    Args:
        exames_list: Lista de exames
        
    Returns:
        Lista de exames sem duplicatas
    """
    if not exames_list:
        return []
    
    # Agrupar por nome normalizado
    groups = {}
    for exam in exames_list:
        normalized = normalize_exam_name(exam.get('exam_name', ''))
        if normalized:
            if normalized not in groups:
                groups[normalized] = []
            groups[normalized].append(exam)
    
    # Para cada grupo, manter o mais completo
    deduplicated = []
    for normalized_name, exams in groups.items():
        if len(exams) == 1:
            deduplicated.append(exams[0])
        else:
            # Ordenar por completude (maior primeiro)
            exams_sorted = sorted(
                exams,
                key=lambda e: calculate_exam_completeness(e),
                reverse=True
            )
            best_exam = exams_sorted[0]
            deduplicated.append(best_exam)
            
            print(f'🔄 Deduplicado: {normalized_name} ({len(exams)} → 1)')
    
    return deduplicated


def normalize_exam_value(value: Any) -> Optional[float]:
    """
    Normaliza valor de exame para float quando possível
    
    Args:
        value: Valor a normalizar (pode ser string, float, int)
        
    Returns:
        float ou None se não for numérico
    """
    if value is None:
        return None
    
    # Já é número
    if isinstance(value, (int, float)):
        return float(value)
    
    # Tentar converter string
    if isinstance(value, str):
        # Limpar string
        clean_value = value.strip().replace(',', '.')
        
        # Remover unidades comuns
        clean_value = re.sub(r'[a-zA-Z/%]+$', '', clean_value).strip()
        
        try:
            return float(clean_value)
        except ValueError:
            return None
    
    return None


# ========================================
# VALIDAÇÃO DE DADOS EXTRAÍDOS
# ========================================

def validate_extracted_data(
    parsed_data: dict,
    extracted_name: Optional[str] = None,
    extracted_birth_date: Optional[str] = None,
    extracted_lab: Optional[str] = None
) -> dict:
    """
    Valida e corrige dados extraídos pela IA
    
    Args:
        parsed_data: Dados parseados pela IA
        extracted_name: Nome extraído por regex (hint)
        extracted_birth_date: Data extraída por regex (hint)
        extracted_lab: Laboratório extraído por regex (hint)
        
    Returns:
        Dados validados e corrigidos
    """
    validated = parsed_data.copy()
    
    # Validar e corrigir nome do paciente
    nome_key = 'nome' if 'nome' in validated else None
    if not nome_key and 'paciente' in validated:
        if isinstance(validated['paciente'], dict) and 'nome' in validated['paciente']:
            nome_key = ('paciente', 'nome')
    
    if nome_key:
        if isinstance(nome_key, tuple):
            ai_name = validated[nome_key[0]][nome_key[1]]
            
            # Se regex encontrou nome e IA não, usar regex
            if extracted_name and not ai_name:
                validated[nome_key[0]][nome_key[1]] = extracted_name
                print(f'✅ Nome corrigido (regex): {extracted_name}')
            
            # Se IA encontrou nome inválido, tentar regex
            elif ai_name and not is_valid_patient_name(ai_name):
                if extracted_name and is_valid_patient_name(extracted_name):
                    validated[nome_key[0]][nome_key[1]] = extracted_name
                    print(f'✅ Nome corrigido (IA inválida → regex): {extracted_name}')
        else:
            ai_name = validated[nome_key]
            if extracted_name and not ai_name:
                validated[nome_key] = extracted_name
                print(f'✅ Nome corrigido (regex): {extracted_name}')
    
    # Validar e corrigir data de nascimento
    if 'data_nascimento' in validated:
        ai_date = validated['data_nascimento']
        if extracted_birth_date and not ai_date:
            validated['data_nascimento'] = extracted_birth_date
            print(f'✅ Data corrigida (regex): {extracted_birth_date}')
    elif 'paciente' in validated and isinstance(validated['paciente'], dict):
        if 'dataNascimento' in validated['paciente']:
            ai_date = validated['paciente']['dataNascimento']
            if extracted_birth_date and not ai_date:
                validated['paciente']['dataNascimento'] = extracted_birth_date
                print(f'✅ Data corrigida (regex): {extracted_birth_date}')
    
    # Validar e corrigir laboratório
    if 'laboratorio' in validated:
        ai_lab = validated['laboratorio']
        if extracted_lab and not ai_lab:
            validated['laboratorio'] = extracted_lab
            print(f'✅ Laboratório corrigido (regex): {extracted_lab}')
    
    # Deduplic exames
    if 'exams' in validated and isinstance(validated['exams'], list):
        validated['exams'] = validate_and_deduplicate_exams(validated['exams'])
    elif 'exames' in validated and isinstance(validated['exames'], list):
        validated['exames'] = validate_and_deduplicate_exams(validated['exames'])
    
    return validated
