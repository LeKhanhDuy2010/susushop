/**
 * Google Apps Script for SuSu Shop App
 * Deploy this as a Web App with "Anyone" access.
 */

const SHEET_ID = '1kDeEiiFPpkS82sSIspAeFSEVO7xIjI0Ggj1820_b7lo'; // Replace with your Sheet ID

function doPost(e) {
  // Keep doPost for standard compatibility
  const data = JSON.parse(e.postData.contents);
  return handleAction(data);
}

function doGet(e) {
  const callback = e.parameter.callback; // Support for JSONP
  const page = e.parameter.page || 'index';

  // Serving HTML Pages
  if (!e.parameter.sheet && !e.parameter.phone && !e.parameter.action) {
    const template = ['index', 'booking', 'equipment'].includes(page) ? page : 'index';
    const title = template === 'index' ? 'Trang Chủ' : (template === 'booking' ? 'Đặt Lịch' : 'Thuê Máy');
    
    return HtmlService.createHtmlOutputFromFile(template)
      .setTitle('SuSu Shop - ' + title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  let results = {};

  // Handle Write Actions (via GET/JSONP for CORS bypass)
  if (e.parameter.action === 'add') {
    const data = {
      sheet: e.parameter.sheet,
      values: JSON.parse(e.parameter.values)
    };
    results = handleAction({ action: 'add', ...data });
  } 
  // Search by Phone functionality
  else if (e.parameter.phone) {
    results = handleSearch(e.parameter.phone);
  } 
  // Read Data functionality
  else {
    results = handleRead(e.parameter.sheet, e.parameter.equipmentName);
  }

  // Final Output
  const jsonString = JSON.stringify(results);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + jsonString + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleAction(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(data.sheet);
  if (!sheet) return { status: 'error', message: 'Sheet not found' };

  // Identification of phone value for formatting
  // Values: [name, phone, service, date, time] or [equipment, user, phone, start, end]
  let phoneValue = "";
  if (data.sheet === 'bookings') phoneValue = data.values[1];
  if (data.sheet === 'rentals') phoneValue = data.values[2];

  // Backend Validation
  if (phoneValue && (phoneValue.toString().length !== 10 || !/^\d+$/.test(phoneValue))) {
    return { status: 'error', message: 'Số điện thoại phải đúng 10 chữ số' };
  }

  // Preserve leading zero by prepending '
  const finalValues = data.values.map(val => {
    if (val === phoneValue) return "'" + val;
    return val;
  });

  const id = new Date().getTime().toString();
  const timestamp = new Date();

  if (data.action === 'add') {
    const row = [id, ...finalValues, 'Pending', timestamp];
    sheet.appendRow(row);
    return { status: 'success', id: id };
  }
  return { status: 'error', message: 'Invalid action' };
}

function handleRead(sheetName, equipmentName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { status: 'error', message: 'Sheet not found' };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  let jsonData = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  if (equipmentName && sheetName === 'rentals') {
    jsonData = jsonData.filter(item => item.equipmentName === equipmentName);
  }
  return jsonData;
}

function handleSearch(phone) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bookingsSheet = ss.getSheetByName('bookings');
  const rentalsSheet = ss.getSheetByName('rentals');
  let searchData = { bookings: [], rentals: [] };
  
  // Fast Search using TextFinder directly in the Sheet
  if (bookingsSheet) {
    const headers = bookingsSheet.getDataRange().getValues()[0];
    const finder = bookingsSheet.createTextFinder(phone).matchEntireCell(true);
    const results = finder.findAll();
    results.forEach(range => {
      const rowNum = range.getRow();
      const rowValues = bookingsSheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
      let obj = {}; headers.forEach((h, i) => obj[h] = rowValues[i]);
      searchData.bookings.push(obj);
    });
  }
  
  if (rentalsSheet) {
    const headers = rentalsSheet.getDataRange().getValues()[0];
    const finder = rentalsSheet.createTextFinder(phone).matchEntireCell(true);
    const results = finder.findAll();
    results.forEach(range => {
      const rowNum = range.getRow();
      const rowValues = rentalsSheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
      let obj = {}; headers.forEach((h, i) => obj[h] = rowValues[i]);
      searchData.rentals.push(obj);
    });
  }
  return searchData;
}
