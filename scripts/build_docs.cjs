const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');
const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  Header,
  Footer,
} = docx;

// Source markdown file paths
const possibleMdPaths = [
  path.resolve('C:/Users/Times Digital/.gemini/antigravity-ide/brain/af353434-ed35-4afb-9c67-f7ecd3d85f76/telecorp_erp_master_user_operation_guide.md'),
  path.resolve(__dirname, '../telecorp_erp_master_user_operation_guide.md'),
  path.resolve(__dirname, 'telecorp_erp_master_user_operation_guide.md')
];

let mdPath = possibleMdPaths.find(p => fs.existsSync(p));
if (!mdPath) {
  console.error('Could not find markdown source file!');
  process.exit(1);
}

console.log('Reading markdown from:', mdPath);
const markdownContent = fs.readFileSync(mdPath, 'utf8');

// Target file locations
const outputPdf = path.resolve('telecorp_erp_operation_guide.pdf');
const outputDocx = path.resolve('telecorp_erp_operation_guide.docx');
const publicDir = path.resolve('public');
const publicPdf = path.join(publicDir, 'telecorp_erp_operation_guide.pdf');
const publicDocx = path.join(publicDir, 'telecorp_erp_operation_guide.docx');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ==========================================
// PART 1: GENERATE EXECUTIVE PDF (via HTML + Edge)
// ==========================================
console.log('\n--- 1. Generating High-Fidelity PDF Document ---');

// Parse Markdown into HTML
let parsedHtml = marked.parse(markdownContent);

// Enhance GitHub-style Alert callouts
parsedHtml = parsedHtml.replace(/<blockquote>\s*<p>\[!IMPORTANT\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (match, p1) => {
  return `<div class="alert-box alert-important">
    <div class="alert-icon">⚠️</div>
    <div class="alert-content"><strong>জরুরি সতর্কতা (CRITICAL):</strong><br>${p1}</div>
  </div>`;
});

parsedHtml = parsedHtml.replace(/<blockquote>\s*<p>\[!NOTE\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (match, p1) => {
  return `<div class="alert-box alert-note">
    <div class="alert-icon">ℹ️</div>
    <div class="alert-content"><strong>বিশেষ নির্দেশনা (NOTE):</strong><br>${p1}</div>
  </div>`;
});

parsedHtml = parsedHtml.replace(/<blockquote>\s*<p>\[!TIP\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (match, p1) => {
  return `<div class="alert-box alert-tip">
    <div class="alert-icon">💡</div>
    <div class="alert-content"><strong>অপারেশনাল টিপস (PRO-TIP):</strong><br>${p1}</div>
  </div>`;
});

// Render complete executive HTML
const fullHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>TeleCorp Mobile Distribution & Trade ERP — User Operation Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
      @bottom-left {
        content: "TeleCorp Mobile Distribution & Trade ERP — User Operation Guide";
        font-family: 'Inter', sans-serif;
        font-size: 7.5pt;
        color: #64748b;
      }
      @bottom-right {
        content: "Page " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 7.5pt;
        color: #64748b;
        font-weight: 600;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Hind Siliguri', 'Kalpurush', 'Vrinda', 'SVRit', 'Siyam Rupali', 'Segoe UI', Tahoma, sans-serif;
      font-size: 9pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Executive Cover Header */
    .doc-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .doc-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #93c5fd;
      padding: 4px 12px;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      border-radius: 9999px;
      margin-bottom: 10px;
    }

    .doc-header h1 {
      margin: 0 0 6px 0;
      font-size: 22pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #ffffff;
      border: none;
      padding: 0;
    }

    .doc-header .doc-subtitle {
      font-size: 11pt;
      color: #cbd5e1;
      margin: 0 0 16px 0;
      font-weight: 500;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 14px;
    }

    .meta-item {
      font-size: 8pt;
      color: #e2e8f0;
    }

    .meta-item strong {
      color: #93c5fd;
    }

    /* Typography Hierarchy */
    h1, h2, h3, h4 {
      font-family: 'Hind Siliguri', 'Inter', 'Segoe UI', sans-serif;
      color: #0f172a;
      page-break-after: avoid;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 26px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }

    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    h4 {
      font-size: 9.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 6px;
    }

    p {
      margin: 0 0 8px 0;
      text-align: justify;
    }

    strong {
      color: #0f172a;
    }

    /* Lists */
    ul, ol {
      margin: 0 0 10px 0;
      padding-left: 20px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Code & Preformatted Blocks (ASCII Diagrams) */
    pre {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 3px solid #3b82f6;
      border-radius: 6px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 7.5pt;
      line-height: 1.4;
      color: #0f172a;
      overflow-x: auto;
      page-break-inside: avoid;
      margin: 10px 0;
    }

    code {
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 8pt;
      background: #f1f5f9;
      color: #b91c1c;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    /* Professional Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 7.8pt;
      page-break-inside: avoid;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }

    thead th {
      background: #1e3a8a;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
      padding: 7px 9px;
      border: 1px solid #1e3a8a;
      white-space: nowrap;
    }

    tbody td {
      padding: 6px 9px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }

    tbody tr:hover {
      background-color: #f1f5f9;
    }

    /* Alert Callout Boxes */
    .alert-box {
      display: flex;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 6px;
      margin: 12px 0;
      page-break-inside: avoid;
      font-size: 8.5pt;
    }

    .alert-important {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      border-top: 1px solid #fee2e2;
      border-right: 1px solid #fee2e2;
      border-bottom: 1px solid #fee2e2;
      color: #991b1b;
    }

    .alert-note {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-top: 1px solid #dbeafe;
      border-right: 1px solid #dbeafe;
      border-bottom: 1px solid #dbeafe;
      color: #1e40af;
    }

    .alert-tip {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      border-top: 1px solid #dcfce7;
      border-right: 1px solid #dcfce7;
      border-bottom: 1px solid #dcfce7;
      color: #166534;
    }

    .alert-icon {
      font-size: 14pt;
      line-height: 1;
    }

    .alert-content {
      flex: 1;
    }

    /* Horizontal Separator */
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 18px 0;
    }

    /* Print Optimizations */
    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none;
      }
      h2 {
        page-break-before: auto;
      }
      table, pre, .alert-box {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <div class="doc-header">
    <div class="doc-badge">ENTERPRISE PRODUCTION SOP & USER MANUAL</div>
    <h1>TeleCorp Mobile Distribution & Trade ERP</h1>
    <div class="doc-subtitle">Complete Step-by-Step User Operation & Business Management Guide</div>
    <div class="meta-grid">
      <div class="meta-item"><strong>সংস্করণ:</strong> 3.2 Enterprise Production Edition</div>
      <div class="meta-item"><strong>টার্গেট ইউজার:</strong> Mobile Dealer Business Managers, Operations Directors, Accountants</div>
      <div class="meta-item"><strong>সিস্টেম প্ল্যাটফর্ম:</strong> TeleCorp ERP (Dual IMEI, BTRC-Compliant, Multi-Branch Cloud)</div>
      <div class="meta-item"><strong>ডকুমেন্ট রিলিজ:</strong> অক্টোবর ২০২৬ | গোপনীয় ও সংরক্ষিত</div>
    </div>
  </div>

  <div class="content-body">
    ${parsedHtml}
  </div>

</body>
</html>`;

const tempHtmlPath = path.resolve('scripts/temp_guide.html');
fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

const edgeExecutable = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
console.log('Invoking Microsoft Edge to print PDF...');
try {
  execSync(`"${edgeExecutable}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outputPdf}" "${tempHtmlPath}"`, {
    stdio: 'inherit'
  });
  
  if (fs.existsSync(outputPdf)) {
    const pdfSize = fs.statSync(outputPdf).size;
    console.log(`✅ PDF Generated Successfully: ${outputPdf} (${(pdfSize / 1024).toFixed(1)} KB)`);
    // Copy to public folder
    fs.copyFileSync(outputPdf, publicPdf);
    console.log(`✅ Copied to Public: ${publicPdf}`);
  } else {
    throw new Error('PDF file was not created');
  }
} catch (pdfErr) {
  console.error('❌ Failed to generate PDF:', pdfErr);
} finally {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}

// ==========================================
// PART 2: GENERATE MICROSOFT WORD (.DOCX)
// ==========================================
console.log('\n--- 2. Generating Microsoft Word (.docx) Document ---');

function parseFormattedRuns(text) {
  // Regex to split text by **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  const parts = text.split(regex);
  const runs = [];

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: 'Segoe UI',
        size: 19
      }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        italics: true,
        font: 'Segoe UI',
        size: 19
      }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        font: 'Consolas',
        color: 'B91C1C',
        size: 18
      }));
    } else {
      runs.push(new TextRun({
        text: part,
        font: 'Segoe UI',
        size: 19
      }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, font: 'Segoe UI', size: 19 })];
}

// Parse markdown into tokens
const tokens = marked.lexer(markdownContent);
const docChildren = [];

// Document Title & Cover Banner
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: 'TeleCorp Mobile Distribution & Trade ERP',
        bold: true,
        size: 36,
        color: '1E3A8A',
        font: 'Segoe UI'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [
      new TextRun({
        text: 'Complete Step-by-Step User Operation & Business Management Guide',
        bold: true,
        size: 24,
        color: '334155',
        font: 'Segoe UI'
      })
    ]
  })
);

// Metadata Summary Table in Word
const metaTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'Version:', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: '3.2 Enterprise Production Edition', size: 18 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'Target Audience:', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'Mobile Dealer Business Managers, Operations Directors, Accountants & Sales Teams', size: 18 })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'Platform:', bold: true, size: 18 })] })]
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: 'TeleCorp ERP (Multi-Branch, Dual IMEI, Cloud-Sync, BTRC-Compliant)', size: 18 })] })]
        })
      ]
    })
  ]
});
docChildren.push(metaTable);
docChildren.push(new Paragraph({ spacing: { before: 200, after: 200 } }));

// Iterate through markdown tokens and translate to DOCX elements
for (const token of tokens) {
  if (token.type === 'heading') {
    let headingLevel = HeadingLevel.HEADING_2;
    let size = 24;
    let color = '1E3A8A';

    if (token.depth === 1) {
      headingLevel = HeadingLevel.HEADING_1;
      size = 28;
      color = '1E3A8A';
    } else if (token.depth === 2) {
      headingLevel = HeadingLevel.HEADING_2;
      size = 24;
      color = '1E3A8A';
    } else if (token.depth >= 3) {
      headingLevel = HeadingLevel.HEADING_3;
      size = 20;
      color = '0F172A';
    }

    docChildren.push(
      new Paragraph({
        heading: headingLevel,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: token.text,
            bold: true,
            size,
            color,
            font: 'Segoe UI'
          })
        ]
      })
    );
  } else if (token.type === 'paragraph') {
    // Check if it's an alert callout or normal text
    const text = token.text;
    const runs = parseFormattedRuns(text);
    docChildren.push(
      new Paragraph({
        spacing: { before: 60, after: 80 },
        children: runs
      })
    );
  } else if (token.type === 'list') {
    for (const item of token.items) {
      const runs = parseFormattedRuns(item.text);
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
          children: runs
        })
      );
    }
  } else if (token.type === 'code') {
    // Preformatted code / ASCII diagram block
    const lines = token.text.split('\n');
    const codeParagraphs = lines.map(line => new Paragraph({
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({
          text: line,
          font: 'Consolas',
          size: 16,
          color: '0F172A'
        })
      ]
    }));

    const codeTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 24, color: '3B82F6' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
              },
              children: codeParagraphs
            })
          ]
        })
      ]
    });
    docChildren.push(codeTable);
    docChildren.push(new Paragraph({ spacing: { before: 60, after: 60 } }));
  } else if (token.type === 'table') {
    // Build DOCX table
    const tableRows = [];

    // Header Row
    const headerCells = token.header.map(cell => {
      return new TableCell({
        shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: '1E3A8A' },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: '0F172A' },
          left: { style: BorderStyle.SINGLE, size: 1, color: '1E3A8A' },
          right: { style: BorderStyle.SINGLE, size: 1, color: '1E3A8A' }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: cell.text,
                bold: true,
                color: 'FFFFFF',
                size: 16,
                font: 'Segoe UI'
              })
            ]
          })
        ]
      });
    });
    tableRows.push(new TableRow({ children: headerCells }));

    // Data Rows
    token.rows.forEach((row, rowIndex) => {
      const isEven = rowIndex % 2 === 1;
      const dataCells = row.map(cell => {
        return new TableCell({
          shading: { fill: isEven ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
          },
          children: [
            new Paragraph({
              children: parseFormattedRuns(cell.text)
            })
          ]
        });
      });
      tableRows.push(new TableRow({ children: dataCells }));
    });

    const docxTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows
    });
    docChildren.push(docxTable);
    docChildren.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
  } else if (token.type === 'blockquote') {
    const runs = parseFormattedRuns(token.text.replace(/^\[!(IMPORTANT|NOTE|TIP)\]\s*/i, ''));
    const isImportant = token.text.includes('[!IMPORTANT]');
    const calloutTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: isImportant ? 'FEF2F2' : 'EFF6FF', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                left: { style: BorderStyle.SINGLE, size: 24, color: isImportant ? 'DC2626' : '2563EB' }
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: isImportant ? 'জরুরি নির্দেশনা (CRITICAL): ' : 'বিশেষ নোট (NOTE): ',
                      bold: true,
                      color: isImportant ? 'DC2626' : '1E40AF',
                      size: 18,
                      font: 'Segoe UI'
                    }),
                    ...runs
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
    docChildren.push(calloutTable);
    docChildren.push(new Paragraph({ spacing: { before: 60, after: 60 } }));
  } else if (token.type === 'hr') {
    docChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
        }
      })
    );
  }
}

// Instantiate Document
const doc = new Document({
  creator: 'TeleCorp Systems Engineering',
  title: 'TeleCorp Mobile Distribution & Trade ERP — User Operation Guide',
  description: 'Complete Step-by-Step User Operation & Business Management Guide',
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1000,
            bottom: 1000,
            left: 1000,
            right: 1000
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'TeleCorp Mobile Distribution & Trade ERP — Operational SOP Manual',
                  font: 'Segoe UI',
                  size: 16,
                  color: '64748B'
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'Page ',
                  font: 'Segoe UI',
                  size: 16,
                  color: '64748B'
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Segoe UI',
                  size: 16,
                  color: '64748B',
                  bold: true
                }),
                new TextRun({
                  text: ' of ',
                  font: 'Segoe UI',
                  size: 16,
                  color: '64748B'
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: 'Segoe UI',
                  size: 16,
                  color: '64748B'
                })
              ]
            })
          ]
        })
      },
      children: docChildren
    }
  ]
});

// Pack and save docx
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputDocx, buffer);
  const docxSize = fs.statSync(outputDocx).size;
  console.log(`✅ Word (.docx) Generated Successfully: ${outputDocx} (${(docxSize / 1024).toFixed(1)} KB)`);
  // Copy to public folder
  fs.copyFileSync(outputDocx, publicDocx);
  console.log(`✅ Copied to Public: ${publicDocx}`);
  console.log('\n🎉 ALL OPERATIONS COMPLETED SUCCESSFULLY!');
}).catch(err => {
  console.error('❌ Failed to generate DOCX:', err);
  process.exit(1);
});
