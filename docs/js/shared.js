(function attachSharedScope() {
  const API =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? "http://localhost:5000/api"
      : "https://hospital-workflow-tracker.onrender.com/api";

  const state = {
    token: localStorage.getItem("jwt") || null,
    currentUser: null,
    allStaff: [],
    allPatients: [],
    currentFilter: { patients: "admitted", tasks: "pending", beds: null },
  };

  const STATUS_COLORS = {
    admitted: { bg: "#E8F4F9", color: "#0D3D52" },
    discharged: { bg: "#F3F4F6", color: "#6B7280" },
    critical: { bg: "#FEE2E2", color: "#B91C1C" },
    transferred: { bg: "#FEF3C7", color: "#B45309" },
    available: { bg: "#E6F4EC", color: "#2E7D52" },
    occupied: { bg: "#FEE2E2", color: "#B91C1C" },
    cleaning: { bg: "#FEF3C7", color: "#B45309" },
    maintenance: { bg: "#F3F4F6", color: "#6B7280" },
    pending: { bg: "#F3F4F6", color: "#6B7280" },
    in_progress: { bg: "#E8F4F9", color: "#0D3D52" },
    completed: { bg: "#E6F4EC", color: "#2E7D52" },
    cancelled: { bg: "#FEE2E2", color: "#B91C1C" },
    low: { bg: "#F3F4F6", color: "#6B7280" },
    medium: { bg: "#E8F4F9", color: "#0D3D52" },
    high: { bg: "#FEF3C7", color: "#B45309" },
    urgent: { bg: "#FEE2E2", color: "#B91C1C" },
    morning: { bg: "#FEF3C7", color: "#B45309" },
    afternoon: { bg: "#E8F4F9", color: "#0D3D52" },
    night: { bg: "#EEEDFE", color: "#3C3489" },
    admin: { bg: "#EEEDFE", color: "#3C3489" },
    doctor: { bg: "#E6F1FB", color: "#0C447C" },
    nurse: { bg: "#E6F4EC", color: "#2E7D52" },
  };

  function badge(status) {
    const colors = STATUS_COLORS[status] || { bg: "#F3F4F6", color: "#6B7280" };
    return `<span class="badge" style="background:${colors.bg};color:${colors.color}">${status?.replace("_", " ") || "—"}</span>`;
  }

  function setToken(token) {
    state.token = token;
    if (token) {
      localStorage.setItem("jwt", token);
    } else {
      localStorage.removeItem("jwt");
    }
  }

  function resetSession() {
    setToken(null);
    state.currentUser = null;
    state.allStaff = [];
    state.allPatients = [];
  }

  function hasRole(...roles) {
    return roles.includes(state.currentUser?.role);
  }

  function canManagePatients() {
    return hasRole("admin", "doctor");
  }

  function canManageBeds() {
    return hasRole("admin");
  }

  function canManageTasks() {
    return hasRole("admin", "doctor", "nurse");
  }

  function canManageStaff() {
    return hasRole("admin");
  }

  function canManageShifts() {
    return hasRole("admin", "doctor");
  }

  async function api(path, options = {}) {
    try {
      const response = await fetch(API + path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
          ...(options.headers || {}),
        },
      });

      const text = await response.text();
      if (!text) {
        return response.ok ? {} : { message: "Unexpected empty response" };
      }

      try {
        return JSON.parse(text);
      } catch (error) {
        return {
          message: response.ok ? "Unexpected response from server" : text,
        };
      }
    } catch (error) {
      return { message: "Network error — check your connection" };
    }
  }

  function getMainContent() {
    return document.getElementById("main-content");
  }

  function setSidebarUser() {
    document.getElementById("sidebar-name").textContent = state.currentUser?.name || "—";
    document.getElementById("sidebar-role").textContent = state.currentUser?.role || "—";
  }

  function openModal(title, bodyHTML, actions = []) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = bodyHTML;
    document.getElementById("modal-actions").innerHTML = actions
      .map(
        action =>
          `<button class="btn ${action.cls || ""}" onclick="${action.fn}">${action.label}</button>`,
      )
      .join("");
    document.getElementById("modal-overlay").style.display = "flex";
  }

  function closeModal(event) {
    if (!event || event.target === document.getElementById("modal-overlay")) {
      document.getElementById("modal-overlay").style.display = "none";
    }
  }

  window.HospitalShared = {
    API,
    STATUS_COLORS,
    api,
    badge,
    canManageBeds,
    canManagePatients,
    canManageShifts,
    canManageStaff,
    canManageTasks,
    closeModal,
    getMainContent,
    hasRole,
    openModal,
    resetSession,
    setSidebarUser,
    setToken,
    state,
  };
})();
