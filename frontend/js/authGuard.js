
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

if (!token || !user) {
  window.location.href = "login.html";
}