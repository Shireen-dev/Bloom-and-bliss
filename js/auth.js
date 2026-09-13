const USER_KEY = "bloomAndBlissUser";

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function logOut() {
  localStorage.removeItem(USER_KEY);
  window.location.href = "index.html";
}

// Shows "Hi, Name" + Log out if signed in, otherwise a Login link.
// Looks for a container with id="authSlot" in the nav.
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

  signInForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;
    const errorEl = document.getElementById("signInError");
    const stored = JSON.parse(localStorage.getItem("bloomAndBlissAccounts") || "{}");
    if (stored[email] && stored[email].password === password) {
      setCurrentUser({ name: stored[email].name, email });
      const params = new URLSearchParams(window.location.search);
window.location.href = params.get("redirect") || "index.html";
    } else {
      errorEl.textContent = "Email or password is incorrect, or no account exists yet — try Create Account.";
      errorEl.hidden = false;
    }
  });

  signUpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signUpName").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value;
    const errorEl = document.getElementById("signUpError");
    if (!name || !email || password.length < 6) {
      errorEl.textContent = "Please fill every field (password needs 6+ characters).";
      errorEl.hidden = false;
      return;
    }
    const stored = JSON.parse(localStorage.getItem("bloomAndBlissAccounts") || "{}");
    stored[email] = { name, password };
    localStorage.setItem("bloomAndBlissAccounts", JSON.stringify(stored));
    setCurrentUser({ name, email });
   const params = new URLSearchParams(window.location.search);
window.location.href = params.get("redirect") || "index.html";
  });
});