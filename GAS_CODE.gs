/**
 * Google Apps Script API - SuSu Shop (Optimized Version)
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
 * RESPONSE (JSON / JSONP)
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
 * ADD DATA (FAST + SAFE)
 */
function handleAdd(sheetName, values) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { status: 'error', message: `Sheet not found: ${sheetName}` };
  }

  const phoneIndex = (sheetName === 'bookings') ? 1 : 2;
  let phone = String(values[phoneIndex] || '').trim();

  if (!/^\d{10}$/.test(phone)) {
    return { status: 'error', message: 'SĐT phải đủ 10 số' };
  }

  const normalizedValues = values.map((v, idx) => {
    if (idx === phoneIndex) return phone;
    return v;
  });

  const id = `ID-${Date.now()}`;
  const timestamp = new Date();
  const row = [id, ...normalizedValues, 'Chờ xác nhận', timestamp];

  // 👉 set TEXT format cho SĐT
  const nextRow = sheet.getLastRow() + 1;
  const phoneCol = phoneIndex + 2;
  sheet.getRange(nextRow, phoneCol).setNumberFormat('@');

  sheet.appendRow(row);

  // ❗ clear cache liên quan
  clearCache(sheetName);
  clearCache('search');

  return { status: 'success', id };
}

/**
 * READ (CÓ CACHE)
 */
function handleRead(sheetName, equipmentName) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `READ_${sheetName}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    return filterData(data, sheetName, equipmentName);
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) return [];

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const result = rows.map(row => mapRow(headers, row));

  // 👉 cache lâu hơn cho equipment và options
  const ttl = (sheetName === 'equipment' || sheetName === 'options') ? 300 : 60;
  cache.put(cacheKey, JSON.stringify(result), ttl);

  return filterData(result, sheetName, equipmentName);
}

function filterData(data, sheetName, equipmentName) {
  if (equipmentName && sheetName === 'rentals') {
    return data.filter(r => r.equipmentName === equipmentName);
  }
  return data;
}

/**
 * SEARCH (CÓ CACHE)
 */
function handleSearch(phone) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `SEARCH_${phone}`;

  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheets = ['bookings', 'rentals'];

  let result = { bookings: [], rentals: [] };

  sheets.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < 2) return;

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowPhone = String(row[getPhoneIndex(name)] || '');

      if (rowPhone === phone) {
        result[name].push(mapRow(headers, row));
      }
    }
  });

  cache.put(cacheKey, JSON.stringify(result), 30);

  return result;
}

/**
 * MAP ROW → OBJECT (FIX TYPE)
 */
function mapRow(headers, row) {
  let obj = {};

  headers.forEach((h, i) => {
    let val = row[i];

    if (val instanceof Date) {
      val = Utilities.formatDate(val, "GMT+7", "yyyy-MM-dd HH:mm");
    }

    if (h.toLowerCase().includes('sđt') || h.toLowerCase().includes('phone')) {
      val = String(val);
    }

    obj[h] = val;
  });

  return obj;
}

/**
 * GET PHONE INDEX (THEO STRUCTURE)
 */
function getPhoneIndex(sheetName) {
  if (sheetName === 'bookings') return 2;
  if (sheetName === 'rentals') return 3;
  return -1;
}

/**
 * CLEAR CACHE
 */
function clearCache(type) {
  const cache = CacheService.getScriptCache();

  if (type === 'search') {
    // Không thể clear từng key → bỏ qua hoặc dùng version key
    return;
  }

  cache.remove(`READ_${type}`);
}