"""Common styles, canvas, and helper functions for dense HR policy generation."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from pathlib import Path


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas that adds running header and footer with total page count."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#0D9488"))
        if self._pageNumber > 1:
            self.drawString(36, 764, "NEXUS ENTERPRISE HR REGULATORY MANUAL")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(612 - 36, 764, "OFFICIAL OPERATING STANDARD  |  CONFIDENTIAL")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 758, 612 - 36, 758)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 34, 612 - 36, 34)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 24, "People Operations, Legal Compliance & Audit  \u2022  Corporate Governance Standard")
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#0F172A"))
        self.drawRightString(612 - 36, 24, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def get_styles():
    b = getSampleStyleSheet()
    return {
        "Title": ParagraphStyle("DocTitle", parent=b["Title"], fontName="Helvetica-Bold",
            fontSize=12.5, leading=15.0, textColor=colors.HexColor("#0F172A"), alignment=0, spaceAfter=2),
        "Meta": ParagraphStyle("DocMeta", parent=b["Normal"], fontName="Helvetica-Bold",
            fontSize=7.0, leading=8.8, textColor=colors.HexColor("#0D9488")),
        "MetaVal": ParagraphStyle("DocMetaVal", parent=b["Normal"], fontName="Helvetica",
            fontSize=7.0, leading=8.8, textColor=colors.HexColor("#475569")),
        "Heading": ParagraphStyle("DocHeading", parent=b["Heading2"], fontName="Helvetica-Bold",
            fontSize=8.8, leading=11.2, textColor=colors.HexColor("#1E293B"),
            spaceBefore=4.0, spaceAfter=1.5, keepWithNext=True),
        "SubHeading": ParagraphStyle("DocSubHeading", parent=b["Heading3"], fontName="Helvetica-Bold",
            fontSize=7.5, leading=9.5, textColor=colors.HexColor("#0F766E"),
            spaceBefore=2.5, spaceAfter=1.2, keepWithNext=True),
        "Body": ParagraphStyle("DocBody", parent=b["Normal"], fontName="Helvetica",
            fontSize=7.15, leading=9.9, textColor=colors.HexColor("#334155"), spaceAfter=2.0),
        "Bullet": ParagraphStyle("DocBullet", parent=b["Normal"], fontName="Helvetica",
            fontSize=7.15, leading=9.7, textColor=colors.HexColor("#334155"),
            leftIndent=10, firstLineIndent=-7, spaceAfter=1.4),
        "TableHeader": ParagraphStyle("TableHeader", parent=b["Normal"], fontName="Helvetica-Bold",
            fontSize=6.8, leading=8.4, textColor=colors.HexColor("#1E293B")),
        "TableCell": ParagraphStyle("TableCell", parent=b["Normal"], fontName="Helvetica",
            fontSize=6.5, leading=8.2, textColor=colors.HexColor("#334155")),
        "Callout": ParagraphStyle("DocCallout", parent=b["Normal"], fontName="Helvetica",
            fontSize=6.8, leading=9.0, textColor=colors.HexColor("#0F766E")),
    }


def add_meta_header(story, styles, doc_id, title, category, eff_date):
    story.append(Paragraph(f"<b>NEXUS HR COMPLIANCE REPOSITORY</b> &bull; {doc_id} &bull; v5.0", styles["Meta"]))
    story.append(Spacer(1, 1.5))
    story.append(Paragraph(title, styles["Title"]))
    story.append(Spacer(1, 1.5))
    meta = [[Paragraph("<b>CATEGORY</b>", styles["Meta"]), Paragraph(category, styles["MetaVal"]),
             Paragraph("<b>EFFECTIVE DATE</b>", styles["Meta"]), Paragraph(eff_date, styles["MetaVal"]),
             Paragraph("<b>REVIEW CYCLE</b>", styles["Meta"]), Paragraph("Annual Corporate Audit", styles["MetaVal"])]]
    t = Table(meta, colWidths=[65, 115, 85, 105, 80, 90])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ("BOX", (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0,0), (-1,-1), 1.8), ("BOTTOMPADDING", (0,0), (-1,-1), 1.8),
        ("LEFTPADDING", (0,0), (-1,-1), 4), ("RIGHTPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 2))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor("#0D9488"), spaceAfter=2.5))


def add_table(story, styles, headers, rows, widths):
    data = [[Paragraph(f"<b>{h}</b>", styles["TableHeader"]) for h in headers]]
    for row in rows:
        data.append([Paragraph(c, styles["TableCell"]) for c in row])
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ("BOX", (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0,0), (-1,-1), 2.0), ("BOTTOMPADDING", (0,0), (-1,-1), 2.0),
        ("LEFTPADDING", (0,0), (-1,-1), 4), ("RIGHTPADDING", (0,0), (-1,-1), 4),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story.append(Spacer(1, 1.5))
    story.append(t)
    story.append(Spacer(1, 2))


def add_callout(story, styles, label, text):
    data = [[Paragraph(f"<b>{label}</b><br/>{text}", styles["Callout"])]]
    t = Table(data, colWidths=[540])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F0FDFA")),
        ("BOX", (0,0), (-1,-1), 0.75, colors.HexColor("#0D9488")),
        ("TOPPADDING", (0,0), (-1,-1), 3.0), ("BOTTOMPADDING", (0,0), (-1,-1), 3.0),
        ("LEFTPADDING", (0,0), (-1,-1), 5), ("RIGHTPADDING", (0,0), (-1,-1), 5),
    ]))
    story.append(Spacer(1, 1.5))
    story.append(t)
    story.append(Spacer(1, 2))


def add_footer(story, styles):
    story.append(Spacer(1, 2))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceAfter=2.5))
    story.append(Paragraph("Document Governance, Audit History &amp; Statutory Authorization", styles["Heading"]))
    add_table(story, styles,
        ["Revision", "Release Date", "Author / Department", "Summary of Regulatory Changes"],
        [
            ["v1.0", "Jan 15, 2024", "People Operations Taskforce",
             "Initial corporate codification of all baseline policy categories. Full legal review by General Counsel and Board HR Committee completed."],
            ["v2.0", "Nov 10, 2024", "Legal &amp; Compliance Committee",
             "Updated statutory bereavement protections. Expanded FMLA/ADA interactive accommodation and civic duty leave provisions with state-level addenda."],
            ["v3.0", "Jan 01, 2025", "Executive Total Rewards Council",
             "401(k) match enhanced to 4% dollar-for-dollar. Parental leave extended from 12 to 16 weeks (primary) and 4 to 6 weeks (secondary caregiver)."],
            ["v4.0", "Oct 15, 2025", "Global Workforce Mobility Team",
             "Formalized 20-day international remote cadence with tax residency affidavits, data sovereignty checks, and OFAC sanctioned-country network blocks."],
            ["v5.0", "Jan 01, 2026", "Chief People Officer &amp; General Counsel",
             "Annual consolidation. AI triage citation integration, SHA-256 digital signature records, CSPM policy additions, and GDPR Article 33 breach notification alignment."],
        ],
        [40, 70, 150, 280])
    add_table(story, styles,
        ["Signatory Role", "Authorized Representative", "Approval Status", "Digital Signature Hash"],
        [
            ["Chief People Officer (CPO)", "Elena Rostova, SPHR",
             "APPROVED &amp; RATIFIED", "SHA256: 7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a...c1d2e3f4"],
            ["General Counsel &amp; VP Legal", "Marcus Vance, Esq.",
             "COMPLIANCE VERIFIED", "SHA256: 9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c...e4f5a6b7"],
            ["Chief Financial Officer (CFO)", "David H. Sterling, CPA",
             "FISCAL BUDGET RATIFIED", "SHA256: 3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e...a7b8c9d0"],
            ["VP People Operations &amp; Audit", "Sarah Jenkins, SHRM-SCP",
             "AUDIT CERTIFIED", "SHA256: 5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a...c8d9e0f1"],
        ],
        [130, 130, 110, 170])
    story.append(Paragraph(
        "<i>Statutory Disclosure: This official regulatory document constitutes binding corporate policy for Nexus Corporation "
        "and all operating subsidiaries. Questions regarding statutory interpretation, policy exceptions, or accommodation requests "
        "must be submitted to People Operations via the Employee Portal within 10 business days. Unauthorized reproduction, "
        "distribution, or external disclosure outside authorized personnel channels is strictly prohibited under applicable trade "
        "secret and confidentiality law. This document supersedes all prior versions and verbal representations.</i>",
        styles["Body"]))


def make_article(title, subtitle, para1, para2, headers, rows, widths, bullets, callout_label, callout_text):
    """Convenience helper to construct a dense standardized article section."""
    content = []
    if subtitle:
        content.append({"type": "subheading", "text": subtitle})
    if para1:
        content.append({"type": "paragraph", "text": para1})
    if para2:
        content.append({"type": "paragraph", "text": para2})
    if headers and rows:
        content.append({"type": "table", "headers": headers, "rows": rows, "widths": widths})
    for b in bullets or []:
        content.append({"type": "bullet", "text": b})
    if callout_label and callout_text:
        content.append({"type": "callout", "label": callout_label, "text": callout_text})
    return {"title": title, "content": content}
