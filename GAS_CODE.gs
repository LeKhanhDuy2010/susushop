/**
 * Google Apps Script for SuSu Shop (React Backend)
 * 
 * Cấu trúc Sheets cần thiết:
 * 
 * 1. Sheet "bookings":
 * [ID, Họ tên, SĐT, Dịch vụ, Ngày, Giờ, Trạng thái, Thời gian tạo]
 * 
 * 2. Sheet "rentals":
 * [ID, Tên máy, Tên khách, SĐT, Gói thuê, Tổng tiền, Ngày bắt đầu, Trạng thái, Thời gian tạo]
 * 
 * 3. Sheet "equipment":
 * [id, name, price4h, price1d, price2d, price3d, desc, image]
 */

const SHEET_ID = '1kDeEiiFPpkS82sSIspAeFSEVO7xIjI0Ggj1820_b7lo'; // ID của Google Sheet

function doGet(e) {
  const callback = e.parameter.callback;
  let results = {};

  try {
    // 1. Thêm mới dữ liệu (Booking / Rental)
    if (e.parameter.action === 'add') {
      results = handleAddAction(e.parameter.sheet, JSON.parse(e.parameter.values));
    } 
    // 2. Tra cứu theo số điện thoại
    else if (e.parameter.phone) {
      results = handleSearch(e.parameter.phone);
    } 
    // 3. Đọc danh sách (Equipment / Rentals)
    else if (e.parameter.sheet) {
      results = handleRead(e.parameter.sheet, e.parameter.equipmentName);
    } 
    else {
      results = { status: 'error', message: 'Tham số không hợp lệ' };
    }
  } catch (error) {
    results = { status: 'error', message: error.toString() };
  }

  // Trả về JSONP để bypass CORS
  const jsonString = JSON.stringify(results);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + jsonString + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(jsonString)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý thêm mới row vào Sheet
 */
function handleAddAction(sheetName, values) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: 'error', message: 'Không tìm thấy Sheet: ' + sheetName };

  // Xác định vị trí cột điện thoại để validate và format
  // Bookings: [name, phone, service, date, time] -> Index 1
  // Rentals: [equipmentName, userName, phone, package, totalPrice, startDate] -> Index 2
  let phoneIndex = (sheetName === 'bookings') ? 1 : 2;
  let phoneValue = values[phoneIndex];

  // Validation SĐT
  if (!phoneValue || phoneValue.toString().length !== 10 || !/^\d+$/.test(phoneValue)) {
    return { status: 'error', message: 'Số điện thoại không hợp lệ (phải đủ 10 số)' };
  }

  // Format SĐT để không bị mất số 0
  const finalValues = values.map((val, idx) => {
    if (idx === phoneIndex) return "'" + val;
    return val;
  });

  const id = "ID-" + new Date().getTime();
  const timestamp = new Date();
  
  // Row structure: [ID, ...Dữ liệu ứng dụng, Trạng thái, Thời gian tạo]
  const rowData = [id, ...finalValues, "Chờ xác nhận", timestamp];
  sheet.appendRow(rowData);

  return { status: 'success', id: id };
}

/**
 * Đọc dữ liệu từ Sheet chuyển thành JSON
 */
function handleRead(sheetName, equipmentName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];

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

  // Lọc riêng cho phần rentals khi cần xem lịch bận của 1 máy cụ thể
  if (equipmentName && sheetName === 'rentals') {
    jsonData = jsonData.filter(item => item.equipmentName === equipmentName);
  }

  return jsonData;
}

/**
 * Tra cứu lịch sử đặt chỗ/thuê máy theo SĐT
 */
function handleSearch(phone) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['bookings', 'rentals'];
  let searchData = { bookings: [], rentals: [] };

  sheets.forEach(sName => {
    const sheet = ss.getSheetByName(sName);
    if (sheet) {
      const headers = sheet.getDataRange().getValues()[0];
      const finder = sheet.createTextFinder(phone).matchEntireCell(true);
      const results = finder.findAll();
      
      results.forEach(range => {
        const rowNum = range.getRow();
        const rowValues = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
        let obj = {};
        headers.forEach((h, i) => {
          // Format date/timestamp nếu cần
          let val = rowValues[i];
          if (val instanceof Date) val = Utilities.formatDate(val, "GMT+7", "yyyy-MM-dd HH:mm");
          obj[h] = val;
        });
        searchData[sName].push(obj);
      });
    }
  });

  return searchData;
}
