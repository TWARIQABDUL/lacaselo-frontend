import * as jwtDecode from "jwt-decode";

export function checkToken() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      // Token expired, remove auth info
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }
}