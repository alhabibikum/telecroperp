import { formatBDT } from './formatters';

interface WhatsAppInvoiceData {
  invoiceNo: string;
  customerName: string;
  mobile?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  items?: Array<{ productName: string; quantity: number; unitPrice: number }>;
  date?: string;
}

export function generateWhatsAppInvoiceMessage(data: WhatsAppInvoiceData): string {
  const dateStr = data.date || new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let message = `*টেলিকর্প ইআরপি - ক্যাশ মেমো / ইনভয়েস* 📱\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📄 *মেমো নং:* ${data.invoiceNo}\n`;
  message += `👤 *গ্রাহক / ডিলার:* ${data.customerName}\n`;
  message += `📅 *তারিখ:* ${dateStr}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;

  if (data.items && data.items.length > 0) {
    message += `*আইটেম বিবরণ:*\n`;
    data.items.slice(0, 10).forEach((it, idx) => {
      message += `${idx + 1}. ${it.productName} (${it.quantity}টি) - ${formatBDT(it.quantity * it.unitPrice)}\n`;
    });
    if (data.items.length > 10) {
      message += `... এবং আরও ${data.items.length - 10}টি আইটেম\n`;
    }
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
  }

  message += `💰 *মোট বিল:* ${formatBDT(data.totalAmount)}\n`;
  message += `💵 *পরিশোধিত:* ${formatBDT(data.paidAmount)}\n`;
  message += `📌 *বর্তমান বাকি:* ${formatBDT(data.dueAmount)}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `ধন্যবাদ আমাদের সাথে থাকার জন্য! 🙏`;

  return message;
}

export function shareInvoiceViaWhatsApp(data: WhatsAppInvoiceData): void {
  const text = generateWhatsAppInvoiceMessage(data);
  let cleanMobile = (data.mobile || '').replace(/[^0-9]/g, '');

  if (cleanMobile.startsWith('01')) {
    cleanMobile = '88' + cleanMobile;
  } else if (!cleanMobile.startsWith('8801') && cleanMobile.length === 11) {
    cleanMobile = '88' + cleanMobile;
  }

  const url = cleanMobile
    ? `https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
