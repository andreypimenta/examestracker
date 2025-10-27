"""
Extração Híbrida de Texto
PyPDF2 (grátis) como prioridade, Textract como fallback
Economia estimada: ~80% em custos de extração
"""

import PyPDF2
from typing import Optional, Tuple
from src.config import (
    ENABLE_PYPDF2,
    ENABLE_TEXTRACT,
    PYPDF2_FALLBACK_TO_TEXTRACT,
    MIN_EXTRACTED_TEXT_LENGTH
)


def extract_text_with_pypdf2(pdf_path: str) -> Optional[str]:
    """
    Extrai texto com PyPDF2 (grátis, rápido)
    
    Args:
        pdf_path: Caminho do arquivo PDF
        
    Returns:
        str: Texto extraído ou None se falhar
    """
    if not ENABLE_PYPDF2:
        return None
    
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text_parts = []
            
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            extracted_text = '\n'.join(text_parts)
            
            if len(extracted_text) >= MIN_EXTRACTED_TEXT_LENGTH:
                print(f'✅ PyPDF2: {len(extracted_text)} caracteres extraídos')
                return extracted_text
            else:
                print(f'⚠️ PyPDF2: Texto muito curto ({len(extracted_text)} chars)')
                return None
                
    except Exception as e:
        print(f'❌ PyPDF2 falhou: {e}')
        return None


def extract_text_with_textract(textract_client, s3_bucket: str, s3_key: str) -> Optional[str]:
    """
    Extrai texto com AWS Textract (pago, mas preciso)
    
    Args:
        textract_client: Cliente boto3 Textract
        s3_bucket: Bucket do S3
        s3_key: Chave do objeto
        
    Returns:
        str: Texto extraído ou None se falhar
    """
    if not ENABLE_TEXTRACT:
        return None
    
    try:
        response = textract_client.detect_document_text(
            Document={
                'S3Object': {
                    'Bucket': s3_bucket,
                    'Name': s3_key
                }
            }
        )
        
        # Extrair texto dos blocos
        text_parts = []
        for block in response.get('Blocks', []):
            if block['BlockType'] == 'LINE':
                text_parts.append(block.get('Text', ''))
        
        extracted_text = '\n'.join(text_parts)
        
        print(f'✅ Textract: {len(extracted_text)} caracteres extraídos')
        return extracted_text
        
    except Exception as e:
        print(f'❌ Textract falhou: {e}')
        return None


def extract_text_hybrid(pdf_path: str, textract_client, s3_bucket: str, s3_key: str) -> Tuple[Optional[str], str]:
    """
    Estratégia híbrida: tenta PyPDF2 primeiro, fallback para Textract
    
    Args:
        pdf_path: Caminho local do PDF
        textract_client: Cliente boto3 Textract
        s3_bucket: Bucket S3
        s3_key: Chave S3
        
    Returns:
        Tuple[texto_extraido, metodo_usado]
    """
    # Tentativa 1: PyPDF2 (grátis)
    text = extract_text_with_pypdf2(pdf_path)
    if text:
        return text, 'pypdf2'
    
    # Tentativa 2: Textract (pago)
    if PYPDF2_FALLBACK_TO_TEXTRACT:
        print('🔄 Fazendo fallback para Textract...')
        text = extract_text_with_textract(textract_client, s3_bucket, s3_key)
        if text:
            return text, 'textract'
    
    print('❌ Falha em ambos os métodos de extração')
    return None, 'none'
