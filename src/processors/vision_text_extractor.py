"""
Extração de texto de imagens usando Vision APIs
Fallback para quando PyPDF2/Textract falham ou para imagens disfarçadas
"""

import base64
from typing import Optional


def extract_text_from_image_with_vision(image_path: str, gemini_client) -> Optional[str]:
    """
    Extrai texto de uma imagem usando Gemini Flash Vision
    
    Args:
        image_path: Caminho da imagem
        gemini_client: Cliente Gemini configurado
        
    Returns:
        Texto extraído ou None se falhar
    """
    if not gemini_client:
        print("❌ Gemini client não configurado")
        return None
    
    try:
        # Ler imagem
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Codificar em base64
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        
        # Prompt para extrair todo o texto
        prompt = """
        Extraia TODO o texto presente nesta imagem de exame médico.
        Mantenha a formatação original, incluindo:
        - Nomes de exames
        - Valores numéricos
        - Unidades de medida
        - Valores de referência
        - Datas
        - Nomes de pacientes
        
        Retorne apenas o texto extraído, sem comentários adicionais.
        """
        
        # Chamar Gemini Flash Vision
        model = gemini_client.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content([
            prompt,
            {'mime_type': 'image/jpeg', 'data': image_b64}
        ])
        
        extracted_text = response.text.strip()
        print(f"✅ Vision API: {len(extracted_text)} caracteres extraídos")
        
        return extracted_text
        
    except Exception as e:
        print(f"❌ Vision API falhou: {e}")
        return None
