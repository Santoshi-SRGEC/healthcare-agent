"""CareFlow AI Agent - document summarization and workflow assistance."""

from pathlib import Path

from pypdf import PdfReader
from openai import OpenAI

from app.core.config import settings


MODEL = settings.llm_model


def extract_pdf_text(file_path: str) -> str:
    """Extract text from a PDF file."""

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    reader = PdfReader(str(path))

    pages = []

    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)

    full_text = "\n".join(pages).strip()

    if not full_text:
        raise ValueError(
            "Could not extract text from this PDF. "
            "The PDF may be scanned/image-based."
        )

    return full_text


def summarize_medical_document(
    document_text: str,
    patient_name: str,
    report_name: str,
    report_type: str,
) -> str:
    """Use an LLM to summarize a medical document for workflow assistance."""

    api_key = settings.openrouter_api_key

    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not configured. "
            "Please add it to your backend/.env file."
        )

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    system_prompt = """
You are the CareFlow AI Workflow Coordinator.

Your job is to assist healthcare staff by summarizing medical
documents and identifying workflow actions.

You MUST NOT:
- diagnose the patient
- prescribe medication
- make treatment decisions
- claim that a finding is definitely a disease
- replace a doctor's judgment

You MUST:
- summarize only information present in the document
- clearly distinguish documented facts from suggestions
- identify important information for staff review
- identify workflow actions that may need attention
- recommend human review when appropriate

Return the result in this format:

DOCUMENT SUMMARY
- ...

KEY INFORMATION
- ...

POSSIBLE WORKFLOW ACTIONS
- ...

DOCTOR REVIEW
- ...

IMPORTANT:
This is an AI-generated workflow summary, not a diagnosis.
The original document must be reviewed by qualified healthcare staff.
"""

    user_prompt = f"""
Patient: {patient_name}
Document: {report_name}
Report type: {report_type}

Medical document text:

{document_text}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.2,
        max_tokens=1200,
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("AI returned an empty response.")

    return content