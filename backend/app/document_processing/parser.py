import io
import fitz  # PyMuPDF
from docx import Document as DocxDocument
from typing import List, Dict, Any, Tuple

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts text and page count from PDF using PyMuPDF.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    page_count = len(doc)
    text_parts = []
    
    for page_idx in range(page_count):
        page = doc.load_page(page_idx)
        text = page.get_text("text")
        if text.strip():
            text_parts.append(text.strip())
            
    doc.close()
    full_text = "\n\n".join(text_parts)
    return full_text, page_count

def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts text from DOCX using python-docx.
    """
    doc = DocxDocument(io.BytesIO(file_bytes))
    text_parts = []
    for p in doc.paragraphs:
        if p.text.strip():
            text_parts.append(p.text.strip())
            
    for table in doc.tables:
        for row in table.rows:
            row_texts = [c.text.strip() for c in row.cells if c.text.strip()]
            if row_texts:
                text_parts.append(" | ".join(row_texts))
                
    full_text = "\n\n".join(text_parts)
    # Estimate page count (~500 words per page)
    words = len(full_text.split())
    page_count = max(1, (words // 400) + 1)
    return full_text, page_count

def extract_text(file_bytes: bytes, filename: str) -> Tuple[str, int, str]:
    """
    Auto-detects file type by extension and extracts plain text.
    Returns: (text, page_count, mime_type)
    """
    lower = filename.lower()
    if lower.endswith(".pdf"):
        text, pages = extract_text_from_pdf(file_bytes)
        return text, pages, "application/pdf"
    elif lower.endswith(".docx"):
        text, pages = extract_text_from_docx(file_bytes)
        return text, pages, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        # Plain text / markdown
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1")
        pages = max(1, (len(text.split()) // 400) + 1)
        return text, pages, "text/plain"

def split_into_passages(text: str) -> List[Dict[str, Any]]:
    """
    Splits document text into indexed passages for anchoring explanations and findings.
    """
    paragraphs = text.split("\n\n")
    passages = []
    current_char = 0
    
    for idx, p in enumerate(paragraphs):
        p_clean = p.strip()
        if not p_clean:
            continue
            
        start_char = text.find(p_clean, current_char)
        if start_char == -1:
            start_char = current_char
        end_char = start_char + len(p_clean)
        current_char = end_char
        
        # Derive a short heading or clause label if present
        first_line = p_clean.split("\n")[0][:80]
        heading = first_line if len(first_line) < 60 and (
            first_line.isupper() or 
            any(first_line.startswith(prefix) for prefix in ["Clause", "Section", "Article", "1.", "2.", "3.", "4.", "5.", "WHEREAS", "NOW THEREFORE"])
        ) else f"Passage {idx + 1}"
        
        passages.append({
            "passage_index": idx,
            "start_char": start_char,
            "end_char": end_char,
            "heading": heading,
            "text_content": p_clean,
        })
        
    return passages
