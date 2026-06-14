const API_BASE_URL = "http://localhost:8000";

/**
 * Requests the backend to extract and generate an AI diagnostic tree
 */
export const generateDiagnosticTree = async (productId, symptom, manualText, token) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/trees/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ symptom, manual_text: manualText })
  });
  
  if (!response.ok) {
    throw new Error("Failed to generate diagnostic tree or validation failed.");
  }
  return await response.json();
};

/**
 * Retrieves all diagnostic trees for a specific product
 */
export const getProductTrees = async (productId, token) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/trees`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return await response.json();
};