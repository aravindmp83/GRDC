// Replace this with the URL you get after deploying your Google Apps Script as a Web App
// Make sure to execute it as "Me" and access "Anyone"
export const API_URL = import.meta.env.VITE_GAS_URL || "https://script.google.com/macros/s/AKfycbyjUD5R-uP6Jn_OKpfomLrCtIFaq27AqfAb93Q460-ZUt4vxJZrL4aUBKhdrguXr9Zr/exec";

export async function login(storeCode) {
  try {
    const response = await fetch(`${API_URL}?storeCode=${encodeURIComponent(storeCode)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Network error occurred while logging in." };
  }
}

export async function updateLineItem(storeCode, material, updates) {
  try {
    // We send a text/plain POST request to avoid CORS preflight issues with Google Apps Script
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        storeCode,
        material,
        updates,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Network error occurred while saving." };
  }
}
