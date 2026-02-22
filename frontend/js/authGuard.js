/**
 * authGuard.js — Include in all protected pages.
 * Redirects to login if no token found in localStorage.
 */
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

if (!token || !user) {
  window.location.href = "login.html";
}