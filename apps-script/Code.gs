const SHEET_NAME = "Sheet1";

function doGet(e) {
  const storeCode = e.parameter.storeCode;
  const cmView = e.parameter.cmView === 'true';
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
     return respond({ success: false, error: `Sheet named '${SHEET_NAME}' not found.` });
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  if (cmView) {
    const allItems = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip empty rows by checking the first column
      if (!row[0]) continue;
      
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      allItems.push(item);
    }
    return respond({ success: true, items: allItems });
  }

  if (!storeCode) {
    return respond({ success: false, error: "Store code is required" });
  }

  const results = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowStoreCode = String(row[headers.indexOf('Store_Code')]).trim();
    
    if (rowStoreCode === String(storeCode).trim()) {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      results.push(item);
    }
  }
  
  if (results.length > 0) {
    return respond({ success: true, storeName: results[0]['Store_Name'], items: results });
  } else {
    return respond({ success: false, error: "Store not found or no items for this store." });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
       return respond({ success: false, error: `Sheet named '${SHEET_NAME}' not found.` });
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const storeCodeIndex = headers.indexOf('Store_Code');
    const materialIndex = headers.indexOf('Material');

    // Batch update support
    if (payload.batch && Array.isArray(payload.batch)) {
      payload.batch.forEach(updateItem => {
        const { storeCode, material, updates } = updateItem;
        if (!storeCode || !material || !updates) return;

        let targetRowIndex = -1;
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][storeCodeIndex]).trim() === String(storeCode).trim() && 
              String(data[i][materialIndex]).trim() === String(material).trim()) {
            targetRowIndex = i + 1;
            break;
          }
        }
        
        if (targetRowIndex !== -1) {
          Object.keys(updates).forEach(headerName => {
            const colIndex = headers.indexOf(headerName);
            if (colIndex !== -1) {
              sheet.getRange(targetRowIndex, colIndex + 1).setValue(updates[headerName]);
            }
          });
        }
      });
      return respond({ success: true });
    }
    
    // Single update fallback
    const { storeCode, material, updates } = payload;
    if (!storeCode || !material || !updates) {
      return respond({ success: false, error: "Missing required fields" });
    }
    
    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][storeCodeIndex]).trim() === String(storeCode).trim() && 
          String(data[i][materialIndex]).trim() === String(material).trim()) {
        targetRowIndex = i + 1;
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      return respond({ success: false, error: "Row not found" });
    }

    Object.keys(updates).forEach(headerName => {
      const colIndex = headers.indexOf(headerName);
      if (colIndex !== -1) {
        sheet.getRange(targetRowIndex, colIndex + 1).setValue(updates[headerName]);
      }
    });
    
    return respond({ success: true });
  } catch (error) {
    return respond({ success: false, error: error.toString() });
  }
}

function respond(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
