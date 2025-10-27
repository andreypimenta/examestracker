"""
Validadores de Dados
Valida nomes de pacientes, datas e estruturas de exames
"""

import re
from datetime import datetime
from typing import Dict, Any, Optional
from src.config import (
    PATIENT_NAME_BLACKLIST,
    MIN_NAME_LENGTH,
    MAX_NAME_LENGTH,
    MIN_NAME_WORDS,
    MIN_WORD_LENGTH,
    MIN_PATIENT_AGE,
    MAX_PATIENT_AGE
)


def validate_patient_name(nome: str) -> bool:
    """
    Valida se nome de paciente é válido
    
    Args:
        nome: Nome a ser validado
        
    Returns:
        bool: True se nome é válido
    """
    if not nome or not isinstance(nome, str):
        return False
    
    nome_clean = nome.strip()
    
    # Verificar comprimento
    if len(nome_clean) < MIN_NAME_LENGTH or len(nome_clean) > MAX_NAME_LENGTH:
        return False
    
    # Verificar número de palavras
    words = [w for w in nome_clean.split() if len(w) >= MIN_WORD_LENGTH]
    if len(words) < MIN_NAME_WORDS:
        return False
    
    # Verificar blacklist (normalizado)
    nome_lower = nome_clean.lower()
    for blacklisted in PATIENT_NAME_BLACKLIST:
        if blacklisted in nome_lower:
            print(f'⚠️ Nome contém termo da blacklist: "{blacklisted}"')
            return False
    
    # Verificar se tem pelo menos uma letra
    if not re.search(r'[a-zA-Z]', nome_clean):
        return False
    
    return True


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
