/**
 * Google Apps Script API - SuSu Shop (Clean Version)
 */

const SHEET_ID = '1kDeEiiFPpkS82sSIspAeFSEVO7xIjI0Ggj1820_b7lo';

/**
 * ENTRY POINT
 */
function doGet(e) {
  const callback = e.parameter.callback;
  let result = {};

  try {
    if (e.parameter.action === 'add') {
      result = handleAdd(e.parameter.sheet, JSON.parse(e.parameter.values));
    } 
    else if (e.parameter.phone) {
      result = handleSearch(String(e.parameter.phone));
    } 
    else if (e.parameter.sheet) {
      result = handleRead(e.parameter.sheet, e.parameter.equipmentName);
    } 
    else {
      result = { status: 'error', message: 'Invalid parameters' };
    }

  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }

  return responseJSON(result, callback);
}

/**
 * RESPONSE HANDLER (JSON / JSONP)
 */
function responseJSON(data, callback) {
  const json = JSON.stringify(data);

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${json})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ADD DATA (Booking / Rental)
 */
function handleAdd(sheetName, values) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { status: 'error', message: `Sheet not found: ${sheetName}` };
  }

  // Xác định vị trí phone
  const phoneIndex = (sheetName === 'bookings') ? 1 : 2;
  let phone = String(values[phoneIndex] || '').trim();

  // Validate SĐT
  if (!/^\d{10}$/.test(phone)) {
    return { status: 'error', message: 'SĐT phải đủ 10 số' };
  }

  // Chuẩn hóa tất cả về string (QUAN TRỌNG)
  const normalizedValues = values.map((v, idx) => {
    if (idx === phoneIndex) return phone;
    return v;
  });

  const id = `ID-${Date.now()}`;
  const timestamp = new Date();

  const row = [id, ...normalizedValues, 'Chờ xác nhận', timestamp];

  // 👉 set format TEXT cho cột phone trước khi ghi
  const nextRow = sheet.getLastRow() + 1;
  const phoneCol = phoneIndex + 2; // +1 ID +1 index

  sheet.getRange(nextRow, phoneCol).setNumberFormat('@');

  sheet.appendRow(row);

  return { status: 'success', id };
}

/**
 * READ DATA
 */
function handleRead(sheetName, equipmentName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  let result = rows.map(row => mapRow(headers, row));

  // Filter rentals theo equipment
  if (equipmentName && sheetName === 'rentals') {
    result = result.filter(r => r.equipmentName === equipmentName);
  }

  return result;
}

/**
 * SEARCH BY PHONE
 */
function handleSearch(phone) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheets = ['bookings', 'rentals'];

  let result = { bookings: [], rentals: [] };

  sheets.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowPhone = String(row[getPhoneIndex(name)] || '');

      if (rowPhone === phone) {
        result[name].push(mapRow(headers, row));
      }
    }
  });

  return result;
}

/**
 * MAP ROW → OBJECT (FIX ALL TYPE BUG)
 */
function mapRow(headers, row) {
  let obj = {};

  headers.forEach((h, i) => {
    let val = row[i];

    // Fix Date
    if (val instanceof Date) {
      val = Utilities.formatDate(val, "GMT+7", "yyyy-MM-dd HH:mm");
    }

    // Fix Phone luôn là string
    if (h.toLowerCase().includes('sđt') || h.toLowerCase().includes('phone')) {
      val = String(val);
    }

    obj[h] = val;
  });

  return obj;
}

/**
 * GET PHONE INDEX
 */
function getPhoneIndex(sheetName) {
  return sheetName === 'bookings' ? 2 : 3; 
  // vì có thêm cột ID ở đầu
}