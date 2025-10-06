document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");

  // SIGNUP
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!name || !email || !password) return alert("Please fill all fields!");

      localStorage.setItem("user", JSON.stringify({ name, email, password }));
      alert("Account created successfully!");
      window.location.href = "signin.html";
    });
  }

  // SIGNIN
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("signinEmail").value.trim();
      const password = document.getElementById("signinPassword").value.trim();
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) return alert("No account found! Please sign up first.");
      if (email === user.email && password === user.password) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", user.name);
        alert(`Welcome back, ${user.name}!`);
        window.location.href = "taskmanager.html";
      } else {
        alert("Invalid credentials!");
      }
    });
  }

  // Redirect check on protected page
  if (window.location.pathname.includes("taskmanager.html")) {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) window.location.href = "signin.html";
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      alert("You’ve been logged out 🌙");
      window.location.href = "signin.html";
    });
  }
});
