/**
 * TeleCorp ERP - Hardware Direct Thermal Printer Engine
 * Supports:
 * 1. Web Serial API (USB-to-UART / Virtual COM port thermal printers like Xprinter, TSC, Rongta, POS-58, POS-80)
 * 2. Web Bluetooth API (Bluetooth portable thermal printers like PT-210, MPT-II, Cat/Goojprt, 58mm/80mm BLE)
 * 3. TSPL Protocol (Standard native command set for 50x30mm, 40x25mm Mobile Box Barcode Sticker labels)
 * 4. ESC/POS Protocol (Standard native command set for 58mm & 80mm thermal receipts and barcodes)
 */

export type PrinterProtocol = 'TSPL' | 'ESC_POS';
export type ConnectionType = 'serial' | 'bluetooth';

export interface PrinterDeviceStatus {
  connected: boolean;
  type: ConnectionType | null;
  name: string;
  protocol: PrinterProtocol;
}

export interface LabelPrintItem {
  brandName: string;
  model: string;
  variantDesc: string;
  imei1: string;
  imei2?: string;
  retailPrice: number;
  warrantyPeriodMonths?: number;
  tacCode?: string;
}

export interface ReceiptPrintData {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  warehouseName: string;
  items: Array<{
    name: string;
    imei?: string;
    qty: number;
    price: number;
    total: number;
  }>;
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
}

// Global active port/device handles
let activeSerialPort: any = null;
let activeBluetoothDevice: any = null;
let activeBluetoothCharacteristic: any = null;

/**
 * Check browser support
 */
export const checkHardwareSupport = () => {
  const hasSerial = typeof navigator !== 'undefined' && 'serial' in navigator;
  const hasBluetooth = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  return {
    serial: hasSerial,
    bluetooth: hasBluetooth,
    recommendedBrowser: !hasSerial && !hasBluetooth ? 'Google Chrome or Microsoft Edge (Desktop/Android)' : null
  };
};

/**
 * Connect to USB Thermal Printer via Web Serial API
 */
export const connectSerialPrinter = async (baudRate = 9600): Promise<{ success: boolean; name: string; error?: string }> => {
  if (typeof navigator === 'undefined' || !('serial' in navigator)) {
    return {
      success: false,
      name: '',
      error: 'Web Serial API is not supported in this browser. Please use Google Chrome or MS Edge.'
    };
  }

  try {
    // Request port from user
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate });
    activeSerialPort = port;
    
    // Attempt to get device info
    const info = port.getInfo ? port.getInfo() : {};
    const devName = `USB Thermal (${info.usbVendorId ? `VID:${info.usbVendorId.toString(16)}` : 'COM Port'})`;

    return {
      success: true,
      name: devName
    };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return { success: false, name: '', error: 'কোনো প্রিন্টার পোর্ট নির্বাচন করা হয়নি (Cancelled)।' };
    }
    return { success: false, name: '', error: err.message || 'সিরিয়াল প্রিন্টার সংযুক্ত করতে ব্যর্থ হয়েছে।' };
  }
};

/**
 * Connect to Bluetooth Thermal Printer via Web Bluetooth API
 */
export const connectBluetoothPrinter = async (): Promise<{ success: boolean; name: string; error?: string }> => {
  if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
    return {
      success: false,
      name: '',
      error: 'Web Bluetooth API is not supported in this browser. Please use Chrome on Android, Windows or macOS.'
    };
  }

  try {
    // Known thermal printer BLE service UUIDs
    const optionalServices = [
      '000018f0-0000-1000-8000-00805f9b34fb', // Standard Chinese POS BLE Service
      'e7810a71-73ae-499d-8c15-faa9ae00c31a', // Common Thermal Label Service
      '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Trans
      '0000ff00-0000-1000-8000-00805f9b34fb', // Custom BLE 0xFF00
      '00001801-0000-1000-8000-00805f9b34fb', // Generic Attribute
      '00001800-0000-1000-8000-00805f9b34fb'  // Generic Access
    ];

    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices
    });

    if (!device || !device.gatt) {
      throw new Error('Bluetooth device handle could not be obtained.');
    }

    const server = await device.gatt.connect();

    // Iterate services to find a writable characteristic
    let foundChar: any = null;
    for (const serviceUuid of optionalServices) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            foundChar = char;
            break;
          }
        }
        if (foundChar) break;
      } catch {
        // Continue searching other services
      }
    }

    if (!foundChar) {
      throw new Error('Could not find a writable GATT printing service on this Bluetooth device.');
    }

    activeBluetoothDevice = device;
    activeBluetoothCharacteristic = foundChar;

    return {
      success: true,
      name: device.name || 'Bluetooth Thermal Printer'
    };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return { success: false, name: '', error: 'কোনো ব্লুটুথ ডিভাইস নির্বাচন করা হয়নি (Cancelled)।' };
    }
    return { success: false, name: '', error: err.message || 'ব্লুটুথ প্রিন্টার কানেক্ট করতে ব্যর্থ হয়েছে।' };
  }
};

/**
 * Disconnect any active hardware printer
 */
export const disconnectPrinter = async () => {
  if (activeSerialPort) {
    try {
      await activeSerialPort.close();
    } catch {
      // Ignore cleanup error
    }
    activeSerialPort = null;
  }

  if (activeBluetoothDevice && activeBluetoothDevice.gatt) {
    try {
      activeBluetoothDevice.gatt.disconnect();
    } catch {
      // Ignore cleanup error
    }
    activeBluetoothDevice = null;
    activeBluetoothCharacteristic = null;
  }
};

/**
 * Send raw binary command payload to connected printer
 */
export const sendRawBytesToPrinter = async (
  bytes: Uint8Array
): Promise<{ success: boolean; error?: string }> => {
  if (activeSerialPort) {
    try {
      const writer = activeSerialPort.writable.getWriter();
      await writer.write(bytes);
      writer.releaseLock();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `USB Serial Write Error: ${err.message}` };
    }
  }

  if (activeBluetoothCharacteristic) {
    try {
      // BLE MTU safety: chunk into <= 100 bytes
      const chunkSize = 100;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        if (activeBluetoothCharacteristic.writeValueWithoutResponse) {
          await activeBluetoothCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await activeBluetoothCharacteristic.writeValue(chunk);
        }
        // Small delay between BLE packets
        await new Promise((res) => setTimeout(res, 25));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `Bluetooth Write Error: ${err.message}` };
    }
  }

  return {
    success: false,
    error: 'কোনো প্রিন্টার সংযুক্ত নেই! অনুগ্রহ করে প্রথমে USB অথবা Bluetooth দিয়ে কানেক্ট করুন।'
  };
};

/**
 * -------------------------------------------------------------------
 * TSPL PROTOCOL GENERATORS (Label & Box Sticker Printers)
 * Standard for Xprinter XP-365B, XP-420B, TSC TE244, Zebra, etc.
 * -------------------------------------------------------------------
 */

export const generateTSPLLabelCommands = (
  items: LabelPrintItem[],
  widthMm = 50,
  heightMm = 30
): Uint8Array => {
  const encoder = new TextEncoder();
  let commands = '';

  items.forEach((item) => {
    commands += `SIZE ${widthMm} mm, ${heightMm} mm\r\n`;
    commands += `GAP 2 mm, 0 mm\r\n`;
    commands += `DIRECTION 1\r\n`;
    commands += `CLS\r\n`;

    // Title: Model & Brand
    const title = `${item.brandName} ${item.model}`.substring(0, 24);
    commands += `TEXT 20,20,"3",0,1,1,"${title}"\r\n`;

    // Variant Description
    const variant = item.variantDesc.substring(0, 30);
    commands += `TEXT 20,52,"2",0,1,1,"${variant}"\r\n`;

    // Barcode 128 for IMEI 1
    // Format: BARCODE X,Y,"code type",height,human readable,rotation,narrow,wide,"content"
    commands += `BARCODE 20,78,"128",42,1,0,2,4,"${item.imei1}"\r\n`;

    // Secondary line: IMEI 2 if present
    if (item.imei2) {
      commands += `TEXT 20,138,"1",0,1,1,"IMEI 2: ${item.imei2}"\r\n`;
    }

    // MRP & Warranty
    const mrpText = `MRP: Tk ${item.retailPrice.toLocaleString()}`;
    const warrantyText = `${item.warrantyPeriodMonths || 12}M War`;
    commands += `TEXT 20,160,"2",0,1,1,"${mrpText}"\r\n`;
    commands += `TEXT 240,160,"1",0,1,1,"${warrantyText}"\r\n`;

    // Print 1 copy
    commands += `PRINT 1,1\r\n`;
  });

  return encoder.encode(commands);
};

/**
 * -------------------------------------------------------------------
 * ESC/POS PROTOCOL GENERATORS (Receipt & Thermal Barcode)
 * Standard for POS-58, POS-80, Epson, Xprinter Receipts
 * -------------------------------------------------------------------
 */

export const generateESCPOSLabelCommands = (items: LabelPrintItem[]): Uint8Array => {
  const chunks: number[] = [];
  const append = (bytes: number[]) => chunks.push(...bytes);
  const appendStr = (str: string) => {
    const enc = new TextEncoder().encode(str);
    for (let i = 0; i < enc.length; i++) chunks.push(enc[i]);
  };

  const ESC = 0x1b;
  const GS = 0x1d;

  items.forEach((item) => {
    // Init printer
    append([ESC, 0x40]);

    // Center alignment
    append([ESC, 0x61, 0x01]);

    // Bold title
    append([ESC, 0x45, 0x01]);
    appendStr(`${item.brandName} ${item.model}\n`);
    append([ESC, 0x45, 0x00]);

    appendStr(`${item.variantDesc}\n`);

    // CODE128 Barcode: GS k 73 len bytes
    append([GS, 0x68, 50]); // Height: 50 dots
    append([GS, 0x77, 2]);  // Module width: 2
    append([GS, 0x48, 2]);  // HRI text below barcode

    const imeiBytes = new TextEncoder().encode(item.imei1);
    // GS k 73 (CODE128 standard)
    append([GS, 0x6b, 73, imeiBytes.length + 2, 0x7b, 0x42]); // CODE B prefix
    for (let i = 0; i < imeiBytes.length; i++) append([imeiBytes[i]]);

    append([0x0a]); // Line feed

    // Footer details
    if (item.imei2) {
      appendStr(`IMEI 2: ${item.imei2}\n`);
    }
    append([ESC, 0x45, 0x01]);
    appendStr(`MRP: Tk ${item.retailPrice.toLocaleString()}\n`);
    append([ESC, 0x45, 0x00]);
    appendStr(`TAC Approved | ${item.warrantyPeriodMonths || 12}M Warranty\n`);

    // Feed lines & cut
    append([0x0a, 0x0a]);
    append([GS, 0x56, 0x42, 0x00]); // Partial Cut
  });

  return new Uint8Array(chunks);
};

/**
 * Generate 58mm/80mm ESC/POS Retail Sales Receipt
 */
export const generateESCPOSReceipt = (data: ReceiptPrintData, is80mm = false): Uint8Array => {
  const chunks: number[] = [];
  const append = (bytes: number[]) => chunks.push(...bytes);
  const appendStr = (str: string) => {
    const enc = new TextEncoder().encode(str);
    for (let i = 0; i < enc.length; i++) chunks.push(enc[i]);
  };

  const ESC = 0x1b;
  const GS = 0x1d;
  const colWidth = is80mm ? 48 : 32;

  // Initialize
  append([ESC, 0x40]);

  // Center alignment - Company Header
  append([ESC, 0x61, 0x01]);
  append([ESC, 0x45, 0x01]);
  append([GS, 0x21, 0x11]); // Double height & width
  appendStr("TELECORP ERP\n");
  append([GS, 0x21, 0x00]); // Normal size
  append([ESC, 0x45, 0x00]);
  appendStr("Mobile Wholesale & Retail Hub\n");
  appendStr("Motijheel / Gulshan, Dhaka\n");
  appendStr("Hotline: 01711-002233\n");
  appendStr("-".repeat(colWidth) + "\n");

  // Left alignment - Invoice Info
  append([ESC, 0x61, 0x00]);
  appendStr(`Invoice: ${data.invoiceNo}\n`);
  appendStr(`Date:    ${data.date}\n`);
  appendStr(`Outlet:  ${data.warehouseName}\n`);
  appendStr(`Client:  ${data.customerName}\n`);
  if (data.customerPhone) appendStr(`Phone:   ${data.customerPhone}\n`);
  appendStr("-".repeat(colWidth) + "\n");

  // Items table
  data.items.forEach((item) => {
    append([ESC, 0x45, 0x01]);
    appendStr(`${item.name}\n`);
    append([ESC, 0x45, 0x00]);
    if (item.imei) {
      appendStr(`  IMEI: ${item.imei}\n`);
    }
    const lineRight = `${item.qty} x ${item.price.toLocaleString()} = ${item.total.toLocaleString()}`;
    appendStr(`  ${lineRight}\n`);
  });

  appendStr("-".repeat(colWidth) + "\n");

  // Totals
  append([ESC, 0x61, 0x02]); // Right align
  appendStr(`Sub Total: Tk ${data.subTotal.toLocaleString()}\n`);
  if (data.discount > 0) appendStr(`Discount:  Tk ${data.discount.toLocaleString()}\n`);
  append([ESC, 0x45, 0x01]);
  appendStr(`Grand Total: Tk ${data.grandTotal.toLocaleString()}\n`);
  appendStr(`Paid (${data.paymentMethod}): Tk ${data.paidAmount.toLocaleString()}\n`);
  if (data.dueAmount > 0) {
    appendStr(`Due Amount: Tk ${data.dueAmount.toLocaleString()}\n`);
  }
  append([ESC, 0x45, 0x00]);
  appendStr("-".repeat(colWidth) + "\n");

  // Barcode of invoice
  append([ESC, 0x61, 0x01]); // Center
  append([GS, 0x68, 40]);    // Height
  append([GS, 0x77, 2]);     // Width
  append([GS, 0x48, 2]);     // Text below
  const invBytes = new TextEncoder().encode(data.invoiceNo.replace(/[^A-Za-z0-9]/g, ''));
  append([GS, 0x6b, 73, invBytes.length + 2, 0x7b, 0x42]);
  for (let i = 0; i < invBytes.length; i++) append([invBytes[i]]);
  append([0x0a]);

  // Thank you message
  appendStr("\nThank you for choosing TeleCorp!\n");
  appendStr("Software Generated Authentic Slip\n");

  // Paper feed & cut
  append([0x0a, 0x0a, 0x0a]);
  append([GS, 0x56, 0x42, 0x00]); // Cut

  return new Uint8Array(chunks);
};

/**
 * Generate a calibration test sticker
 */
export const generateTestSticker = (protocol: PrinterProtocol): Uint8Array => {
  const testItem: LabelPrintItem = {
    brandName: 'TeleCorp',
    model: 'Test Calibration',
    variantDesc: '8GB/256GB - Blue',
    imei1: '864912068888999',
    imei2: '864912068888990',
    retailPrice: 28500,
    warrantyPeriodMonths: 12
  };

  if (protocol === 'TSPL') {
    return generateTSPLLabelCommands([testItem], 50, 30);
  }
  return generateESCPOSLabelCommands([testItem]);
};
