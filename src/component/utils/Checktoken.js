import jwtDecode from "jwt-decode";

export function checkToken() {

  const token = localStorage.getItem("token");

  if (!token) return;

  const decoded = jwtDecode(token);

  const now = Date.now() / 1000;

  if (decoded.exp < now) {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  }
}