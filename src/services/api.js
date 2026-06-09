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

export async function fetchCMData() {
  try {
    const response = await fetch(`${API_URL}?cmView=true`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("CM Fetch Error:", error);
    return { success: false, error: "Network error occurred while fetching CM data." };
  }
}

export async function updateLineItem(storeCode, material, updates) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ storeCode, material, updates }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error occurred while saving." };
  }
}

export async function batchUpdateLineItems(batchArray) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ batch: batchArray }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Network error occurred while batch saving." };
  }
}
