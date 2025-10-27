"""
Processors Package
Exporta funções de processamento de texto, headers e exames
"""

from .text_extractor import (
    extract_text_with_pypdf2,
    extract_text_with_textract,
    extract_text_hybrid
)

from .header_processor import (
    extract_patient_identifiers_from_text,
    extract_lab_hint_from_text,
    extract_header_with_vision,
    extract_header_with_cache
)

from .exam_parser import (
    parse_exams_from_text,
    clean_reference_values,
    deduplicate_exams,
    assign_biomarker_ids
)

__all__ = [
    # Text extraction
    'extract_text_with_pypdf2',
    'extract_text_with_textract',
    'extract_text_hybrid',
    
    # Header processing
    'extract_patient_identifiers_from_text',
    'extract_lab_hint_from_text',
    'extract_header_with_vision',
    'extract_header_with_cache',
    
    # Exam parsing
    'parse_exams_from_text',
    'clean_reference_values',
    'deduplicate_exams',
    'assign_biomarker_ids',
]
