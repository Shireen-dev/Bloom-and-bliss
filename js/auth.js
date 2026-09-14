const TOKEN_KEY = "bloomAndBlissToken";
const USER_KEY = "bloomAndBlissUser";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function logOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "index.html";
}

function renderAuthSlot() {
  const slot = document.getElementById("authSlot");
  if (!slot) return;
  const user = getCurrentUser();
  if (user) {
    slot.innerHTML = `
      <span class="auth-greeting">Hi, ${user.name.split(" ")[0]}</span>
      <button type="button" class="btn btn--outline btn--small" id="logOutBtn">Log Out</button>
    `;
    document.getElementById("logOutBtn").addEventListener("click", logOut);
  } else {
    slot.innerHTML = `<a href="login.html" class="btn btn--outline btn--small">Login</a>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderAuthSlot();

  const tabSignIn = document.getElementById("tabSignIn");
  const tabSignUp = document.getElementById("tabSignUp");
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  if (!tabSignIn) return; // not on login.html

  tabSignIn.addEventListener("click", () => {
    tabSignIn.classList.add("is-active");
    tabSignUp.classList.remove("is-active");
    signInForm.hidden = false;
    signUpForm.hidden = true;
  });
  tabSignUp.addEventListener("click", () => {
    tabSignUp.classList.add("is-active");
    tabSignIn.classList.remove("is-active");
    signUpForm.hidden = false;
    signInForm.hidden = true;
  });

  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;
    const errorEl = document.getElementById("signInError");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setSession(data.token, data.user);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("redirect") || "index.html";
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  });

  signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signUpName").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value;
    const errorEl = document.getElementById("signUpError");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      setSession(data.token, data.user);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("redirect") || "index.html";
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  });
});