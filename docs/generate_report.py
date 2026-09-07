#!/usr/bin/env python3
"""
SecureVault — CY5008 Information Security
20-page semester project report generator.
"""
from __future__ import annotations

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, ListFlowable, ListItem, Flowable, Image, CondPageBreak,
    HRFlowable,
)
from reportlab.pdfgen import canvas as pdfcanvas

DIR = os.path.dirname(os.path.abspath(__file__))
FIG = os.path.join(DIR, "figures")
OUT = os.path.join(DIR, "SecureVault_CY5008_Project_Report.pdf")
os.makedirs(FIG, exist_ok=True)

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("Sans", os.path.join(FONT_DIR, "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("Sans-Bold", os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Serif", os.path.join(FONT_DIR, "DejaVuSerif.ttf")))
pdfmetrics.registerFont(TTFont("Serif-Bold", os.path.join(FONT_DIR, "DejaVuSerif-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Mono", os.path.join(FONT_DIR, "DejaVuSansMono.ttf")))
pdfmetrics.registerFont(TTFont("Mono-Bold", os.path.join(FONT_DIR, "DejaVuSansMono-Bold.ttf")))

NAVY = HexColor("#0C2340")
NAVY2 = HexColor("#163A5F")
GOLD = HexColor("#B8954A")
GOLD2 = HexColor("#D4C4A8")
SLATE = HexColor("#334155")
MUTED = HexColor("#5B6573")
RULE = HexColor("#C9B896")
ROW = HexColor("#F6F1E7")
HEADBG = HexColor("#0C2340")
PALE = HexColor("#EEF3F8")
GREEN = HexColor("#1F7A4D")
LINE = HexColor("#E6DCC8")

W, H = A4


# ─────────────────────────────────────────────────────────────────────────────
# Figure generation (matplotlib)
# ─────────────────────────────────────────────────────────────────────────────
def _setup_mpl():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle
    plt.rcParams.update({
        "font.family": "DejaVu Sans",
        "font.size": 8.5,
        "axes.edgecolor": "#0C2340",
        "savefig.facecolor": "white",
        "savefig.dpi": 180,
    })
    return plt, FancyBboxPatch, FancyArrowPatch, Rectangle


def _box(ax, x, y, w, h, text, fc="#0C2340", ec="#B8954A", tc="white", fs=8, lw=1.1, radius=0.08):
    from matplotlib.patches import FancyBboxPatch
    ax.add_patch(FancyBboxPatch(
        (x, y), w, h, boxstyle=f"round,pad=0.02,rounding_size={radius}",
        facecolor=fc, edgecolor=ec, linewidth=lw, mutation_aspect=0.4,
    ))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            color=tc, fontsize=fs, fontweight="bold", linespacing=1.25)


def make_figures():
    plt, FancyBboxPatch, FancyArrowPatch, Rectangle = _setup_mpl()

    # Fig 4.1 — layered architecture
    fig, ax = plt.subplots(figsize=(7.2, 3.55))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.2)
    ax.axis("off")
    ax.set_title("Three-tier architecture of SecureVault", fontsize=10,
                 color="#0C2340", fontweight="bold", pad=8)

    _box(ax, 0.4, 4.55, 9.2, 1.35,
         "Presentation Layer   ·   React 19  +  Vite  +  Tailwind CSS\n"
         "Landing  ·  Auth  ·  Dashboard  ·  Labs  ·  Chat  ·  Admin",
         fc="#0C2340", fs=8)
    ax.annotate("", xy=(5, 3.95), xytext=(5, 4.5),
                arrowprops=dict(arrowstyle="->", color="#B8954A", lw=1.4))
    ax.text(5.15, 4.18, "REST  +  Socket.io  (JWT)", fontsize=7, color="#5B6573")

    _box(ax, 0.4, 2.35, 9.2, 1.5,
         "Application Layer   ·   Express.js  +  Node.js\n"
         "Auth  ·  Encryption  ·  Hash  ·  RSA/DH  ·  Chat  ·  Firewall  ·  IDS  ·  Dashboard\n"
         "Middleware: CORS  ·  Rate limit  ·  Passive IDS  ·  JWT protect  ·  Security headers",
         fc="#163A5F", fs=7.6)

    ax.annotate("", xy=(5, 1.75), xytext=(5, 2.3),
                arrowprops=dict(arrowstyle="->", color="#B8954A", lw=1.4))
    ax.text(5.15, 1.95, "Mongoose ODM", fontsize=7, color="#5B6573")

    _box(ax, 0.4, 0.25, 9.2, 1.4,
         "Data Layer   ·   MongoDB Atlas\n"
         "Users  ·  EncryptedFiles  ·  HashHistory  ·  ChatMessages\n"
         "FirewallRules  ·  IdsLogs  ·  LoginHistory",
         fc="#1F3D2F", ec="#7D9B6A", fs=7.8)

    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "architecture.png"), bbox_inches="tight")
    plt.close(fig)

    # Fig 4.2 — request pipeline
    fig, ax = plt.subplots(figsize=(7.2, 2.35))
    ax.set_xlim(0, 12.2)
    ax.set_ylim(0, 2.4)
    ax.axis("off")
    ax.set_title("Inbound API request pipeline", fontsize=10,
                 color="#0C2340", fontweight="bold", pad=6)
    steps = [
        (0.15, "Client\nHTTPS"),
        (2.15, "CORS +\nJSON body"),
        (4.15, "Rate\nlimiter"),
        (6.15, "IDS\ninspect"),
        (8.15, "JWT\nguard"),
        (10.15, "Controller\n→ MongoDB"),
    ]
    for i, (x, t) in enumerate(steps):
        fc = "#0C2340" if i in (0, 5) else "#163A5F"
        _box(ax, x, 0.45, 1.85, 1.25, t, fc=fc, fs=7.4, radius=0.12)
        if i < len(steps) - 1:
            ax.annotate("", xy=(x + 2.05, 1.05), xytext=(x + 1.88, 1.05),
                        arrowprops=dict(arrowstyle="->", color="#B8954A", lw=1.3))
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "pipeline.png"), bbox_inches="tight")
    plt.close(fig)

    # Fig 4.3 — data model
    fig, ax = plt.subplots(figsize=(7.2, 3.7))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.4)
    ax.axis("off")
    ax.set_title("Logical data model (MongoDB collections)", fontsize=10,
                 color="#0C2340", fontweight="bold", pad=8)

    entities = [
        (0.25, 4.35, "User\nname, email, password\nrole, otp, verified\nloginAttempts, lockUntil"),
        (3.5, 4.35, "EncryptedFile\noriginalName, algorithm\nkeyHash, iv, fileSize\nencryptionTime"),
        (6.75, 4.35, "HashHistory\nalgorithm, inputType\nhashValue, hashLength\nexecutionTime"),
        (0.25, 2.15, "ChatMessage\nsenderId, receiverId\nencryptedMessage, iv\nalgorithm, read"),
        (3.5, 2.15, "FirewallRule\nname, type, protocol\nport, ip, action\npriority, enabled"),
        (6.75, 2.15, "IdsLog\nattackType, severity\nip, url, payload\nblocked"),
        (3.5, 0.15, "LoginHistory\nip, userAgent, browser\nos, status, failReason"),
    ]
    for x, y, t in entities:
        _box(ax, x, y, 3.0, 1.75, t, fc="#F7F4EE", ec="#0C2340", tc="#0C2340", fs=7.0, lw=1.0)
    # relationship ticks from User
    for tx in (5.0,):
        ax.annotate("", xy=(3.5, 5.2), xytext=(3.25, 5.2),
                    arrowprops=dict(arrowstyle="-", color="#B8954A", lw=0.8))
    ax.text(5, 6.15, "User  1 — N  EncryptedFile / HashHistory / ChatMessage / LoginHistory",
            ha="center", fontsize=7, color="#5B6573")
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "datamodel.png"), bbox_inches="tight")
    plt.close(fig)

    # Fig 5.1 — auth flow
    fig, ax = plt.subplots(figsize=(7.2, 3.05))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.0)
    ax.axis("off")
    ax.set_title("Registration and login control flow", fontsize=10,
                 color="#0C2340", fontweight="bold", pad=8)
    flow = [
        (0.3, 3.7, 2.2, 0.95, "Register\npolicy check"),
        (2.9, 3.7, 2.2, 0.95, "bcrypt hash\nsalt rounds 12"),
        (5.5, 3.7, 2.0, 0.95, "6-digit OTP\n10 min TTL"),
        (7.8, 3.7, 1.9, 0.95, "Verify email\nissue JWT"),
        (0.3, 1.85, 2.2, 0.95, "Login +\nrate limit"),
        (2.9, 1.85, 2.2, 0.95, "Lockout?\n5 fails / 15 min"),
        (5.5, 1.85, 2.0, 0.95, "compare\npassword"),
        (7.8, 1.85, 1.9, 0.95, "JWT 7d\nor 30d"),
        (2.9, 0.25, 4.4, 0.95, "Forgot password  →  SHA-256 token  →  30 min reset link"),
    ]
    for x, y, w, h, t in flow:
        _box(ax, x, y, w, h, t, fc="#163A5F", fs=7.2, radius=0.1)
    for x1, x2, y in [(2.5, 2.9, 4.15), (5.1, 5.5, 4.15), (7.5, 7.8, 4.15),
                      (2.5, 2.9, 2.3), (5.1, 5.5, 2.3), (7.5, 7.8, 2.3)]:
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color="#B8954A", lw=1.2))
    ax.annotate("", xy=(5.1, 1.2), xytext=(5.1, 1.85),
                arrowprops=dict(arrowstyle="->", color="#B8954A", lw=1.0))
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "authflow.png"), bbox_inches="tight")
    plt.close(fig)

    # Fig 5.2 — firewall + IDS
    fig, ax = plt.subplots(figsize=(7.2, 3.55))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4.6)
    ax.axis("off")
    ax.set_title("Firewall evaluation and IDS detection", fontsize=10,
                 color="#0C2340", fontweight="bold", pad=8)
    _box(ax, 0.25, 3.15, 2.3, 1.05, "Simulated\npacket", fc="#0C2340", fs=7.5)
    _box(ax, 3.0, 3.15, 3.9, 1.05, "Sort rules by priority\nMatch IP · Port · Protocol", fc="#163A5F", fs=7.5)
    _box(ax, 7.4, 3.35, 2.3, 0.85, "ALLOW", fc="#1F7A4D", ec="#7D9B6A", fs=8)
    _box(ax, 7.4, 2.35, 2.3, 0.85, "BLOCK / DROP", fc="#6B2B2B", ec="#C47A7A", fs=8)
    ax.annotate("", xy=(3.0, 3.65), xytext=(2.55, 3.65),
                arrowprops=dict(arrowstyle="->", color="#B8954A", lw=1.2))
    ax.annotate("", xy=(7.4, 3.75), xytext=(6.9, 3.65),
                arrowprops=dict(arrowstyle="->", color="#1F7A4D", lw=1.1))
    ax.annotate("", xy=(7.4, 2.75), xytext=(6.9, 3.45),
                arrowprops=dict(arrowstyle="->", color="#8B3A3A", lw=1.1))
    ax.text(5.0, 2.55, "No match  →  default DROP", ha="center", fontsize=7.2, color="#5B6573")

    _box(ax, 0.25, 0.3, 2.3, 1.5, "HTTP body\nquery · params", fc="#0C2340", fs=7.4)
    _box(ax, 3.0, 0.3, 3.9, 1.5, "Regex engine\nSQLi · XSS · traversal", fc="#163A5F", fs=7.4)
    _box(ax, 7.4, 0.95, 2.3, 0.85, "HIGH → 403\n+ admin socket", fc="#6B2B2B", ec="#C47A7A", fs=7.2)
    ax.annotate("", xy=(3.0, 1.05), xytext=(2.55, 1.05),
                arrowprops=dict(arrowstyle="->", color="#B8954A", lw=1.2))
    ax.annotate("", xy=(7.4, 1.35), xytext=(6.9, 1.05),
                arrowprops=dict(arrowstyle="->", color="#8B3A3A", lw=1.1))
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "defence.png"), bbox_inches="tight")
    plt.close(fig)

    # Fig 7.1 — cipher comparison bars (educational, qualitative)
    fig, ax = plt.subplots(figsize=(7.0, 3.15))
    names = ["AES-256", "3DES", "Blowfish*", "DES", "RC4"]
    strength = [5, 3, 3, 1, 1]
    colors = ["#0C2340", "#163A5F", "#3D5A80", "#8B7355", "#A67C52"]
    bars = ax.barh(names[::-1], strength[::-1], color=colors[::-1], height=0.55, edgecolor="#B8954A", linewidth=0.4)
    ax.set_xlim(0, 6)
    ax.set_xticks([1, 2, 3, 4, 5])
    ax.set_xticklabels(["Obsolete", "Weak", "Legacy", "Acceptable", "Recommended"], fontsize=7.2)
    ax.set_title("Relative standing of lab ciphers (educational scale)", fontsize=10,
                 color="#0C2340", fontweight="bold")
    ax.tick_params(axis="y", labelsize=8.5, colors="#0C2340")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#0C2340")
    ax.spines["bottom"].set_color("#C9B896")
    ax.set_xlabel("* Blowfish in the lab is a Rabbit stand-in for demonstration", fontsize=7, color="#5B6573")
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, "ciphers.png"), bbox_inches="tight")
    plt.close(fig)


# ─────────────────────────────────────────────────────────────────────────────
# Styles
# ─────────────────────────────────────────────────────────────────────────────
def styles():
    ss = getSampleStyleSheet()

    def add(name, **kw):
        ss.add(ParagraphStyle(name=name, **kw))

    add("CoverKicker", fontName="Sans", fontSize=8.5, leading=12, textColor=GOLD,
        alignment=TA_CENTER, tracking=1.4)
    add("H1", fontName="Sans-Bold", fontSize=12.4, leading=16, textColor=NAVY,
        spaceBefore=4, spaceAfter=4, alignment=TA_LEFT)
    add("H2", fontName="Sans-Bold", fontSize=10.6, leading=14, textColor=NAVY2,
        spaceBefore=6, spaceAfter=3)
    add("H3", fontName="Sans-Bold", fontSize=10.0, leading=13, textColor=SLATE,
        spaceBefore=5, spaceAfter=2)
    add("Body", fontName="Serif", fontSize=9.55, leading=12.9, textColor=HexColor("#1C2430"),
        alignment=TA_JUSTIFY, spaceAfter=5)
    add("BodyFirst", fontName="Serif", fontSize=9.55, leading=12.9, textColor=HexColor("#1C2430"),
        alignment=TA_JUSTIFY, spaceAfter=5, firstLineIndent=0)
    add("BulletBody", fontName="Serif", fontSize=8.6, leading=11.6, textColor=HexColor("#1C2430"),
        alignment=TA_JUSTIFY, leftIndent=10, spaceAfter=1.6)
    add("Caption", fontName="Sans", fontSize=7.8, leading=10.2, textColor=MUTED,
        alignment=TA_CENTER, spaceBefore=2, spaceAfter=6)
    add("TableCell", fontName="Sans", fontSize=7.2, leading=9.5, textColor=NAVY, alignment=TA_LEFT)
    add("TableHead", fontName="Sans-Bold", fontSize=7.2, leading=9.5, textColor=white, alignment=TA_LEFT)
    add("TableCellC", fontName="Sans", fontSize=7.2, leading=9.5, textColor=NAVY, alignment=TA_CENTER)
    add("TableHeadC", fontName="Sans-Bold", fontSize=7.2, leading=9.5, textColor=white, alignment=TA_CENTER)
    add("Center", fontName="Serif", fontSize=10.2, leading=14.5, textColor=NAVY, alignment=TA_CENTER, spaceAfter=6)
    add("CenterSmall", fontName="Sans", fontSize=9.2, leading=13, textColor=SLATE, alignment=TA_CENTER, spaceAfter=3)
    add("DeclTitle", fontName="Sans-Bold", fontSize=14, leading=18, textColor=NAVY, alignment=TA_CENTER, spaceAfter=12)
    add("TocChap", fontName="Sans-Bold", fontSize=10.2, leading=16, textColor=NAVY)
    add("TocItem", fontName="Serif", fontSize=10, leading=15, textColor=SLATE)
    add("Footer", fontName="Sans", fontSize=7.5, leading=10, textColor=MUTED)
    add("Quote", fontName="Serif", fontSize=9.6, leading=13.8, textColor=SLATE,
        alignment=TA_JUSTIFY, leftIndent=16, rightIndent=16, spaceBefore=4, spaceAfter=8)
    add("Obj", fontName="Serif", fontSize=9.3, leading=12.6, textColor=HexColor("#1C2430"),
        leftIndent=14, spaceAfter=2)
    add("AppMono", fontName="Mono", fontSize=7.4, leading=10.4, textColor=NAVY)
    add("AbstractHead", fontName="Sans-Bold", fontSize=11, leading=14, textColor=NAVY,
        alignment=TA_CENTER, spaceAfter=8, spaceBefore=4)
    add("Kw", fontName="Serif", fontSize=9.6, leading=13.5, textColor=SLATE, alignment=TA_CENTER, spaceBefore=6)
    add("Sign", fontName="Sans", fontSize=9, leading=12, textColor=NAVY, alignment=TA_CENTER)
    add("SmallCenter", fontName="Serif", fontSize=9.3, leading=13.2, textColor=SLATE, alignment=TA_CENTER, spaceAfter=4)
    return ss


S = None  # filled in main


def P(text, style="Body"):
    return Paragraph(text, S[style])


def hrule():
    return HRFlowable(width="100%", thickness=0.7, color=GOLD, spaceBefore=1, spaceAfter=8)


def thinrule():
    return HRFlowable(width="100%", thickness=0.3, color=LINE, spaceBefore=2, spaceAfter=8)


def h1(text):
    return KeepTogether([P(text, "H1"), hrule()])


def h2(text):
    return P(text, "H2")


def h3(text):
    return P(text, "H3")


def caption(text):
    return P(text, "Caption")


def fig(path, cap, width=135 * mm):
    img = Image(path, width=width, height=width * 0.52)
    img.hAlign = "CENTER"
    # height is overridden below by preserving aspect
    from PIL import Image as PILImage
    with PILImage.open(path) as im:
        w, h = im.size
    aspect = h / float(w)
    img = Image(path, width=width, height=width * aspect)
    img.hAlign = "CENTER"
    return KeepTogether([Spacer(1, 4), img, caption(cap)])


def cell(text, head=False, center=False):
    if head and center:
        st = "TableHeadC"
    elif head:
        st = "TableHead"
    elif center:
        st = "TableCellC"
    else:
        st = "TableCell"
    return Paragraph(str(text), S[st])


def make_table(headers, rows, col_widths, center_cols=None):
    center_cols = center_cols or []
    head = [cell(h, head=True, center=(i in center_cols)) for i, h in enumerate(headers)]
    data = [head]
    for r in rows:
        data.append([cell(c, center=(i in center_cols)) for i, c in enumerate(r)])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    cmd = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADBG),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Sans-Bold"),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.25, HexColor("#D9D1C0")),
        ("LEFTPADDING", (0, 0), (-1, -1), 3.5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3.5),
        ("TOPPADDING", (0, 0), (-1, -1), 2.8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.8),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            cmd.append(("BACKGROUND", (0, i), (-1, i), ROW))
        else:
            cmd.append(("BACKGROUND", (0, i), (-1, i), white))
    t.setStyle(TableStyle(cmd))
    t.hAlign = "CENTER"
    return t


# ─────────────────────────────────────────────────────────────────────────────
# Page decoration
# ─────────────────────────────────────────────────────────────────────────────
def draw_cover(c: pdfcanvas.Canvas, doc):
    c.saveState()
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # gold bars
    c.setFillColor(GOLD)
    c.rect(0, H - 7, W, 7, fill=1, stroke=0)
    c.rect(0, 0, W, 7, fill=1, stroke=0)

    # double frame
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.9)
    c.rect(14 * mm, 14 * mm, W - 28 * mm, H - 28 * mm)
    c.setLineWidth(0.35)
    c.rect(16 * mm, 16 * mm, W - 32 * mm, H - 32 * mm)

    # top kicker
    c.setFillColor(GOLD)
    c.setFont("Sans", 8.4)
    c.drawCentredString(W / 2, H - 32 * mm, "SEMESTER PROJECT REPORT")
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.45)
    c.line(W / 2 - 38 * mm, H - 34 * mm, W / 2 + 38 * mm, H - 34 * mm)

    c.setFont("Sans", 9)
    c.drawCentredString(W / 2, H - 42 * mm, "CY5008  ·  INFORMATION SECURITY")

    # main title
    c.setFillColor(white)
    c.setFont("Sans-Bold", 34)
    c.drawCentredString(W / 2, H - 78 * mm, "SECUREVAULT")

    c.setFillColor(GOLD2)
    c.setFont("Serif", 12.2)
    c.drawCentredString(W / 2, H - 90 * mm, "A Unified Interactive Information Security Suite")

    # gold diamond rule
    c.setFillColor(GOLD)
    path = c.beginPath()
    cx, cy = W / 2, H - 102 * mm
    path.moveTo(cx, cy + 3.2)
    path.lineTo(cx + 3.2, cy)
    path.lineTo(cx, cy - 3.2)
    path.lineTo(cx - 3.2, cy)
    path.close()
    c.drawPath(path, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.line(cx - 42 * mm, cy, cx - 6 * mm, cy)
    c.line(cx + 6 * mm, cy, cx + 42 * mm, cy)

    # short abstract line
    c.setFillColor(HexColor("#C9D4E0"))
    c.setFont("Serif", 9.4)
    c.drawCentredString(W / 2, H - 114 * mm,
                        "Cryptography  ·  Hashing  ·  Digital Signatures  ·  Secure Chat")
    c.drawCentredString(W / 2, H - 120 * mm,
                        "Firewall Simulation  ·  Intrusion Detection  ·  Authentication")

    # cream info card
    card_y = 52 * mm
    card_h = 78 * mm
    c.setFillColor(HexColor("#F4EFE4"))
    c.roundRect(32 * mm, card_y, W - 64 * mm, card_h, 4, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.6)
    c.roundRect(32 * mm, card_y, W - 64 * mm, card_h, 4, fill=0, stroke=1)

    c.setFillColor(NAVY)
    c.setFont("Sans", 7.8)
    labels = [
        (card_y + card_h - 14 * mm, "SUBMITTED BY", "Vaibhav Pawar"),
        (card_y + card_h - 28 * mm, "COURSE", "CY5008 — Information Security"),
        (card_y + card_h - 42 * mm, "STACK", "MongoDB  ·  Express.js  ·  React.js  ·  Node.js"),
        (card_y + card_h - 56 * mm, "LIVE SYSTEM", "https://securevault-pied.vercel.app"),
        (card_y + card_h - 70 * mm, "ACADEMIC YEAR", "2025 – 2026"),
    ]
    for y, lab, val in labels:
        c.setFillColor(GOLD)
        c.setFont("Sans", 7.2)
        c.drawCentredString(W / 2, y + 5.2 * mm, lab)
        c.setFillColor(NAVY)
        c.setFont("Sans-Bold", 10.2)
        c.drawCentredString(W / 2, y, val)

    c.setFillColor(GOLD2)
    c.setFont("Sans", 7.6)
    c.drawCentredString(W / 2, 24 * mm, "Submitted in partial fulfilment of the course requirements")
    c.drawCentredString(W / 2, 19.5 * mm, "September 2026")
    c.restoreState()


def draw_later(c: pdfcanvas.Canvas, doc):
    page = c.getPageNumber()
    c.saveState()
    # header bar
    c.setFillColor(NAVY)
    c.rect(0, H - 12 * mm, W, 12 * mm, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, H - 12.7 * mm, W, 0.7 * mm, fill=1, stroke=0)
    c.setFillColor(GOLD2)
    c.setFont("Sans", 7.4)
    c.drawString(18 * mm, H - 8.2 * mm, "SECUREVAULT")
    c.drawRightString(W - 18 * mm, H - 8.2 * mm, "CY5008  ·  Information Security")

    # footer
    c.setFillColor(NAVY)
    c.rect(0, 0, W, 11 * mm, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, 11 * mm, W, 0.55 * mm, fill=1, stroke=0)
    c.setFillColor(GOLD2)
    c.setFont("Sans", 7.3)
    c.drawString(18 * mm, 4.6 * mm, "Vaibhav Pawar")
    c.drawCentredString(W / 2, 4.6 * mm, f"{page}")
    c.drawRightString(W - 18 * mm, 4.6 * mm, "Semester Project Report")
    c.restoreState()


# ─────────────────────────────────────────────────────────────────────────────
# Story
# ─────────────────────────────────────────────────────────────────────────────
def build_story():
    story = []
    story.append(PageBreak())  # page 1 is canvas cover

    # ── PAGE 2 Certificate ────────────────────────────────────────────────
    story.append(Spacer(1, 2 * mm))
    story.append(P("CERTIFICATE", "DeclTitle"))
    story.append(hrule())
    story.append(Spacer(1, 4 * mm))
    story.append(P(
        "This is to certify that the project report entitled "
        "<b>SecureVault: A Unified Interactive Information Security Suite</b> "
        "submitted by <b>Vaibhav Pawar</b> in partial fulfilment of the requirements of the "
        "course <b>CY5008 – Information Security</b> is a bona fide record of the work carried "
        "out by the student. The report describes a working MERN-stack application that "
        "demonstrates the principal topics of the syllabus in a single, interactive laboratory.",
        "Body"))
    story.append(P(
        "The implementation covers symmetric and asymmetric cryptography, cryptographic "
        "hashing, digital signatures, a Diffie–Hellman demonstration, authenticated real-time "
        "chat, a priority-based firewall simulator, a signature-based intrusion detection "
        "layer, and a complete registration–OTP–login pipeline. The work has been completed "
        "during the academic year 2025–26 and is considered worthy of evaluation.",
        "Body"))
    story.append(P(
        "I further certify that the observations recorded in this report are consistent with "
        "the source code of the project repository and with the deployed demonstration system.",
        "Body"))
    story.append(Spacer(1, 8 * mm))
    story.append(P("Date: September 2026&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Place: Ahmedabad", "CenterSmall"))
    story.append(Spacer(1, 10 * mm))

    sign = Table(
        [[P("____________________________", "Sign"), P("____________________________", "Sign")],
         [P("<b>Internal Guide</b>", "Sign"), P("<b>Head of Department</b>", "Sign")],
         [P("Name &amp; Signature", "SmallCenter"), P("Name &amp; Signature", "SmallCenter")]],
        colWidths=[85 * mm, 85 * mm])
    sign.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(sign)
    story.append(Spacer(1, 8 * mm))
    story.append(thinrule())
    story.append(P("DECLARATION", "DeclTitle"))
    story.append(P(
        "I, <b>Vaibhav Pawar</b>, hereby declare that the project work entitled "
        "<b>SecureVault: A Unified Interactive Information Security Suite</b> submitted for "
        "the course CY5008 – Information Security is my original work. The design, source "
        "code, and this report have not been submitted, in part or in full, to any other "
        "course or institution for the award of a grade, degree, or diploma. Material taken "
        "from books, standards, and scholarly papers has been acknowledged in the references. "
        "Educational stand-ins that appear in the laboratory (for example the Blowfish and "
        "Tiger demonstrations) are clearly identified as such in the implementation chapters.",
        "Body"))
    story.append(Spacer(1, 8 * mm))
    story.append(P("____________________________", "Sign"))
    story.append(P("<b>Vaibhav Pawar</b>", "Sign"))
    story.append(P("Student  ·  CY5008  ·  September 2026", "SmallCenter"))

    story.append(PageBreak())

    # ── PAGE 3 Acknowledgement ────────────────────────────────────────────
    story.append(h1("ACKNOWLEDGEMENT"))
    story.append(P(
        "I wish to express my sincere gratitude to the faculty of the Information Security "
        "course (CY5008) for framing a syllabus that connects classical cryptographic theory "
        "with the defences used in modern web systems. The structure of that syllabus is the "
        "reason SecureVault exists as one application rather than as a set of disconnected scripts.",
        "Body"))
    story.append(P(
        "I thank the internal guide for patient reviews of the module design, for insisting "
        "that every laboratory screen should expose a measurable result (encryption time, "
        "avalanche percentage, signature validity, firewall decision), and for reminding me "
        "that a student tool must be honest about what it simulates and what it does not.",
        "Body"))
    story.append(P(
        "I am grateful to classmates who registered on the deployed system, sent encrypted "
        "chat messages, and attempted SQL-injection and XSS strings against the IDS. Their "
        "misuse of the laboratory was the most useful form of testing. I also acknowledge "
        "the authors of the textbooks and standards listed in the references — in particular "
        "Stallings, Forouzan, the NIST FIPS publications, and the OWASP Authentication Cheat "
        "Sheet — which supplied the definitions against which the modules were checked.",
        "Body"))
    story.append(P(
        "The open-source ecosystem made the engineering tractable: Node.js <font face='Mono'>crypto</font>, "
        "Express, MongoDB/Mongoose, React, Socket.io, bcryptjs, jsonwebtoken, and Chart.js. "
        "Any remaining errors of fact or of implementation are my own.",
        "Body"))
    story.append(Spacer(1, 8 * mm))
    story.append(P("Vaibhav Pawar", "Sign"))
    story.append(P("Ahmedabad, September 2026", "SmallCenter"))

    story.append(Spacer(1, 10 * mm))
    story.append(thinrule())
    story.append(P("ABSTRACT", "AbstractHead"))
    story.append(P(
        "Information Security is usually taught as a sequence of paper algorithms. Students "
        "meet AES, RSA, SHA-2, firewalls and intrusion detection as separate chapters, and "
        "rarely see them cooperate inside one running system. SecureVault was built to close "
        "that gap. It is a full-stack web laboratory, implemented with MongoDB, Express.js, "
        "React and Node.js, in which every major unit of the CY5008 syllabus is a live module.",
        "Body"))
    story.append(P(
        "The application provides an AES/DES/3DES/RC4 encryption laboratory with file upload "
        "and timing; a hash laboratory (SHA-256, SHA-512, MD5, HMAC) with avalanche analysis "
        "and a birthday-attack demonstration; RSA-2048 key generation, SHA256withRSA signatures "
        "and a toy Diffie–Hellman exchange; AES-256-CBC chat delivered over Socket.io; a "
        "priority-ordered packet-filter with a default-deny policy; a regex intrusion detector "
        "for SQL injection, XSS and directory traversal that blocks high-severity requests and "
        "alerts administrators in real time; and an authentication pipeline with password "
        "policy, bcrypt (cost 12), e-mail OTP, account lockout, JWT sessions and rate limiting.",
        "Body"))
    story.append(P(
        "The report describes the problem, the literature that informed the design, the "
        "requirements, the three-tier architecture, the implementation of each module, the "
        "tests that were run, and the limitations that a teaching system must declare. The "
        "live deployment is available at https://securevault-pied.vercel.app.",
        "Body"))
    story.append(P(
        "<b>Keywords:</b>  AES-256-CBC &nbsp;·&nbsp; RSA-2048 &nbsp;·&nbsp; SHA-2 &nbsp;·&nbsp; "
        "HMAC &nbsp;·&nbsp; JWT &nbsp;·&nbsp; bcrypt &nbsp;·&nbsp; Firewall &nbsp;·&nbsp; "
        "IDS &nbsp;·&nbsp; Socket.io &nbsp;·&nbsp; MERN",
        "Kw"))

    story.append(PageBreak())

    # ── PAGE 4 Contents ───────────────────────────────────────────────────
    story.append(h1("TABLE OF CONTENTS"))

    toc = [
        ("Certificate / Declaration", "2"),
        ("Acknowledgement and Abstract", "3"),
        ("Table of Contents / Lists", "4"),
        ("List of Abbreviations", "5"),
        ("Chapter 1 &nbsp;&nbsp; Introduction", "6"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;1.1  Background and motivation", "6"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;1.2  Problem statement", "6"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;1.3  Objectives", "7"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;1.4  Scope and limitations", "7"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;1.5  Syllabus mapping and organisation", "7"),
        ("Chapter 2 &nbsp;&nbsp; Literature Survey", "8"),
        ("Chapter 3 &nbsp;&nbsp; System Analysis and Requirements", "9"),
        ("Chapter 4 &nbsp;&nbsp; System Design", "10"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;4.1  Architecture", "10"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;4.2  Request pipeline and data model", "11"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;4.3  Technology stack and APIs", "11"),
        ("Chapter 5 &nbsp;&nbsp; Implementation", "12"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.1  Authentication and session security", "12"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.2  Symmetric encryption laboratory", "13"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.3  Hashing, HMAC and the birthday attack", "13"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.4  RSA signatures and Diffie–Hellman", "14"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.5  Secure chat", "14"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.6  Firewall simulator", "15"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.7  Intrusion detection", "15"),
        ("&nbsp;&nbsp;&nbsp;&nbsp;5.8  Learning centre, dashboard and deployment", "16"),
        ("Chapter 6 &nbsp;&nbsp; Testing", "17"),
        ("Chapter 7 &nbsp;&nbsp; Results and Discussion", "18"),
        ("Chapter 8 &nbsp;&nbsp; Conclusion and Future Work", "19"),
        ("References", "20"),
        ("Appendix A &nbsp;&nbsp; Project structure and security controls", "20"),
    ]
    toc_data = []
    for title, page in toc:
        toc_data.append([
            Paragraph(title, S["TocItem"] if title.startswith("&nbsp;") else S["TocChap"]),
            Paragraph(page, ParagraphStyle("tp", parent=S["TocChap"], alignment=TA_RIGHT, fontSize=10)),
        ])
    tt = Table(toc_data, colWidths=[150 * mm, 20 * mm])
    tt.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2),
        ("LINEBELOW", (0, 0), (-1, -2), 0.15, LINE),
    ]))
    story.append(tt)

    # Lists continue on the same / next page as contents

    # ── Lists ─────────────────────────────────────────────────────────────
    story.append(h1("LIST OF FIGURES"))
    figs = [
        ("4.1", "Three-tier architecture of SecureVault", "10"),
        ("4.2", "Inbound API request pipeline", "11"),
        ("4.3", "Logical data model (MongoDB collections)", "11"),
        ("5.1", "Registration and login control flow", "12"),
        ("5.2", "Firewall evaluation and IDS detection", "15"),
        ("7.1", "Relative standing of laboratory ciphers", "18"),
    ]
    story.append(make_table(
        ["Fig.", "Title", "Page"],
        figs, [18 * mm, 132 * mm, 20 * mm], center_cols=[0, 2]))
    story.append(Spacer(1, 6 * mm))
    story.append(h1("LIST OF TABLES"))
    tabs = [
        ("1.1", "Mapping of CY5008 units to SecureVault modules", "7"),
        ("3.1", "Functional requirements", "9"),
        ("3.2", "Non-functional requirements", "9"),
        ("4.1", "Technology stack", "11"),
        ("5.1", "Symmetric algorithms exposed by the encryption laboratory", "13"),
        ("5.2", "Default packet-filter rules", "15"),
        ("6.1", "Representative test cases", "17"),
        ("7.1", "Observed behaviour of the principal modules", "18"),
        ("A.1", "Defence-in-depth controls implemented in the running system", "20"),
    ]
    story.append(make_table(
        ["Table", "Title", "Page"],
        tabs, [18 * mm, 132 * mm, 20 * mm], center_cols=[0, 2]))
    story.append(Spacer(1, 6 * mm))
    story.append(h1("LIST OF ABBREVIATIONS"))
    abbr = [
        ("AES", "Advanced Encryption Standard (FIPS 197)"),
        ("CBC", "Cipher Block Chaining"),
        ("DES / 3DES", "Data Encryption Standard / Triple DES"),
        ("DH", "Diffie–Hellman key exchange"),
        ("HMAC", "Hash-based Message Authentication Code (RFC 2104)"),
        ("IDS", "Intrusion Detection System"),
        ("IV", "Initialisation Vector"),
        ("JWT", "JSON Web Token (RFC 7519), HMAC-SHA256 in this project"),
        ("MERN", "MongoDB, Express.js, React, Node.js"),
        ("OTP", "One-Time Password"),
        ("PKI", "Public Key Infrastructure"),
        ("RSA", "Rivest–Shamir–Adleman public-key cryptosystem"),
        ("SHA-2", "Secure Hash Algorithm 2 (FIPS 180-4)"),
        ("SPN", "Substitution–Permutation Network"),
        ("XSS", "Cross-Site Scripting"),
    ]
    story.append(make_table(["Abbreviation", "Expansion"], abbr, [38 * mm, 132 * mm]))

    story.append(PageBreak())

    # ── CHAPTER 1 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 1 &nbsp;&nbsp; INTRODUCTION"))
    story.append(h2("1.1  Background and motivation"))
    story.append(P(
        "Confidentiality, integrity and authenticity are no longer specialist concerns. Every "
        "student who will later build a web service will have to store passwords, protect "
        "tokens, filter hostile input and reason about cryptographic modes. The CY5008 syllabus "
        "covers this ground in six units: symmetric ciphers and modes of operation; public-key "
        "cryptography and key exchange; hash functions, the birthday problem and digital "
        "signatures; authentication mechanisms; firewall design; and intrusion detection."))
    story.append(P(
        "Textbook presentations of these topics are necessary, but they leave a practical hole. "
        "A student can write the AES round structure on paper and still not know what an "
        "initialisation vector looks like in a stored file, or why a password hash must be "
        "salted, or how a packet-filter decides to drop a datagram. Separate command-line "
        "exercises do not show how the pieces interact: a login request that is rate-limited, "
        "inspected by an IDS, authenticated with a JWT, and then allowed to encrypt a file."))
    story.append(P(
        "SecureVault was conceived as a single product-shaped laboratory. The student registers, "
        "receives an OTP, signs in, and then walks the syllabus through a sidebar: encryption, "
        "hashing, RSA, chat, firewall, IDS, a learning centre with quizzes, and a birthday-attack "
        "visualisation. An administrator sees live alerts and user management. The same code "
        "that teaches the concept is the code that enforces it."))

    story.append(h2("1.2  Problem statement"))
    story.append(P(
        "The problem addressed by this project is the absence of a unified, browser-based "
        "environment in which the CY5008 topics can be practised end-to-end, with visible "
        "ciphertext, timings, decisions and logs, while still resembling a contemporary "
        "multi-user web application. Existing online cipher toys treat algorithms in isolation. "
        "Existing capture-the-flag platforms emphasise exploitation rather than explanation. "
        "Neither is a convenient semester artefact that a student can deploy, demonstrate and "
        "extend."))
    story.append(P(
        "SecureVault therefore sets out to design, implement and evaluate a MERN-stack system "
        "that (i) implements the core cryptographic operations with Node.js <font face='Mono'>crypto</font> "
        "and well-known libraries, (ii) records enough metadata for a student to compare "
        "algorithms, and (iii) wraps those operations in realistic controls: password policy, "
        "lockout, OTP, JWT sessions, rate limits, security headers, a default-deny firewall "
        "and a blocking IDS for high-severity payloads."))

    story.append(h2("1.3  Objectives"))
    objs = [
        "To survey the CY5008 topics and identify a compact set of laboratory modules that cover every unit without becoming a textbook clone.",
        "To design a three-tier architecture (React client, Express API with Socket.io, MongoDB Atlas) with a clear request pipeline.",
        "To implement symmetric encryption of text and files (AES-256-CBC as the primary cipher) with key hashing and IV storage.",
        "To implement hashing (SHA-256/512, MD5, HMAC), avalanche demonstration and a controlled birthday-collision experiment.",
        "To implement RSA-2048 key generation, SHA256withRSA sign/verify, RSA encrypt/decrypt for small messages, and a didactic Diffie–Hellman exchange.",
        "To implement AES-256-CBC chat with JWT-authenticated Socket.io rooms.",
        "To implement a priority-based packet filter (ALLOW / BLOCK / DROP, default DROP) and a signature-based IDS for SQLi, XSS and directory traversal.",
        "To implement registration, OTP e-mail verification, bcrypt password storage, lockout, JWT sessions, rate limiting and an admin console.",
        "To deploy the system and evaluate it with structured test cases.",
    ]
    for i, o in enumerate(objs, 1):
        story.append(P(f"<b>{i}.</b>  {o}", "Obj"))

    story.append(h2("1.4  Scope and limitations"))
    story.append(P(
        "The scope is an educational web laboratory, not a production security appliance. "
        "AES-256-CBC, RSA-2048 and SHA-2 are real primitives from Node.js. Several items are "
        "deliberately didactic and are labelled as such in the code and in this report: the "
        "Blowfish button uses CryptoJS Rabbit as a stand-in; Tiger is a truncated SHA-512 "
        "digest; Diffie–Hellman uses the tiny public parameters <font face='Mono'>p = 23</font>, "
        "<font face='Mono'>g = 5</font>; the birthday module collides on a hash prefix so that "
        "a collision appears in a few thousand trials; chat encryption uses a server-side key "
        "rather than true end-to-end cryptography. The firewall evaluates simulated packets, "
        "not live NIC traffic. The IDS is signature-based, not anomaly-based."))
    story.append(P(
        "These limits are not defects of haste; they are the difference between a course "
        "project that a student can finish and a research IDS. Chapter 8 lists the upgrades "
        "that would be required to harden each limit."))

    story.append(h2("1.5  Syllabus mapping and organisation of the report"))
    story.append(P(
        "Table 1.1 records the correspondence between the six CY5008 units and the modules "
        "of the running system. The remainder of the report follows a conventional engineering "
        "sequence: literature (Chapter 2), requirements (Chapter 3), design (Chapter 4), "
        "implementation (Chapter 5), testing (Chapter 6), results (Chapter 7) and conclusion "
        "(Chapter 8)."))
    story.append(Spacer(1, 2 * mm))
    story.append(make_table(
        ["Unit", "Syllabus topics", "SecureVault module"],
        [
            ["1", "AES, DES, 3DES, Feistel, ECB/CBC", "Encryption Lab + Learning Centre"],
            ["2", "RSA, Diffie–Hellman, PKI ideas", "RSA page (keys, sign, DH demo)"],
            ["3", "SHA-2, MD5, HMAC, birthday, signatures", "Hash Lab, Birthday page, RSA sign"],
            ["4", "Authentication, CAPTCHA, OTP, lockout", "Register / OTP / Login / Profile"],
            ["5", "Firewall design, packet filter, priority", "Firewall simulator"],
            ["6", "IDS, SQLi, XSS, brute-force patterns", "IDS monitor + global middleware"],
        ],
        [18 * mm, 78 * mm, 74 * mm],
        center_cols=[0],
    ))
    story.append(caption("Table 1.1  Mapping of CY5008 units to SecureVault modules."))

    story.append(PageBreak())

    # ── CHAPTER 2 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 2 &nbsp;&nbsp; LITERATURE SURVEY"))
    story.append(h2("2.1  Symmetric cryptography and modes"))
    story.append(P(
        "Shannon’s principles of confusion and diffusion still describe what a block cipher "
        "must achieve. Feistel networks, used by DES, split a block and apply a round function "
        "to one half; AES instead uses a substitution–permutation network on a 128-bit state "
        "[1], [2]. NIST standardised AES in FIPS 197 [3]. With a 256-bit key, AES runs 14 "
        "rounds of SubBytes, ShiftRows, MixColumns and AddRoundKey. DES, with a 56-bit key, "
        "is obsolete against brute force; 3DES lengthens the effective key but is slow and is "
        "withdrawn for new applications. RC4 is a stream cipher with well-known biases and "
        "must not be used in new protocols."))
    story.append(P(
        "A block cipher is not a complete encryption scheme. ECB encrypts identical blocks "
        "to identical ciphertext and leaks patterns. CBC XORs each plaintext block with the "
        "previous ciphertext block and therefore needs a random IV, which must be stored "
        "beside the ciphertext and must never be reused with the same key. SecureVault’s "
        "primary file cipher is AES-256-CBC with a fresh 16-byte IV from "
        "<font face='Mono'>crypto.randomBytes</font>."))

    story.append(h2("2.2  Public-key cryptography and key exchange"))
    story.append(P(
        "Diffie and Hellman (1976) showed that two parties can agree on a shared secret over "
        "an open channel by exchanging <font face='Mono'>g<sup>a</sup> mod p</font> and "
        "<font face='Mono'>g<sup>b</sup> mod p</font> [4]. RSA (1978) based confidentiality "
        "and signatures on the difficulty of factoring <font face='Mono'>n = pq</font> [5]. "
        "PKCS #1 (RFC 8017) [6] describes modern encodings. Current guidance is a 2048-bit "
        "modulus as a minimum. Because RSA is slow and limited in message size, real systems "
        "use it to wrap a symmetric session key or to sign a hash — hybrid encryption, which "
        "the RSA module of SecureVault lets a student see by generating keys, encrypting a "
        "short string, and signing a document digest."))

    story.append(h2("2.3  Hash functions, HMAC and the birthday paradox"))
    story.append(P(
        "A cryptographic hash is one-way and collision-resistant. SHA-256 and SHA-512 (FIPS "
        "180-4) [7] are the workhorses of TLS, Git and Bitcoin. MD5 and SHA-1 are broken for "
        "collision resistance and remain in the laboratory only as cautionary exhibits. HMAC "
        "(RFC 2104) [8] keys a hash so that it can authenticate a message without public-key "
        "operations. The avalanche property — a one-bit input change flipping about half of "
        "the output bits — is the empirical test the hash module reports as a percentage."))
    story.append(P(
        "Yuval’s birthday attack follows from the classical birthday paradox: a collision "
        "among <i>N</i> possible hash values is expected after roughly "
        "<font face='Mono'>√N</font> trials, not <font face='Mono'>N</font>. For a 128-bit "
        "MD5 digest that is 2<sup>64</sup> work, which is why MD5 must not be used for "
        "signatures. The birthday page in SecureVault makes the probability curve visible "
        "and runs a prefix-collision experiment so that a student can watch two different "
        "messages agree on the first bytes of a digest without waiting for an infeasible "
        "full-width search."))

    story.append(h2("2.4  Authentication, passwords and tokens"))
    story.append(P(
        "Storing a password in plaintext is indefensible. Slow, salted hashes such as bcrypt "
        "(cost factor 12 in this project) raise the cost of offline guessing [9]. Complementary "
        "controls recommended by OWASP [10] include complexity rules, lockout after repeated "
        "failures, OTP verification of e-mail, and CAPTCHA on public forms. Session proof is "
        "carried by a JSON Web Token (RFC 7519) [11]. SecureVault signs tokens with HMAC-SHA256 "
        "and a server secret (HS256), not with an RSA key pair; the README’s mention of RS256 "
        "is therefore a documentation slip, and the implementation is the authority for this "
        "report. Rate limiting (express-rate-limit) bounds the online guessing rate."))

    story.append(h2("2.5  Firewalls and intrusion detection"))
    story.append(P(
        "A packet-filter firewall takes an ordered list of rules on addresses, ports and "
        "protocols and applies the first match; a default-deny (drop) policy is the only "
        "safe remainder [12]. Intrusion detection, surveyed from Denning’s early model to "
        "signature engines such as Snort, watches events and raises alerts. Signature-based "
        "IDS is precise for known payloads (SQL metacharacters, <font face='Mono'>&lt;script&gt;</font> "
        "tags, <font face='Mono'>../</font> traversal) and blind to novel attacks. "
        "Anomaly-based IDS is the opposite. SecureVault implements the signature style, "
        "because it can be explained with a short list of regular expressions, and it goes "
        "one step further than a pure IDS: high-severity matches are blocked (403), so the "
        "middleware behaves as a lightweight IPS on those patterns."))

    story.append(h2("2.6  Related teaching systems and the gap"))
    story.append(P(
        "OpenSSL, CyberChef, and various university “crypto palettes” already encrypt a "
        "string in the browser. What they do not do is place that string next to a real "
        "user account, a stored file record, a chat ciphertext, a firewall decision log and "
        "an IDS alert stream. SecureVault’s contribution is not a new cipher. It is the "
        "integration of the syllabus into one authenticated product, with enough production "
        "texture (bcrypt, JWT, headers, rate limits, Socket.io) that a student can later "
        "recognise the same shapes in an industrial codebase."))

    story.append(PageBreak())

    # ── CHAPTER 3 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 3 &nbsp;&nbsp; SYSTEM ANALYSIS AND REQUIREMENTS"))
    story.append(h2("3.1  Stakeholders and use cases"))
    story.append(P(
        "Two roles exist. A <b>verified user</b> registers, confirms an e-mail OTP, signs in, "
        "edits a profile, encrypts and decrypts files, hashes text or files, generates RSA "
        "keys, signs and verifies documents, chats privately, simulates packets against the "
        "firewall, inspects personal IDS events, studies the learning centre, and runs the "
        "birthday experiment. An <b>administrator</b> additionally opens the admin console, "
        "bans or promotes users, and occupies the Socket.io <font face='Mono'>admin-room</font> "
        "to receive live IDS alerts. Unauthenticated visitors see only the landing page, "
        "registration, login, OTP and password-reset screens."))

    story.append(h2("3.2  Functional requirements"))
    story.append(make_table(
        ["ID", "Requirement", "Priority"],
        [
            ["F1", "Register with a strong-password policy; send and verify a 6-digit OTP (10 min).", "Must"],
            ["F2", "Login with lockout after 5 failures (15 min) and JWT session (7 d / 30 d).", "Must"],
            ["F3", "Encrypt/decrypt uploaded files (≤ 10 MB) with AES, DES, 3DES, RC4.", "Must"],
            ["F4", "Hash text/files (SHA-256/512, MD5, HMAC); show avalanche; verify a digest.", "Must"],
            ["F5", "Generate RSA-2048 keys; sign and verify with SHA256withRSA.", "Must"],
            ["F6", "Demonstrate Diffie–Hellman with visible public parameters.", "Should"],
            ["F7", "Send and receive AES-256-CBC chat in real time.", "Must"],
            ["F8", "CRUD firewall rules; simulate a packet; default DROP.", "Must"],
            ["F9", "Detect SQLi, XSS, traversal on every /api request; block HIGH; log.", "Must"],
            ["F10", "Dashboard cards and charts; admin user management.", "Should"],
            ["F11", "Learning centre with step diagrams and quizzes.", "Should"],
            ["F12", "Forgot-password flow with a hashed, time-limited token.", "Should"],
        ],
        [16 * mm, 128 * mm, 26 * mm],
        center_cols=[0, 2],
    ))
    story.append(caption("Table 3.1  Functional requirements."))

    story.append(h2("3.3  Non-functional requirements"))
    story.append(make_table(
        ["ID", "Requirement", "Approach in SecureVault"],
        [
            ["N1", "Security of stored secrets", "bcrypt cost 12; never store raw cipher keys (store SHA-256 of the key); chat key in env"],
            ["N2", "Abuse resistance", "Auth limiter 20/15 min; OTP limiter 5/10 min; API limiter 200/15 min"],
            ["N3", "Usability", "Single sidebar, toasts, Chart.js, Framer Motion, mobile drawer"],
            ["N4", "Maintainability", "One controller and one React page per module; Mongoose models"],
            ["N5", "Deployability", "Vercel (client) + Render (API) + MongoDB Atlas; render.yaml"],
            ["N6", "Observability", "LoginHistory, IdsLog, dashboard aggregations, socket alerts"],
            ["N7", "Honesty", "Didactic stand-ins labelled in API responses and in this report"],
        ],
        [16 * mm, 48 * mm, 106 * mm],
        center_cols=[0],
    ))
    story.append(caption("Table 3.2  Non-functional requirements."))

    story.append(h2("3.4  Feasibility"))
    story.append(P(
        "Technical feasibility is high: every primitive is available in Node.js 18+ or in "
        "CryptoJS, and the author already had a React/Express background. Operational "
        "feasibility is acceptable on the free tiers of Vercel, Render and Atlas for a class "
        "demonstration. Economic feasibility is essentially the cost of the student’s time; "
        "no licensed cryptographic toolkit is required. The main risk was scope — six syllabus "
        "units in one term — and it was managed by keeping each module to one route file, "
        "one controller and one page."))

    story.append(h2("3.5  Hardware and software requirements"))
    story.append(P(
        "Development requires Node.js 18 or newer, npm, a MongoDB instance (local or Atlas), "
        "and a modern browser. Optional SMTP credentials enable real OTP mail; without them "
        "the server prints the OTP to the console and, in non-production mode, returns it in "
        "the JSON body so that the laboratory remains usable. Production additionally needs "
        "the environment variables listed in <font face='Mono'>.env.example</font>: "
        "<font face='Mono'>MONGODB_URI</font>, <font face='Mono'>JWT_SECRET</font>, "
        "<font face='Mono'>CHAT_AES_KEY</font>, <font face='Mono'>CLIENT_URL</font> and the "
        "SMTP quartet. A laptop with 4 GB of RAM is sufficient."))

    # ── CHAPTER 4 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 4 &nbsp;&nbsp; SYSTEM DESIGN"))
    story.append(h2("4.1  Architecture"))
    story.append(P(
        "SecureVault is a classical three-tier web system. The presentation tier is a React 19 "
        "single-page application built with Vite, styled with Tailwind CSS, routed with React "
        "Router, and animated with Framer Motion. Public routes (landing, login, register, "
        "OTP, forgot-password) sit outside the application shell. Protected routes share a "
        "sidebar and navbar and are wrapped in a <font face='Mono'>ProtectedRoute</font> that "
        "reads the JWT from AuthContext. Admin routes add a second guard on <font face='Mono'>role === 'admin'</font>."))
    story.append(P(
        "The application tier is an Express 5 process that also hosts a Socket.io server on "
        "the same HTTP listener. REST handles request–response work (encrypt a file, list "
        "rules, verify a signature). Sockets handle events that cannot wait for a poll: a "
        "new chat message, a typing indicator, an IDS alert to the admin room. The data tier "
        "is MongoDB, reached only through Mongoose models. Figure 4.1 summarises the layers."))
    story.append(fig(os.path.join(FIG, "architecture.png"),
                     "Figure 4.1  Three-tier architecture of SecureVault."))

    story.append(h2("4.2  Request pipeline"))
    story.append(P(
        "Every call to <font face='Mono'>/api</font> walks a fixed pipeline, which is the "
        "pedagogical counterpart of a reverse-proxy chain in industry. CORS is restricted to "
        "the configured client origin plus local development hosts. JSON bodies are capped at "
        "10 MB. A global rate limiter then a passive IDS inspect the request. Security headers "
        "(<font face='Mono'>X-Content-Type-Options: nosniff</font>, "
        "<font face='Mono'>X-Frame-Options: DENY</font>, XSS protection, strict referrer) are "
        "applied. Route-level JWT middleware loads the user. Only then does a controller run. "
        "High-severity IDS matches short-circuit the pipeline with HTTP 403."))
    story.append(fig(os.path.join(FIG, "pipeline.png"),
                     "Figure 4.2  Inbound API request pipeline."))

    story.append(h2("4.3  Data model"))
    story.append(P(
        "Seven collections cover the laboratory. <font face='Mono'>User</font> holds identity, "
        "the bcrypt hash, OTP fields, lockout counters, a five-slot password history, a "
        "90-day password expiry stamp, and a ban flag. <font face='Mono'>EncryptedFile</font> "
        "stores metadata only — the ciphertext lives on disk under <font face='Mono'>server/uploads</font>, "
        "and the key is never stored, only its SHA-256. <font face='Mono'>ChatMessage</font> "
        "stores ciphertext and IV. <font face='Mono'>FirewallRule</font> and "
        "<font face='Mono'>IdsLog</font> feed the two defence screens. "
        "<font face='Mono'>HashHistory</font> and <font face='Mono'>LoginHistory</font> feed "
        "the dashboard. Figure 4.3 shows the fields a student actually meets."))
    story.append(fig(os.path.join(FIG, "datamodel.png"),
                     "Figure 4.3  Logical data model (MongoDB collections)."))

    story.append(h2("4.4  Technology stack"))
    story.append(make_table(
        ["Layer", "Choice", "Role in the project"],
        [
            ["Client", "React 19, Vite, Tailwind v3", "SPA, navy/cyan laboratory UI"],
            ["Routing / UX", "React Router 7, Framer Motion, Lucide", "Pages, motion, icons"],
            ["Charts", "Chart.js + react-chartjs-2", "Dashboard metrics"],
            ["Realtime", "Socket.io-client", "Chat and IDS alerts"],
            ["HTTP", "Axios services (one per module)", "Typed API wrappers"],
            ["Server", "Express 5, Node.js 18+", "REST + static /uploads"],
            ["Realtime", "Socket.io 4", "JWT handshake, rooms"],
            ["Database", "MongoDB + Mongoose 9", "Seven models"],
            ["Auth", "jsonwebtoken HS256, bcryptjs 12", "Sessions and password hashes"],
            ["Crypto", "Node crypto, CryptoJS", "AES/RSA/SHA and legacy ciphers"],
            ["Mail", "Nodemailer", "OTP and reset messages"],
            ["Upload", "Multer", "Encryption and hash files"],
            ["Hosting", "Vercel + Render + Atlas", "Split frontend / API / data"],
        ],
        [28 * mm, 58 * mm, 84 * mm],
    ))
    story.append(caption("Table 4.1  Technology stack."))
    story.append(P(
        "The client is deployed independently of the API. This split matches current practice "
        "and forces CORS, environment-specific <font face='Mono'>CLIENT_URL</font>, and "
        "<font face='Mono'>trust proxy</font> (so rate limiting reads "
        "<font face='Mono'>X-Forwarded-For</font> correctly behind Render)."))

    story.append(PageBreak())

    # ── CHAPTER 5 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 5 &nbsp;&nbsp; IMPLEMENTATION"))
    story.append(h2("5.1  Authentication and session security"))
    story.append(P(
        "Registration refuses empty fields and enforces the regular expression "
        "<font face='Mono'>(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&amp;]).{8,}</font>. "
        "A 6-digit OTP is generated, stored with a ten-minute expiry, e-mailed when SMTP is "
        "configured, and logged to the server console so that a classroom demo never stalls. "
        "The User pre-save hook hashes the password with bcrypt salt rounds 12 and appends "
        "the hash to a rolling history of five. Login is wrapped in a 20-request / 15-minute "
        "limiter. Five consecutive failures set <font face='Mono'>lockUntil</font> fifteen "
        "minutes ahead; <font face='Mono'>isLocked()</font> then returns HTTP 423. A successful "
        "login resets the counter, writes a LoginHistory row (IP, coarse browser and OS) and "
        "issues a JWT for 7 days, or 30 days when “remember me” is set. Password-reset tokens "
        "are 32 random bytes, stored as SHA-256, and expire in 30 minutes."))
    story.append(fig(os.path.join(FIG, "authflow.png"),
                     "Figure 5.1  Registration and login control flow."))
    story.append(P(
        "Protected REST routes call <font face='Mono'>protect</font>, which accepts a Bearer "
        "token or a cookie, verifies it with <font face='Mono'>JWT_SECRET</font>, and loads "
        "the user without the password fields. Socket connections present the same token in "
        "the handshake; failure closes the socket. Math and text CAPTCHAs are generated at "
        "<font face='Mono'>/api/captcha/*</font> as an additional bot obstacle on public pages."))

    story.append(h2("5.2  Symmetric encryption laboratory"))
    story.append(P(
        "The encryption controller accepts a multipart upload (Multer, 10 MB cap). The file "
        "bytes, a passphrase and an algorithm name are handed to "
        "<font face='Mono'>cryptoUtils.encrypt</font>. AES is implemented with "
        "<font face='Mono'>crypto.createCipheriv('aes-256-cbc')</font>: the passphrase is "
        "digested with SHA-256 to obtain a 32-byte key, a random 16-byte IV is generated, and "
        "the ciphertext and IV are written as JSON to disk. The original upload is deleted. "
        "The MongoDB record stores original name, algorithm, IV, size, elapsed milliseconds "
        "and the SHA-256 of the passphrase — never the passphrase itself. Decryption recomputes "
        "the key hash, refuses a mismatch, and streams the recovered bytes with the original "
        "MIME type."))
    story.append(make_table(
        ["Label", "Engine", "Key / notes", "Status"],
        [
            ["AES", "Node crypto AES-256-CBC", "256-bit key from SHA-256(passphrase); random IV", "Primary, recommended"],
            ["DES", "CryptoJS DES", "56-bit effective key", "Historical exhibit"],
            ["Triple-DES", "CryptoJS TripleDES", "168-bit nominal key", "Legacy exhibit"],
            ["RC4", "CryptoJS RC4", "Stream cipher, biased output", "Insecure exhibit"],
            ["Blowfish", "CryptoJS Rabbit stand-in", "Labelled “Blowfish (Rabbit-demo)” in the API", "Didactic stand-in"],
        ],
        [28 * mm, 48 * mm, 62 * mm, 32 * mm],
    ))
    story.append(caption("Table 5.1  Symmetric algorithms exposed by the encryption laboratory."))

    story.append(h2("5.3  Hashing, HMAC and the birthday attack"))
    story.append(P(
        "Text or a 5 MB file is hashed with <font face='Mono'>crypto.createHash</font> for "
        "SHA-256, SHA-512 and MD5. HMAC requires a student-supplied secret. The avalanche "
        "endpoint hashes the original string and a one-character mutation, XOR-counts differing "
        "hex nibbles and reports the bit-flip percentage — typically close to 50 % for SHA-256, "
        "which is the expected behaviour of a good hash. History rows let a student compare "
        "digests later. The birthday endpoint hashes up to 50 000 random messages and collides "
        "on an 8–12 hex-character prefix so that the paradox is felt in a browser session; the "
        "JSON body states plainly that a real attack targets the full digest."))

    story.append(h2("5.4  RSA signatures and Diffie–Hellman"))
    story.append(P(
        "Key generation calls <font face='Mono'>crypto.generateKeyPairSync('rsa')</font> with "
        "modulus 2048 (configurable), SPKI public PEM and PKCS#8 private PEM. Signing uses "
        "<font face='Mono'>crypto.createSign('SHA256')</font>; verification uses the matching "
        "verifier and returns a boolean plus an English sentence the UI can show (“valid / "
        "tampered”). RSA encrypt/decrypt is offered for short strings only, which is the "
        "correct restriction. The Diffie–Hellman demonstration is intentionally tiny "
        "(<font face='Mono'>p = 23</font>, <font face='Mono'>g = 5</font>, random private "
        "exponents in {3…17}) so that a student can recompute "
        "<font face='Mono'>g<sup>a</sup> mod p</font> by hand and see Alice’s and Bob’s shared "
        "secrets match. It is a blackboard, not a key-exchange protocol."))

    story.append(h2("5.5  Secure chat"))
    story.append(P(
        "A verified user fetches the directory of other verified users and the ciphertext "
        "history with a chosen peer. On send, the plaintext is encrypted with AES-256-CBC "
        "under <font face='Mono'>CHAT_AES_KEY</font> (falling back to the JWT secret only in "
        "misconfigured development). The document stored in MongoDB contains "
        "<font face='Mono'>encryptedMessage</font> and <font face='Mono'>iv</font> only. The "
        "API decrypts for the two participants when history is loaded. The same payload is "
        "emitted on the receiver’s Socket.io room for instant delivery. Typing and read "
        "receipts are socket-only events and are not persisted. This is <i>server-side</i> "
        "encryption at rest and in transit between the two browsers via the server; it is "
        "not end-to-end encryption in the Signal sense, because the server can decrypt. "
        "Chapter 8 notes the upgrade path (per-conversation keys wrapped by RSA)."))

    story.append(h2("5.6  Firewall simulator"))
    story.append(P(
        "Rules have a name, a type (IP / PORT / PROTOCOL / CUSTOM), a protocol (TCP, UDP, "
        "ICMP, ANY), a port or port range, an IP or ANY, a direction, an action (ALLOW, "
        "BLOCK, DROP), a numeric priority and an enabled flag. Evaluation sorts enabled "
        "rules by ascending priority and returns on the first match of port, IP and protocol. "
        "Port ranges such as <font face='Mono'>1-1024</font> are supported. If the table is "
        "empty, five defaults are used (Table 5.2). If nothing matches, the engine applies "
        "DROP and says so in the log — the default-deny lesson in one sentence. BLOCK/DROP "
        "outcomes are also copied into IdsLog so that the two defence screens stay coupled."))
    story.append(make_table(
        ["Priority", "Name", "Match", "Action"],
        [
            ["10", "Allow HTTP", "TCP / 80", "ALLOW"],
            ["20", "Allow HTTPS", "TCP / 443", "ALLOW"],
            ["30", "Allow DNS", "UDP / 53", "ALLOW"],
            ["40", "Block Telnet", "TCP / 23", "BLOCK"],
            ["50", "Block FTP", "TCP / 21", "BLOCK"],
        ],
        [28 * mm, 48 * mm, 54 * mm, 40 * mm],
        center_cols=[0, 3],
    ))
    story.append(caption("Table 5.2  Default packet-filter rules (lower number = higher priority)."))

    story.append(h2("5.7  Intrusion detection"))
    story.append(P(
        "The IDS engine compiles three families of regular expressions. SQL injection looks "
        "for statement keywords, tautologies such as <font face='Mono'>1=1</font>, comment "
        "markers and timing functions (<font face='Mono'>SLEEP</font>, "
        "<font face='Mono'>BENCHMARK</font>). XSS looks for "
        "<font face='Mono'>&lt;script&gt;</font>, event-handler attributes, "
        "<font face='Mono'>javascript:</font> URLs, iframes and <font face='Mono'>eval(</font>. "
        "Directory traversal looks for <font face='Mono'>../</font> and several URL encodings. "
        "Only <font face='Mono'>query</font>, <font face='Mono'>body</font> and "
        "<font face='Mono'>params</font> are scanned; the User-Agent is excluded because "
        "browser banners contain the word “like” and were causing false SQL hits."))
    story.append(P(
        "On a match the middleware writes an IdsLog, emits <font face='Mono'>ids-alert</font> "
        "to the admin room, and, for HIGH or CRITICAL severity, returns 403 with the attack "
        "type. The IDS page can also inject a simulated payload for teaching. Figure 5.2 "
        "places the firewall and the IDS on one diagram because a student should see them as "
        "two layers, not two unrelated screens."))
    story.append(fig(os.path.join(FIG, "defence.png"),
                     "Figure 5.2  Firewall evaluation (top) and IDS detection (bottom)."))

    story.append(h2("5.8  Learning centre, dashboard and deployment"))
    story.append(P(
        "The learning centre is a client-side syllabus: AES, DES, SHA-256, RSA, the birthday "
        "attack, firewalls and IDS, each with a short description, a numbered “how it works” "
        "list, key facts, and a quiz. The dashboard aggregates counts (users, files, hashes, "
        "blocked threats, rules, alerts, seven-day login success/failure), Chart.js series "
        "for daily activity and attack-type breakdown, and the five most recent threats. "
        "When MongoDB is unreachable the dashboard still returns a small demo payload so that "
        "a presentation does not show an empty shell."))
    story.append(P(
        "Deployment splits the two packages. The Vite client is built to static files and "
        "hosted on Vercel (<font face='Mono'>client/vercel.json</font>). The Express server "
        "is a Render web service defined in <font face='Mono'>render.yaml</font> (Singapore, "
        "Node, <font face='Mono'>npm start</font>). Secrets — Mongo URI, JWT secret, chat "
        "key, SMTP — are injected as environment variables and are never committed. The "
        "repository README is the operator’s manual for local reproduction."))

    story.append(PageBreak())

    # ── CHAPTER 6 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 6 &nbsp;&nbsp; TESTING"))
    story.append(h2("6.1  Strategy"))
    story.append(P(
        "Testing was black-box against the running API and the browser, supplemented by "
        "direct inspection of MongoDB documents and of the <font face='Mono'>uploads</font> "
        "directory. The aim was not a coverage percentage; it was to confirm that each "
        "syllabus claim in Table 1.1 is visible as a result a demonstrator can show: a "
        "ciphertext file, a 403 from the IDS, a DROP from the firewall, a JWT in local "
        "storage, a matching DH secret. Table 6.1 lists representative cases."))

    story.append(make_table(
        ["ID", "Action", "Expected result", "Outcome"],
        [
            ["T1", "Register with password 'abc'", "400, policy message", "Pass"],
            ["T2", "Register valid user, verify OTP after 11 min", "400, OTP expired", "Pass"],
            ["T3", "Five wrong passwords", "423 lockout, LoginHistory FAILED", "Pass"],
            ["T4", "Login after lock expiry", "200, JWT, attempts reset", "Pass"],
            ["T5", "Encrypt a PDF with AES, decrypt with same key", "Original bytes, matching MIME", "Pass"],
            ["T6", "Decrypt with a wrong key", "400, incorrect key", "Pass"],
            ["T7", "SHA-256 avalanche on 'SecureVault' vs one-letter change", "~50 % bits differ", "Pass"],
            ["T8", "Sign a sentence, alter one character, verify", "isValid = false", "Pass"],
            ["T9", "DH demo endpoint", "aliceShared === bobShared", "Pass"],
            ["T10", "Packet TCP/23 against default rules", "BLOCK (Telnet rule)", "Pass"],
            ["T11", "Packet TCP/9999, no matching rule", "DROP, default-deny note", "Pass"],
            ["T12", "POST body containing '1=1' OR UNION SELECT", "403, IdsLog SQL_INJECTION", "Pass"],
            ["T13", "Body containing <font face='Mono'>&lt;script&gt;alert(1)&lt;/script&gt;</font>", "403, IdsLog XSS", "Pass"],
            ["T14", "Chat message stored document", "No plaintext field; IV present", "Pass"],
            ["T15", "Request /api/admin without admin role", "403 Admin access required", "Pass"],
        ],
        [14 * mm, 58 * mm, 68 * mm, 20 * mm],
        center_cols=[0, 3],
    ))
    story.append(caption("Table 6.1  Representative test cases."))

    story.append(h2("6.2  Observations from testing"))
    story.append(P(
        "Two false-positive lessons were learned. Early IDS builds scanned the User-Agent and "
        "flagged ordinary Chrome banners because of the substring “like”. The scan surface was "
        "narrowed to user-controlled fields. Second, CryptoJS DES/3DES/RC4 operate on strings; "
        "binary files are base64-wrapped before those ciphers run, which a student must be "
        "told when comparing ciphertext lengths with AES. Load testing was modest — the free "
        "Render instance is not a benchmark harness — but the rate limiter was confirmed by "
        "bursting the login route past twenty attempts in a quarter of an hour."))

    story.append(h2("6.3  Usability checks"))
    story.append(P(
        "Classmates completed registration on a telephone-sized viewport, which exercised the "
        "sidebar drawer and the OTP page. The learning-centre quizzes were used as a smoke "
        "test that every topic card rendered. The principal remaining usability debt is that "
        "error messages from Node’s crypto library (for example a truncated AES block) are "
        "sometimes too raw for a first-year reader; wrapping them in one teaching sentence "
        "is listed as future work."))

    story.append(PageBreak())

    # ── CHAPTER 7 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 7 &nbsp;&nbsp; RESULTS AND DISCUSSION"))
    story.append(h2("7.1  Module-level results"))
    story.append(P(
        "Table 7.1 records what a demonstrator actually sees after the tests of Chapter 6. "
        "Timings are order-of-magnitude observations on a development laptop; they are not "
        "cryptographic benchmarks. They are still useful pedagogically: AES-256-CBC of a "
        "small file is a handful of milliseconds, RSA-2048 key generation is the first "
        "operation a student notices as “slow”, and hashing is effectively free. That "
        "ordering matches the textbook claim that asymmetric cryptography is for keys and "
        "signatures, not for bulk data."))
    story.append(make_table(
        ["Module", "What is produced", "What a student should notice"],
        [
            ["Auth", "Verified user, JWT, lockout, OTP mail/console", "Policy + slow hash + lockout beat a guesser"],
            ["Encryption", "Ciphertext file + IV + time + keyHash", "IV changes every run; wrong key fails cleanly"],
            ["Hash", "Hex digest, length, avalanche %", "Tiny input change, large digest change"],
            ["Birthday", "Prefix collision pair + probability curve", "√N, not N; MD5 is the cautionary tale"],
            ["RSA", "PEM pair, Base64 signature, valid/invalid", "One flipped character kills the signature"],
            ["DH", "p, g, public keys, equal shared secrets", "Secrets match without sending the secret"],
            ["Chat", "Ciphertext in Mongo, live bubble in UI", "Database has no plaintext column"],
            ["Firewall", "ALLOW / BLOCK / DROP + matched rule", "First match wins; empty match is DROP"],
            ["IDS", "Log row, socket alert, 403 on HIGH", "Signatures catch known strings only"],
        ],
        [28 * mm, 62 * mm, 80 * mm],
    ))
    story.append(caption("Table 7.1  Observed behaviour of the principal modules."))

    story.append(h2("7.2  Cipher standing"))
    story.append(P(
        "Figure 7.1 is an educational scale, not a cryptanalytic ranking. It places AES-256 "
        "at the recommended end of the laboratory and DES/RC4 at the obsolete end, with 3DES "
        "and the Blowfish stand-in in between. The point of the figure is to stop a student "
        "from leaving the course believing that “the application offers five equal ciphers”. "
        "It does not. It offers one cipher a student may use (AES-256-CBC) and four exhibits."))
    story.append(fig(os.path.join(FIG, "ciphers.png"),
                     "Figure 7.1  Relative standing of laboratory ciphers (educational scale)."))

    story.append(h2("7.3  Discussion"))
    story.append(P(
        "Three design choices dominate the discussion. First, <b>honesty about stand-ins</b>. "
        "A course project that silently labels Rabbit as Blowfish would teach the wrong fact. "
        "SecureVault keeps the button, because the syllabus names Blowfish, but the API string "
        "says “Rabbit-demo” and this report repeats the caveat. Second, <b>defence in depth "
        "on the same process</b>. Rate limit, IDS, JWT and the controller are not four products; "
        "they are four functions on one Express app, which is exactly how a small company "
        "ships a first version. Third, <b>hybrid cryptography in pieces</b>. The student meets "
        "AES for files, RSA for signatures and DH for agreement as separate screens, then "
        "sees AES again inside chat. Connecting those screens into a single “secure session” "
        "protocol is the natural next laboratory, not a missing feature of this one."))
    story.append(P(
        "A limitation that testing made obvious is the global chat key. It simplifies "
        "deployment (one environment variable) and still hides plaintext from a casual "
        "database dump, but it gives the server operator full reading rights. For CY5008 "
        "that is acceptable — confidentiality of chat is demonstrated, not proven against "
        "the operator. A second limitation is the signature IDS: it will never catch a "
        "novel payload and it can be bypassed by encodings it does not list. Those are "
        "the right limitations to discuss in an oral examination."))

    story.append(PageBreak())

    # ── CHAPTER 8 ─────────────────────────────────────────────────────────
    story.append(h1("CHAPTER 8 &nbsp;&nbsp; CONCLUSION AND FUTURE WORK"))
    story.append(h2("8.1  Conclusion"))
    story.append(P(
        "SecureVault meets the nine objectives of Section 1.3. It is a deployed MERN "
        "application in which a student can encrypt a file, hash a message, watch an avalanche, "
        "sign a document, agree a toy DH secret, talk over AES-CBC, drop a simulated Telnet "
        "packet, trip an SQL-injection detector, and do all of this behind a password policy, "
        "an OTP, a lockout and a JWT. The CY5008 syllabus is no longer a list of chapters; "
        "it is a sidebar."))
    story.append(P(
        "The engineering contribution is integration and clarity, not novelty of algorithms. "
        "Node.js already knew how to run AES and RSA. What the project adds is a coherent "
        "path from a landing page to a log of blocked requests, with the didactic substitutions "
        "(Rabbit for Blowfish, truncated SHA-512 for Tiger, tiny DH primes, prefix birthday "
        "collisions) declared rather than hidden. That declaration is itself part of the "
        "security lesson: a system that over-claims is an insecure system."))

    story.append(h2("8.2  Future work"))
    story.append(P(
        "The following extensions would move the laboratory toward production texture without "
        "abandoning its teaching purpose."))
    fut = [
        "<b>True Blowfish and Tiger.</b> Replace the Rabbit and truncated-SHA stand-ins with native implementations so that the labels match the bytes.",
        "<b>End-to-end chat.</b> Wrap a per-conversation AES key with each recipient’s RSA public key; keep plaintext off the server.",
        "<b>Authenticated encryption.</b> Prefer AES-GCM over CBC so that confidentiality and integrity arrive together.",
        "<b>RS256 JWT or rotating HS256 secrets</b>, plus HTTP-only cookies, to retire tokens from localStorage.",
        "<b>TOTP second factor</b> (RFC 6238) beside the e-mail OTP.",
        "<b>Anomaly IDS.</b> A simple baseline on request rates per IP, to complement signatures.",
        "<b>Live packet capture</b> for the firewall, even if only from a user-space pcap file.",
        "<b>Automated tests.</b> Jest/Supertest for controllers and Playwright for the SPA, turning Table 6.1 into a pipeline.",
        "<b>Accessibility and copy.</b> Friendlier crypto error messages; contrast audit of the navy theme.",
    ]
    for i, x in enumerate(fut, 1):
        story.append(P(f"<b>{i}.</b>  {x}", "Obj"))

    story.append(h2("8.3  Closing remark"))
    story.append(P(
        "If a student can, in one sitting, encrypt a file, break a signature by editing one "
        "letter, and watch the IDS refuse a tautology, then CY5008 has done its job. "
        "SecureVault is a vehicle for that sitting. The source is at "
        "github.com/pavarvaibhav989-tech/securevault and the working system is at "
        "https://securevault-pied.vercel.app."))

    story.append(Spacer(1, 4 * mm))
    story.append(thinrule())
    story.append(h1("REFERENCES"))
    refs = [
        "[1]  W. Stallings, <i>Cryptography and Network Security: Principles and Practice</i>, 8th ed. Pearson, 2023.",
        "[2]  B. A. Forouzan, <i>Cryptography and Network Security</i>. McGraw-Hill, 2008.",
        "[3]  NIST, “Advanced Encryption Standard (AES),” FIPS PUB 197, 2001 (updated 2023).",
        "[4]  W. Diffie and M. E. Hellman, “New directions in cryptography,” <i>IEEE Trans. Inf. Theory</i>, vol. 22, no. 6, pp. 644–654, 1976.",
        "[5]  R. L. Rivest, A. Shamir, and L. Adleman, “A method for obtaining digital signatures and public-key cryptosystems,” <i>Commun. ACM</i>, vol. 21, no. 2, pp. 120–126, 1978.",
        "[6]  K. Moriarty (Ed.) et al., “PKCS #1: RSA Cryptography Specifications Version 2.2,” RFC 8017, 2016.",
        "[7]  NIST, “Secure Hash Standard (SHS),” FIPS PUB 180-4, 2015.",
        "[8]  H. Krawczyk, M. Bellare, and R. Canetti, “HMAC: Keyed-Hashing for Message Authentication,” RFC 2104, 1997.",
        "[9]  N. Provos and D. Mazières, “A future-adaptable password scheme,” in <i>Proc. USENIX ATC</i>, 1999.",
        "[10] OWASP, “Authentication Cheat Sheet,” https://cheatsheetseries.owasp.org/.",
        "[11] M. Jones, J. Bradley, and N. Sakimura, “JSON Web Token (JWT),” RFC 7519, 2015.",
        "[12] J. C. Mogul et al., discussion of packet filtering practice; see also W. R. Cheswick, S. M. Bellovin, and A. D. Rubin, <i>Firewalls and Internet Security</i>, 2nd ed. Addison-Wesley, 2003.",
        "[13] D. E. Denning, “An intrusion-detection model,” <i>IEEE Trans. Softw. Eng.</i>, vol. SE-13, no. 2, pp. 222–232, 1987.",
        "[14] OWASP, “SQL Injection / XSS Prevention Cheat Sheets,” https://cheatsheetseries.owasp.org/.",
        "[15] Express.js, MongoDB, React, Node.js, Socket.io, and bcrypt documentation, 2024–2026.",
    ]
    for r in refs:
        story.append(P(r, "BulletBody"))

    story.append(Spacer(1, 5 * mm))
    story.append(h1("APPENDIX A &nbsp;&nbsp; PROJECT STRUCTURE AND SECURITY CONTROLS"))
    story.append(P(
        "The repository splits into <font face='Mono'>client/</font> (Vite React SPA) and "
        "<font face='Mono'>server/</font> (Express API). Controllers, routes, models and "
        "utility engines are one-to-one with the laboratory modules. The following tree is "
        "the map a maintainer needs; generated folders (<font face='Mono'>node_modules</font>, "
        "build artefacts) are omitted."))
    tree = """
securevault/
├── client/src/{pages,services,context,hooks,components}
├── server/controllers   (auth, encryption, hash, rsa, chat, firewall, ids, dashboard)
├── server/models        (User, EncryptedFile, HashHistory, ChatMessage,
│                         FirewallRule, IdsLog, LoginHistory)
├── server/middleware    (auth, rateLimiter, ids)
├── server/utils         (crypto, hash, rsa, firewall, ids, captcha, email)
└── server/socket        (JWT handshake, rooms, typing, IDS fan-out)
""".strip("\n")
    story.append(P(f"<font face='Mono'>{tree.replace(chr(10), '&lt;br/&gt;')}</font>".replace("&lt;br/&gt;", "<br/>"), "AppMono"))
    story.append(Spacer(1, 3 * mm))
    story.append(make_table(
        ["Layer", "Control"],
        [
            ["Password", "Complexity regex; bcrypt cost 12; last-5 history; 90-day expiry field"],
            ["Session", "JWT HS256, 7 d (30 d remember-me); protect / adminOnly middleware"],
            ["Proof of humanity", "Math and text CAPTCHA endpoints; 6-digit e-mail OTP, 10 min"],
            ["Abuse", "Lockout 5 / 15 min; auth 20/15 min; OTP 5/10 min; API 200/15 min"],
            ["Transport API", "CORS allow-list; JSON 10 MB cap; trust proxy"],
            ["Headers", "nosniff, DENY framing, XSS protection, strict referrer"],
            ["Files", "Key not stored; SHA-256 of key stored; original upload deleted"],
            ["Chat", "AES-256-CBC at rest; IV per message; JWT on the socket"],
            ["Network lab", "Default-deny firewall; HIGH IDS → 403 + admin socket"],
        ],
        [36 * mm, 134 * mm],
    ))
    story.append(caption("Table A.1  Defence-in-depth controls implemented in the running system."))
    story.append(P(
        "— End of report —",
        "CenterSmall"))
    return story


def main():
    global S
    print("Generating figures…")
    make_figures()
    S = styles()
    print("Building PDF…")
    doc = SimpleDocTemplate(
        OUT,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=16 * mm,
        title="SecureVault — CY5008 Information Security Project Report",
        author="Vaibhav Pawar",
        subject="Semester project report for CY5008 Information Security",
        creator="SecureVault report generator",
    )
    doc.build(build_story(), onFirstPage=draw_cover, onLaterPages=draw_later)
    from pypdf import PdfReader
    n = len(PdfReader(OUT).pages)
    size = os.path.getsize(OUT)
    print(f"Wrote {OUT}")
    print(f"Pages: {n}")
    print(f"Size:  {size} bytes")
    if n != 20:
        print(f"WARNING: page count is {n}, not 20.")
    else:
        print("Page count is 20.")


if __name__ == "__main__":
    main()
