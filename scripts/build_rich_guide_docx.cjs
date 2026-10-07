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
  Footer
} = docx;

console.log('--- শুরু হচ্ছে: TeleCorp ERP সমৃদ্ধ বাংলা ইউজার ম্যানুয়াল ও বিজনেস গাইড জেনারেটর ---');

// ফন্ট এবং স্টাইল কনফিগারেশন
const FONT_NAME = 'Segoe UI';
const CODE_FONT = 'Consolas';

// হেল্পার: সাধারণ টেক্সট রান
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

// হেল্পার: হেডিং প্যারাগ্রাফ
function createHeading(title, level, color = '1E3A8A') {
  let hLevel = HeadingLevel.HEADING_2;
  let size = 26; // 13pt
  let spacingBefore = 280;
  let spacingAfter = 120;

  if (level === 1) {
    hLevel = HeadingLevel.HEADING_1;
    size = 32; // 16pt
    spacingBefore = 360;
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

// হেল্পার: সাধারণ প্যারাগ্রাফ
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

// হেল্পার: বুলেট আইটেম
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

// হেল্পার: চেকবাক্স আইটেম
function createCheckItem(text, isChecked = false) {
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

// হেল্পার: অ্যালার্ট / কলআউট বক্স
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

// হেল্পার: টেক্সট-বেসড ডায়াগ্রাম / গ্রাফ / চার্ট কার্ড
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

// হেল্পার: ফরম্যাটেড ডেটা টেবিল
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

// ডকুমেন্ট বডি তৈরির অ্যারে
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
        text: 'TeleCorp Mobile Distribution & Trade ERP',
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
        text: 'মোবাইল ডিলার ও ডিস্ট্রিবিউশন বিজনেস কমপ্লিট অপারেশনাল এসওপি ও ইউজার গাইড',
        font: FONT_NAME,
        size: 26,
        bold: true,
        color: '0F172A'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 260 },
    children: [
      new TextRun({
        text: 'Step-by-Step Practical Management Guide with Diagrams, UI Indicators, Charts & Flowcharts',
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
    ['ডকুমেন্ট মেটাডাটা প্রোপার্টিজ', 'বিবরণ ও স্পেসিফিকেশন'],
    [
      ['সফটওয়্যার প্ল্যাটফর্ম', 'TeleCorp ERP (Multi-Branch, Dual IMEI, Cloud-Sync, BTRC-Compliant)'],
      ['ডকুমেন্ট ভার্সন', 'Version 3.2 Enterprise Production Edition'],
      ['টার্গেট অডিয়েন্স', 'Mobile Dealer Business Managers, Operations Directors, Accountants & Sales Teams'],
      ['মূল বিষয়বস্তু', 'পেইজ-বাই-পেইজ ওয়ার্কফ্লো, লাইভ ইন্ডিকেটর, গ্রাফ/চার্ট, ডিলার ক্রেডিট ও ভল্ট কন্ট্রোল'],
      ['নিরাপত্তা ও অ্যাক্সেস', 'অভ্যন্তরীণ ব্যবসায়িক পরিচালনার জন্য সংরক্ষিত (Strictly Confidential)']
    ],
    [35, 65]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 200, after: 200 } }));

// ভূমিকা ও ওভারভিউ
docChildren.push(
  createCallout(
    'tip',
    'গাইড ব্যবহারের নির্দেশিকা ও উদ্দেশ্য',
    'এই নির্দেশিকাটি মোবাইল হ্যান্ডসেট ও গ্যাজেট ডিস্ট্রিবিউটর, শো-রুম চেইন এবং পাইকারি ডিলারদের বাস্তব ব্যবসায়িক প্রয়োজন অনুসারে প্রণয়ন করা হয়েছে। এতে সফটওয়্যারের প্রতিটি পেইজ, বোতামের মার্কিং, রঙের ইন্ডিকেটর, ক্যালকুলেশন লজিক এবং ট্রাবলশুটিং পদ্ধতি পরিষ্কার বাংলায় উপস্থাপন করা হয়েছে।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ১: সফটওয়্যারের কালার ইন্ডিকেটর ও ভিজ্যুয়াল স্ট্যাটাস মার্কিং
// ==========================================
docChildren.push(createHeading('অধ্যায় ১: সিস্টেমের স্ট্যাটাস ইন্ডিকেটর ও কালার মার্কিং গাইড', 1));
docChildren.push(
  createPara(
    'টেলিকর্প ইআরপিতে ভুলভ্রান্তি প্রতিরোধে প্রতিটি হ্যান্ডসেট, ইনভয়েস এবং ডিলার অ্যাকাউন্টে স্বয়ংক্রিয় কালার কোডেড স্ট্যাটাস ব্যাজ ব্যবহৃত হয়। কর্মীরা স্ক্রিনে এই রঙ দেখে এক নজরে পণ্যের ও অ্যাকাউন্টের বর্তমান অবস্থা বুঝতে পারবেন:'
  )
);

// ইন্ডিকেটর টেবিল
docChildren.push(
  createDataTable(
    ['ইন্ডিকেটর ও ব্যাজ', 'অর্থ ও স্ট্যাটাস', 'সিস্টেমের আচরণ ও ব্যবসায়িক নিয়ম', 'অনুমোদিত অ্যাকশন'],
    [
      ['🟢 [ইন স্টক - In Stock]', 'পণ্য ওয়্যারহাউজে বিদ্যমান', 'হ্যান্ডসেটটি অক্ষত এবং অবিলম্বে বিক্রয় বা ট্রান্সফারের জন্য উন্মুক্ত।', 'POS সেলস, ট্রান্সফার ডিসপ্যাচ'],
      ['🔴 [বিক্রিত - Sold]', 'হ্যান্ডসেট ডেলিভারি সম্পন্ন', 'আইএমইআইটি ইতিমধ্যে কোনো ইনভয়েসে বিক্রি হয়ে গেছে। পুনরায় বিক্রি অসম্ভব।', 'ওয়ারেন্টি লুকআপ, কাস্টমার রিটার্ন'],
      ['🟡 [ইন ট্রানজিট - In Transit]', 'এক ব্রাঞ্চ হতে অন্য ব্রাঞ্চে স্থানান্তরিত হচ্ছে', 'সোর্স ব্রাঞ্চ থেকে ডিসপ্যাচ হয়েছে কিন্তু ডেস্টিনেশন এখনো রিসিভ কনফার্ম করেনি।', 'ডেস্টিনেশন শোরুমে স্ক্যান রিসিভ'],
      ['🔵 [আরএমএ / ফেরত - RMA Return]', 'ডিফেক্টিভ বা সার্ভিসিংয়ে প্রেরিত', 'ত্রুটিযুক্ত হ্যান্ডসেট যা কাস্টমার ফেরত দিয়েছে বা ভেন্ডর রিপ্লেসমেন্টে রয়েছে।', 'সাপ্লায়ার রিটার্ন চালান, ক্রেডিট নোট'],
      ['⛔ [হার্ড ব্লকড - Hard Blocked]', 'ডিলারের ক্রেডিট লিমিট অতিক্রান্ত', 'ডিলারের বর্তমান বকেয়া তার অনুমোদিত ক্রেডিট সীমা ছাড়িয়ে গেছে। নতুন সেল বন্ধ।', 'মানি রসিদের মাধ্যমে বকেয়া কালেকশন'],
      ['⚠️ [ওভারডিউ - Overdue Alert]', 'বকেয়া জমার মেয়াদ পার হয়েছে', 'ডিলারের বাকি নির্ধারিত দিন (যেমন: ১৫ দিন) অতিক্রম করেছে।', 'কালেকশন তাগাদা, সেলস রেস্ট্রিকশন'],
      ['🟣 [ইএমআই কিস্তি - EMI Active]', 'কিস্তিতে বিক্রিত হ্যান্ডসেট', 'হ্যান্ডসেটটি গ্রাহকের কাছে হস্তান্তর করা হয়েছে তবে কিস্তির টাকা চলমান রয়েছে।', 'মাসিক কিস্তি গ্রহণ ও শিডিউল আপডেট'],
      ['☁️ [সবুজ ক্লাউড - Synced]', '১০০% ক্লাউড সিঙ্ক সম্পন্ন', 'লোকাল ডিভাইসের সকল এন্ট্রি সুপাবেজ ক্লাউড ডাটাবেজে স্থায়ীভাবে সংরক্ষিত।', 'স্বাভাবিক কার্যক্রম চলমান রাখা'],
      ['⚡ [কমলা ক্লাউড - Pending]', 'অফলাইন সিঙ্ক কিউ পেন্ডিং', 'ইন্টারনেট ড্রপ বা সার্ভার সংযোগে বিলম্বের কারণে লোকাল ক্যাশে জমা আছে।', 'নেটওয়ার্ক চেক বা ম্যানুয়াল সিঙ্ক ক্লিক']
    ],
    [22, 24, 38, 16]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

// আইএমইআই লাইফসাইকেল চার্ট
docChildren.push(
  createDiagramCard(
    '১৫-ডিজিট আইএমইআই (IMEI) লাইফসাইকেল ট্রানজিশন চার্ট',
    `[সাপ্লায়ার পারচেজ বিল]
        │
        ▼ (ইনওয়ার্ড স্ক্যান)
 ┌─────────────────┐       ট্রান্সফার ডিসপ্যাচ        ┌─────────────────────┐
 │ 🟢 In Stock     │ ───────────────────────────> │ 🟡 In Transit       │
 │ (ওয়্যারহাউজে মজুদ)│ <─────────────────────────── │ (রাস্তায় বা কুরিয়ারে) │
 └─────────────────┘       ট্রান্সফার রিসিভড         └─────────────────────┘
        │
        ├──────────────────────┬─────────────────────┐
        ▼ (হোলসেল / POS সেল)   ▼ (কিস্তিতে সেল)       ▼ (সরাসরি ভেন্ডর ফেরত)
 ┌─────────────────┐    ┌─────────────────┐   ┌─────────────────────┐
 │ 🔴 Sold         │    │ 🟣 Sold (EMI)   │   │ 🔵 Supplier Return  │
 │ (নগদ/বাকি বিক্রিত)│    │ (কিস্তি চলমান)   │   │ (সাপ্লায়ারকে ফেরত)   │
 └─────────────────┘    └─────────────────┘   └─────────────────────┘
        │                        │
        ▼ (কাস্টমার ফেরত)          ▼ (কিস্তি শেষ)
 ┌─────────────────┐    ┌─────────────────┐
 │ 🔵 RMA Return   │    │ 🔴 Fully Paid   │
 │ (সার্ভিসিং / বদল) │    │ (পূর্ণ পরিশোধিত) │
 └─────────────────┘    └─────────────────┘`,
    'একটি আইএমইআই এর সম্পূর্ণ জীবনচক্র: ইনওয়ার্ড থেকে বিক্রয় এবং রিটার্ন পর্যন্ত স্বয়ংক্রিয় স্ট্যাটাস রূপান্তর।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ২: ড্যাশবোর্ড ও অপারেশনাল ককপিট
// ==========================================
docChildren.push(createHeading('অধ্যায় ২: ড্যাশবোর্ড ও অপারেশনাল ককপিট (DashboardView)', 1));
docChildren.push(
  createPara(
    'ড্যাশবোর্ড হল ব্যবসার কেন্দ্রীয় নিয়ন্ত্রণ কক্ষ। প্রতিদিন সকালে লগইন করার পর ম্যানেজার এই স্ক্রিন থেকে ব্যবসার সামগ্রিক আর্থিক ও ইনভেন্টরি অবস্থান পর্যবেক্ষণ করবেন।'
  )
);

docChildren.push(
  createDiagramCard(
    'অপারেশনাল ড্যাশবোর্ড ইন্টারফেস ওয়্যারফ্রেম ও মার্কিং',
    `┌────────────────────────────────────────────────────────────────────────┐
│ [ককপিট হেডার] 🏢 TeleCorp Central Hub | 📅 ০৭ অক্টোবর ২০২৬ | 🟢 Online │
├───────────────┬────────────────┬───────────────┬───────────────────────┤
│ [১] মোট বিক্রয় │ [২] আজকের কালেকশন│ [৩] ক্যাশ ড্রয়ার │ [৪] ডিলার বকেয়া মোট    │
│  ৳ ১২,৫০,০০০   │   ৳ ৫,২০,০০০   │   ৳ ২,১৫,০০০  │   ৳ ৪২,৮০,০০০ (⚠️ ১২ ডিলার)│
├───────────────┴────────────────┴───────────────┴───────────────────────┤
│ 📈 সেলস ট্রেন্ড গ্রাফ (বার ও লাইন চার্ট)                                   │
│  ৳১৫লাখ ┤          █                                                   │
│  ৳১০লাখ ┤   █      █      █                                            │
│   ৳৫লাখ ┤   █   █  █   █  █   █                                        │
│     ৳০ └───┴───┴───┴───┴───┴───┴─────── (গত ৭ দিনের সেলস পারফরম্যান্স)     │
├────────────────────────────────────────┬───────────────────────────────┤
│ ⚠️ জরুরি অ্যালার্ট প্যানেল             │ ⚡ কুইক লঞ্চ বাটন            │
│ • স্যামসাং S24 Ultra স্টক মাত্র ৩ পিস! │ • [+ নতুন সেলস ইনভয়েস]         │
│ • খান টেলিকমের ৩টি ইনভয়েস বকেয়া ওভারডিউ│ • [+ নতুন পারচেজ বিল]          │
│ • সেন্ট্রাল থেকে ১০ পিস ট্রানজিট পেন্ডিং │ • [মানি রসিদ কালেকশন]         │
└────────────────────────────────────────┴───────────────────────────────┘`,
    'ড্যাশবোর্ডের ৪টি মূল KPI কার্ড, রিয়েলটাইম সেলস বার-চার্ট এবং শর্টকাট অ্যাকশন বাটন।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

docChildren.push(createHeading('ড্যাশবোর্ডের মূল ৪টি স্ট্যাটাস কার্ডের তাৎপর্য:', 3));
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
// অধ্যায় ৩: কোম্পানি প্রোফাইল ও ৯-স্তরের আরবিক (RBAC) রোল সেটআপ
// ==========================================
docChildren.push(createHeading('অধ্যায় ৩: কোম্পানি প্রোফাইল, ভ্যাট ও ৯-স্তরের পারমিশন ম্যাট্রিক্স', 1));
docChildren.push(
  createPara(
    'যেকোনো লেনদেন শুরুর পূর্বে সিস্টেমের কোম্পানি প্রোফাইল, ভ্যাট/বিআইএন নম্বর এবং কর্মকর্তা-কর্মচারীদের রোল ও পারমিশন সুনির্দিষ্ট করতে হবে।'
  )
);

docChildren.push(
  createDataTable(
    ['রোল (Role Name)', 'অনুমোদিত ক্ষেত্রসমূহ', 'নিষিদ্ধ অ্যাকশন', 'দায়িত্ব ও ভূমিকা'],
    [
      ['Super Admin / Owner', 'সকল মডিউল, ব্যালেন্স রিসেট, ইউজার তৈরি, কনফিগারেশন', 'কোনো নিষেধাজ্ঞা নেই', 'ব্যবসার স্বত্বাধিকারী / আইটি হেড'],
      ['General Manager', 'দৈনিক অপারেশন, সেলস, পারচেজ, স্টক, রিপোর্ট ও অনুমোদন', 'সিস্টেম ফুল রিসেট ও ডাটা মুছে ফেলা', 'সার্বিক ব্যবসায়িক কার্যক্রম সমন্বয়ক'],
      ['Sales Manager', 'হোলসেল সেলস, ডিলার লিমিট অনুমোদন, সেলসম্যান টার্গেট', 'পারচেজ কস্ট দেখা, ব্যাংক ভল্ট এডিট', 'ডিলার সেলস ও কালেকশন তদারকি'],
      ['Warehouse Manager', 'পারচেজ ইনওয়ার্ড, আইএমইআই স্ক্যান, স্টক ট্রান্সফার, আরএমএ', 'সেলস প্রাইস এডিট, ফাইনান্সিয়াল রিপোর্ট', 'গুদাম ও হ্যান্ডসেট স্টক নির্ভুল রাখা'],
      ['Accounts Manager', 'ক্যাশ বুক, ব্যাংক হিসাব, জার্নাল, ডিলার লেজার, খরচ অনুমোদন', 'স্টক ম্যানুয়ালি ডিলিট করা', 'আর্থিক স্বচ্ছতা ও অডিট নিয়ন্ত্রণ'],
      ['Accountant', 'ভাউচার এন্ট্রি, খরচ হিসাব, ব্যাংক স্টেটমেন্ট ভেরিফিকেশন', 'ডিলার ক্রেডিট সীমা পরিবর্তন', 'দৈনিক হিসাব রক্ষণাবেক্ষণ'],
      ['Cashier', 'রিটেইল পিওএস সেলস, মানি রসিদ কালেকশন, দৈনিক ডে ক্লোজিং', 'হোলসেল ডিসকাউন্ট ওভাররাইড, পারচেজ', 'কাউন্টার ক্যাশ গ্রহণ ও ভল্ট মিলকরণ'],
      ['Salesman', 'রিটেইল বিলিং, আইএমইআই সার্চ, নিজস্ব সেলস ও কমিশন দেখা', 'পাইকারি রেট কমানো, অন্য সেলসম্যানের ডাটা', 'ফিল্ড অর্ডার গ্রহণ ও রিটেইল সেলস']
    ],
    [20, 32, 28, 20]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

docChildren.push(
  createCallout(
    'critical',
    'হার্ড ক্রেডিট লক পলিসি (Hard Credit Block Rule)',
    'SettingsView-এ "creditLimitHardBlock = true" সক্রিয় থাকলে, কোনো ডিলারের বকেয়া তার ক্রেডিট লিমিট ছাড়িয়ে গেলে সফটওয়্যার স্বয়ংক্রিয়ভাবে ইনভয়েস জেনারেশন ব্লক করে দেবে। শুধুমাত্র Super Admin বা GM লিখিত অনুমতি সাপেক্ষে সাময়িক লিমিট বাড়াতে পারবেন।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ৪: সাপ্লায়ার পারচেজ ও ১৫-ডিজিট মাল্টি-আইএমইআই ইনওয়ার্ড
// ==========================================
docChildren.push(createHeading('অধ্যায় ৪: সাপ্লায়ার পারচেজ ও ১৫-ডিজিট মাল্টি-আইএমইআই ইনওয়ার্ড (PurchaseView)', 1));
docChildren.push(
  createPara(
    'মোবাইল ব্যবসার প্রধান ভিত্তি হল সঠিক আইএমইআই সহ পারচেজ বিল এন্ট্রি। স্যামসাং, শাওমি বা অফিসিয়াল ডিস্ট্রিবিউটর থেকে পণ্য আসার সাথে সাথে নিচের নিয়মে চালানের সকল আইএমইআই সিস্টেমে স্ক্যান করতে হবে।'
  )
);

docChildren.push(
  createDiagramCard(
    'পারচেজ বিল ও আইএমইআই স্ক্যানার ফ্লোচার্ট',
    `┌────────────────────────────────────────────────────────────────────────┐
│ [+ Purchase Bill] ──> ১. সাপ্লায়ার নির্বাচন ──> ২. ওয়্যারহাউজ নির্বাচন   │
│                             │                            │             │
│                             ▼                            ▼             │
│                 ৩. হ্যান্ডসেট মডেল ও ভেরিয়েন্ট নির্বাচন                    │
│                             │                                          │
│                             ▼                                          │
│          ┌──────────────────────────────────────────────┐              │
│          │  ৪. ১৫-ডিজিট আইএমইআই স্ক্যানিং বক্স (Barcode Scanner) │              │
│          │  864192061234561, 864192061234562, ...       │              │
│          └──────────────────────────────────────────────┘              │
│                             │                                          │
│    ┌────────────────────────┴─────────────────────────┐                │
│    ▼                                                  ▼                │
│ [স্বয়ংক্রিয় ভ্যালিডেশন ১]                         [স্বয়ংক্রিয় ভ্যালিডেশন ২]        │
│ ১৫ ডিজিট পূরণ আছে কি না?                         সিস্টেমে ইতিমধ্যে বিদ্যমান কি না?│
│    │                                                  │                │
│    ├───────► ❌ ভুল হলে ওয়ার্নিং ও ব্লক               ├──────► ❌ ডুপ্লিকেট হলে ব্লক │
│    │                                                  │                │
│    ▼ (সঠিক হলে)                                       ▼ (সঠিক হলে)     │
│ [৫. মোট কোয়ান্টিটি == স্ক্যানকৃত মোট আইএমইআই সংখ্যা লকড]                  │
│                             │                                          │
│                             ▼                                          │
│ ৬. কেনা রেট (Unit Cost) + পরিবহন খরচ এন্ট্রি ──> ৭. [পারচেজ বিল সংরক্ষণ] │
└────────────────────────────────────────────────────────────────────────┘`,
    'পারচেজ এন্ট্রির সম্পূর্ণ প্রক্রিয়া: স্ক্যানিং, ডুপ্লিকেট রোধ এবং কোয়ান্টিটি অটো-লকিং।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

docChildren.push(createHeading('পারচেজ এন্ট্রির অপরিবর্তনীয় শর্তাবলী (Strict Purchase Rules):', 3));
docChildren.push(
  createBullet([
    createTextRun('১. কোয়ান্টিটি ম্যানুয়ালি টাইপ করা যায় না: ', { bold: true }),
    createTextRun('আপনি যদি ১০টি মোবাইলের চালান এন্ট্রি করতে চান, তবে আপনাকে ১০টি আইএমইআই-ই স্ক্যান করতে হবে। স্ক্যান না করে কোয়ান্টিটি বাড়ানোর সুযোগ নেই।')
  ]),
  createBullet([
    createTextRun('২. ডুপ্লিকেট আইএমইআই কঠোরভাবে নিষিদ্ধ: ', { bold: true }),
    createTextRun('কোনো আইএমইআই যদি আগে একবার কেনা হয়ে থাকে বা অন্য কোনো ব্রাঞ্চে স্টকে থাকে, তবে সিস্টেম সাথে সাথে লাল কালারে এরর দেবে এবং ইনভয়েস সেভ হতে দেবে না।')
  ]),
  createBullet([
    createTextRun('৩. পরিবহন খরচ (Landed Cost): ', { bold: true }),
    createTextRun('চালানের সাথে কুরিয়ার বা পরিবহন খরচ যুক্ত করলে তা স্বয়ংক্রিয়ভাবে প্রতিটি সেটের কস্টিং-এর সাথে আনুপাতিক হারে যুক্ত হয়ে আসল কেনা রেট নির্ধারণ করবে।')
  ])
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ৫: পাইকারি সেলস ও রিটেইল পিওএস কাউন্টার
// ==========================================
docChildren.push(createHeading('অধ্যায় ৫: পাইকারি সেলস ও রিটেইল পিওএস কাউন্টার (Wholesale & Retail POS)', 1));
docChildren.push(
  createPara(
    'টেলিকর্প ইআরপিতে দুই ধরনের বিক্রয় ব্যবস্থা রয়েছে: ১. পাইকারি বা ডিলার সেলস (WholesaleSalesView) এবং ২. এক্সপ্রেস রিটেইল কাউন্টার (RetailPOSView)।'
  )
);

docChildren.push(
  createDiagramCard(
    'পাইকারি বনাম রিটেইল বিক্রয় প্রক্রিয়ার তুলনামূলক চার্ট',
    `┌───────────────────────────────┬────────────────────────────────────────┐
│ পাইকারি সেলস (Wholesale Sales) │ এক্সপ্রেস রিটেইল পিওএস (Retail POS)   │
├───────────────────────────────┼────────────────────────────────────────┤
│ • গ্রাহক: রেজিস্টার্ড ডিলার/দোকানদার│ • গ্রাহক: সাধারণ ওয়াক-ইন ক্রেতা/ব্যক্তি│
│ • ক্রেডিট লিমিট ও বাকি ভ্যালিডেশন│ • তাৎক্ষণিক নগদ/বিকাশ/কার্ড লেনদেন    │
│ • ফিল্ড সেলসম্যান কমিশন ট্র্যাকিং │ • সরাসরি দ্রুত কাউন্টার প্রিন্ট         │
│ • ৩-কপি এ৪ বা থার্মাল চালান প্রিন্ট│ • ৩-ইঞ্চি থার্মাল ক্যাশ রসিদ ও কিউআর কোড│
│ • কার্টনে কার্টনে একাধিক আইএমইআই   │ • দ্রুত সিঙ্গেল বক্স স্ক্যান ও ওয়ারেন্টি│
└───────────────────────────────┴────────────────────────────────────────┘`,
    'পাইকারি ও রিটেইল কাউন্টারের কাজের বৈশিষ্ট্যের পার্থক্য।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

docChildren.push(
  createCallout(
    'critical',
    'ডিসকাউন্ট অনুমোদন পলিসি (Discount Approval Threshold)',
    'সফটওয়্যারে প্রতি হ্যান্ডসেটে সর্বোচ্চ অনুমোদিত ডিসকাউন্টের সিলিং (যেমন: ৳১,০০০) নির্ধারিত থাকে। কোনো সেলসম্যান যদি তার চেয়ে বেশি ডিসকাউন্ট দিতে চান, তবে স্ক্রিনে সাথে সাথে "ম্যানেজার পাসওয়ার্ড ও অনুমোদন" পপআপ ভেসে উঠবে। ম্যানেজার অনুমোদন না দিলে ডিসকাউন্ট কার্যকর হবে না।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ৬: কিস্তি ও ইএমআই হায়ার-পারচেজ ফাইন্যান্সিং
// ==========================================
docChildren.push(createHeading('অধ্যায় ৬: কিস্তি / ইএমআই ও হায়ার-পারচেজ ফাইন্যান্সিং (EMIInstallmentView)', 1));
docChildren.push(
  createPara(
    'বাংলাদেশে প্রিমিয়াম স্মার্টফোন (iPhone, Samsung Ultra) বিক্রির অন্যতম প্রধান চালিকাশক্তি হল শপ-কিস্তি বা হায়ার পারচেজ। টেলিকর্প ইআরপিতে নিজস্ব কিস্তি ক্যালকুলেটর ও মাসিক অ্যামরটাইজেশন শিডিউল যুক্ত রয়েছে।'
  )
);

docChildren.push(
  createDiagramCard(
    'উদাহরণ: ১,২০,০০০ টাকার আইফোনে ৬ মাসের কিস্তির অ্যামরটাইজেশন শিডিউল',
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
    'মাসিক কিস্তির পূর্ণাঙ্গ শিডিউল যা বিক্রির সময় স্বয়ংক্রিয়ভাবে চুক্তিনামা সহ প্রিন্ট হয়।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

docChildren.push(createHeading('কিস্তি বিক্রির আবশ্যিক চেকলিস্ট (EMI Mandatory Checklist):', 3));
docChildren.push(
  createCheckItem('গ্রাহকের জাতীয় পরিচয়পত্র (NID) ও পাসপোর্ট সাইজ ছবি আপলোড করা হয়েছে।', true),
  createCheckItem('গ্রাহকের নিজস্ব সক্রিয় মোবাইল নম্বর ও বিকল্প পারিবারিক নম্বর যাচাই করা হয়েছে।', true),
  createCheckItem('অন্তত ১ জন সক্ষম জামিনদারের (Guarantor) NID ও মোবাইল নম্বর ডাটাবেজে এন্ট্রি হয়েছে।', true),
  createCheckItem('গ্রাহকের ব্যাংক একাউন্টের স্বাক্ষরিত সিকিউরিটি চেক (MICR Cheque) সংগ্রহ ও ড্রয়ারে জমা হয়েছে।', true),
  createCheckItem('ন্যূনতম ২০% থেকে ৫০% ডাউন পেমেন্ট ক্যাশ কাউন্টারে আদায় করা হয়েছে।', true)
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ৭: ডিলার ক্রেডিট, ডিউ এজিং ও মানি রসিদ হাব
// ==========================================
docChildren.push(createHeading('অধ্যায় ৭: ডিলার ক্রেডিট, ডিউ এজিং ও মানি রসিদ হাব (DueCollectionView)', 1));
docChildren.push(
  createPara(
    'পাইকারি ব্যবসায় সময়মতো টাকা আদায় করা সবচেয়ে গুরুত্বপূর্ণ। টেলিকর্প ইআরপিতে ডিলারদের বাকি টাকার বয়স (Ageing) ৪টি ভাগে স্বয়ংক্রিয়ভাবে ট্র্যাক করা হয়।'
  )
);

docChildren.push(
  createDataTable(
    ['বকেয়া বয়সের স্ল্যাব (Ageing Bracket)', 'রিস্ক লেভেল', 'সিস্টেমের আচরণ ও অ্যাকশন', 'ম্যানেজার করণীয়'],
    [
      ['০ – ১৫ দিন (Current Due)', '🟢 স্বাভাবিক (Low Risk)', 'নিয়মিত ক্রেডিট সাইকেল। ডিলার নতুন পণ্য বাকিতে নিতে পারবেন।', 'স্বাভাবিক ডেলিভারি চলমান রাখা'],
      ['১৬ – ৩০ দিন (Due Warning)', '🟡 সতর্কতা (Medium Risk)', 'ডিলারের ড্যাশবোর্ডে হলুদ ওয়ার্নিং ব্যাজ। নতুন বিক্রিতে ৫০% ক্যাশ শর্ত।', 'সেলসম্যানকে কালেকশন তাগাদা পাঠানো'],
      ['৩১ – ৬০ দিন (Critical Due)', '🟠 ঝুঁকিপূর্ণ (High Risk)', 'নতুন ইনভয়েস লক। মানি রসিদ ছাড়া কোনো অর্ডার প্রসেস হবে না।', 'দোকানে ফিল্ড ভিজিট ও চেক উপস্থাপন'],
      ['৬০+ দিন (Bad Debt Recovery)', '🔴 চরম সংকট (Critical Block)', 'আইনি নোটিশ প্রসেসিং। ডিলারকে পার্মানেন্ট ব্ল্যাকলিস্টে অন্তর্ভুক্তি।', 'মালিক ও জিএম পর্যায়ের আইনি ব্যবস্থা']
    ],
    [24, 20, 36, 20]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

docChildren.push(
  createCallout(
    'accounting',
    'ক্যাশ ডিসকাউন্ট ওয়েভার পলিসি (Prompt Payment Discount)',
    'কোনো ডিলার যদি দ্রুত বকেয়া পরিশোধ করার সময় ছাড় দাবি করেন (যেমন: ৳১,০০,০০০ বকেয়ায় ৳৯৮,০০০ ক্যাশ দিয়ে ৳২,০০০ ছাড়), তবে মানি রসিদে Discount Waiver বক্সে ৳২,০০০ লিখতে হবে। এতে ডিলারের খাতা থেকে পুরো ৳১,০০,০০০ মাইনাস হবে, ক্যাশ ড্রয়ারে ৳৯৮,০০০ ঢুকবে এবং বাকি ৳২,০০০ সরাসরি "Sales Discount Expense" লেজারে ডেবিট হবে।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ৮: ব্রাঞ্চ ও ইন্টার-ওয়্যারহাউজ স্টক ট্রান্সফার
// ==========================================
docChildren.push(createHeading('অধ্যায় ৮: ব্রাঞ্চ ও ইন্টার-ওয়্যারহাউজ স্টক ট্রান্সফার (StockTransfersView)', 1));
docChildren.push(
  createPara(
    'মাল্টি-শোরুম বিশিষ্ট ব্যবসায় সেন্ট্রাল হাব থেকে শাখা শোরুমে পণ্য পাঠাতে ৩-ধাপের ভেরিফিকেশন প্রোটোকল অনুসরণ করা বাধ্যতামূলক।'
  )
);

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
    'পণ্য পাঠানোর পর গন্তব্যে স্ক্যান করে গ্রহণ নিশ্চিত না করা পর্যন্ত ট্রানজিট স্টকে সুরক্ষিত থাকে।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ৯: দৈনিক ক্যাশ ভল্ট রিকনসিলিয়েশন ও ডে ক্লোজিং
// ==========================================
docChildren.push(createHeading('অধ্যায় ৯: দৈনিক ক্যাশ ভল্ট রিকনসিলিয়েশন ও ডে ক্লোজিং (DayClosingView)', 1));
docChildren.push(
  createPara(
    'প্রতিদিন ব্যবসা শেষে ক্যাশিয়ারের ক্যাশ বাক্সের নগদ টাকা এবং সিস্টেমের হিসাবের ১০০% মিল নিশ্চিত করে দিন লক করতে হবে।'
  )
);

docChildren.push(
  createDiagramCard(
    'দৈনিক ক্যাশ ড্রয়ার হিসাবের সমীকরণ',
    `   [দিনের শুরুতে প্রারম্ভিক ক্যাশ (Opening Cash)]
 + [আজকের ক্যাশ বিক্রয় (Cash Sales)]
 + [আজকের ক্যাশ বকেয়া আদায় (Cash Due Collections)]
 - [আজকের ক্যাশ অফিস খরচ (Cash Expenses)]
 - [আজকের দিনে ব্যাংকে ক্যাশ জমা (Cash Bank Deposits)]
 ────────────────────────────────────────────────────────
 = [সিস্টেমের প্রত্যাশিত ক্যাশ ব্যালেন্স (Expected Closing Cash)]
 
               বনাম (VS)
 
   [ফিজিক্যাল ক্যাশ ড্রয়ারে গোনা টাকা (Physical Denomination Count)]
 ────────────────────────────────────────────────────────
 = [ডিসক্রিপেন্সি বা ব্যবধান: ৳ ০.০০ (অবশ্যই শূন্য হতে হবে)]`,
    'দিনের সব ক্যাশ লেনদেনের সঠিক হিসাবের গাণিতিক মডেল।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

// নোট ডিনোমিনেশন টেবিল
docChildren.push(createHeading('নোটের ডিনোমিনেশন গণনা ফর্ম (Physical Currency Count Breakdown):', 3));
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

docChildren.push(new Paragraph({ spacing: { before: 140, after: 140 } }));

docChildren.push(
  createCallout(
    'critical',
    'ডে ক্লোজিং সংক্রান্ত অনুশাসন',
    'দিন শেষে ডে ক্লোজিং লক না করে শোরুম বন্ধ করা কঠোরভাবে নিষিদ্ধ। ডে ক্লোজিং ছাড়া পরবর্তী দিনের লেনদেন শুরু করলে পূর্ববর্তী দিনের ক্যাশ ও অ্যাকাউন্টিং রিপোর্ট বিশৃঙ্খল হয়ে পড়বে।'
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ১০: ১০০% ওয়াল-টু-ওয়াল আইএমইআই ফিজিক্যাল অডিট
// ==========================================
docChildren.push(createHeading('অধ্যায় ১০: ইনভেন্টরি ভ্যালুয়েশন ও ১০০% ওয়াল-টু-ওয়াল আইএমইআই অডিট', 1));
docChildren.push(
  createPara(
    'মোবাইল ব্যবসার সবচেয়ে বড় ঝুঁকি হল স্টক চুরি বা স্টক গরমিল। তাই প্রতি মাসের শেষ দিনে শোরুমের প্রতিটি হ্যান্ডসেটের বাক্স নামিয়ে বারকোড স্ক্যানার দিয়ে অডিট পরিচালনা করতে হবে।'
  )
);

docChildren.push(
  createDataTable(
    ['অডিট ফলাফল ক্যাটাগরি', 'সংজ্ঞা ও কারণ', 'ঝুঁকির মাত্রা', 'তাত্ক্ষণিক সমাধান'],
    [
      ['১. Matched Stock (মিলে যাওয়া)', 'সিস্টেমে ইন-স্টক আছে এবং ফিজিক্যালিও বক্সে পাওয়া গেছে।', '🟢 স্বাভাবিক', 'কোনো অ্যাকশন প্রয়োজন নেই। স্টক নির্ভুল।'],
      ['২. Ghost Stock (সিস্টেমে আছে, বক্সে নেই)', 'ডাটাবেজে দেখাচ্ছে স্টকে আছে কিন্তু শোরুমে পাওয়া যাচ্ছে না।', '🔴 উচ্চ ঝুঁকি (চুরি/হারানো)', 'সংশ্লিষ্ট দিনের সিসিটিভি ফুটেজ ও ইনভয়েস পরীক্ষা। ক্ষতিপূরণ ধার্য।'],
      ['৩. Unrecorded Stock (বক্সে আছে, সিস্টেমে নেই)', 'শোরুমের তাকে ফোন রয়েছে কিন্তু সিস্টেমে এন্ট্রি নেই।', '🟠 মাঝারি ঝুঁকি', 'সাপ্লায়ার চালান বা পূর্ববর্তী ক্যানসেলড সেলস ইনভয়েস যাচাই ও এন্ট্রি।']
    ],
    [25, 35, 18, 22]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ১১: এরর প্রিভেনশন ও ট্রাবলশুটিং ম্যাট্রিক্স
// ==========================================
docChildren.push(createHeading('অধ্যায় ১১: লাইভ এরর প্রিভেনশন ও ট্রাবলশুটিং ম্যাট্রিক্স', 1));
docChildren.push(
  createPara(
    'দৈনন্দিন কাজের সময় স্ক্রিনে কোনো এরর মেসেজ আসলে ভয় পাওয়ার কারণ নেই। নিচের টেবিল দেখে মূল কারণ ও তাত্ক্ষণিক সমাধান জেনে নিন:'
  )
);

docChildren.push(
  createDataTable(
    ['স্ক্রিনের এরর মেসেজ', 'প্রকৃত কারণ (Root Cause)', 'তাত্ক্ষণিক সমাধান (Solution)', 'প্রয়োজনীয় রোল'],
    [
      ['"IMEI already exists in system"', 'আইএমইআইটি ইতিমধ্যে পূর্বের কোনো চালানে এন্ট্রি হয়ে আছে।', 'IMEI 360° ট্র্যাকারে সার্চ করে দেখুন কোন চালানে এন্ট্রি হয়েছিল।', 'Warehouse Manager'],
      ['"IMEI status is Sold"', 'বিক্রি হয়ে যাওয়া আইএমইআই পুনরায় অন্য বিলে বিক্রির চেষ্টা করা হচ্ছে।', 'হ্যান্ডসেটের বক্স চেক করুন। হয়তো সঠিক বক্সের বদলে অন্য বক্স নেওয়া হয়েছে।', 'Salesman, Cashier'],
      ['"Credit limit exceeded for dealer"', 'ডিলারের বর্তমান বাকি তার অনুমোদিত লিমিট ছাড়িয়ে গেছে।', 'মানি রসিদ দিয়ে পূর্বের বকেয়া আদায় করুন অথবা সাময়িক লিমিট অনুমোদন নিন।', 'Accounts, GM'],
      ['"Negative stock not allowed"', 'স্টকে শূন্য থাকা সত্ত্বেও কোনো অ্যাকসেসরিজ বিল করার চেষ্টা।', 'আগে পারচেজ বিল বা স্টক ট্রান্সফারের মাধ্যমে পণ্য স্টকে যুক্ত করুন।', 'Warehouse Manager'],
      ['"Day closing discrepancy error"', 'কাউন্টারের নগদ টাকা আর সিস্টেমের হিসাবে অমিল পাওয়া গেছে।', 'দিনের খরচ ভাউচার ও কালেকশন রসিদ মিলিয়ে গরমিল চিহ্নিত করুন।', 'Cashier, Accounts'],
      ['"Cloud sync pending (Offline)"', 'ইন্টারনেট সংযোগ ড্রপ করায় ক্লাউডে ডাটা পৌঁছায়নি।', 'ব্রডব্যান্ড/ওয়াইফাই চেক করুন। নেট আসলে হেডার সিঙ্ক বাটনে চাপুন।', 'সকল ইউজার']
    ],
    [24, 28, 32, 16]
  )
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ১২: ব্রাঞ্চ ম্যানেজারের প্রফেশনাল দৈনিক চেকলিস্ট
// ==========================================
docChildren.push(createHeading('অধ্যায় ১২: ব্রাঞ্চ ম্যানেজারের প্রফেশনাল দৈনিক চেকলিস্ট', 1));
docChildren.push(
  createPara(
    'একজন দায়িত্বশীল মোবাইল শোরুম বা ডিলার ব্রাঞ্চ ম্যানেজার হিসেবে প্রতিদিনের তিনটি শিফটে নিচের কাজগুলো ক্রমানুসারে সম্পন্ন করতে হবে:'
  )
);

docChildren.push(createHeading('☀️ সকালের ওপেনিং চেকলিস্ট (০৮:৩০ AM – ০৯:৩০ AM):', 3));
docChildren.push(
  createCheckItem('ম্যানেজার আইডিতে লগইন করে সিস্টেমের ক্লাউড সিঙ্ক স্ট্যাটাস 🟢 Online নিশ্চিত করা হয়েছে।', true),
  createCheckItem('ক্যাশ ড্রয়ার খুলে গতকালের ক্লোজিং ক্যাশ গুনে আজকের প্রারম্ভিক ক্যাশের সাথে মিলানো হয়েছে।', true),
  createCheckItem('ড্যাশবোর্ড অ্যালার্ট সেন্টারে গিয়ে লো-স্টক হ্যান্ডসেট এবং বকেয়া ওভারডিউ ডিলারদের তালিকা দেখা হয়েছে।', true),
  createCheckItem('অন্য ব্রাঞ্চ থেকে ট্রানজিটে পাঠানো কোনো স্টক সকালে এসে পৌঁছালে তা স্ক্যান করে রিসিভ করা হয়েছে।', true)
);

docChildren.push(new Paragraph({ spacing: { before: 100, after: 100 } }));

docChildren.push(createHeading('🏢 দুপুরের ট্রেডিং ও মনিটরিং চেকলিস্ট (০১:০০ PM – ০২:০০ PM):', 3));
docChildren.push(
  createCheckItem('সকাল থেকে সম্পাদিত বিক্রির গতি ও আজকের সেলস টার্গেট অর্জন পর্যবেক্ষণ করা হয়েছে।', true),
  createCheckItem('কাউন্টারে সেলসম্যানরা অতিরিক্ত ডিসকাউন্ট দিচ্ছে কি না তা অডিট করা হয়েছে।', true),
  createCheckItem('সকালে আসা নতুন চালানের সকল হ্যান্ডসেট ১০০% স্ক্যান হয়ে স্টকে ঢুকেছে কি না নিশ্চিত করা হয়েছে।', true),
  createCheckItem('বকেয়া থাকা ডিলারদের দোকানে কালেকশন সেলসম্যানকে ফলো-আপে পাঠানো হয়েছে।', true)
);

docChildren.push(new Paragraph({ spacing: { before: 100, after: 100 } }));

docChildren.push(createHeading('🌙 রাতের ক্লোজিং ও ভল্ট লক চেকলিস্ট (০৭:৩০ PM – ০৯:০০ PM):', 3));
docChildren.push(
  createCheckItem('দিনের সকল কুরিয়ার ডেলিভারি চালান ও বুকিং ট্র্যাকিং নম্বর ডাটাবেজে এন্ট্রি হয়েছে।', true),
  createCheckItem('সকল খুচরা খরচ ভাউচারে অনুমোদনের স্বাক্ষর ও রসিদ সংযুক্ত করা হয়েছে।', true),
  createCheckItem('ক্যাশিয়ারের নোট গোনার সাথে সিস্টেমের ব্যালেন্স মিলিয়ে ব্যবধান ৳০.০০ নিশ্চিত করা হয়েছে।', true),
  createCheckItem('বিকাশ মার্চেন্ট ও ক্রেডিট কার্ড পিওএস স্লিপ ব্যাংকের স্টেটমেন্টের সাথে মিলানো হয়েছে।', true),
  createCheckItem('আজকের ডে ক্লোজিং সম্পন্ন করে ভল্ট লক করা হয়েছে।', true),
  createCheckItem('হেডার ক্লাউড সিঙ্কে "Pending Changes: 0" দেখে ব্রাউজার ক্লোজ করা হয়েছে।', true)
);

docChildren.push(new Paragraph({ spacing: { before: 160, after: 160 } }));

// ==========================================
// অধ্যায় ১৩: প্রয়োজনীয় কীবোর্ড শর্টকাট রেফারেন্স
// ==========================================
docChildren.push(createHeading('অধ্যায় ১৩: কীবোর্ড শর্টকাট ও মাল্টি-স্ক্যানার রেফারেন্স', 1));
docChildren.push(
  createPara(
    'মাউসের স্পর্শ ছাড়াই দ্রুত বিলিং ও ব্রাউজিংয়ের জন্য সফটওয়্যারের প্রধান কীবোর্ড শর্টকাটসমূহ:'
  )
);

docChildren.push(
  createDataTable(
    ['শর্টকাট কী (Key)', 'ফাংশন ও কাজের বিবরণ', 'ব্যবহারের ক্ষেত্র'],
    [
      ['Ctrl + B', 'মাল্টি-বারকোড ও দ্রুত আইএমইআই স্ক্যানার ইঞ্জিন ওপেন', 'পারচেজ ও সেলস কাউন্টারে দ্রুত স্ক্যানিং'],
      ['Ctrl + K', 'গ্লোবাল কমান্ড প্যালেট (যেকোনো মেনু বা কাস্টমার সার্চ)', 'সফটওয়্যারের যেকোনো পেইজে নিমেষেই যাওয়া'],
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
  description: 'Complete Step-by-Step User Operation Guide in Bengali Unicode with Diagrams, Indicators & Charts',
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
                  text: 'TeleCorp Mobile Distribution & Trade ERP — ব্যবহারিক অপারেশন নির্দেশিকা (বাংলা)',
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

// আউটপুট ফাইল পাথসমূহ
const outputDocx = path.resolve('telecorp_erp_operation_guide.docx');
const publicDocx = path.resolve('public/telecorp_erp_operation_guide.docx');

// ফাইল রাইট
Packer.toBuffer(richDoc).then(buffer => {
  fs.writeFileSync(outputDocx, buffer);
  fs.writeFileSync(publicDocx, buffer);
  const sizeKb = (fs.statSync(outputDocx).size / 1024).toFixed(1);
  console.log(`✅ সমৃদ্ধ বাংলা ওয়ার্ড ফাইল (.docx) সফলভাবে তৈরি হয়েছে: ${outputDocx} (${sizeKb} KB)`);
  console.log(`✅ পাবলিক ফোল্ডারে কপি সম্পন্ন: ${publicDocx}`);
  
  // এখন একই কন্টেন্ট থেকে হাই-কোয়ালিটি PDF তৈরি ও সিঙ্ক করা
  console.log('\n--- PDF ডকুমেন্টে সমৃদ্ধ বাংলা কন্টেন্ট আপডেট করা হচ্ছে ---');
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
  const tempHtml = path.resolve('scripts/temp_rich_guide.html');

  // সমৃদ্ধ HTML টেমপ্লেট
  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>TeleCorp Mobile Distribution & Trade ERP — ব্যবহারিক অপারেশন নির্দেশিকা</title>
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
    .callout.critical {
      border-left-color: #dc2626;
      background: #fef2f2;
      color: #991b1b;
    }
    .callout.tip {
      border-left-color: #16a34a;
      background: #f0fdf4;
      color: #166534;
    }
    .callout.accounting {
      border-left-color: #d97706;
      background: #fffbeb;
      color: #92400e;
    }
    ul { margin: 6px 0; padding-left: 20px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="badge">ENTERPRISE PRODUCTION SOP & USER MANUAL</div>
    <h1>TeleCorp Mobile Distribution & Trade ERP</h1>
    <div style="font-size: 11pt; color: #cbd5e1;">মোবাইল ডিলার ও ডিস্ট্রিবিউশন বিজনেস কমপ্লিট অপারেশনাল এসওপি ও ইউজার গাইড</div>
    <div style="font-size: 8pt; color: #94a3b8; margin-top: 10px;">সংস্করণ ৩.২ এন্টারপ্রাইজ | বাংলা ইউনিকোড সংস্করণ | ডায়াগ্রাম, ইন্ডিকেটর, গ্রাফ ও চেকলিস্ট সহ</div>
  </div>

  <h2>অধ্যায় ১: সিস্টেমের স্ট্যাটাস ইন্ডিকেটর ও কালার মার্কিং গাইড</h2>
  <p>টেলিকর্প ইআরপিতে ভুলভ্রান্তি প্রতিরোধে প্রতিটি হ্যান্ডসেট, ইনভয়েস এবং ডিলার অ্যাকাউন্টে স্বয়ংক্রিয় কালার কোডেড স্ট্যাটাস ব্যাজ ব্যবহৃত হয়:</p>
  <table>
    <thead><tr><th>ইন্ডিকেটর ও ব্যাজ</th><th>অর্থ ও স্ট্যাটাস</th><th>সিস্টেমের আচরণ ও ব্যবসায়িক নিয়ম</th><th>অনুমোদিত অ্যাকশন</th></tr></thead>
    <tbody>
      <tr><td>🟢 [ইন স্টক]</td><td>পণ্য ওয়্যারহাউজে বিদ্যমান</td><td>হ্যান্ডসেটটি অক্ষত এবং অবিলম্বে বিক্রয় বা ট্রান্সফারের জন্য উন্মুক্ত।</td><td>POS সেলস, ট্রান্সফার</td></tr>
      <tr><td>🔴 [বিক্রিত]</td><td>হ্যান্ডসেট ডেলিভারি সম্পন্ন</td><td>আইএমইআইটি ইতিমধ্যে কোনো ইনভয়েসে বিক্রি হয়ে গেছে। পুনরায় বিক্রি অসম্ভব।</td><td>ওয়ারেন্টি লুকআপ, রিটার্ন</td></tr>
      <tr><td>🟡 [ইন ট্রানজিট]</td><td>ব্রাঞ্চে স্থানান্তরিত হচ্ছে</td><td>সোর্স থেকে ডিসপ্যাচ হয়েছে কিন্তু ডেস্টিনেশন এখনো রিসিভ কনফার্ম করেনি।</td><td>শোরুমে স্ক্যান রিসিভ</td></tr>
      <tr><td>🔵 [আরএমএ ফেরত]</td><td>ত্রুটিপূর্ণ/সার্ভিসিংয়ে প্রেরিত</td><td>কাস্টমার ফেরত দিয়েছে বা ভেন্ডর রিপ্লেসমেন্টে রয়েছে।</td><td>সাপ্লায়ার রিটার্ন চালান</td></tr>
      <tr><td>⛔ [হার্ড ব্লকড]</td><td>ডিলারের ক্রেডিট সীমা অতিক্রান্ত</td><td>ডিলারের বর্তমান বকেয়া অনুমোদিত ক্রেডিট সীমা ছাড়িয়ে গেছে। নতুন সেল বন্ধ।</td><td>মানি রসিদে কালেকশন</td></tr>
      <tr><td>⚠️ [ওভারডিউ]</td><td>বকেয়া জমার মেয়াদ পার</td><td>ডিলারের বাকি নির্ধারিত দিন (যেমন: ১৫ দিন) অতিক্রম করেছে।</td><td>কালেকশন তাগাদা</td></tr>
      <tr><td>🟣 [ইএমআই কিস্তি]</td><td>কিস্তিতে বিক্রিত ডিভাইস</td><td>হ্যান্ডসেট হস্তান্তর করা হয়েছে তবে কিস্তির টাকা চলমান রয়েছে।</td><td>মাসিক কিস্তি গ্রহণ</td></tr>
      <tr><td>☁️ [সবুজ ক্লাউড]</td><td>১০০% ক্লাউড সিঙ্কড</td><td>লোকাল ডিভাইসের সকল এন্ট্রি সুপাবেজ ক্লাউড ডাটাবেজে স্থায়ীভাবে সংরক্ষিত।</td><td>স্বাভাবিক কার্যক্রম</td></tr>
    </tbody>
  </table>

  <h2>১৫-ডিজিট আইএমইআই (IMEI) লাইফসাইকেল ট্রানজিশন চার্ট</h2>
  <pre>[সাপ্লায়ার পারচেজ বিল] ──> (ইনওয়ার্ড স্ক্যান)
       │
       ▼
┌─────────────────┐       ট্রান্সফার ডিসপ্যাচ        ┌─────────────────────┐
│ 🟢 In Stock     │ ───────────────────────────> │ 🟡 In Transit       │
│ (ওয়্যারহাউজে মজুদ)│ <─────────────────────────── │ (রাস্তায় বা কুরিয়ারে) │
└─────────────────┘       ট্রান্সফার রিসিভড         └─────────────────────┘
       │
       ├──────────────────────┬─────────────────────┐
       ▼ (হোলসেল / POS সেল)   ▼ (কিস্তিতে সেল)       ▼ (সরাসরি ভেন্ডর ফেরত)
┌─────────────────┐    ┌─────────────────┐   ┌─────────────────────┐
│ 🔴 Sold         │    │ 🟣 Sold (EMI)   │   │ 🔵 Supplier Return  │
│ (নগদ/বাকি বিক্রিত)│    │ (কিস্তি চলমান)   │   │ (সাপ্লায়ারকে ফেরত)   │
└─────────────────┘    └─────────────────┘   └─────────────────────┘</pre>

  <h2>অধ্যায় ২: ড্যাশবোর্ড ও অপারেশনাল ককপিট</h2>
  <pre>┌────────────────────────────────────────────────────────────────────────┐
│ [ককপিট হেডার] 🏢 TeleCorp Central Hub | 📅 ০৭ অক্টোবর ২০২৬ | 🟢 Online │
├───────────────┬────────────────┬───────────────┬───────────────────────┤
│ [১] মোট বিক্রয় │ [২] আজকের কালেকশন│ [৩] ক্যাশ ড্রয়ার │ [৪] ডিলার বকেয়া মোট    │
│  ৳ ১২,৫০,০০০   │   ৳ ৫,২০,০০০   │   ৳ ২,১৫,০০০  │   ৳ ৪২,৮০,০০০ (⚠️ ১২ ডিলার)│
├───────────────┴────────────────┴───────────────┴───────────────────────┤
│ 📈 সেলস ট্রেন্ড গ্রাফ (বার ও লাইন চার্ট):                              │
│  ৳১৫লাখ ┤          █                                                   │
│  ৳১০লাখ ┤   █      █      █                                            │
│   ৳৫লাখ ┤   █   █  █   █  █   █                                        │
│     ৳০ └───┴───┴───┴───┴───┴───┴─────── (গত ৭ দিনের সেলস পারফরম্যান্স)     │
└────────────────────────────────────────────────────────────────────────┘</pre>

  <div class="callout tip">
    <strong>💡 ড্যাশবোর্ডের ৪টি মূল KPI কার্ড:</strong><br>
    ১. মোট বিক্রয়: আজকের দিনের নগদ ও বাকির মোট সেলস।<br>
    ২. আজকের কালেকশন: ক্যাশ, ব্যাংক ও বিকাশের মাধ্যমে সরাসরি জমা হওয়া অর্থ।<br>
    ৩. ক্যাশ ড্রয়ার ব্যালেন্স: ক্যাশিয়ারের ক্যাশ বাক্সে উপস্থিত থাকার হিসাব।<br>
    ৪. ডিলার মোট বকেয়া: বাজারে ডিলারদের কাছে অনাদায়ী মোট পাওনা টাকা।
  </div>

  <h2>অধ্যায় ৩: ৯-স্তরের আরবিক (RBAC) রোল পারমিশন ম্যাট্রিক্স</h2>
  <table>
    <thead><tr><th>রোল (Role)</th><th>অনুমোদিত ক্ষেত্র</th><th>নিষিদ্ধ ক্ষেত্র</th><th>ভূমিকা</th></tr></thead>
    <tbody>
      <tr><td>Super Admin / Owner</td><td>সকল মডিউল, ব্যালেন্স রিসেট, ইউজার তৈরি</td><td>কোনোটি নয়</td><td>মালিক / আইটি হেড</td></tr>
      <tr><td>General Manager</td><td>দৈনিক অপারেশন, পারচেজ, সেলস, অনুমোদন</td><td>সিস্টেম ফুল রিসেট</td><td>সার্বিক অপারেশন</td></tr>
      <tr><td>Sales Manager</td><td>হোলসেল সেলস, ডিলার লিমিট, সেলসম্যান টার্গেট</td><td>পারচেজ কস্ট দেখা</td><td>ডিলার সেলস তদারকি</td></tr>
      <tr><td>Warehouse Manager</td><td>পারচেজ ইনওয়ার্ড, আইএমইআই স্ক্যান, ট্রান্সফার</td><td>সেলস প্রাইস এডিট</td><td>ইনভেন্টরি নির্ভুল রাখা</td></tr>
      <tr><td>Accounts Manager</td><td>ক্যাশ বুক, ব্যাংক হিসাব, লেজার, খরচ অনুমোদন</td><td>স্টক ডিলিট করা</td><td>আর্থিক নিয়ন্ত্রণ</td></tr>
      <tr><td>Cashier</td><td>রিটেইল POS, মানি রসিদ কালেকশন, ডে ক্লোজিং</td><td>ডিসকাউন্ট ওভাররাইড</td><td>কাউন্টার ক্যাশ মিলকরণ</td></tr>
      <tr><td>Salesman</td><td>রিটেইল বিলিং, আইএমইআই সার্চ, নিজস্ব কমিশন</td><td>পাইকারি রেট কমানো</td><td>ফিল্ড সেলস ও অর্ডার</td></tr>
    </tbody>
  </table>

  <h2>অধ্যায় ৪: সাপ্লায়ার পারচেজ ও ১৫-ডিজিট আইএমইআই ইনওয়ার্ড</h2>
  <div class="callout critical">
    <strong>⚠️ পারচেজ এন্ট্রির অপরিবর্তনীয় শর্তাবলী:</strong><br>
    • কোয়ান্টিটি ম্যানুয়ালি টাইপ করা যায় না; স্ক্যানকৃত আইএমইআই সংখ্যাই হবে পণ্যের কোয়ান্টিটি।<br>
    • ডুপ্লিকেট আইএমইআই সিস্টেমে ঢুকানো অসম্ভব; ১৫-ডিজিট ভ্যালিডেশন ব্যর্থ হলে বিল সেভ হবে না।
  </div>

  <h2>অধ্যায় ৫: কিস্তি ও ইএমআই হায়ার-পারচেজ ফাইন্যান্সিং</h2>
  <pre>┌────────────────────────────────────────────────────────────────────────┐
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
└──────┴──────────────┴──────────────┴──────────────┴────────────────────┘</pre>

  <h2>অধ্যায় ৬: দৈনিক ক্যাশ ভল্ট রিকনসিলিয়েশন ও ডে ক্লোজিং</h2>
  <table>
    <thead><tr><th>নোটের ডিনোমিনেশন</th><th>নোটের সংখ্যা</th><th>মোট টাকার অংক</th></tr></thead>
    <tbody>
      <tr><td>৳ ১০০০ টাকার নোট</td><td>১৮০ টি</td><td>৳ ১,৮০,০০০</td></tr>
      <tr><td>৳ ৫০০ টাকার নোট</td><td>৫০ টি</td><td>৳ ২৫,০০০</td></tr>
      <tr><td>৳ ২০০ টাকার নোট</td><td>৩০ টি</td><td>৳ ৬,০০০</td></tr>
      <tr><td>৳ ১০০ টাকার নোট</td><td>৩৫ টি</td><td>৳ ৩,৫০০</td></tr>
      <tr><td>৳ ৫০ / ২০ / ১০ / কয়েন</td><td>মিশ্রিত</td><td>৳ ৫০০</td></tr>
      <tr><td><strong>সর্বমোট ফিজিক্যাল ক্যাশ</strong></td><td><strong>৩০৩ টি নোট</strong></td><td><strong>৳ ২,১৫,০০০ (সিস্টেমের সাথে হুবহু মিলেছে ✅)</strong></td></tr>
    </tbody>
  </table>

  <h2>অধ্যায় ৭: লাইভ এরর প্রিভেনশন ও ট্রাবলশুটিং ম্যাট্রিক্স</h2>
  <table>
    <thead><tr><th>স্ক্রিনের এরর মেসেজ</th><th>প্রকৃত কারণ</th><th>তাত্ক্ষণিক সমাধান</th><th>প্রয়োজনীয় রোল</th></tr></thead>
    <tbody>
      <tr><td>"IMEI already exists in system"</td><td>পূর্বে এন্ট্রি হয়ে আছে।</td><td>IMEI 360° ট্র্যাকারে চেক করুন।</td><td>Warehouse Mgr</td></tr>
      <tr><td>"IMEI status is Sold"</td><td>ইতিমধ্যে বিক্রি হয়ে গেছে।</td><td>হ্যান্ডসেটের বক্স অদলবদল হয়েছে কিনা দেখুন।</td><td>Salesman, Cashier</td></tr>
      <tr><td>"Credit limit exceeded"</td><td>ডিলারের বাকি সীমা অতিক্রান্ত।</td><td>মানি রসিদে বকেয়া আদায় করুন।</td><td>Accounts, GM</td></tr>
      <tr><td>"Day closing discrepancy"</td><td>ক্যাশ ড্রয়ারে টাকার গরমিল।</td><td>দিনের খরচ ও কালেকশন ভাউচার মেলান।</td><td>Cashier, Accounts</td></tr>
      <tr><td>"Cloud sync pending (Offline)"</td><td>ইন্টারনেট ড্রপ করেছে।</td><td>নেট আসলে হেডার সিঙ্ক বাটনে চাপুন।</td><td>সকল ইউজার</td></tr>
    </tbody>
  </table>

  <h2>অধ্যায় ৮: প্রয়োজনীয় কীবোর্ড শর্টকাট</h2>
  <table>
    <thead><tr><th>শর্টকাট কী</th><th>ফাংশন ও কাজের বিবরণ</th><th>ব্যবহারের ক্ষেত্র</th></tr></thead>
    <tbody>
      <tr><td>Ctrl + B</td><td>মাল্টি-বারকোড ও দ্রুত আইএমইআই স্ক্যানার ওপেন</td><td>পারচেজ ও সেলস দ্রুত স্ক্যানিং</td></tr>
      <tr><td>Ctrl + K</td><td>গ্লোবাল কমান্ড প্যালেট (যেকোনো মেনু বা কাস্টমার সার্চ)</td><td>সফটওয়্যারের যেকোনো পেইজে যাওয়া</td></tr>
      <tr><td>Ctrl + /</td><td>কমপ্লিট অপারেশনাল এসওপি, হেল্প ও ট্রেনিং সহায়িকা</td><td>যেকোনো স্ক্রিনে গাইড দেখতে</td></tr>
      <tr><td>Ctrl + P</td><td>সক্রিয় ইনভয়েস বা চালান সরাসরি প্রিন্ট কমান্ড</td><td>ইনভয়েস ভিউ ও রিপোর্ট পেজ</td></tr>
      <tr><td>F2</td><td>রিটেইল এক্সপ্রেস পিওএস সেলস উইন্ডো ওপেন</td><td>কাউন্টার বিলিং শুরু করতে</td></tr>
      <tr><td>F7</td><td>বকেয়া কালেকশন ও মানি রসিদ উইন্ডো ওপেন</td><td>ডিলারের নগদ/চেক রিসিভ করতে</td></tr>
      <tr><td>F9</td><td>দৈনিক ডে ক্লোজিং ও ক্যাশ কাউন্ট উইন্ডো ওপেন</td><td>দিন শেষে ভল্ট মিলাতে</td></tr>
    </tbody>
  </table>
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
      console.log(`✅ সমৃদ্ধ বাংলা PDF ফাইল সফলভাবে তৈরি হয়েছে: ${outputPdf} (${pdfSize} KB)`);
      console.log(`✅ পাবলিক ফোল্ডারে কপি সম্পন্ন: ${publicPdf}`);
    }
  } catch (err) {
    console.error('❌ PDF তৈরিতে ত্রুটি:', err);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}
