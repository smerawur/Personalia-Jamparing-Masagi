const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getToken = () => localStorage.getItem("token");

export const getHolidays = async (year) => {
  const response = await fetch(`${API_BASE_URL}/holidays?year=${year}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch holidays: ${response.statusText}`);
  }
  return await response.json();
};

export const tambahHoliday = async (form) => {
  const response = await fetch(`${API_BASE_URL}/holidays`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: JSON.stringify(form),
  });
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    const error = new Error(errorData.message || "Failed to add holiday");
    error.response = { data: errorData };
    throw error;
  }
  return await response.json();
};

export const hapusHoliday = async (id) => {
  const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete holiday: ${response.statusText}`);
  }
  return await response.json();
};