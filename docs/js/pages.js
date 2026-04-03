(function attachPagesScope() {
  const {
    api,
    badge,
    canManageBeds,
    canManagePatients,
    canManageShifts,
    canManageStaff,
    canManageTasks,
    closeModal,
    getMainContent,
    openModal,
    state,
  } = window.HospitalShared;

  const TYPE_ICONS = {
    medication: "💊",
    lab_order: "🧪",
    procedure: "🩺",
    general: "📋",
    emergency: "🚑",
  };

  const BED_ICONS = {
    available: "🟢",
    occupied: "🔴",
    cleaning: "🟡",
    maintenance: "⚫",
  };

  function showPage(page) {
    const pages = {
      dashboard: renderDashboard,
      patients: renderPatients,
      beds: renderBeds,
      tasks: renderTasks,
      staff: renderStaff,
      shifts: renderShifts,
    };

    document.querySelectorAll(".nav-item").forEach(element => element.classList.remove("active"));
    const nav = document.getElementById(`nav-${page}`);
    if (nav) {
      nav.classList.add("active");
    }
    if (pages[page]) {
      pages[page]();
    }
  }

  async function renderDashboard() {
    const main = getMainContent();
    main.innerHTML = `<div class="page-title">Dashboard</div><div class="loading">Loading stats...</div>`;

    const [patients, beds, tasks, criticalPatients] = await Promise.all([
      api("/patients?status=admitted"),
      api("/beds?status=available"),
      api("/tasks?status=pending"),
      api("/patients?status=critical"),
    ]);

    const criticalCount = Array.isArray(criticalPatients) ? criticalPatients.length : 0;

    main.innerHTML = `
      <div class="page-title">Good day, ${state.currentUser?.name || ""}!</div>
      <div class="stats-grid">
        <div class="stat-card" style="border-color:#1B5E7B" onclick="showPage('patients')">
          <div class="stat-value" style="color:#1B5E7B">${Array.isArray(patients) ? patients.length : 0}</div>
          <div class="stat-label">Admitted Patients</div>
        </div>
        <div class="stat-card" style="border-color:#B91C1C" onclick="showPage('patients')">
          <div class="stat-value" style="color:#B91C1C">${criticalCount}</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat-card" style="border-color:#2E7D52" onclick="showPage('beds')">
          <div class="stat-value" style="color:#2E7D52">${Array.isArray(beds) ? beds.length : 0}</div>
          <div class="stat-label">Available Beds</div>
        </div>
        <div class="stat-card" style="border-color:#B45309" onclick="showPage('tasks')">
          <div class="stat-value" style="color:#B45309">${Array.isArray(tasks) ? tasks.length : 0}</div>
          <div class="stat-label">Pending Tasks</div>
        </div>
      </div>
      <div class="content-card">
        <div class="card-header"><div class="card-header-title">Recent Admitted Patients</div></div>
        <table>
          <thead><tr><th>Name</th><th>Ward</th><th>Diagnosis</th><th>Status</th><th>Admitted</th></tr></thead>
          <tbody>
            ${
              Array.isArray(patients) && patients.length > 0
                ? patients
                    .slice(0, 5)
                    .map(
                      patient => `<tr>
                  <td><strong>${patient.name}</strong></td>
                  <td>${patient.ward}</td>
                  <td>${patient.diagnosis || "—"}</td>
                  <td>${badge(patient.status)}</td>
                  <td>${new Date(patient.admittedAt).toLocaleDateString()}</td>
                </tr>`,
                    )
                    .join("")
                : `<tr><td colspan="5" class="empty">No admitted patients</td></tr>`
            }
          </tbody>
        </table>
      </div>`;
  }

  async function renderPatients(filter = state.currentFilter.patients) {
    state.currentFilter.patients = filter;
    const main = getMainContent();
    main.innerHTML = `<div class="page-title">Patients</div><div class="loading">Loading...</div>`;

    const patients = await api(`/patients?status=${filter}`);

    main.innerHTML = `
      <div class="page-title">Patients</div>
      <div id="patient-form-container"></div>
      <div class="content-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <div class="card-header-title">All Patients</div>
            ${
              canManagePatients()
                ? `<button class="action-btn" style="background:#1B5E7B;color:white;padding:8px 16px;font-size:13px" onclick="togglePatientForm()">+ Admit Patient</button>`
                : ""
            }
          </div>
          <div class="filter-row">
            ${["admitted", "critical", "discharged", "transferred"]
              .map(
                current =>
                  `<button class="filter-btn ${filter === current ? "active" : ""}" onclick="renderPatients('${current}')">${current}</button>`,
              )
              .join("")}
          </div>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Ward</th><th>Diagnosis</th><th>Status</th><th>Admitted</th><th>Actions</th></tr></thead>
          <tbody>
            ${
              Array.isArray(patients) && patients.length > 0
                ? patients
                    .map(
                      patient => `<tr>
                  <td><strong>${patient.name}</strong><br><span style="font-size:11px;color:#6B7280">${patient.gender || ""}</span></td>
                  <td>${patient.ward}</td>
                  <td>${patient.diagnosis || "—"}</td>
                  <td>${badge(patient.status)}</td>
                  <td>${new Date(patient.admittedAt).toLocaleDateString()}</td>
                  <td>
                    <div class="btn-row">
                      ${
                        canManagePatients()
                          ? `<button class="action-btn" style="background:#E8F4F9;color:#0D3D52" onclick="editPatient('${patient._id}','${escapeHtmlAttribute(patient.name)}','${escapeHtmlAttribute(patient.ward)}','${escapeHtmlAttribute(patient.diagnosis || "")}','${patient.status}','${escapeHtmlAttribute(patient.notes || "")}')">Edit</button>`
                          : ""
                      }
                      ${
                        canManagePatients() &&
                        (patient.status === "admitted" || patient.status === "critical")
                          ? `<button class="action-btn btn-danger" onclick="dischargePatient('${patient._id}')">Discharge</button>`
                          : ""
                      }
                    </div>
                  </td>
                </tr>`,
                    )
                    .join("")
                : `<tr><td colspan="6" class="empty">No ${filter} patients</td></tr>`
            }
          </tbody>
        </table>
      </div>`;
  }

  function togglePatientForm() {
    if (!canManagePatients()) {
      return;
    }

    const container = document.getElementById("patient-form-container");
    if (container.innerHTML) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="form-panel">
        <div class="form-panel-title">Admit New Patient</div>
        <div class="form-grid">
          <div class="form-group"><label>Full Name *</label><input type="text" id="p-name" placeholder="Jane Doe" /></div>
          <div class="form-group"><label>Date of Birth *</label><input type="date" id="p-dob" /></div>
          <div class="form-group"><label>Gender *</label>
            <select id="p-gender"><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
          </div>
          <div class="form-group"><label>Ward *</label><input type="text" id="p-ward" placeholder="Cardiology" /></div>
          <div class="form-group"><label>Diagnosis</label><input type="text" id="p-diagnosis" placeholder="Hypertension" /></div>
          <div class="form-group"><label>Status</label>
            <select id="p-status"><option value="admitted">Admitted</option><option value="critical">Critical</option></select>
          </div>
          <div class="form-group" style="grid-column:1/-1"><label>Notes</label><input type="text" id="p-notes" placeholder="Additional notes..." /></div>
        </div>
        <div id="p-error" class="error-msg" style="display:none"></div>
        <div class="form-actions">
          <button class="btn" style="width:auto;padding:10px 24px" onclick="submitAdmitPatient()">Admit Patient</button>
          <button class="btn btn-secondary" style="width:auto;padding:10px 24px" onclick="togglePatientForm()">Cancel</button>
        </div>
      </div>`;
  }

  async function submitAdmitPatient() {
    if (!canManagePatients()) {
      return;
    }

    const name = document.getElementById("p-name").value.trim();
    const dateOfBirth = document.getElementById("p-dob").value;
    const gender = document.getElementById("p-gender").value;
    const ward = document.getElementById("p-ward").value.trim();
    const diagnosis = document.getElementById("p-diagnosis").value.trim();
    const status = document.getElementById("p-status").value;
    const notes = document.getElementById("p-notes").value.trim();
    const error = document.getElementById("p-error");

    if (!name || !dateOfBirth || !gender || !ward) {
      error.textContent = "Please fill required fields";
      error.style.display = "block";
      return;
    }

    const data = await api("/patients", {
      method: "POST",
      body: JSON.stringify({ name, dateOfBirth, gender, ward, diagnosis, status, notes }),
    });

    if (data._id || data.patient) {
      renderPatients();
      return;
    }

    error.textContent = data.message || "Failed";
    error.style.display = "block";
  }

  function editPatient(id, name, ward, diagnosis, status, notes) {
    openModal(
      "Edit Patient",
      `
      <div class="form-group"><label>Name</label><input type="text" id="ep-name" value="${escapeHtmlAttribute(name)}" /></div>
      <div class="form-group"><label>Ward</label><input type="text" id="ep-ward" value="${escapeHtmlAttribute(ward)}" /></div>
      <div class="form-group"><label>Diagnosis</label><input type="text" id="ep-diagnosis" value="${escapeHtmlAttribute(diagnosis)}" /></div>
      <div class="form-group"><label>Status</label>
        <select id="ep-status">
          ${["admitted", "critical", "transferred"]
            .map(option => `<option value="${option}" ${status === option ? "selected" : ""}>${option}</option>`)
            .join("")}
        </select>
      </div>
      <div class="form-group"><label>Notes</label><input type="text" id="ep-notes" value="${escapeHtmlAttribute(notes)}" /></div>
      <div id="ep-error" class="error-msg" style="display:none"></div>`,
      [
        { label: "Save Changes", fn: `submitEditPatient('${id}')` },
        { label: "Cancel", cls: "btn-secondary", fn: "closeModal()" },
      ],
    );
  }

  async function submitEditPatient(id) {
    if (!canManagePatients()) {
      return;
    }

    const name = document.getElementById("ep-name").value.trim();
    const ward = document.getElementById("ep-ward").value.trim();
    const diagnosis = document.getElementById("ep-diagnosis").value.trim();
    const status = document.getElementById("ep-status").value;
    const notes = document.getElementById("ep-notes").value.trim();

    const data = await api(`/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name, ward, diagnosis, status, notes }),
    });

    if (data._id || data.patient) {
      closeModal();
      renderPatients();
      return;
    }

    const error = document.getElementById("ep-error");
    error.textContent = data.message || "Failed";
    error.style.display = "block";
  }

  async function dischargePatient(id) {
    if (!canManagePatients() || !window.confirm("Discharge this patient?")) {
      return;
    }
    await api(`/patients/${id}/discharge`, { method: "PATCH" });
    renderPatients();
  }

  async function renderBeds(filter = state.currentFilter.beds) {
    state.currentFilter.beds = filter;
    const main = getMainContent();
    main.innerHTML = `<div class="page-title">Beds</div><div class="loading">Loading...</div>`;

    const [beds, stats] = await Promise.all([
      api(filter ? `/beds?status=${filter}` : "/beds"),
      api("/beds/stats"),
    ]);

    main.innerHTML = `
      <div class="page-title">Bed Management</div>
      <div id="bed-form-container"></div>
      <div class="stats-grid" style="margin-bottom:20px">
        ${
          Array.isArray(stats)
            ? stats
                .map(
                  item => `
          <div class="stat-card" style="border-color:#1B5E7B;cursor:default">
            <div class="stat-value" style="color:#1B5E7B;font-size:28px">${item.count}</div>
            <div class="stat-label" style="text-transform:capitalize">${item._id}</div>
          </div>`,
                )
                .join("")
            : ""
        }
      </div>
      <div class="content-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <div class="card-header-title">All Beds</div>
            ${
              canManageBeds()
                ? `<button class="action-btn" style="background:#1B5E7B;color:white;padding:8px 16px;font-size:13px" onclick="toggleBedForm()">+ Add Bed</button>`
                : ""
            }
          </div>
          <div class="filter-row">
            ${[null, "available", "occupied", "cleaning", "maintenance"]
              .map(
                current =>
                  `<button class="filter-btn ${filter === current ? "active" : ""}" onclick="renderBeds(${current ? `'${current}'` : "null"})">${current || "all"}</button>`,
              )
              .join("")}
          </div>
        </div>
        <div class="beds-grid">
          ${
            Array.isArray(beds) && beds.length > 0
              ? beds
                  .map(
                    bed => `
              <div class="bed-card">
                <div class="bed-number">${BED_ICONS[bed.status] || "⬜"} ${bed.bedNumber}</div>
                ${badge(bed.status)}
                <div class="bed-meta">Room ${bed.room} · Floor ${bed.floor}</div>
                <div class="bed-meta">Ward: ${bed.ward}</div>
                ${bed.currentPatient ? `<div class="bed-patient">👤 ${bed.currentPatient.name}</div>` : ""}
                <div style="margin-top:8px">
                  ${
                    canManageBeds()
                      ? `<button class="action-btn" style="background:#E8F4F9;color:#0D3D52;font-size:11px" onclick="editBed('${bed._id}','${bed.status}')">Update Status</button>`
                      : ""
                  }
                </div>
              </div>`,
                  )
                  .join("")
              : `<div class="empty" style="grid-column:1/-1">No beds found</div>`
          }
        </div>
      </div>`;
  }

  function toggleBedForm() {
    if (!canManageBeds()) {
      return;
    }

    const container = document.getElementById("bed-form-container");
    if (container.innerHTML) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="form-panel">
        <div class="form-panel-title">Add New Bed</div>
        <div class="form-grid">
          <div class="form-group"><label>Bed Number *</label><input type="text" id="b-number" placeholder="A101" /></div>
          <div class="form-group"><label>Room *</label><input type="text" id="b-room" placeholder="101" /></div>
          <div class="form-group"><label>Floor *</label><input type="number" id="b-floor" placeholder="1" /></div>
          <div class="form-group"><label>Ward *</label><input type="text" id="b-ward" placeholder="Cardiology" /></div>
        </div>
        <div id="b-error" class="error-msg" style="display:none"></div>
        <div class="form-actions">
          <button class="btn" style="width:auto;padding:10px 24px" onclick="submitAddBed()">Add Bed</button>
          <button class="btn btn-secondary" style="width:auto;padding:10px 24px" onclick="toggleBedForm()">Cancel</button>
        </div>
      </div>`;
  }

  async function submitAddBed() {
    if (!canManageBeds()) {
      return;
    }

    const bedNumber = document.getElementById("b-number").value.trim();
    const room = document.getElementById("b-room").value.trim();
    const floor = document.getElementById("b-floor").value;
    const ward = document.getElementById("b-ward").value.trim();
    const error = document.getElementById("b-error");

    if (!bedNumber || !room || !floor || !ward) {
      error.textContent = "Please fill all fields";
      error.style.display = "block";
      return;
    }

    const data = await api("/beds", {
      method: "POST",
      body: JSON.stringify({ bedNumber, room, floor: parseInt(floor, 10), ward }),
    });

    if (data._id || data.bed) {
      renderBeds();
      return;
    }

    error.textContent = data.message || "Failed";
    error.style.display = "block";
  }

  function editBed(id, currentStatus) {
    if (!canManageBeds()) {
      return;
    }

    openModal(
      "Update Bed Status",
      `
      <div class="form-group"><label>New Status</label>
        <select id="bed-new-status">
          ${["available", "occupied", "cleaning", "maintenance"]
            .map(option => `<option value="${option}" ${currentStatus === option ? "selected" : ""}>${option}</option>`)
            .join("")}
        </select>
      </div>`,
      [
        { label: "Update", fn: `submitUpdateBed('${id}')` },
        { label: "Cancel", cls: "btn-secondary", fn: "closeModal()" },
      ],
    );
  }

  async function submitUpdateBed(id) {
    if (!canManageBeds()) {
      return;
    }

    const status = document.getElementById("bed-new-status").value;
    const data = await api(`/beds/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (data._id || data.bed) {
      closeModal();
      renderBeds();
    }
  }

  async function renderTasks(filter = state.currentFilter.tasks) {
    state.currentFilter.tasks = filter;
    const main = getMainContent();
    main.innerHTML = `<div class="page-title">Tasks</div><div class="loading">Loading...</div>`;

    const tasks = await api(`/tasks?status=${filter}`);

    main.innerHTML = `
      <div class="page-title">Tasks & Orders</div>
      <div id="task-form-container"></div>
      <div class="content-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <div class="card-header-title">All Tasks</div>
            ${
              canManageTasks()
                ? `<button class="action-btn" style="background:#1B5E7B;color:white;padding:8px 16px;font-size:13px" onclick="toggleTaskForm()">+ Create Task</button>`
                : ""
            }
          </div>
          <div class="filter-row">
            ${["pending", "in_progress", "completed", "cancelled"]
              .map(
                current =>
                  `<button class="filter-btn ${filter === current ? "active" : ""}" onclick="renderTasks('${current}')">${current.replace("_", " ")}</button>`,
              )
              .join("")}
          </div>
        </div>
        <table>
          <thead><tr><th>Title</th><th>Type</th><th>Priority</th><th>Patient</th><th>Assigned To</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${
              Array.isArray(tasks) && tasks.length > 0
                ? tasks
                    .map(
                      task => `<tr>
                  <td><strong>${TYPE_ICONS[task.type] || "📋"} ${task.title}</strong>${task.description ? `<br><span style="font-size:11px;color:#6B7280">${task.description}</span>` : ""}</td>
                  <td style="text-transform:capitalize">${task.type?.replace("_", " ") || "—"}</td>
                  <td>${badge(task.priority)}</td>
                  <td>${task.patient?.name || "—"}</td>
                  <td>${task.assignedTo?.name || "—"}</td>
                  <td>${badge(task.status)}</td>
                  <td>
                    <div class="btn-row">
                      ${task.status === "pending" ? `<button class="action-btn" style="background:#E8F4F9;color:#0D3D52" onclick="updateTask('${task._id}','in_progress')">Start</button>` : ""}
                      ${task.status === "in_progress" ? `<button class="action-btn" style="background:#E6F4EC;color:#2E7D52" onclick="updateTask('${task._id}','completed')">Complete</button>` : ""}
                      <button class="action-btn" style="background:#F9FAFB;color:#374151" onclick="assignTask('${task._id}')">Assign</button>
                    </div>
                  </td>
                </tr>`,
                    )
                    .join("")
                : `<tr><td colspan="7" class="empty">No ${filter.replace("_", " ")} tasks</td></tr>`
            }
          </tbody>
        </table>
      </div>`;
  }

  function toggleTaskForm() {
    if (!canManageTasks()) {
      return;
    }

    const container = document.getElementById("task-form-container");
    if (container.innerHTML) {
      container.innerHTML = "";
      return;
    }

    const staffOptions = state.allStaff
      .map(staff => `<option value="${staff._id}">${staff.name} (${staff.role})</option>`)
      .join("");
    const patientOptions = state.allPatients
      .map(patient => `<option value="${patient._id}">${patient.name} - ${patient.ward}</option>`)
      .join("");

    container.innerHTML = `
      <div class="form-panel">
        <div class="form-panel-title">Create New Task</div>
        <div class="form-grid">
          <div class="form-group"><label>Title *</label><input type="text" id="t-title" placeholder="Blood pressure check" /></div>
          <div class="form-group"><label>Type</label>
            <select id="t-type">
              <option value="general">General</option><option value="medication">Medication</option>
              <option value="lab_order">Lab Order</option><option value="procedure">Procedure</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div class="form-group"><label>Priority</label>
            <select id="t-priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
          </div>
          <div class="form-group"><label>Due Date</label><input type="datetime-local" id="t-due" /></div>
          <div class="form-group"><label>Assign to Staff</label>
            <select id="t-staff"><option value="">Unassigned</option>${staffOptions}</select>
          </div>
          <div class="form-group"><label>Patient</label>
            <select id="t-patient"><option value="">No patient</option>${patientOptions}</select>
          </div>
          <div class="form-group" style="grid-column:1/-1"><label>Description</label><input type="text" id="t-desc" placeholder="Additional details..." /></div>
        </div>
        <div id="t-error" class="error-msg" style="display:none"></div>
        <div class="form-actions">
          <button class="btn" style="width:auto;padding:10px 24px" onclick="submitCreateTask()">Create Task</button>
          <button class="btn btn-secondary" style="width:auto;padding:10px 24px" onclick="toggleTaskForm()">Cancel</button>
        </div>
      </div>`;
  }

  async function submitCreateTask() {
    if (!canManageTasks()) {
      return;
    }

    const title = document.getElementById("t-title").value.trim();
    const type = document.getElementById("t-type").value;
    const priority = document.getElementById("t-priority").value;
    const description = document.getElementById("t-desc").value.trim();
    const assignedTo = document.getElementById("t-staff").value || null;
    const patient = document.getElementById("t-patient").value || null;
    const dueAt = document.getElementById("t-due").value || null;
    const error = document.getElementById("t-error");

    if (!title) {
      error.textContent = "Please enter a title";
      error.style.display = "block";
      return;
    }

    const body = { title, type, priority, description };
    if (assignedTo) {
      body.assignedTo = assignedTo;
    }
    if (patient) {
      body.patient = patient;
    }
    if (dueAt) {
      body.dueAt = dueAt;
    }

    const data = await api("/tasks", { method: "POST", body: JSON.stringify(body) });

    if (data._id || data.task) {
      renderTasks();
      return;
    }

    error.textContent = data.message || "Failed";
    error.style.display = "block";
  }

  function assignTask(id) {
    if (!canManageTasks()) {
      return;
    }

    const staffOptions = state.allStaff
      .map(staff => `<option value="${staff._id}">${staff.name} (${staff.role})</option>`)
      .join("");
    const patientOptions = state.allPatients
      .map(patient => `<option value="${patient._id}">${patient.name} - ${patient.ward}</option>`)
      .join("");

    openModal(
      "Assign Task",
      `
      <div class="form-group"><label>Assign to Staff</label>
        <select id="assign-staff"><option value="">Unassigned</option>${staffOptions}</select>
      </div>
      <div class="form-group"><label>Link to Patient</label>
        <select id="assign-patient"><option value="">No patient</option>${patientOptions}</select>
      </div>`,
      [
        { label: "Save Assignment", fn: `submitAssignTask('${id}')` },
        { label: "Cancel", cls: "btn-secondary", fn: "closeModal()" },
      ],
    );
  }

  async function submitAssignTask(id) {
    if (!canManageTasks()) {
      return;
    }

    const assignedTo = document.getElementById("assign-staff").value || null;
    const patient = document.getElementById("assign-patient").value || null;

    await api(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ assignedTo, patient }),
    });

    closeModal();
    renderTasks();
  }

  async function updateTask(id, status) {
    if (!canManageTasks()) {
      return;
    }
    await api(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    renderTasks();
  }

  async function renderStaff() {
    const main = getMainContent();
    main.innerHTML = `<div class="page-title">Staff</div><div class="loading">Loading...</div>`;

    const staff = await api("/staff");
    state.allStaff = Array.isArray(staff) ? staff : [];

    main.innerHTML = `
      <div class="page-title">Staff Directory</div>
      <div class="content-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <div class="card-header-title">All Staff (${state.allStaff.length})</div>
            ${
              canManageStaff()
                ? `<button class="action-btn" style="background:#1B5E7B;color:white;padding:8px 16px;font-size:13px" onclick="showRegisterModal()">+ Add Staff</button>`
                : ""
            }
          </div>
          <div class="filter-row">
            ${["all", "admin", "doctor", "nurse"]
              .map(
                role =>
                  `<button class="filter-btn ${role === "all" ? "active" : ""}" onclick="filterStaff('${role}', this)">${role}</button>`,
              )
              .join("")}
          </div>
        </div>
        <div class="staff-grid" id="staff-grid">
          ${renderStaffCards(state.allStaff)}
        </div>
      </div>`;
  }

  function filterStaff(role, button) {
    document.querySelectorAll(".filter-btn").forEach(element => element.classList.remove("active"));
    if (button) {
      button.classList.add("active");
    }
    const grid = document.getElementById("staff-grid");
    if (!grid) {
      return;
    }
    const filtered = role === "all" ? state.allStaff : state.allStaff.filter(staff => staff.role === role);
    grid.innerHTML = renderStaffCards(filtered, role);
  }

  function showRegisterModal() {
    if (!canManageStaff()) {
      return;
    }

    openModal(
      "Add New Staff Member",
      `
      <div class="form-group"><label>Full Name *</label><input type="text" id="ms-name" placeholder="Dr. Jane Smith" /></div>
      <div class="form-group"><label>Email *</label><input type="email" id="ms-email" placeholder="jane@hospital.com" /></div>
      <div class="form-group">
        <label>Password *</label>
        <div class="password-field">
          <input type="password" id="ms-password" placeholder="Min 6 characters" />
          <button type="button" class="password-toggle" onclick="togglePassword('ms-password', this)">Show</button>
        </div>
      </div>
      <div class="form-group"><label>Role</label>
        <select id="ms-role"><option value="nurse">Nurse</option><option value="doctor">Doctor</option><option value="admin">Admin</option></select>
      </div>
      <div class="form-group"><label>Department</label><input type="text" id="ms-dept" placeholder="Cardiology" /></div>
      <div id="ms-error" class="error-msg" style="display:none"></div>
      <div id="ms-success" class="success-msg" style="display:none"></div>`,
      [
        { label: "Create Account", fn: "submitRegisterModal()" },
        { label: "Cancel", cls: "btn-secondary", fn: "closeModal()" },
      ],
    );
  }

  async function submitRegisterModal() {
    if (!canManageStaff()) {
      return;
    }

    const name = document.getElementById("ms-name").value.trim();
    const email = document.getElementById("ms-email").value.trim();
    const password = document.getElementById("ms-password").value;
    const role = document.getElementById("ms-role").value;
    const department = document.getElementById("ms-dept").value.trim();
    const error = document.getElementById("ms-error");
    const success = document.getElementById("ms-success");

    if (!name || !email || !password) {
      error.textContent = "Fill in required fields";
      error.style.display = "block";
      return;
    }

    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, department }),
    });

    if (data.user || data.token) {
      success.textContent = `${name} added successfully!`;
      success.style.display = "block";
      error.style.display = "none";
      window.setTimeout(() => {
        closeModal();
        renderStaff();
      }, 1500);
      return;
    }

    error.textContent = data.message || "Failed";
    error.style.display = "block";
  }

  async function renderShifts() {
    const main = getMainContent();
    main.innerHTML = `<div class="page-title">Shifts</div><div class="loading">Loading...</div>`;

    const today = new Date().toISOString().split("T")[0];
    const shifts = await api(`/staff/shifts?from=${today}`);

    main.innerHTML = `
      <div class="page-title">Shift Scheduling</div>
      <div id="shift-form-container"></div>
      <div class="content-card">
        <div class="card-header">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
            <div class="card-header-title">Upcoming Shifts</div>
            ${
              canManageShifts()
                ? `<button class="action-btn" style="background:#1B5E7B;color:white;padding:8px 16px;font-size:13px" onclick="toggleShiftForm()">+ Schedule Shift</button>`
                : ""
            }
          </div>
        </div>
        <div style="padding:20px">
          ${
            Array.isArray(shifts) && shifts.length > 0
              ? shifts
                  .map(shift => {
                    const start = new Date(shift.startTime);
                    const end = new Date(shift.endTime);
                    const formatTime = value => value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const formatDate = value => value.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

                    return `
                  <div class="shift-card">
                    <div class="shift-info">
                      <div class="shift-name">${shift.staff?.name || "—"} ${badge(shift.staff?.role || "nurse")}</div>
                      <div class="shift-meta">📍 ${shift.ward} · ${formatDate(start)}</div>
                      <div class="shift-meta">🕐 ${formatTime(start)} – ${formatTime(end)}</div>
                    </div>
                    ${badge(shift.shiftType)}
                    ${
                      canManageShifts()
                        ? `<button class="action-btn btn-danger" style="margin-left:12px" onclick="deleteShift('${shift._id}')">Remove</button>`
                        : ""
                    }
                  </div>`;
                  })
                  .join("")
              : `<div class="empty">No upcoming shifts scheduled</div>`
          }
        </div>
      </div>`;
  }

  function toggleShiftForm() {
    if (!canManageShifts()) {
      return;
    }

    const container = document.getElementById("shift-form-container");
    if (container.innerHTML) {
      container.innerHTML = "";
      return;
    }

    const staffOptions = state.allStaff
      .map(staff => `<option value="${staff._id}">${staff.name} (${staff.role})</option>`)
      .join("");

    container.innerHTML = `
      <div class="form-panel">
        <div class="form-panel-title">Schedule New Shift</div>
        <div class="form-grid">
          <div class="form-group"><label>Staff Member *</label>
            <select id="sh-staff"><option value="">Select staff...</option>${staffOptions}</select>
          </div>
          <div class="form-group"><label>Ward *</label><input type="text" id="sh-ward" placeholder="ICU" /></div>
          <div class="form-group"><label>Shift Type *</label>
            <select id="sh-type"><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="night">Night</option></select>
          </div>
          <div class="form-group"><label>Start Time *</label><input type="datetime-local" id="sh-start" /></div>
          <div class="form-group"><label>End Time *</label><input type="datetime-local" id="sh-end" /></div>
          <div class="form-group"><label>Notes</label><input type="text" id="sh-notes" placeholder="Optional notes" /></div>
        </div>
        <div id="sh-error" class="error-msg" style="display:none"></div>
        <div class="form-actions">
          <button class="btn" style="width:auto;padding:10px 24px" onclick="submitScheduleShift()">Schedule Shift</button>
          <button class="btn btn-secondary" style="width:auto;padding:10px 24px" onclick="toggleShiftForm()">Cancel</button>
        </div>
      </div>`;
  }

  async function submitScheduleShift() {
    if (!canManageShifts()) {
      return;
    }

    const staff = document.getElementById("sh-staff").value;
    const ward = document.getElementById("sh-ward").value.trim();
    const shiftType = document.getElementById("sh-type").value;
    const startTime = document.getElementById("sh-start").value;
    const endTime = document.getElementById("sh-end").value;
    const notes = document.getElementById("sh-notes").value.trim();
    const error = document.getElementById("sh-error");

    if (!staff || !ward || !startTime || !endTime) {
      error.textContent = "Please fill required fields";
      error.style.display = "block";
      return;
    }

    const data = await api("/staff/shifts", {
      method: "POST",
      body: JSON.stringify({ staff, ward, shiftType, startTime, endTime, notes }),
    });

    if (data._id || data.shift) {
      renderShifts();
      return;
    }

    error.textContent = data.message || "Failed to schedule shift";
    error.style.display = "block";
  }

  async function deleteShift(id) {
    if (!canManageShifts() || !window.confirm("Remove this shift?")) {
      return;
    }
    await api(`/staff/shifts/${id}`, { method: "DELETE" });
    renderShifts();
  }

  function renderStaffCards(staff, role = "staff") {
    if (!staff.length) {
      return `<div class="empty" style="grid-column:1/-1">No ${role} found</div>`;
    }

    return staff
      .map(
        member => `
        <div class="staff-card">
          <div class="staff-avatar">${member.name.charAt(0).toUpperCase()}</div>
          <div class="staff-name">${member.name}</div>
          ${badge(member.role)}
          ${member.department ? `<div class="staff-dept">📍 ${member.department}</div>` : ""}
          <div class="staff-dept" style="margin-top:6px">✉️ ${member.email}</div>
        </div>`,
      )
      .join("");
  }

  function escapeHtmlAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.HospitalPages = {
    assignTask,
    deleteShift,
    dischargePatient,
    editBed,
    editPatient,
    filterStaff,
    renderBeds,
    renderDashboard,
    renderPatients,
    renderShifts,
    renderStaff,
    renderTasks,
    showPage,
    showRegisterModal,
    submitAddBed,
    submitAdmitPatient,
    submitAssignTask,
    submitCreateTask,
    submitEditPatient,
    submitRegisterModal,
    submitScheduleShift,
    submitUpdateBed,
    toggleBedForm,
    togglePatientForm,
    toggleShiftForm,
    toggleTaskForm,
    updateTask,
  };
})();
