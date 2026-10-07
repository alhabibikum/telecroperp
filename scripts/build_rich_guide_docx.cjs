const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
  ImageRun
} = docx;

console.log('--- শুরু হচ্ছে: TeleCorp ERP সমৃদ্ধ বাংলা ইউজার ম্যানুয়াল ও স্ক্রিনশট গাইড জেনারেটর ---');

const FONT_NAME = 'Segoe UI';
const CODE_FONT = 'Consolas';
const SCREENSHOT_DIR = path.resolve('public/screenshots');

// টেক্সট রান হেল্পার
function createTextRun(text, options = {}) {
  return new TextRun({
    text: text,
    font: options.font || FONT_NAME,
    size: options.size || 20, // 10pt
    bold: options.bold || false,
    italics: options.italics || false,
    color: options.color || '1E293B'
  });
}

// হেডিং হেল্পার
function createHeading(title, level, color = '1E3A8A') {
  let hLevel = HeadingLevel.HEADING_2;
  let size = 26; // 13pt
  let spacingBefore = 280;
  let spacingAfter = 120;

  if (level === 1) {
    hLevel = HeadingLevel.HEADING_1;
    size = 32; // 16pt
    spacingBefore = 380;
    spacingAfter = 160;
  } else if (level === 2) {
    hLevel = HeadingLevel.HEADING_2;
    size = 26;
    spacingBefore = 280;
    spacingAfter = 120;
  } else if (level === 3) {
    hLevel = HeadingLevel.HEADING_3;
    size = 22; // 11pt
    spacingBefore = 200;
    spacingAfter = 80;
    color = '0F172A';
  }

  return new Paragraph({
    heading: hLevel,
    spacing: { before: spacingBefore, after: spacingAfter },
    children: [
      new TextRun({
        text: title,
        font: FONT_NAME,
        size: size,
        bold: true,
        color: color
      })
    ]
  });
}

// সাধারণ প্যারাগ্রাফ
function createPara(text, options = {}) {
  let runs = [];
  if (Array.isArray(text)) {
    runs = text;
  } else {
    runs = [createTextRun(text, options)];
  }

  return new Paragraph({
    spacing: { before: options.before || 60, after: options.after || 80 },
    alignment: options.align || AlignmentType.LEFT,
    children: runs
  });
}

// বুলেট আইটেম
function createBullet(runs, level = 0) {
  if (typeof runs === 'string') {
    runs = [createTextRun(runs)];
  }
  return new Paragraph({
    bullet: { level },
    spacing: { before: 30, after: 40 },
    children: runs
  });
}

// চেকলিস্ট আইটেম
function createCheckItem(text, isChecked = true) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text: isChecked ? '☑ ' : '☐ ',
        font: FONT_NAME,
        size: 22,
        bold: true,
        color: isChecked ? '16A34A' : '475569'
      }),
      createTextRun(text, { size: 20 })
    ]
  });
}

// অ্যালার্ট কলআউট বক্স
function createCallout(type, title, text) {
  let borderColor = '2563EB'; // info blue
  let bgColor = 'EFF6FF';
  let titleColor = '1E40AF';
  let icon = 'ℹ️ ';

  if (type === 'critical' || type === 'warning') {
    borderColor = 'DC2626'; // red
    bgColor = 'FEF2F2';
    titleColor = '991B1B';
    icon = '⚠️ ';
  } else if (type === 'tip' || type === 'success') {
    borderColor = '16A34A'; // green
    bgColor = 'F0FDF4';
    titleColor = '166534';
    icon = '💡 ';
  } else if (type === 'accounting') {
    borderColor = 'D97706'; // amber
    bgColor = 'FFFBEB';
    titleColor = '92400E';
    icon = '⚖️ ';
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 28, color: borderColor }
            },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 40 },
                children: [
                  new TextRun({
                    text: icon + title,
                    font: FONT_NAME,
                    size: 20,
                    bold: true,
                    color: titleColor
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 20, after: 60 },
                children: [
                  new TextRun({
                    text: text,
                    font: FONT_NAME,
                    size: 19,
                    color: '334155'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

// স্ক্রিনশট চিত্র সন্নিবেশ হেল্পার
function createScreenshotImage(imageFilename, captionTitle, description = '') {
  const fullPath = path.join(SCREENSHOT_DIR, imageFilename);
  if (!fs.existsSync(fullPath)) {
    console.warn(`সতর্কতা: স্ক্রিনশট ফাইল পাওয়া যায়নি: ${fullPath}`);
    return new Paragraph({
      children: [createTextRun(`[স্ক্রিনশট অনুপস্থিত: ${imageFilename}]`, { italics: true, color: 'DC2626' })]
    });
  }

  const imageBuffer = fs.readFileSync(fullPath);
  const elements = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: {
            width: 580,
            height: 335
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 60 },
      children: [
        new TextRun({
          text: `📸 স্ক্রিনশট: ${captionTitle}`,
          font: FONT_NAME,
          size: 18,
          bold: true,
          color: '1E3A8A'
        })
      ]
    })
  ];

  if (description) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: description,
            font: FONT_NAME,
            size: 16,
            italics: true,
            color: '64748B'
          })
        ]
      })
    );
  }

  return elements;
}

// ডেটা টেবিল হেল্পার
function createDataTable(headers, rows, colWidths = []) {
  const headerCells = headers.map((h, i) => {
    const widthConfig = colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined;
    return new TableCell({
      width: widthConfig,
      shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '1E3A8A' },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: '0F172A' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '1E3A8A' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '1E3A8A' }
      },
      children: [
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: h,
              font: FONT_NAME,
              size: 17,
              bold: true,
              color: 'FFFFFF'
            })
          ]
        })
      ]
    });
  });

  const tableRows = [new TableRow({ children: headerCells })];

  rows.forEach((row, rowIndex) => {
    const isEven = rowIndex % 2 === 1;
    const dataCells = row.map((cellText, i) => {
      const widthConfig = colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined;
      return new TableCell({
        width: widthConfig,
        shading: { fill: isEven ? 'F8FAFC' : 'FFFFFF', type: ShadingType.CLEAR },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
        },
        children: [
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [
              new TextRun({
                text: cellText,
                font: FONT_NAME,
                size: 17,
                color: '1E293B'
              })
            ]
          })
        ]
      });
    });
    tableRows.push(new TableRow({ children: dataCells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });
}

// টেক্সট-বেসড ডায়াগ্রাম কার্ড হেল্পার
function createDiagramCard(title, asciiContent, caption = '') {
  const lines = asciiContent.trim().split('\n');
  const codeParas = lines.map(line => new Paragraph({
    spacing: { before: 10, after: 10 },
    children: [
      new TextRun({
        text: line,
        font: CODE_FONT,
        size: 16,
        color: '0F172A'
      })
    ]
  }));

  const children = [
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: '📊 ' + title,
          font: FONT_NAME,
          size: 18,
          bold: true,
          color: '1E3A8A'
        })
      ]
    }),
    ...codeParas
  ];

  if (caption) {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: 'চিত্র বিবরণ: ' + caption,
            font: FONT_NAME,
            size: 16,
            italics: true,
            color: '64748B'
          })
        ]
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 24, color: '2563EB' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
            },
            children: children
          })
        ]
      })
    ]
  });
}

const docChildren = [];

// ==========================================
// কভার পেজ ও এক্সিকিউটিভ হেডার
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 120 },
    children: [
      new TextRun({
        text: 'টেলিকর্প মোবাইল ডিস্ট্রিবিউশন ইআরপি (TeleCorp ERP)',
        font: FONT_NAME,
        size: 38,
        bold: true,
        color: '1E3A8A'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({
        text: 'প্রফেশনাল মোবাইল ডিলার বিজনেস ম্যানেজার – কমপ্লিট স্টেপ-বাই-স্টেপ ইউজার অপারেশন গাইড',
        font: FONT_NAME,
        size: 26,
        bold: true,
        color: '0F172A'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240 },
    children: [
      new TextRun({
        text: 'বাস্তব স্ক্রিনশট, স্ট্যাটাস ইন্ডিকেটর, গ্রাফ/চার্ট, কলআউট নোটস ও চেকলিস্ট সহ সম্পূর্ণ ব্যবহারিক নির্দেশিকা',
        font: FONT_NAME,
        size: 20,
        italics: true,
        color: '64748B'
      })
    ]
  })
);

// মেটাডাটা টেবিল
docChildren.push(
  createDataTable(
    ['সিস্টেম ও ডকুমেন্ট প্রোপার্টিজ', 'বিবরণ ও কার্যপরিধি'],
    [
      ['সফটওয়্যার প্ল্যাটফর্ম', 'TeleCorp ERP (Multi-Branch, Dual IMEI, Cloud-Sync, BTRC-Compliant)'],
      ['ডকুমেন্ট সংস্করণ', 'Version 3.2 Enterprise Production Edition'],
      ['টার্গেট অডিয়েন্স', 'Mobile Dealer Business Managers, Operations Directors, Accountants & Sales Staff'],
      ['কোর মডিউল কভারেজ', '৩৫টি পূর্ণাঙ্গ মডিউল, ৯-স্তরের রোল অ্যাক্সেস কন্ট্রোল (RBAC), দ্বিমুখী ক্লাউড সিঙ্ক'],
      ['ভিজ্যুয়াল এলিমেন্টস', '১০টি বাস্তব হাই-রেজোলিউশন স্ক্রিনশট, কালার কোডেড স্ট্যাটাস ইন্ডিকেটর, চেকলিস্ট ও অ্যালার্ট']
    ],
    [32, 68]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 180, after: 180 } }));

docChildren.push(
  createCallout(
    'tip',
    'সফটওয়্যার হেল্প সেন্টারে সরাসরি অ্যাক্সেস (In-App Shortcut)',
    'টেলিকর্প ইআরপির যেকোনো স্ক্রিনে কাজ করার সময় কীবোর্ড থেকে Ctrl + / চাপলে সরাসরি ম্যানেজার অপারেশন এসওপি (Manager SOP) এবং নতুন কর্মী ট্রেনিং মোড (১৩-ধাপের ইন্টারেক্টিভ চেকলিস্ট) ভেসে উঠবে। এছাড়া স্ক্রিনের ওপরের হেডারের "?" আইকনে ক্লিক করেও এই নির্দেশিকা পাওয়া যায়।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সূচিপত্র ও দ্রুত রেফারেন্স
// ==========================================
docChildren.push(createHeading('সূচিপত্র ও অধ্যায় তালিকা', 2));
docChildren.push(
  createBullet('A. কমপ্লিট স্টার্ট-টু-ফিনিশ বিজনেস ওয়ার্কফ্লো (শুরু থেকে শেষ পর্যন্ত ১৫টি ধাপ)'),
  createBullet('B. নতুন ব্যবহারকারী ও প্রথমবার সেটআপ চেকলিস্ট (১৩টি প্রায়োরিটি আইটেম)'),
  createBullet('C. দৈনিক অপারেশন রুটিন (সকাল, দুপুর ও রাতের শিফট)'),
  createBullet('D. পারচেজ ও আইএমইআই ইনওয়ার্ড গাইড (হ্যান্ডসেট ও অ্যাকসেসরিজ ইনওয়ার্ড)'),
  createBullet('E. প্রফেশনাল সেলস ও পিওএস গাইড (পাইকারি ইনভয়েস ও রিটেইল কাউন্টার)'),
  createBullet('F. কাস্টমার ক্রেডিট, বকেয়া ও মানি রসিদ হাব (ডিউ এজিং ও রসিদ ভাউচার)'),
  createBullet('G. ব্রাঞ্চ ও ওয়্যারহাউজ ট্রান্সফার গাইড (৩-ধাপের ইন-ট্রানজিট প্রোটোকল)'),
  createBullet('H. কিস্তি ও ইএমআই হায়ার-পারচেজ ফাইন্যান্সিং (অ্যামরটাইজেশন ও সিকিউরিটি চেক)'),
  createBullet('I. রিটার্নস ও সার্ভিস ওয়ারেন্টি প্রসিডিউর (কাস্টমার ও ভেন্ডর আরএমএ)'),
  createBullet('J. ক্যাশ ও মাল্টি-ব্যাংক ফাইন্যান্সিয়াল ম্যানেজমেন্ট এবং দৈনিক ডে ক্লোজিং'),
  createBullet('K. ইনভেন্টরি কন্ট্রোল, আইএমইআই অডিট ও ভ্যালুয়েশন (FIFO Method)'),
  createBullet('L. বিজনেস রিপোর্ট ও ম্যানেজমেন্ট অ্যানালাইসিস (লাভ-ক্ষতি ও ব্র্যান্ড ইনসেন্টিভ)'),
  createBullet('M. ৯-স্তরের রোল-ভিত্তিক অ্যাক্সেস ম্যাট্রিক্স (RBAC Permissions)'),
  createBullet('N. সফটওয়্যার রুলস, টার্মস ও রেগুলেশনস'),
  createBullet('O. ভুল প্রতিরোধ ও লাইভ ট্রাবলশুটিং ম্যাট্রিক্স'),
  createBullet('P. প্রফেশনাল ম্যানেজারের দৈনিক চেকলিস্ট'),
  createBullet('Q. সফটওয়্যার-বিল্টইন ইন্টারেক্টিভ হেল্প ও ট্রেনিং মোড')
);

docChildren.push(new Paragraph({ spacing: { before: 200, after: 200 } }));

// ==========================================
// সেকশন A: কমপ্লিট স্টার্ট-টু-ফিনিশ বিজনেস ওয়ার্কফ্লো
// ==========================================
docChildren.push(createHeading('A. কমপ্লিট স্টার্ট-টু-ফিনিশ বিজনেস ওয়ার্কফ্লো', 1));
docChildren.push(
  createPara(
    'টেলিকর্প ইআরপিতে একটি মোবাইল ডিস্ট্রিবিউশন বা শোরুম ব্যবসার সম্পূর্ণ সাইকেল শুরু থেকে শেষ পর্যন্ত একটি সুসংগঠিত চেইনে পরিচালিত হয়:'
  )
);

docChildren.push(
  createDiagramCard(
    'সম্পূর্ণ এন্ড-টু-এন্ড ব্যবসায়িক সাইকেল ফ্লোচার্ট',
    `১. সিস্টেম সেটআপ ──> ২. ব্রাঞ্চ/ওয়্যারহাউজ ──> ৩. ইউজার ও রোল ──> ৪. ব্র্যান্ড ও সাপ্লায়ার ──> ৫. প্রোডাক্ট ও ভেরিয়েন্ট
                                                                                                  │
                                                                                                  ▼
১০. ডেলিভারি চালান <── ৯. পিওএস/পাইকারি সেলস <── ৮. ইন্টার-ব্রাঞ্চ ট্রান্সফার <── ৭. বারকোড প্রিন্ট <── ৬. পারচেজ ও IMEI স্ক্যান
        │
        ▼
১১. বকেয়া কালেকশন (মানি রসিদ) ──> ১২. কাস্টমার রিটার্ন ──> ১৩. অফিস খরচ ভাউচার ──> ১৪. দৈনিক ডে ক্লোজিং (ভল্ট লক) ──> ১৫. রিপোর্টস`,
    'কোম্পানি প্রোফাইল সেটআপ থেকে শুরু করে পারচেজ, সেলস, বকেয়া আদায় এবং ডে ক্লোজিং পর্যন্ত ১৫টি ধাপ।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

// ড্যাশবোর্ড স্ক্রিনশট ও বিবরণ
docChildren.push(...createScreenshotImage('01_dashboard.png', 'অপারেশনাল ড্যাশবোর্ড ও ককপিট ভিউ (DashboardView)', 'ড্যাশবোর্ডের ৪টি মূল KPI কার্ড: গ্রস সেলস, ক্যাশ কালেকশন, ড্রয়ার ক্যাশ এবং মোট ডিলার বকেয়া।'));

docChildren.push(createHeading('ড্যাশবোর্ডের প্রধান ৪টি স্ট্যাটাস ইন্ডিকেটর:', 3));
docChildren.push(
  createBullet([
    createTextRun('১. মোট বিক্রয় (Gross Sales): ', { bold: true }),
    createTextRun('আজকের দিনে শোরুম ও হোলসেল কাউন্টারে সর্বমোট সম্পাদিত বিক্রির টাকার অংক (ক্যাশ + বাকি)।')
  ]),
  createBullet([
    createTextRun('২. আজকের কালেকশন (Cash Realized): ', { bold: true }),
    createTextRun('আজকের দিনে নগদ, ব্যাংক ও বিকাশের মাধ্যমে সরাসরি ক্যাশ ড্রয়ারে ও ব্যাংক অ্যাকাউন্টে জমা হওয়া মোট টাকা।')
  ]),
  createBullet([
    createTextRun('৩. ক্যাশ ড্রয়ার ব্যালেন্স (Cash in Drawer): ', { bold: true }),
    createTextRun('বর্তমান মুহূর্তে ক্যাশিয়ারের ক্যাশ বাক্সে ফিজিক্যালি কত টাকা থাকার কথা (সিস্টেম ক্যালকুলেটেড)।')
  ]),
  createBullet([
    createTextRun('৪. ডিলার মোট বকেয়া (Total Receivables): ', { bold: true }),
    createTextRun('মার্কেটে ডিলার ও রিটেইলারদের কাছে বকেয়া পড়ে থাকা মোট পাওনা টাকা। লাল ব্যাজে ওভারডিউ ডিলারের সংখ্যা প্রদর্শিত হয়।')
  ])
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন B: নতুন ব্যবহারকারী ও প্রথমবার সেটআপ চেকলিস্ট
// ==========================================
docChildren.push(createHeading('B. নতুন ব্যবহারকারী ও প্রথমবার সেটআপ চেকলিস্ট', 1));
docChildren.push(
  createPara(
    'বাণিজ্যিক লেনদেন শুরুর পূর্বে সিস্টেমের ১৩টি ফান্ডামেন্টাল কনফিগারেশন ক্রমানুসারে সম্পন্ন করতে হবে:'
  )
);

docChildren.push(
  createDataTable(
    ['ক্রম', 'সেটআপ আইটেম', 'সংশ্লিষ্ট মডিউল', 'যা যা নিশ্চিত করতে হবে'],
    [
      ['১', 'কোম্পানি প্রোফাইল', 'সেটিংস ও ব্যাকআপ হাব', 'আইনি নাম, মোবাইল, ইমেইল, BIN/VAT ও FIFO ভ্যালুয়েশন'],
      ['২', 'চার্ট অব অ্যাকাউন্টস (COA)', 'জেনারেল লেজার ও COA', 'Assets (1000s), Liabilities (2000s), Income, Expenses'],
      ['৩', 'ব্যাংক অ্যাকাউন্টস', 'ক্যাশ বুক ও ব্যাংক ব্যালেন্স', 'DBBL, BRAC, City Bank ও bKash মার্চেন্ট অ্যাকাউন্ট নম্বর ও ওপেনিং'],
      ['৪', 'মাল্টি-ওয়্যারহাউজ', 'মাল্টি-ওয়্যারহাউজ ও শোরুম', 'সেন্ট্রাল ওয়্যারহাউজ (wh-1) ও শোরুম ব্রাঞ্চ রেজিস্ট্রেশন'],
      ['৫', 'ইউজার অ্যাকাউন্টস', 'সেটিংস ও ব্যাকআপ হাব', 'Owner, GM, Accounts, Sales, Warehouse ইউজার ও পাসওয়ার্ড'],
      ['৬', 'ব্র্যান্ড ও ক্যাটাগরি', 'ব্র্যান্ড ও অথরাইজেশন', 'Samsung, Xiaomi, Vivo, Realme, Apple'],
      ['৭', 'খরচ ক্যাটাগরি', 'অফিস ও অপারেশন খরচ', 'শোরুম ভাড়া, কুরিয়ার খরচ, টিএ/ডিএ, বিদ্যুৎ বিল'],
      ['৮', 'সাপ্লায়ার প্রোফাইল', 'সাপ্লায়ার লেজার ও পেয়াবল', 'অফিশিয়াল আমদানিকারক ও তাদের ওপেনিং বাকি'],
      ['৯', 'ডিলার / কাস্টমার', 'ডিলার ও রিটেইলার লেজার', 'ডিলার শপের নাম, ফোন, সিকিউরিটি চেক সাপেক্ষে ক্রেডিট লিমিট'],
      ['১০', 'সেলস অফিসার (Salesmen)', 'সেলসম্যান ও সেলস কমিশন', 'মাসিক সেলস টার্গেট, কমিশন পার্সেন্টেজ ও রুট'],
      ['১১', 'প্রোডাক্ট ও ভেরিয়েন্ট', 'স্টক ব্যালেন্স ও ভ্যালুয়েশন', 'হ্যান্ডসেটের মডেল, কালার ও স্টোরেজ ভেরিয়েন্ট'],
      ['১২', 'ওপেনিং স্টক ইনওয়ার্ড', 'সাপ্লায়ার পারচেজ বিল', 'ওপেনিং চালান #OP-STOCK দিয়ে সমস্ত হ্যান্ডসেটের আইএমইআই স্ক্যান'],
      ['১৩', 'ওপেনিং ক্যাশ ভল্ট', 'দৈনিক ডে ক্লোজিং', 'ডে-১ ক্যাশ ড্রয়ার ব্যালেন্স নিশ্চিতকরণ']
    ],
    [8, 26, 28, 38]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// সেটিংস ও আরবিক স্ক্রিনশট
docChildren.push(...createScreenshotImage('10_settings.png', 'সিস্টেম সেটিংস ও ইউজার পারমিশন কন্ট্রোল (SettingsView)', 'কোম্পানি প্রোফাইল, ভ্যাট রেট (৫%), হার্ড ক্রেডিট লক পলিসি এবং অটো ক্লাউড সিঙ্ক কনফিগারেশন।'));

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন C: দৈনিক অপারেশন রুটিন
// ==========================================
docChildren.push(createHeading('C. দৈনিক অপারেশন রুটিন (Daily Operational Routine)', 1));
docChildren.push(
  createPara(
    'ব্রাঞ্চের দৈনন্দিন কার্যক্রমে শৃঙ্খলা বজায় রাখতে কর্মীরা তিনটি সুনির্দিষ্ট শিফট পালন করবেন:'
  )
);

docChildren.push(createHeading('১. সকালের রুটিন (০৮:৩০ - ১০:০০):', 3));
docChildren.push(
  createBullet('ড্যাশবোর্ড ওপেন করে রাজস্ব, স্টক সতর্কতা ও ওভারডিউ ডিলার তালিকা চেক করুন।'),
  createBullet('গতকালকের ক্লোজিং ক্যাশ এবং সকালের ড্রয়ারের নগদ টাকা মিলিয়ে ওপেনিং ব্যালেন্স নিশ্চিত করুন।'),
  createBullet('ইন্টার-ওয়্যারহাউজ ট্রান্সফার চেক করে রাতে আসা চালান রিসিভ ও আইএমইআই স্ক্যান করে ভেরিফাই করুন।')
);

docChildren.push(createHeading('২. দিনের বেলায় বাণিজ্যিক লেনদেন (১০:০০ - ১৯:০০):', 3));
docChildren.push(
  createBullet('নতুন স্টক এলেই সঙ্গে সঙ্গে "+ Purchase" এ আইএমইআই স্ক্যান করে স্টকে তুলুন (স্ক্যান ছাড়া বক্সে ডিসপ্লেতে রাখা সম্পূর্ণ নিষিদ্ধ)।'),
  createBullet('হোলসেল ও রিটেইল সেলসে প্রতিবার আইএমইআই বারকোড স্ক্যান করুন (Ctrl + B)।'),
  createBullet('ডিলারের বকেয়া আদায়ের সাথে সাথে DueCollectionView এ মানি রসিদ এন্ট্রি দিন।'),
  createBullet('ছোটখাটো খরচ হলে তাৎক্ষণিক ভাউচার এন্ট্রি দিয়ে ক্যাশিয়ারকে রসিদ জমা দিন।')
);

docChildren.push(createHeading('৩. রাতে দোকান বন্ধের সময় (১৯:০০ - ২১:০০):', 3));
docChildren.push(
  createBullet('ক্যাশ ড্রয়ারের ১০০%, ৫০০%, ১০০০ টাকার নোট গুনে DayClosingView এ নোটের সংখ্যা বসান।'),
  createBullet('সিস্টেম ক্যাশ ও বাস্তব ক্যাশের পার্থক্য (Discrepancy) শূন্য হলে "ডে ক্লোজিং সম্পন্ন ও লক করুন"।'),
  createBullet('হেডার আইকন দেখে নিশ্চিত করুন "Pending Sync: 0" (সকল ডাটা সুপাবেজ ক্লাউডে ব্যাকআপ হয়েছে)।')
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন D: পারচেজ ও আইএমইআই ইনওয়ার্ড গাইড
// ==========================================
docChildren.push(createHeading('D. পারচেজ ও আইএমইআই ইনওয়ার্ড গাইড (PurchaseView)', 1));
docChildren.push(
  createPara(
    'সাপ্লায়ার চালান রিসিভ করার সময় আইএমইআই স্ক্যানিং ও ল্যান্ডেড কস্ট গণনার স্ক্রিনশট ও নিয়মাবলি:'
  )
);

// পারচেজ স্ক্রিনশট
docChildren.push(...createScreenshotImage('02_purchase.png', 'সাপ্লায়ার পারচেজ বিল ও ইনওয়ার্ড রেজিস্টার (PurchaseView)', 'চালান নম্বর, সাপ্লায়ার নাম, ওয়্যারহাউজ নির্বাচন এবং মাল্টি-আইএমইআই স্ক্যানিং কন্ট্রোল।'));

docChildren.push(
  createCallout(
    'critical',
    'আইএমইআই ইনওয়ার্ডের অপরিবর্তনীয় নিয়ম (Strict IMEI Rules)',
    '১. কোয়ান্টিটি ও স্ক্যানকৃত আইএমইআই সংখ্যা ১০০% সমান হতে হবে (Quantity == Scanned IMEIs Count)।\n২. পূর্বে কেনা বা অন্য ব্রাঞ্চে থাকা কোনো আইএমইআই সিস্টেমে ঢুকানো অসম্ভব (Duplicate IMEI Blocked)।\n৩. প্রতিটি হ্যান্ডসেটের জন্য ১৫ ডিজিটের ভ্যালিড জিএসএমএ আইএমইআই বাধ্যতামূলক।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন E: প্রফেশনাল সেলস ও পিওএস গাইড
// ==========================================
docChildren.push(createHeading('E. প্রফেশনাল সেলস ও পিওএস গাইড (Wholesale & Retail POS)', 1));
docChildren.push(
  createPara(
    'টেলিকর্প ইআরপিতে পাইকারি ডিলার সেলস এবং দ্রুততম রিটেইল কাউন্টার বিলিংয়ের দুটি স্বতন্ত্র ইন্টারফেস রয়েছে:'
  )
);

// পাইকারি সেলস স্ক্রিনশট
docChildren.push(...createScreenshotImage('03_wholesale_sales.png', 'পাইকারি সেলস ও ডিলার ইনভয়েসিং (WholesaleSalesView)', 'ডিলার সিলেক্ট, ক্রেডিট লিমিট চেক, আইএমইআই স্ক্যান এবং বাকিতে ইনভয়েস ইস্যু উইন্ডো।'));

docChildren.push(new Paragraph({ spacing: { before: 120, after: 120 } }));

// রিটেইল পিওএস স্ক্রিনশট
docChildren.push(...createScreenshotImage('04_retail_pos.png', 'রিটেইল এক্সপ্রেস পিওএস কাউন্টার (RetailPOSView)', 'ওয়াক-ইন কাস্টমার, বারকোড স্ক্যানার শর্টকাট (F2 / Ctrl+B), ক্যাশ ও বিকাশ স্প্লিট পেমেন্ট এবং ৩-ইঞ্চি থার্মাল রসিদ।'));

docChildren.push(
  createCallout(
    'tip',
    'দ্রুত সেলস স্ক্যানিং প্রোটোকল',
    'কাউন্টারে কিবোর্ড থেকে Ctrl + B চাপলে "মাল্টি-বারকোড স্ক্যানার ইঞ্জিন" চালু হবে। একাধারে ১০-২০টি ফোনের বক্স স্ক্যান করে সরাসরি ইনভয়েসের কার্টে যোগ করা যায়।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন F: কাস্টমার ক্রেডিট, বকেয়া ও মানি রসিদ হাব
// ==========================================
docChildren.push(createHeading('F. কাস্টমার ক্রেডিট, বকেয়া ও মানি রসিদ হাব (DueCollectionView)', 1));
docChildren.push(
  createPara(
    'ডিলারদের বকেয়া আদায়, নগদ/চেক রসিদ ইস্যু এবং ক্যাশ ডিসকাউন্ট ওয়েভারের নিয়মাবলি:'
  )
);

// ডিউ কালেকশন স্ক্রিনশট
docChildren.push(...createScreenshotImage('05_due_collection.png', 'বকেয়া কালেকশন ও মানি রসিদ হাব (DueCollectionView)', 'ডিলারের মোট বাকি, বিল-বাই-বিল এফআইএফও বকেয়া নিষ্পত্তি এবং মানি রসিদ (MR-2026-xxxx) জেনারেশন।'));

docChildren.push(createHeading('ডিলার বকেয়া বয়স (Due Ageing) ও রিস্ক স্ল্যাব ম্যাট্রিক্স:', 3));
docChildren.push(
  createDataTable(
    ['বকেয়া স্ল্যাব (Ageing Bracket)', 'রিস্ক লেভেল', 'সিস্টেমের আচরণ ও অ্যাকশন', 'ম্যানেজার করণীয়'],
    [
      ['০ – ১৫ দিন (Current Due)', '🟢 স্বাভাবিক (Low Risk)', 'নিয়মিত ক্রেডিট সাইকেল। ডিলার নতুন পণ্য বাকিতে নিতে পারবেন।', 'স্বাভাবিক ডেলিভারি চলমান রাখা'],
      ['১৬ – ৩০ দিন (Due Warning)', '🟡 সতর্কতা (Medium Risk)', 'ডিলারের ড্যাশবোর্ডে হলুদ ওয়ার্নিং ব্যাজ। নতুন বিক্রিতে ৫০% ক্যাশ শর্ত।', 'সেলসম্যানকে কালেকশন তাগাদা পাঠানো'],
      ['৩১ – ৬০ দিন (Critical Due)', '🟠 ঝুঁকিপূর্ণ (High Risk)', 'নতুন ইনভয়েস লক। মানি রসিদ ছাড়া কোনো অর্ডার প্রসেস হবে না।', 'দোকানে ফিল্ড ভিজিট ও চেক উপস্থাপন'],
      ['৬০+ দিন (Bad Debt Recovery)', '🔴 চরম সংকট (Critical Block)', 'আইনি নোটিশ প্রসেসিং। ডিলারকে পার্মানেন্ট ব্ল্যাকলিস্টে অন্তর্ভুক্তি।', 'মালিক ও জিএম পর্যায়ের আইনি ব্যবস্থা']
    ],
    [24, 20, 36, 20]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন G: ব্রাঞ্চ ও ওয়্যারহাউজ ট্রান্সফার গাইড
// ==========================================
docChildren.push(createHeading('G. ব্রাঞ্চ ও ওয়্যারহাউজ ট্রান্সফার গাইড (StockTransfersView)', 1));
docChildren.push(
  createPara(
    'সেন্ট্রাল গুদাম থেকে শাখা আউটলেটে হ্যান্ডসেট স্থানান্তরের ৩-ধাপের ইন-ট্রানজিট প্রোটোকল:'
  )
);

// স্টক ট্রান্সফার স্ক্রিনশট
docChildren.push(...createScreenshotImage('07_stock_transfers.png', 'ইন্টার-ওয়্যারহাউজ ও ব্রাঞ্চ স্টক ট্রান্সফার (StockTransfersView)', 'সোর্স ওয়্যারহাউজ, ডেস্টিনেশন শোরুম, আইএমইআই স্ক্যান ও ইন-ট্রানজিট ভেরিফিকেশন।'));

docChildren.push(
  createDiagramCard(
    '৩-ধাপের স্টক ট্রান্সফার ও ভেরিফিকেশন ফ্লোচার্ট',
    `[ধাপ ১: সেন্ট্রাল ওয়্যারহাউজ] ──> ট্রান্সফার ইস্যু ও প্রতিটি আইএমইআই স্ক্যান
                                     │
                                     ▼
[ধাপ ২: ইন-ট্রানজিট অবস্থা] ──> স্ট্যাটাস: 🟡 In Transit (রাস্তায় চলমান)
                                 * কোনো ব্রাঞ্চই এই ফোন বিক্রি করতে পারবে না।
                                     │
                                     ▼
[ধাপ ৩: ডেস্টিনেশন শোরুম] ──> কার্টন খুলে ফিজিক্যালি প্রতিটি আইএমইআই স্ক্যান
                                     │
                   ┌─────────────────┴─────────────────┐
                   ▼                                   ▼
         [সকল আইএমইআই মিলেছে]                [কোনো আইএমইআই নেই/হারিয়েছে]
                   │                                   │
                   ▼                                   ▼
          🟢 "রিসিভ নিশ্চিত করুন"             🔴 "ডিসক্রিপেন্সি এরর রিপোর্ট"
          (স্টক ডেস্টিনেশনে যুক্ত)             (জিএম তদন্ত ও কুরিয়ার ক্লেইম)`,
    'গন্তব্যে স্ক্যান করে গ্রহণ নিশ্চিত না করা পর্যন্ত ফোন বিক্রয়যোগ্য স্টকে আসবে না।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন H: কিস্তি ও ইএমআই হায়ার-পারচেজ ফাইন্যান্সিং
// ==========================================
docChildren.push(createHeading('H. কিস্তি ও ইএমআই হায়ার-পারচেজ ফাইন্যান্সিং (EMIInstallmentView)', 1));
docChildren.push(
  createPara(
    'স্মার্টফোন ফাইন্যান্সিং, ডাউন পেমেন্ট ক্যালকুলেটর ও মাসিক কিস্তির কিউআর কোড রসিদ:'
  )
);

// কিস্তি স্ক্রিনশট
docChildren.push(...createScreenshotImage('06_emi_installment.png', 'কিস্তি ও ইএমআই হায়ার-পারচেজ চুক্তি ও শিডিউল (EMIInstallmentView)', 'ডাউন পেমেন্ট, মাসিক কিস্তি ক্যালকুলেটর, জামিনদার ভেরিফিকেশন ও অ্যামরটাইজেশন টেবিল।'));

docChildren.push(
  createDiagramCard(
    'উদাহরণ: ১,২০,০০০ টাকার হ্যান্ডসেটের ৬ মাসের কিস্তি অ্যামরটাইজেশন শিডিউল',
    `┌────────────────────────────────────────────────────────────────────────┐
│ মোট পণ্যের মূল্য: ৳ ১,২০,০০০ | ডাউন পেমেন্ট (৩০%): ৳ ৩৬,০০০ (নগদ গৃহীত)  │
│ অবশিষ্ট অর্থায়নযোগ্য প্রিন্সিপাল: ৳ ৮৪,০০০ | মেয়াদ: ৬ মাস | সার্ভিস চার্জ: ০%│
├──────┬──────────────┬──────────────┬──────────────┬────────────────────┤
│ কিস্তি নং│ পরিশোধের তারিখ │ মাসিক কিস্তি │ বকেয়া প্রিন্সিপাল│ স্ট্যাটাস ও কালেকশন│
├──────┼──────────────┼──────────────┼──────────────┼────────────────────┤
│ ১    │ ১০ নভেম্বর ২৬│ ৳ ১৪,০০০     │ ৳ ৭০,০০০     │ 🟢 আদায়ের অপেক্ষায় │
│ ২    │ ১০ ডিসেম্বর ২৬│ ৳ ১৪,০০০     │ ৳ ৫৬,০০০     │ 🟢 আদায়ের অপেক্ষায় │
│ ৩    │ ১০ জানুয়ারি ২৭│ ৳ ১৪,০০০     │ ৳ ৪২,০০০     │ 🟢 আদায়ের অপেক্ষায় │
│ ৪    │ ১০ ফেব্রুয়ারি ২৭│ ৳ ১৪,০০০   │ ৳ ২৮,০০০     │ 🟢 আদায়ের অপেক্ষায় │
│ ৫    │ ১০ মার্চ ২৭   │ ৳ ১৪,০০০     │ ৳ ১৪,০০০     │ 🟢 আদায়ের অপেক্ষায় │
│ ৬    │ ১০ এপ্রিল ২৭  │ ৳ ১৪,০০০     │ ৳ ০          │ 🟢 আদায়ের অপেক্ষায় │
└──────┴──────────────┴──────────────┴──────────────┴────────────────────┘`,
    'বিক্রির সাথে সাথে এই শিডিউলটি গ্রাহক চুক্তি ও সিকিউরিটি চেক রিসিপ্ট সহ প্রিন্ট হয়।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন J: ক্যাশ ও ব্যাংক এবং দৈনিক ডে ক্লোজিং
// ==========================================
docChildren.push(createHeading('J. ক্যাশ ও ব্যাংক এবং দৈনিক ডে ক্লোজিং (DayClosingView)', 1));
docChildren.push(
  createPara(
    'দিন শেষে ড্রয়ারের নগদ টাকা গুনে সিস্টেম ব্যালেন্সের সাথে শূন্য ব্যবধান নিশ্চিত করার পদ্ধতি:'
  )
);

// ডে ক্লোজিং স্ক্রিনশট
docChildren.push(...createScreenshotImage('08_day_closing.png', 'দৈনিক ক্যাশ ভল্ট রিকনসিলিয়েশন ও ডে ক্লোজিং (DayClosingView)', 'নোট ডিনোমিনেশন কাউন্ট (১০০০xN, ৫০০xN), ব্যবধান যাচাই এবং ভল্ট ডে লক সম্পন্নকরণ।'));

docChildren.push(createHeading('নোটের ডিনোমিনেশন গণনা ফরম্যাট (Denomination Count):', 3));
docChildren.push(
  createDataTable(
    ['মুদ্রা বা নোটের মান', 'নোটের সংখ্যা (Pieces)', 'মোট টাকার অংক (Subtotal)'],
    [
      ['৳ ১০০০ টাকার নোট', '১৮০ টি', '৳ ১,৮০,০০০'],
      ['৳ ৫০০ টাকার নোট', '৫০ টি', '৳ ২৫,০০০'],
      ['৳ ২০০ টাকার নোট', '৩০ টি', '৳ ৬,০০০'],
      ['৳ ১০০ টাকার নোট', '৩৫ টি', '৳ ৩,৫০০'],
      ['৳ ৫০ টাকার নোট', '৮ টি', '৳ ৪০০'],
      ['৳ ২০ / ১০ / কয়েন', 'মিশ্রিত', '৳ ১০০'],
      ['সর্বমোট ফিজিক্যাল ক্যাশ গণনা', '৩০৩ টি নোট', '৳ ২,১৫,০০০ (সিস্টেমের সাথে হুবহু মিলেছে ✅)']
    ],
    [35, 30, 35]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন K: ইনভেন্টরি কন্ট্রোল, আইএমইআই অডিট ও ভ্যালুয়েশন
// ==========================================
docChildren.push(createHeading('K. ইনভেন্টরি কন্ট্রোল, আইএমইআই অডিট ও ভ্যালুয়েশন (InventoryView)', 1));
docChildren.push(
  createPara(
    'স্টক ব্যালেন্স, কালার ও স্টোরেজ ভেরিয়েন্ট এবং ফিজিক্যাল অডিটের কার্যপদ্ধতি:'
  )
);

// ইনভেন্টরি স্ক্রিনশট
docChildren.push(...createScreenshotImage('09_inventory.png', 'স্টক ব্যালেন্স, ভ্যালুয়েশন ও আইএমইআই ট্র্যাকার (InventoryView)', 'মডেলভিত্তিক স্টক, কালার/স্টোরেজ ভেরিয়েন্ট এবং ফিজিক্যাল স্টক অডিট ভিউ।'));

docChildren.push(
  createCallout(
    'accounting',
    'ফিফো (FIFO) ইনভেন্টরি ভ্যালুয়েশন নীতি',
    'টেলিকর্প ইআরপিতে প্রতিটি ফোনের কেনা রেট First-In First-Out (FIFO) পদ্ধতিতে নির্ধারিত হয়। এর ফলে পুরনো লটের ফোন আগে বিক্রি হলে কস্ট অব গুডস সোল্ড (COGS) হুবহু সঠিক থাকে এবং ব্যালেন্স শিটের অ্যাসেট ভ্যালু আন্তর্জাতিক মানদণ্ড অনুযায়ী সংরক্ষিত হয়।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন L: ৯-স্তরের রোল-ভিত্তিক অ্যাক্সেস ম্যাট্রিক্স (RBAC)
// ==========================================
docChildren.push(createHeading('L. ৯-স্তরের রোল-ভিত্তিক অ্যাক্সেস ম্যাট্রিক্স (RBAC Matrix)', 1));
docChildren.push(
  createPara(
    'সফটওয়্যারে ৯টি সুনির্দিষ্ট রোলের পারমিশন চার্ট:'
  )
);

docChildren.push(
  createDataTable(
    ['মডিউল ও ফিচার', 'Super Admin / Owner', 'General Manager', 'Sales Manager', 'Warehouse Manager', 'Accounts Manager', 'Accountant', 'Cashier', 'Salesman'],
    [
      ['সিস্টেম সেটিংস ও রিসেট', 'সম্পূর্ণ', 'শুধু দেখা', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ'],
      ['ইউজার তৈরি ও রোল পরিবর্তন', 'সম্পূর্ণ', 'শুধু দেখা', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ'],
      ['সাপ্লায়ার পারচেজ বিল এন্ট্রি', 'সম্পূর্ণ', 'সম্পূর্ণ', 'শুধু দেখা', 'সম্পূর্ণ', 'শুধু দেখা', 'শুধু দেখা', 'নিষিদ্ধ', 'নিষিদ্ধ'],
      ['স্টক ও আইএমইআই ট্র্যাকার', 'সম্পূর্ণ', 'সম্পূর্ণ', 'শুধু দেখা', 'সম্পূর্ণ', 'শুধু দেখা', 'শুধু দেখা', 'শুধু দেখা', 'শুধু নিজস্ব'],
      ['হোলসেল সেলস ইনভয়েসিং', 'সম্পূর্ণ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'শুধু দেখা', 'শুধু দেখা', 'শুধু দেখা', 'সম্পূর্ণ', 'সম্পূর্ণ'],
      ['রিটেইল পিওএস কাউন্টার', 'সম্পূর্ণ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'শুধু দেখা', 'শুধু দেখা', 'শুধু দেখা', 'সম্পূর্ণ', 'নিষিদ্ধ'],
      ['স্টক ট্রান্সফার ইস্যু ও রিসিভ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'নিষিদ্ধ', 'সম্পূর্ণ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'নিষিদ্ধ'],
      ['বকেয়া কালেকশন ও মানি রসিদ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'নিষিদ্ধ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'সম্পূর্ণ'],
      ['ক্যাশ বুক ও ব্যাংক রিকনসাইল', 'সম্পূর্ণ', 'সম্পূর্ণ', 'নিষিদ্ধ', 'নিষিদ্ধ', 'সম্পূর্ণ', 'সম্পূর্ণ', 'শুধু দেখা', 'নিষিদ্ধ'],
      ['দৈনিক ভল্ট ডে ক্লোজিং', 'সম্পূর্ণ', 'অনুমোদন', 'নিষিদ্ধ', 'নিষিদ্ধ', 'অনুমোদন', 'ভেরিফাই', 'এন্ট্রি', 'নিষিদ্ধ'],
      ['খরচ ভাউচার এন্ট্রি ও অনুমোদন', 'সম্পূর্ণ', 'অনুমোদন', 'নিষিদ্ধ', 'নিষিদ্ধ', 'সম্পূর্ণ', 'এন্ট্রি', 'এন্ট্রি', 'নিষিদ্ধ'],
      ['রিটার্নস ও সার্ভিস কেয়ার (RMA)', 'সম্পূর্ণ', 'অনুমোদন', 'অনুমোদন', 'সম্পূর্ণ', 'শুধু দেখা', 'শুধু দেখা', 'নিষিদ্ধ', 'নিষিদ্ধ'],
      ['লাভ-ক্ষতি ও ব্যবসায়িক রিপোর্ট', 'সম্পূর্ণ', 'সম্পূর্ণ', 'সেলস মাত্র', 'স্টক মাত্র', 'সম্পূর্ণ', 'সম্পূর্ণ', 'নিষিদ্ধ', 'নিষিদ্ধ']
    ],
    [20, 10, 10, 10, 10, 10, 10, 10, 10]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন N: ভুল প্রতিরোধ ও লাইভ ট্রাবলশুটিং ম্যাট্রিক্স
// ==========================================
docChildren.push(createHeading('N. ভুল প্রতিরোধ ও লাইভ ট্রাবলশুটিং ম্যাট্রিক্স', 1));
docChildren.push(
  createPara(
    'কাজের সময় কোনো এরর নোটিফিকেশন আসলে দ্রুত সমাধানের গাইডলাইন:'
  )
);

docChildren.push(
  createDataTable(
    ['সমস্যা / এরর মেসেজ', 'প্রকৃত কারণ (Root Cause)', 'তাত্ক্ষণিক সমাধান', 'প্রয়োজনীয় রোল'],
    [
      ['"IMEI already exists in system"', 'ফোনটি আগেই অন্য কোনো চালানে এন্ট্রি হয়েছে।', 'IMEI 360° ট্র্যাকারে চেক করুন। যদি আগেই রিটার্ন হয়ে থাকে চালান যাচাই করুন।', 'Warehouse Mgr'],
      ['"IMEI status is Sold"', 'বিক্রি হয়ে যাওয়া আইএমইআই পুনরায় বিক্রির চেষ্টা।', 'আইএমইআই ট্র্যাকারে চেক করুন কোন ইনভয়েসে সেল হয়েছে। ফিজিক্যাল বক্স বদল হয়েছে কিনা দেখুন।', 'Salesman, Cashier'],
      ['"Credit limit exceeded for dealer"', 'ডিলারের বাকি অনুমোদিত সীমার বেশি হয়ে গেছে।', 'আগে মানি রসিদে বকেয়া আদায় করুন, অথবা ওনারের মাধ্যমে সাময়িকভাবে লিমিট বাড়ান।', 'Accounts, GM'],
      ['"Negative stock not allowed"', 'এক্সেসরিজ স্টকে না থাকায় বিল হচ্ছে না।', 'আগে পারচেজ বিল বা ট্রান্সফার রিসিভ করুন, তারপর কাস্টমার সেলস কনফার্ম করুন।', 'Warehouse Mgr'],
      ['"Day Closing Discrepancy"', 'গণনা করা ক্যাশের সাথে সিস্টেম ক্যাশ মিলছে না।', 'দিনের সকল খরচের ভাউচার, ক্যাশ কালেকশন ও ব্যাংক ডিপোজিট স্লিপ পুনরায় মিলিয়ে নিন।', 'Cashier, Accounts'],
      ['"Offline sync queue pending"', 'ইন্টারনেট ড্রপ করায় সুপাবেজে ডাটা পৌঁছায়নি।', 'ব্রডব্যান্ড/ওয়াইফাই চেক করুন। নেট আসলে হেডার সিঙ্ক বাটনে চাপুন।', 'সকল ইউজার']
    ],
    [24, 28, 32, 16]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন O: প্রফেশনাল ম্যানেজারের দৈনিক চেকলিস্ট
// ==========================================
docChildren.push(createHeading('O. প্রফেশনাল ম্যানেজারের দৈনিক চেকলিস্ট', 1));
docChildren.push(
  createPara(
    'প্রতিদিনের তিনটি গুরুত্বপূর্ণ সময়ে ম্যানেজারের পালনীয় চেকলিস্ট:'
  )
);

docChildren.push(createHeading('☀️ সকালের রুটিন (০৮:৩০ - ০৯:৩০):', 3));
docChildren.push(
  createCheckItem('নিজের ম্যানেজার অ্যাকাউন্টে লগইন করে হেডার স্ট্যাটাস Online নিশ্চিত করা হয়েছে।', true),
  createCheckItem('ড্যাশবোর্ডে গত রাতের হোলসেল অর্ডার ও পেন্ডিং ডেলিভারি চালানগুলো পর্যবেক্ষণ করা হয়েছে।', true),
  createCheckItem('ড্রয়ারের ফিজিক্যাল ক্যাশ গুনে গতকালের ভল্ট ক্লোজিং ব্যালেন্সের সাথে ১০০% মিল নিশ্চিত করা হয়েছে।', true),
  createCheckItem('অ্যালার্ট সেন্টারে গিয়ে ওভারডিউ ডিলার ও কম স্টকে থাকা ফোনগুলোর নোটিফিকেশন চেক করা হয়েছে।', true),
  createCheckItem('রাতে অন্য ওয়্যারহাউজ থেকে আসা কোনো স্টক ট্রান্সফার থাকলে তা রিসিভ ও আইএমইআই ভেরিফাই করা হয়েছে।', true)
);

docChildren.push(new Paragraph({ spacing: { before: 100, after: 100 } }));

docChildren.push(createHeading('🏢 দুপুরের রুটিন (১৩:০০ - ১৪:০০):', 3));
docChildren.push(
  createCheckItem('রিয়েল-টাইম সেলস এবং সেলসম্যানদের ফিল্ড ভিজিট স্ট্যাটাস পর্যবেক্ষণ করা হয়েছে।', true),
  createCheckItem('বিক্রয়কেন্দ্রে কোনো অননুমোদিত অতিরিক্ত ডিসকাউন্ট দেওয়া হচ্ছে কিনা মনিটর করা হয়েছে।', true),
  createCheckItem('সকালে আসা নতুন পারচেজ চালানগুলোর আইএমইআই ১০০% স্ক্যান হয়ে স্টকে উঠেছে কিনা নিশ্চিত করা হয়েছে।', true),
  createCheckItem('বকেয়া বেশি থাকা ডিলারদের সাথে যোগাযোগ করে কালেকশন নিশ্চিত করা হয়েছে।', true)
);

docChildren.push(new Paragraph({ spacing: { before: 100, after: 100 } }));

docChildren.push(createHeading('🌙 রাতের ক্লোজিং রুটিন (১৯:৩০ - ২১:০০):', 3));
docChildren.push(
  createCheckItem('সকল ডেলিভারি চালানের কুরিয়ার কনসাইনমেন্ট নম্বর সফটওয়্যারে উঠেছে কিনা দেখা হয়েছে।', true),
  createCheckItem('ক্যাশিয়ারের সকল খরচের ভাউচারে স্বাক্ষরিত রসিদ সংযুক্ত আছে কিনা যাচাই করা হয়েছে।', true),
  createCheckItem('ক্যাশিয়ারের পাশে দাঁড়িয়ে ১০০%, ৫০০%, ১০০০ টাকার নোট গুনে সংখ্যা ইনপুট দেওয়া হয়েছে।', true),
  createCheckItem('bKash মার্চেন্ট ও POS মেশিনের স্লিপ ব্যাংকের এন্ট্রির সাথে মিলিয়ে রিকনসাইল করা হয়েছে।', true),
  createCheckItem('দৈনিক ডে ক্লোজিং সম্পন্ন করে আজকের দিনের ক্যাশ ভল্ট লক করা হয়েছে।', true),
  createCheckItem('হেডারের ক্লাউড আইকন দেখে নিশ্চিত করা হয়েছে Pending Changes: 0।', true)
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// সেকশন P & Q: সফটওয়্যার-বিল্টইন হেল্প ও কীবোর্ড শর্টকাট
// ==========================================
docChildren.push(createHeading('P & Q. সফটওয়্যার-বিল্টইন ইন্টারেক্টিভ হেল্প ও শর্টকাট রেফারেন্স', 1));
docChildren.push(
  createPara(
    'সফটওয়্যারের ভেতরে এই পুরো গাইডটি সরাসরি যুক্ত রয়েছে এবং কিবোর্ড দিয়ে দ্রুত কাজ করার শর্টকাটসমূহ:'
  )
);

docChildren.push(
  createDataTable(
    ['শর্টকাট কী (Key)', 'ফাংশন ও কাজের বিবরণ', 'ব্যবহারের ক্ষেত্র'],
    [
      ['Ctrl + B', 'মাল্টি-বারকোড ও দ্রুত আইএমইআই স্ক্যানার ইঞ্জিন ওপেন', 'পারচেজ ও সেলস কাউন্টারে দ্রুত স্ক্যানিং'],
      ['Ctrl + K', 'গ্লোবাল কমান্ড প্যালেট (যেকোনো মেনু বা কাস্টমার সার্চ)', 'সফটওয়্যারের যেকোনো পেইজে নিমেষেই যাওয়া'],
      ['Ctrl + /', 'কমপ্লিট অপারেশনাল এসওপি, হেল্প ও ট্রেনিং সহায়িকা', 'যেকোনো স্ক্রিনে কাজের নিয়ম দেখতে'],
      ['Ctrl + P', 'সক্রিয় ইনভয়েস বা চালান সরাসরি প্রিন্ট কমান্ড', 'ইনভয়েস ভিউ ও রিপোর্ট পেজ'],
      ['F2', 'রিটেইল এক্সপ্রেস পিওএস সেলস উইন্ডো ওপেন', 'দ্রুত কাউন্টার বিলিং শুরু করতে'],
      ['F4', 'নতুন পারচেজ বিল এন্ট্রি উইন্ডো ওপেন', 'সাপ্লায়ার চালান রিসিভ করতে'],
      ['F7', 'বকেয়া কালেকশন ও মানি রসিদ উইন্ডো ওপেন', 'ডিলারের কাছ থেকে নগদ/চেক রিসিভ করতে'],
      ['F9', 'দৈনিক ডে ক্লোজিং ও ক্যাশ কাউন্ট উইন্ডো ওপেন', 'দিন শেষে ভল্ট মিলাতে'],
      ['Esc', 'যেকোনো খোলা পপআপ বা মোডাল বন্ধ করা', 'স্ক্রিন ক্লিয়ার করতে']
    ],
    [20, 50, 30]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 200, after: 200 } }));

// সমাপ্তি বার্তা
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: '— টেলিকর্প এন্টারপ্রাইজ সিস্টেমস ইঞ্জিনিয়ারিং টিম কর্তৃক অনুমোদিত ও প্রস্তুতকৃত —',
        font: FONT_NAME,
        size: 18,
        bold: true,
        color: '475569'
      })
    ]
  })
);

// ডকুমেন্ট ইনিশিয়ালাইজেশন
const richDoc = new Document({
  creator: 'TeleCorp Systems Engineering',
  title: 'TeleCorp Mobile Distribution & Trade ERP — User Operation & Business Management Guide',
  description: 'Complete Step-by-Step User Operation Guide in Bengali Unicode with Real Screenshots, Diagrams, Indicators & Charts',
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
                  text: 'TeleCorp Mobile Distribution ERP — প্রফেশনাল ইউজার গাইড (বাংলা সংস্করণ)',
                  font: FONT_NAME,
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
                  text: 'পৃষ্ঠা ',
                  font: FONT_NAME,
                  size: 16,
                  color: '64748B'
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_NAME,
                  size: 16,
                  color: '64748B',
                  bold: true
                }),
                new TextRun({
                  text: ' / ',
                  font: FONT_NAME,
                  size: 16,
                  color: '64748B'
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: FONT_NAME,
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

// আউটপুট ফাইল পাথ
const outputDocx = path.resolve('telecorp_erp_operation_guide.docx');
const publicDocx = path.resolve('public/telecorp_erp_operation_guide.docx');

// ফাইল রাইট
Packer.toBuffer(richDoc).then(buffer => {
  fs.writeFileSync(outputDocx, buffer);
  fs.writeFileSync(publicDocx, buffer);
  const sizeKb = (fs.statSync(outputDocx).size / 1024).toFixed(1);
  console.log(`✅ সমৃদ্ধ বাংলা স্ক্রিনশট ওয়ার্ড ফাইল (.docx) সফলভাবে তৈরি হয়েছে: ${outputDocx} (${sizeKb} KB)`);
  console.log(`✅ পাবলিক ফোল্ডারে কপি সম্পন্ন: ${publicDocx}`);

  // এখন একই কন্টেন্ট থেকে হাই-কোয়ালিটি PDF সিঙ্ক করা
  console.log('\n--- PDF ডকুমেন্টে স্ক্রিনশট ও সমৃদ্ধ বাংলা কন্টেন্ট আপডেট করা হচ্ছে ---');
  generateMatchingPdf();
}).catch(err => {
  console.error('❌ ওয়ার্ড ফাইল তৈরিতে ত্রুটি:', err);
  process.exit(1);
});

// পিডিএফ তৈরি ফাংশন
function generateMatchingPdf() {
  const edgeExecutable = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outputPdf = path.resolve('telecorp_erp_operation_guide.pdf');
  const publicPdf = path.resolve('public/telecorp_erp_operation_guide.pdf');
  const tempHtml = path.resolve('scripts/temp_rich_screenshot_guide.html');

  // স্ক্রিনশটের রিলেটিভ ইউআরএল
  const s01 = path.join(SCREENSHOT_DIR, '01_dashboard.png').replace(/\\/g, '/');
  const s02 = path.join(SCREENSHOT_DIR, '02_purchase.png').replace(/\\/g, '/');
  const s03 = path.join(SCREENSHOT_DIR, '03_wholesale_sales.png').replace(/\\/g, '/');
  const s04 = path.join(SCREENSHOT_DIR, '04_retail_pos.png').replace(/\\/g, '/');
  const s05 = path.join(SCREENSHOT_DIR, '05_due_collection.png').replace(/\\/g, '/');
  const s06 = path.join(SCREENSHOT_DIR, '06_emi_installment.png').replace(/\\/g, '/');
  const s07 = path.join(SCREENSHOT_DIR, '07_stock_transfers.png').replace(/\\/g, '/');
  const s08 = path.join(SCREENSHOT_DIR, '08_day_closing.png').replace(/\\/g, '/');
  const s09 = path.join(SCREENSHOT_DIR, '09_inventory.png').replace(/\\/g, '/');
  const s10 = path.join(SCREENSHOT_DIR, '10_settings.png').replace(/\\/g, '/');

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>TeleCorp Mobile Distribution & Trade ERP — ইউজার অপারেশন গাইড</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    @page {
      size: A4 portrait;
      margin: 14mm;
      @bottom-left {
        content: "TeleCorp Mobile Distribution ERP — ব্যবহারিক অপারেশন নির্দেশিকা";
        font-family: 'Hind Siliguri', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
      @bottom-right {
        content: "পৃষ্ঠা " counter(page);
        font-family: 'Hind Siliguri', sans-serif;
        font-size: 8pt;
        color: #64748b;
        font-weight: 600;
      }
    }
    body {
      font-family: 'Hind Siliguri', 'Kalpurush', 'Siyam Rupali', 'Segoe UI', sans-serif;
      font-size: 9pt;
      line-height: 1.55;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      color: #93c5fd;
      padding: 3px 10px;
      font-size: 8pt;
      font-weight: 700;
      border-radius: 9999px;
      margin-bottom: 8px;
    }
    h1 { margin: 0 0 6px 0; font-size: 20pt; color: white; }
    h2 { font-size: 13pt; color: #1e3a8a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 5px; margin-top: 24px; }
    h3 { font-size: 10.5pt; color: #0f172a; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 8pt; page-break-inside: avoid; border: 1px solid #cbd5e1; }
    th { background: #1e3a8a; color: white; padding: 7px 9px; text-align: left; font-weight: 600; }
    td { padding: 6px 9px; border: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .screenshot-card {
      margin: 16px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    .screenshot-card img {
      width: 100%;
      max-width: 620px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    .screenshot-caption {
      font-size: 8.5pt;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 6px;
    }
    .screenshot-desc {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 2px;
    }
    pre {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 3px solid #2563EB;
      border-radius: 6px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 7.5pt;
      line-height: 1.4;
      color: #0f172a;
      page-break-inside: avoid;
      margin: 10px 0;
      white-space: pre-wrap;
    }
    .callout {
      border-left: 4px solid #2563EB;
      background: #eff6ff;
      padding: 10px 14px;
      border-radius: 6px;
      margin: 12px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    .callout.critical { border-left-color: #dc2626; background: #fef2f2; color: #991b1b; }
    .callout.tip { border-left-color: #16a34a; background: #f0fdf4; color: #166534; }
    .callout.accounting { border-left-color: #d97706; background: #fffbeb; color: #92400e; }
    ul { margin: 6px 0; padding-left: 20px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="badge">ENTERPRISE PRODUCTION SOP & USER MANUAL</div>
    <h1>TeleCorp Mobile Distribution & Trade ERP</h1>
    <div style="font-size: 11pt; color: #cbd5e1;">প্রফেশনাল মোবাইল ডিলার বিজনেস ম্যানেজার – কমপ্লিট স্টেপ-বাই-স্টেপ ইউজার অপারেশন গাইড</div>
    <div style="font-size: 8pt; color: #94a3b8; margin-top: 10px;">বাস্তব স্ক্রিনশট, স্ট্যাটাস ইন্ডিকেটর, গ্রাফ/চার্ট, কলআউট নোটস ও চেকলিস্ট সহ সম্পূর্ণ ব্যবহারিক নির্দেশিকা</div>
  </div>

  <h2>A. কমপ্লিট স্টার্ট-টু-ফিনিশ বিজনেস ওয়ার্কফ্লো</h2>
  <div class="screenshot-card">
    <img src="${s01}" alt="Dashboard">
    <div class="screenshot-caption">📸 স্ক্রিনশট ১: অপারেশনাল ড্যাশবোর্ড ও ককপিট ভিউ (DashboardView)</div>
    <div class="screenshot-desc">গ্রস সেলস, ক্যাশ কালেকশন, ড্রয়ার ক্যাশ ও মোট ডিলার বকেয়া পর্যবেক্ষণের কেন্দ্রীয় ড্যাশবোর্ড।</div>
  </div>

  <h2>B. নতুন ব্যবহারকারী ও প্রথমবার সেটআপ চেকলিস্ট</h2>
  <div class="screenshot-card">
    <img src="${s10}" alt="Settings">
    <div class="screenshot-caption">📸 স্ক্রিনশট ২: সিস্টেম সেটিংস ও ইউজার পারমিশন কন্ট্রোল (SettingsView)</div>
    <div class="screenshot-desc">কোম্পানি প্রোফাইল, ভ্যাট রেট (৫%), হার্ড ক্রেডিট লক পলিসি ও ক্লাউড সিঙ্ক।</div>
  </div>

  <h2>D. পারচেজ ও আইএমইআই ইনওয়ার্ড গাইড</h2>
  <div class="screenshot-card">
    <img src="${s02}" alt="Purchase">
    <div class="screenshot-caption">📸 স্ক্রিনশট ৩: সাপ্লায়ার পারচেজ বিল ও ইনওয়ার্ড রেজিস্টার (PurchaseView)</div>
    <div class="screenshot-desc">চালান এন্ট্রি, সাপ্লায়ার নির্বাচন, ওয়্যারহাউজ নির্বাচন এবং মাল্টি-আইএমইআই স্ক্যানিং।</div>
  </div>

  <h2>E. প্রফেশনাল সেলস ও পিওএস গাইড</h2>
  <div class="screenshot-card">
    <img src="${s03}" alt="Wholesale Sales">
    <div class="screenshot-caption">📸 স্ক্রিনশট ৪: পাইকারি সেলস ও ডিলার ইনভয়েসিং (WholesaleSalesView)</div>
    <div class="screenshot-desc">ডিলার নির্বাচন, ক্রেডিট লিমিট ভ্যালিডেশন, আইএমইআই স্ক্যান এবং বাকিতে ইনভয়েস ইস্যু।</div>
  </div>

  <div class="screenshot-card">
    <img src="${s04}" alt="Retail POS">
    <div class="screenshot-caption">📸 স্ক্রিনশট ৫: রিটেইল এক্সপ্রেস পিওএস কাউন্টার (RetailPOSView)</div>
    <div class="screenshot-desc">ওয়াক-ইন কাস্টমার, বারকোড স্ক্যানার শর্টকাট (Ctrl+B), স্প্লিট পেমেন্ট ও থার্মাল রসিদ।</div>
  </div>

  <h2>F. কাস্টমার ক্রেডিট, বকেয়া ও মানি রসিদ হাব</h2>
  <div class="screenshot-card">
    <img src="${s05}" alt="Due Collection">
    <div class="screenshot-caption">📸 স্ক্রিনশট ৬: বকেয়া কালেকশন ও মানি রসিদ হাব (DueCollectionView)</div>
    <div class="screenshot-desc">ডিলারের মোট বাকি, বিল-বাই-বিল এফআইএফও বকেয়া নিষ্পত্তি এবং মানি রসিদ (MR-2026-xxxx) জেনারেশন।</div>
  </div>

  <h2>G. ব্রাঞ্চ ও ওয়্যারহাউজ ট্রান্সফার গাইড</h2>
  <div class="screenshot-card">
    <img src="${s07}" alt="Stock Transfers">
    <div class="screenshot-caption">📸 স্ক্রিনশট ৭: ইন্টার-ওয়্যারহাউজ ও ব্রাঞ্চ স্টক ট্রান্সফার (StockTransfersView)</div>
    <div class="screenshot-desc">সোর্স ওয়্যারহাউজ, ডেস্টিনেশন শোরুম, আইএমইআই স্ক্যান ও ইন-ট্রানজিট ভেরিফিকেশন।</div>
  </div>

  <h2>H. কিস্তি ও ইএমআই হায়ার-পারচেজ ফাইন্যান্সিং</h2>
  <div class="screenshot-card">
    <img src="${s06}" alt="EMI Financing">
    <div class="screenshot-caption">📸 স্ক্রিনশট ৮: কিস্তি ও ইএমআই হায়ার-পারচেজ চুক্তি ও শিডিউল (EMIInstallmentView)</div>
    <div class="screenshot-desc">ডাউন পেমেন্ট, মাসিক কিস্তি ক্যালকুলেটর, জামিনদার ভেরিফিকেশন ও অ্যামরটাইজেশন টেবিল।</div>
  </div>

  <h2>J. ক্যাশ ও ব্যাংক এবং দৈনিক ডে ক্লোজিং</h2>
  <div class="screenshot-card">
    <img src="${s08}" alt="Day Closing">
    <div class="screenshot-caption">📸 স্ক্রিনশট ৯: দৈনিক ক্যাশ ভল্ট রিকনসিলিয়েশন ও ডে ক্লোজিং (DayClosingView)</div>
    <div class="screenshot-desc">নোট ডিনোমিনেশন কাউন্ট (১০০০xN, ৫০০xN), ব্যবধান যাচাই এবং ভল্ট ডে লক সম্পন্নকরণ।</div>
  </div>

  <h2>K. ইনভেন্টরি কন্ট্রোল, আইএমইআই অডিট ও ভ্যালুয়েশন</h2>
  <div class="screenshot-card">
    <img src="${s09}" alt="Inventory">
    <div class="screenshot-caption">📸 স্ক্রিনশট ১০: স্টক ব্যালেন্স, ভ্যালুয়েশন ও আইএমইআই ট্র্যাকার (InventoryView)</div>
    <div class="screenshot-desc">মডেলভিত্তিক স্টক, কালার/স্টোরেজ ভেরিয়েন্ট এবং ফিজিক্যাল স্টক অডিট ভিউ।</div>
  </div>
</body>
</html>`;

  fs.writeFileSync(tempHtml, htmlContent, 'utf8');
  try {
    execSync(`"${edgeExecutable}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outputPdf}" "${tempHtml}"`, {
      stdio: 'inherit'
    });
    if (fs.existsSync(outputPdf)) {
      fs.copyFileSync(outputPdf, publicPdf);
      const pdfSize = (fs.statSync(outputPdf).size / 1024).toFixed(1);
      console.log(`✅ সমৃদ্ধ স্ক্রিনশট PDF ফাইল সফলভাবে তৈরি হয়েছে: ${outputPdf} (${pdfSize} KB)`);
      console.log(`✅ পাবলিক ফোল্ডারে কপি সম্পন্ন: ${publicPdf}`);
    }
  } catch (err) {
    console.error('❌ PDF তৈরিতে ত্রুটি:', err);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}
