const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY || "";
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID || "";

export async function getRequests() {
  if (!BIN_ID || !API_KEY) {
    console.warn("JSONBin API credentials missing in environment variables.");
    return [];
  }
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY,
      },
    });
    if (!res.ok) {
      throw new Error(`JSONBin fetch error (${res.status}): ${res.statusText}`);
    }
    const data = await res.json();
    return data.record?.requests || [];
  } catch (err) {
    console.error("Error fetching requests from JSONBin:", err);
    return [];
  }
}

export async function addRequest(requestObj) {
  if (!BIN_ID || !API_KEY) {
    throw new Error("JSONBin API credentials missing. Please configure VITE_JSONBIN_API_KEY and VITE_JSONBIN_BIN_ID.");
  }
  const currentRequests = await getRequests();
  const updatedRequests = [...currentRequests, requestObj];

  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify({ requests: updatedRequests }),
  });

  if (!res.ok) {
    throw new Error(`JSONBin save error (${res.status}): ${res.statusText}`);
  }
  const data = await res.json();
  return data.record?.requests || updatedRequests;
}

export async function updateRequest(id, updates) {
  if (!BIN_ID || !API_KEY) {
    throw new Error("JSONBin API credentials missing. Please configure VITE_JSONBIN_API_KEY and VITE_JSONBIN_BIN_ID.");
  }
  const currentRequests = await getRequests();
  const updatedRequests = currentRequests.map((req) =>
    req.id === id ? { ...req, ...updates } : req
  );

  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify({ requests: updatedRequests }),
  });

  if (!res.ok) {
    throw new Error(`JSONBin update error (${res.status}): ${res.statusText}`);
  }
  const data = await res.json();
  return data.record?.requests || updatedRequests;
}
