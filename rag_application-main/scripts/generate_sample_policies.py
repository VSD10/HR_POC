"""Master Generator: Compiles dense, fully-filled 6-page HR Policy PDFs for Nexus Corporation."""
import sys
from pathlib import Path
import shutil
import pypdf
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

# Ensure current script folder is in python path
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from policies.common import (
    NumberedCanvas, get_styles, add_meta_header, add_table, add_callout, add_footer
)
from policies.leave_policy import get_document as get_leave_doc
from policies.handbook_policy import get_document as get_handbook_doc
from policies.benefits_policy import get_document as get_benefits_doc
from policies.remote_work_policy import get_document as get_remote_doc
from policies.travel_expense_policy import get_document as get_travel_doc
from policies.security_policy import get_document as get_security_doc
from policies.performance_policy import get_document as get_performance_doc

PROJECT_ROOT = SCRIPT_DIR.parent
KB_DIR = PROJECT_ROOT / "knowledge_base"
RESOURCES_DIR = PROJECT_ROOT.parent / "resources"
FRONTEND_POLICIES_DIR = PROJECT_ROOT.parent / "hr" / "frontend" / "public" / "policies"
EMP_FRONTEND_POLICIES_DIR = PROJECT_ROOT.parent / "employee_frontend-main" / "public" / "policies"


def build_pdf(filename, meta, sections):
    """Compiles sections into a dense, professionally styled PDF."""
    output_path = KB_DIR / filename
    styles = get_styles()
    story = []

    # Document Header
    add_meta_header(story, styles, meta["id"], meta["title"], meta["category"], meta["eff_date"])

    # Articles
    for sec in sections:
        story.append(Paragraph(sec["title"], styles["Heading"]))
        for item in sec.get("content", []):
            tp = item.get("type") or item.get("table", "paragraph")
            if tp == "paragraph":
                story.append(Paragraph(item["text"], styles["Body"]))
            elif tp == "subheading":
                story.append(Paragraph(item["text"], styles["SubHeading"]))
            elif tp == "bullet":
                story.append(Paragraph(f"&bull;&nbsp;&nbsp;{item['text']}", styles["Bullet"]))
            elif tp == "table":
                add_table(story, styles, item["headers"], item["rows"], item["widths"])
            elif tp == "callout":
                add_callout(story, styles, item.get("label", "REGULATORY MANDATE:"), item["text"])

    # Document Governance & Signatory Footer
    add_footer(story, styles)

    # Build PDF with letter pagesize and standard professional margins
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=44
    )
    doc.build(story, canvasmaker=NumberedCanvas)

    # Validate output
    reader = pypdf.PdfReader(str(output_path))
    pages = len(reader.pages)
    words_per_page = [len(p.extract_text().split()) for p in reader.pages]
    size_kb = output_path.stat().st_size // 1024

    return pages, words_per_page, size_kb


def main():
    KB_DIR.mkdir(parents=True, exist_ok=True)
    print("=" * 80)
    print("  NEXUS ENTERPRISE HR REGULATORY MANUALS -- DENSE COMPILATION ENGINE")
    print("=" * 80)

    policies = [
        get_leave_doc(),
        get_handbook_doc(),
        get_benefits_doc(),
        get_remote_doc(),
        get_travel_doc(),
        get_security_doc(),
        get_performance_doc(),
    ]

    results = []
    total_pages = 0

    for doc in policies:
        pages, words, size_kb = build_pdf(doc["filename"], doc["meta"], doc["sections"])
        total_pages += pages
        results.append({
            "filename": doc["filename"],
            "title": doc["meta"]["title"],
            "pages": pages,
            "words": words,
            "size_kb": size_kb
        })
        print(f"  Generated: {doc['filename']:35} | {pages} pages | {size_kb:3} KB | Words: {words}")

    # Synchronize legacy aliases for 100% backward citation compatibility
    src_travel = KB_DIR / "travel_expense_policy.pdf"
    if src_travel.exists():
        for alias in ["travel_policy.pdf", "expense_policy.pdf"]:
            dest = KB_DIR / alias
            shutil.copy2(src_travel, dest)
            alias_pages = len(pypdf.PdfReader(str(dest)).pages)
            print(f"  Synchronized legacy alias: {alias:23} | {alias_pages} pages | {dest.stat().st_size//1024:3} KB")

    # Multi-Location Synchronization
    target_dirs = [RESOURCES_DIR, FRONTEND_POLICIES_DIR, EMP_FRONTEND_POLICIES_DIR]
    print("-" * 80)
    print("  Synchronizing policy suites to downstream application repositories...")
    for dest in target_dirs:
        try:
            dest.mkdir(parents=True, exist_ok=True)
            copied = 0
            for pdf_file in KB_DIR.glob("*.pdf"):
                shutil.copy2(pdf_file, dest / pdf_file.name)
                copied += 1
            print(f"  -> Successfully mirrored {copied} PDFs to: {dest}")
        except Exception as e:
            print(f"  [WARN] Failed to copy to {dest}: {e}")

    print("=" * 80)
    print(f"  COMPILATION COMPLETE: {len(policies)} policies (+ 2 aliases), {total_pages} total pages")
    print("=" * 80)


if __name__ == "__main__":
    main()
