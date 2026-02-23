const guardToken = localStorage.getItem("token");
const guardUser = localStorage.getItem("user");

if (!guardToken || !guardUser) {
  window.location.href = "login.html";
}

function getAuthHeaders() {
  return {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  };
}