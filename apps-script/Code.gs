const SHEET_NAME = "Sheet1"; // Change this if your sheet has a different name (e.g., "Data" or "Form Responses")

function doGet(e) {
  // CORS Headers are managed by ContentService
  const storeCode = e.parameter.storeCode;
  
  if (!storeCode) {
    return respond({ success: false, error: "Store code is required" });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
     return respond({ success: false, error: `Sheet named '${SHEET_NAME}' not found.` });
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const results = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowStoreCode = String(row[headers.indexOf('Store_Code')]).trim();
    
    if (rowStoreCode === String(storeCode).trim()) {
      const item = {};
      headers.forEach((header, index) => {
        // Handle dates properly if needed, otherwise grab value
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
    const { storeCode, material, updates } = payload;
    
    if (!storeCode || !material || !updates) {
      return respond({ success: false, error: "Missing storeCode, material, or updates" });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
       return respond({ success: false, error: `Sheet named '${SHEET_NAME}' not found.` });
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const storeCodeIndex = headers.indexOf('Store_Code');
    const materialIndex = headers.indexOf('Material');
    
    let targetRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][storeCodeIndex]).trim() === String(storeCode).trim() && 
          String(data[i][materialIndex]).trim() === String(material).trim()) {
        targetRowIndex = i + 1; // 1-based index in Google Sheets
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      return respond({ success: false, error: "Row not found for the given Store Code and Material" });
    }

    // Write updates back to the sheet
    Object.keys(updates).forEach(headerName => {
      const colIndex = headers.indexOf(headerName);
      if (colIndex !== -1) {
        sheet.getRange(targetRowIndex, colIndex + 1).setValue(updates[headerName]);
      } else {
        // If the header doesn't exist yet, we can optionally append the header or just log it.
        // For now, we skip missing columns.
      }
    });
    
    return respond({ success: true });
  } catch (error) {
    return respond({ success: false, error: error.toString() });
  }
}

// Helper to return JSON responses with correct MIME type
function respond(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
