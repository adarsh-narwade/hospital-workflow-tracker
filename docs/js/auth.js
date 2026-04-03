(function attachAuthScope() {
  const { api, resetSession, setSidebarUser, setToken, state } = window.HospitalShared;

  function switchAuthTab(tab) {
    document.getElementById("tab-login").classList.toggle("active", tab === "login");
    document.getElementById("tab-register").classList.toggle("active", tab === "register");
    document.getElementById("login-form").style.display = tab === "login" ? "block" : "none";
    document.getElementById("register-form").style.display = tab === "register" ? "block" : "none";
  }

  function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) {
      return;
    }

    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";

    if (button) {
      button.textContent = shouldShow ? "Hide" : "Show";
    }
  }

  async function login() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const button = document.getElementById("login-btn");
    const error = document.getElementById("login-error");

    if (!email || !password) {
      error.textContent = "Please fill in all fields";
      error.style.display = "block";
      return false;
    }

    button.disabled = true;
    button.textContent = "Signing in...";
    error.style.display = "none";

    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      setToken(data.token);
      state.currentUser = data.user;
      return true;
    }

    error.textContent = data.message || "Login failed";
    error.style.display = "block";
    button.disabled = false;
    button.textContent = "Sign In";
    return false;
  }

  async function registerStaff() {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const role = document.getElementById("reg-role").value;
    const department = document.getElementById("reg-dept").value.trim();
    const error = document.getElementById("reg-error");
    const success = document.getElementById("reg-success");

    error.style.display = "none";
    success.style.display = "none";

    if (!name || !email || !password) {
      error.textContent = "Please fill in all required fields";
      error.style.display = "block";
      return;
    }

    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, department }),
    });

    if (data.token || data.user) {
      success.textContent = `Account created for ${name}!`;
      success.style.display = "block";
      document.getElementById("reg-name").value = "";
      document.getElementById("reg-email").value = "";
      document.getElementById("reg-password").value = "";
      document.getElementById("reg-dept").value = "";
      return;
    }

    error.textContent = data.message || "Registration failed";
    error.style.display = "block";
  }

  function logout() {
    resetSession();
    document.getElementById("auth-page").style.display = "flex";
    document.getElementById("app-page").style.display = "none";
  }

  async function showApp(showInitialPage) {
    document.getElementById("auth-page").style.display = "none";
    document.getElementById("app-page").style.display = "block";

    if (!state.currentUser) {
      const data = await api("/auth/me");
      state.currentUser = data.user;
    }

    setSidebarUser();

    const [staffData, patientData] = await Promise.all([
      api("/staff"),
      api("/patients?status=admitted"),
    ]);

    state.allStaff = Array.isArray(staffData) ? staffData : [];
    state.allPatients = Array.isArray(patientData) ? patientData : [];

    showInitialPage("dashboard");
  }

  window.HospitalAuth = {
    login,
    logout,
    registerStaff,
    showApp,
    switchAuthTab,
    togglePassword,
  };
})();
