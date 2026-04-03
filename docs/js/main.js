(function attachMainScope() {
  const { closeModal, state } = window.HospitalShared;
  const { login, logout, registerStaff, showApp, switchAuthTab, togglePassword } = window.HospitalAuth;
  const pages = window.HospitalPages;

  Object.assign(window, {
    ...pages,
    closeModal,
    logout,
    switchAuthTab,
    togglePassword,
  });

  window.login = async () => {
    const button = document.getElementById("login-btn");
    const error = document.getElementById("login-error");

    try {
      const success = await login();
      if (success) {
        await showApp(pages.showPage);
      }
    } catch (exception) {
      error.textContent = "Unable to sign in right now";
      error.style.display = "block";
      button.disabled = false;
      button.textContent = "Sign In";
      console.error(exception);
    }
  };

  window.registerStaff = registerStaff;

  window.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const authVisible = document.getElementById("auth-page").style.display !== "none";
      if (authVisible) {
        const activeTab = document.getElementById("tab-login").classList.contains("active");
        if (activeTab) {
          window.login();
        } else {
          registerStaff();
        }
      }
    }

    if (event.key === "Escape") {
      closeModal();
    }
  });

  if (state.token) {
    showApp(pages.showPage);
  }
})();
