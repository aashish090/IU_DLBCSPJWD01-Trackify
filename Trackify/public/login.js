document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  document.getElementById("loginResponse").innerText = data.message;

  if (res.ok) {
    window.location.href = "/dashboard.html";
    console.log("User ID:", data.userId);
    localStorage.setItem("userId", data.userId); // save session
  }
});
