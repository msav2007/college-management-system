const APP_BASE =
  window.location.origin && window.location.origin !== "null" ? window.location.origin : "http://localhost:3000";
const API_BASE = `${APP_BASE}/api`;
const TOKEN_KEY = "cms_token";
const USER_KEY = "cms_user";

const DEPARTMENTS = [
  { code: "CSE", name: "Computer Science and Engineering" },
  { code: "ECE", name: "Electronics and Communication Engineering" },
  { code: "BBA", name: "Business Administration" }
];

const PAGE_ACCESS = {
  dashboard: ["admin", "faculty", "student"],
  academics: ["admin"],
  students: ["admin", "faculty"],
  faculty: ["admin"],
  attendance: ["admin", "faculty", "student"],
  exams: ["admin", "faculty", "student"],
  timetable: ["admin", "faculty", "student"],
  fees: ["admin", "student"],
  assignments: ["admin", "faculty", "student"],
  notices: ["admin", "faculty", "student"],
  materials: ["admin", "faculty", "student"],
  outing: ["admin", "faculty", "student"]
};

const MENU_ITEMS = {
  admin: [
    { page: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" },
    { page: "academics", label: "Academics", href: "academics.html", icon: "timetable" },
    { page: "students", label: "Students", href: "students.html", icon: "students" },
    { page: "faculty", label: "Faculty", href: "faculty.html", icon: "faculty" },
    { page: "attendance", label: "Attendance", href: "attendance.html", icon: "attendance" },
    { page: "exams", label: "Exams", href: "exams.html", icon: "results" },
    { page: "timetable", label: "Timetable", href: "timetable.html", icon: "timetable" },
    { page: "fees", label: "Fees", href: "fees.html", icon: "fees" },
    { page: "assignments", label: "Assignments", href: "assignments.html", icon: "assignments" },
    { page: "materials", label: "Materials", href: "materials.html", icon: "materials" },
    { page: "notices", label: "Notices", href: "notices.html", icon: "notices" },
    { page: "outing", label: "Outing", href: "outing.html", icon: "outing" }
  ],
  faculty: [
    { page: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" },
    { page: "students", label: "Students", href: "students.html", icon: "students" },
    { page: "attendance", label: "Attendance", href: "attendance.html", icon: "attendance" },
    { page: "exams", label: "Exams", href: "exams.html", icon: "results" },
    { page: "timetable", label: "Timetable", href: "timetable.html", icon: "timetable" },
    { page: "assignments", label: "Assignments", href: "assignments.html", icon: "assignments" },
    { page: "materials", label: "Materials", href: "materials.html", icon: "materials" },
    { page: "notices", label: "Notices", href: "notices.html", icon: "notices" },
    { page: "outing", label: "Outing", href: "outing.html", icon: "outing" }
  ],
  student: [
    { page: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "dashboard" },
    { page: "attendance", label: "Attendance", href: "attendance.html", icon: "attendance" },
    { page: "exams", label: "Results", href: "exams.html", icon: "results" },
    { page: "timetable", label: "Timetable", href: "timetable.html", icon: "timetable" },
    { page: "fees", label: "Fees", href: "fees.html", icon: "fees" },
    { page: "assignments", label: "Assignments", href: "assignments.html", icon: "assignments" },
    { page: "materials", label: "Materials", href: "materials.html", icon: "materials" },
    { page: "notices", label: "Notices", href: "notices.html", icon: "notices" },
    { page: "outing", label: "Outing", href: "outing.html", icon: "outing" }
  ]
};

const ICON_PATHS = {
  dashboard:
    '<path d="M3 11.5A2.5 2.5 0 0 1 5.5 9H9v10H5.5A2.5 2.5 0 0 1 3 16.5v-5Zm8 7.5V5h3.5A2.5 2.5 0 0 1 17 7.5V19h-6Z"/><path d="M17 19h1.5A2.5 2.5 0 0 0 21 16.5V13h-4v6Z"/><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H9v2H3v.5Zm14-4A2.5 2.5 0 0 0 14.5 2H11v5h6V4.5Z"/>',
  students:
    '<path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M2.5 19.5A5.5 5.5 0 0 1 8 14h1a5.5 5.5 0 0 1 5.5 5.5v.5h-12v-.5Zm11.5.5v-.5A6.9 6.9 0 0 0 13 15.2a4.7 4.7 0 0 1 2-.4h1a4 4 0 0 1 4 4v1.2h-6Z"/>',
  faculty:
    '<path d="M12 3 2.5 7.5 12 12l9.5-4.5L12 3Zm-7.5 7 7.5 3.6 7.5-3.6V16c0 1.4-3.3 3.5-7.5 3.5S4.5 17.4 4.5 16v-6Z"/>',
  attendance:
    '<path d="M7 2v3M17 2v3M4 8h16"/><rect x="3" y="5" width="18" height="16" rx="3"/><path d="m8.5 14 2.2 2.2 4.8-5"/>',
  results:
    '<path d="M6 3h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h8"/>',
  timetable:
    '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 9h18M8 13h3M8 17h7"/>',
  fees:
    '<path d="M12 3c4.4 0 8 2 8 4.5S16.4 12 12 12 4 10 4 7.5 7.6 3 12 3Z"/><path d="M4 12.5C4 15 7.6 17 12 17s8-2 8-4.5"/><path d="M4 17.5C4 20 7.6 22 12 22s8-2 8-4.5"/>',
  assignments:
    '<path d="M7 3h10a2 2 0 0 1 2 2v14l-4-2-3 2-3-2-4 2V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h6"/>',
  materials:
    '<path d="M4 4h6l2 2h8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z"/><path d="M12 12v6M9.5 15.5 12 18l2.5-2.5"/>',
  notices:
    '<path d="M12 3a4 4 0 0 1 4 4v1.4a2 2 0 0 0 .6 1.4l1 1a1 1 0 0 1-.7 1.7H7.1a1 1 0 0 1-.7-1.7l1-1A2 2 0 0 0 8 8.4V7a4 4 0 0 1 4-4Z"/><path d="M10 18a2 2 0 0 0 4 0"/>',
  outing:
    '<path d="M12 3 4 7l8 4 8-4-8-4Z"/><path d="M4 11l8 4 8-4"/><path d="M4 15l8 4 8-4"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>'
};

const STATE = {
  token: localStorage.getItem(TOKEN_KEY),
  user: loadStoredUser()
};

document.addEventListener("DOMContentLoaded", () => {
  initializeApp().catch((error) => {
    showToast(error.message || "Unable to load the application right now.", "error");
  });
});

function loadStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

async function initializeApp() {
  const page = getCurrentPage();

  if (["login", "forgot-password", "reset-password"].includes(page)) {
    await initializePublicPage(page);
    return;
  }

  await initializeProtectedPage(page);
}

function getCurrentPage() {
  return document.body.dataset.page;
}

function setSession(token, user) {
  STATE.token = token;
  STATE.user = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  STATE.token = null;
  STATE.user = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function redirectTo(page) {
  window.location.href = page;
}

function getRoleLabel(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeAssetUrl(path) {
  if (!path) return "#";
  return path.startsWith("http") ? path : `${APP_BASE}${path}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("+", "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function statusBadge(label) {
  return `<span class="status-badge ${slugify(label)}">${escapeHtml(label || "N/A")}</span>`;
}

function tag(label) {
  return `<span class="tag">${escapeHtml(label)}</span>`;
}

function icon(name) {
  return `<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg></span>`;
}

function statIcon(name) {
  return `<span class="stat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg></span>`;
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function createStatsGrid(cards) {
  return `
    <section class="stats-grid">
      ${cards
        .map(
          (card) => `
            <article class="stat-card">
              ${statIcon(card.icon)}
              <span class="stat-label">${escapeHtml(card.label)}</span>
              <strong>${escapeHtml(card.value)}</strong>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function createTableCard({ title, subtitle = "", headers, rows, emptyMessage = "No records found." }) {
  return `
    <section class="table-card">
      <div class="table-head">
        <div class="panel-heading">
          ${subtitle ? `<p class="table-meta">${escapeHtml(subtitle)}</p>` : ""}
          <h2>${escapeHtml(title)}</h2>
        </div>
      </div>
      ${
        rows.length
          ? `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
                </thead>
                <tbody>${rows.join("")}</tbody>
              </table>
            </div>
          `
          : emptyState(emptyMessage)
      }
    </section>
  `;
}

function panel({ eyebrow = "Overview", title, body, actions = "" }) {
  return `
    <section class="panel">
      <div class="split-row panel-head">
        <div class="panel-heading">
          ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
          <h2>${escapeHtml(title)}</h2>
        </div>
        ${actions}
      </div>
      ${body}
    </section>
  `;
}

function renderLoading(message) {
  const root = document.getElementById("pageContent");
  if (root) {
    root.innerHTML = emptyState(message);
  }
}

function buildDepartmentOptions() {
  return DEPARTMENTS.map((item) => `<option value="${item.code}">${item.name}</option>`).join("");
}

async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(STATE.token ? { Authorization: `Bearer ${STATE.token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

async function initializePublicPage(page) {
  if (STATE.token) {
    try {
      const session = await api("/me");
      STATE.user = session.user;
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      if (page === "login") {
        redirectTo("dashboard.html");
        return;
      }
    } catch (_error) {
      clearSession();
    }
  }

  if (page === "login") bindLoginForm();
  if (page === "forgot-password") bindForgotPasswordForm();
  if (page === "reset-password") bindResetPasswordForm();
}

async function initializeProtectedPage(page) {
  if (!STATE.token) {
    redirectTo("login.html");
    return;
  }

  try {
    const session = await api("/me");
    STATE.user = session.user;
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch (_error) {
    clearSession();
    redirectTo("login.html");
    return;
  }

  if (!PAGE_ACCESS[page] || !PAGE_ACCESS[page].includes(STATE.user.role)) {
    redirectTo("dashboard.html");
    return;
  }

  renderShell(page);
  await renderPage(page);
}

function renderShell(page) {
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    pageTitle.textContent = document.body.dataset.title || "Dashboard";
  }

  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <div class="sidebar-brand-row">
          <span class="sidebar-brand-pill">
            <span class="sidebar-brand-mark">CMS</span>
            <span class="sidebar-brand-pill-text">Secure Campus Workspace</span>
          </span>
        </div>
        <h2>College Management</h2>
      </div>
      <div>
        <p class="sidebar-section-title">Navigation</p>
        <nav class="sidebar-nav">
          ${MENU_ITEMS[STATE.user.role]
            .map(
              (item) => `
                <a class="sidebar-link ${item.page === page ? "active" : ""}" href="${item.href}">
                  ${icon(item.icon)}
                  <span>${escapeHtml(item.label)}</span>
                </a>
              `
            )
            .join("")}
        </nav>
      </div>
      <div class="sidebar-footer">
        <button class="button button-secondary" id="sidebarLogout" type="button">Logout</button>
      </div>
    `;
  }

  const topbarActions = document.getElementById("topbarActions");
  if (topbarActions) {
    const roleLabel = getRoleLabel(STATE.user.role);
    topbarActions.innerHTML = `
      <button class="role-icon-button" type="button" aria-label="${escapeHtml(roleLabel)}" title="${escapeHtml(roleLabel)}">${escapeHtml(
        roleLabel.charAt(0)
      )}</button>
      <button class="button button-secondary button-small" id="topbarLogout" type="button">Logout</button>
    `;
  }

  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("mobileOverlay");

  const closeSidebar = () => {
    document.getElementById("sidebar")?.classList.remove("open");
    overlay?.classList.remove("open");
  };

  menuToggle?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
    overlay?.classList.toggle("open");
  });

  overlay?.addEventListener("click", closeSidebar);
  document.getElementById("sidebarLogout")?.addEventListener("click", logout);
  document.getElementById("topbarLogout")?.addEventListener("click", logout);
}

function logout() {
  clearSession();
  redirectTo("login.html");
}

function showToast(message, type = "success") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
    if (!stack.children.length) {
      stack.remove();
    }
  }, 3800);
}

function setInlineMessage(element, message, type) {
  if (!element) return;
  element.className = `inline-message ${type}`;
  element.textContent = message;
}

function bindLoginForm() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("authMessage");
  const roleField = document.getElementById("loginRole");
  const emailField = document.getElementById("loginEmail");
  const passwordField = document.getElementById("loginPassword");

  document.querySelectorAll("[data-demo-role]").forEach((button) => {
    button.addEventListener("click", () => {
      if (roleField) roleField.value = button.dataset.demoRole || "";
      if (emailField) emailField.value = button.dataset.demoEmail || "";
      if (passwordField) passwordField.value = button.dataset.demoPassword || "";
      message?.classList.add("hidden");
      showToast(`${getRoleLabel(button.dataset.demoRole || "student")} credentials autofilled.`);
    });
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const selectedRole = String(formData.get("role") || "").trim();

    try {
      const response = await api("/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });

      if (selectedRole && response.role !== selectedRole) {
        clearSession();
        setInlineMessage(message, `This account belongs to the ${getRoleLabel(response.role)} role.`, "error");
        return;
      }

      setSession(response.token, response.user);
      message?.classList.add("hidden");
      showToast("Login successful.");
      redirectTo(response.redirectTo || "dashboard.html");
    } catch (error) {
      setInlineMessage(message, error.message, "error");
    }
  });
}

function bindForgotPasswordForm() {
  const form = document.getElementById("forgotPasswordForm");
  const result = document.getElementById("forgotPasswordResult");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await api("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: formData.get("email") })
      });

      result.classList.remove("hidden");
      result.innerHTML = `
        <strong>${escapeHtml(response.message)}</strong>
        <p style="margin-top: 8px;">Reset link:</p>
        <a style="color: var(--primary); font-weight: 800;" href="${escapeHtml(response.resetLink)}">${escapeHtml(response.resetLink)}</a>
      `;
      showToast("Reset link generated.");
    } catch (error) {
      result.classList.remove("hidden");
      result.textContent = error.message;
    }
  });
}

function bindResetPasswordForm() {
  const form = document.getElementById("resetPasswordForm");
  const tokenField = document.getElementById("resetToken");
  const message = document.getElementById("resetPasswordMessage");
  const token = new URLSearchParams(window.location.search).get("token");

  if (tokenField && token) {
    tokenField.value = token;
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await api("/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: formData.get("token"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword")
        })
      });

      setInlineMessage(message, response.message, "success");
      showToast("Password reset successfully.");
      window.setTimeout(() => redirectTo("login.html"), 1200);
    } catch (error) {
      setInlineMessage(message, error.message, "error");
    }
  });
}

async function renderPage(page) {
  renderLoading(`Loading ${document.body.dataset.title || page}...`);

  switch (page) {
    case "dashboard":
      await renderDashboardPage();
      break;
    case "academics":
      await renderAcademicsPage();
      break;
    case "students":
      await renderStudentsPage();
      break;
    case "faculty":
      await renderFacultyPage();
      break;
    case "attendance":
      await renderAttendancePage();
      break;
    case "exams":
      await renderExamsPage();
      break;
    case "timetable":
      await renderTimetablePage();
      break;
    case "fees":
      await renderFeesPage();
      break;
    case "assignments":
      await renderAssignmentsPage();
      break;
    case "notices":
      await renderNoticesPage();
      break;
    case "materials":
      await renderMaterialsPage();
      break;
    case "outing":
      await renderOutingPage();
      break;
    default:
      document.getElementById("pageContent").innerHTML = emptyState("This page is not available.");
  }
}

async function renderDashboardPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "admin") {
    const [studentsData, facultyData, noticesData, outingData, feesData] = await Promise.all([
      api("/students"),
      api("/faculty"),
      api("/notices"),
      api("/outing"),
      api("/students/fees")
    ]);

    const pendingOutings = outingData.requests.filter((item) => item.status === "pending").slice(0, 5);
    const dues = feesData.fees.filter((item) => item.status !== "paid");

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Total Students", value: String(studentsData.students.length), helper: "Active student records", icon: "students" },
        { label: "Faculty Members", value: String(facultyData.faculty.length), helper: "Teaching staff onboarded", icon: "faculty" },
        { label: "Open Notices", value: String(noticesData.notices.length), helper: "Institution-wide communication", icon: "notices" },
        { label: "Pending Outings", value: String(pendingOutings.length), helper: "Approval queue requiring action", icon: "outing" }
      ])}
      <section class="section-grid two-column">
        ${panel({
          eyebrow: "Operations",
          title: "Institution snapshot",
          body: `
            <div class="activity-list">
              <div class="list-card">
                <h3>Fee collection pulse</h3>
                <p>${dues.length} student fee records still have pending balances.</p>
              </div>
              <div class="list-card">
                <h3>Role coverage</h3>
                <p>${facultyData.faculty.length} faculty accounts and ${studentsData.students.length} student accounts are ready for live workflows.</p>
              </div>
            </div>
          `
        })}
        ${panel({
          eyebrow: "Recent Notices",
          title: "Communication feed",
          body: noticesData.notices.length
            ? `<div class="notice-list">${noticesData.notices
                .slice(0, 4)
                .map(
                  (notice) => `
                    <article class="notice-card">
                      ${statusBadge(notice.audience)}
                      <h3>${escapeHtml(notice.title)}</h3>
                      <p>${escapeHtml(notice.content)}</p>
                      <div class="meta-row" style="margin-top: 12px;">
                        <span class="muted-text">${escapeHtml(notice.posted_by_name)}</span>
                        <span class="muted-text">${formatDateTime(notice.posted_at)}</span>
                      </div>
                    </article>
                  `
                )
                .join("")}</div>`
            : emptyState("No notices have been posted yet.")
        })}
      </section>
      ${createTableCard({
        title: "Pending outing approvals",
        subtitle: "Requests awaiting review",
        headers: ["Student", "Roll Number", "Purpose", "Dates", "Status"],
        rows: pendingOutings.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.student_name)}</td>
              <td>${escapeHtml(request.roll_number)}</td>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
            </tr>
          `
        ),
        emptyMessage: "No pending outing requests."
      })}
    `;
    return;
  }

  if (STATE.user.role === "faculty") {
    const [studentsData, coursesData, assignmentsData, materialsData, noticesData, outingData] = await Promise.all([
      api("/students/assigned"),
      api("/faculty/courses"),
      api("/assignments"),
      api("/materials"),
      api("/notices"),
      api("/outing")
    ]);

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Assigned Students", value: String(studentsData.students.length), helper: "Advisee records available", icon: "students" },
        { label: "Subjects", value: String(coursesData.courses.length), helper: "Subjects mapped to your profile", icon: "timetable" },
        { label: "Assignments Posted", value: String(assignmentsData.assignments.length), helper: "Live academic deliverables", icon: "assignments" },
        { label: "Pending Outings", value: String(outingData.requests.filter((item) => item.status === "pending").length), helper: "Requests needing review", icon: "outing" }
      ])}
      <section class="section-grid two-column">
        ${panel({
          eyebrow: "Academics",
          title: "My Subjects",
          body: coursesData.courses.length
            ? `<div class="activity-list">${coursesData.courses
                .map(
                  (course) => `
                    <div class="list-card">
                      <h3>${escapeHtml(course.name)}</h3>
                      <p>${escapeHtml(course.code)} • Semester ${escapeHtml(course.semester)} • ${escapeHtml(course.department_name)}</p>
                    </div>
                  `
                )
                .join("")}</div>`
            : emptyState("No subjects are currently assigned.")
        })}
        ${panel({
          eyebrow: "Notices",
          title: "Latest announcements",
          body: noticesData.notices.length
            ? `<div class="notice-list">${noticesData.notices
                .slice(0, 4)
                .map(
                  (notice) => `
                    <article class="notice-card">
                      <h3>${escapeHtml(notice.title)}</h3>
                      <p>${escapeHtml(notice.content)}</p>
                      <div class="meta-row" style="margin-top: 10px;">
                        ${statusBadge(notice.audience)}
                        <span class="muted-text">${formatDateTime(notice.posted_at)}</span>
                      </div>
                    </article>
                  `
                )
                .join("")}</div>`
            : emptyState("No notices available for faculty.")
        })}
      </section>
      ${createTableCard({
        title: "Uploaded materials",
        subtitle: "Resources currently available to students",
        headers: ["Title", "Subject", "Uploaded", "Download"],
        rows: materialsData.materials.map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.title)}</td>
              <td>${escapeHtml(item.course_code)}</td>
              <td>${formatDateTime(item.uploaded_at)}</td>
              <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(item.downloadUrl)}" target="_blank" rel="noreferrer">Open</a></td>
            </tr>
          `
        ),
        emptyMessage: "No materials uploaded yet."
      })}
    `;
    return;
  }

  const [profileData, attendanceData, assignmentsData, submissionsData, materialsData, feesData, noticesData, resultsData, outingData] =
    await Promise.all([
      api("/students/me/profile"),
      api("/attendance/my"),
      api("/assignments"),
      api("/submissions/my"),
      api("/materials"),
      api("/students/me/fees"),
      api("/notices"),
      api("/results/my"),
      api("/outing/my")
    ]);

  const submittedAssignments = new Set(submissionsData.submissions.map((item) => item.assignment_id));
  const feeRecord = feesData.fees[0];

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Overall Attendance", value: `${attendanceData.summary.overallPercentage || 0}%`, helper: "Across all your courses", icon: "attendance" },
      { label: "Open Assignments", value: String(assignmentsData.assignments.filter((item) => !submittedAssignments.has(item.id)).length), helper: "Tasks still awaiting your upload", icon: "assignments" },
      { label: "Study Materials", value: String(materialsData.materials.length), helper: "Files ready for download", icon: "materials" },
      { label: "Fee Balance", value: feeRecord ? formatCurrency(feeRecord.balance) : formatCurrency(0), helper: "Outstanding fee on the latest semester", icon: "fees" }
    ])}
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Profile",
        title: "Your academic profile",
        body: `
          <div class="activity-list">
            <div class="list-card">
              <h3>${escapeHtml(profileData.student.fullName)}</h3>
              <p>${escapeHtml(profileData.student.rollNumber)} • ${escapeHtml(profileData.student.departmentName)}</p>
            </div>
            <div class="list-card">
              <h3>Mentor</h3>
              <p>${escapeHtml(profileData.student.advisorName || "Not assigned")}</p>
            </div>
            <div class="list-card">
              <h3>Semester</h3>
              <p>Semester ${escapeHtml(profileData.student.semester)} • Section ${escapeHtml(profileData.student.section)}</p>
            </div>
          </div>
        `
      })}
      ${panel({
        eyebrow: "Upcoming work",
        title: "Assignment status",
        body: assignmentsData.assignments.length
          ? `<div class="activity-list">${assignmentsData.assignments
              .slice(0, 4)
              .map((assignment) => {
                const submission = submissionsData.submissions.find((item) => item.assignment_id === assignment.id);
                return `
                  <div class="list-card">
                    <h3>${escapeHtml(assignment.title)}</h3>
                    <p>${escapeHtml(assignment.course_code)} • Due ${formatDateTime(assignment.deadline)}</p>
                    <div class="meta-row" style="margin-top: 12px;">${statusBadge(submission ? submission.status : "pending")}</div>
                  </div>
                `;
              })
              .join("")}</div>`
          : emptyState("No assignments assigned to you yet.")
      })}
    </section>
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Results",
        title: "Latest published scores",
        body: resultsData.results.length
          ? `<div class="notice-list">${resultsData.results
              .slice(0, 4)
              .map(
                (result) => `
                  <article class="notice-card">
                    <div class="meta-row">
                      ${statusBadge(result.grade)}
                      <span class="muted-text">${escapeHtml(result.course_code)}</span>
                    </div>
                    <h3>${escapeHtml(result.course_name)}</h3>
                    <p>${escapeHtml(result.exam_type)} • ${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</p>
                  </article>
                `
              )
              .join("")}</div>`
          : emptyState("Results have not been published yet.")
      })}
      ${panel({
        eyebrow: "Notices & outing",
        title: "Recent updates",
        body: `
          <div class="activity-list">
            <div class="list-card">
              <h3>Notice feed</h3>
              <p>${noticesData.notices.length} active notices available for your role.</p>
            </div>
            <div class="list-card">
              <h3>Outing requests</h3>
              <p>${outingData.requests.length} requests submitted so far.</p>
            </div>
          </div>
        `
      })}
    </section>
  `;
}

async function renderStudentsPageLegacy() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "faculty") {
    const { students } = await api("/students/assigned");
    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Assigned Students", value: String(students.length), helper: "Students under your guidance", icon: "students" },
        { label: "Active Cohorts", value: String(new Set(students.map((item) => `${item.department_name}-${item.semester}`)).size), helper: "Distinct department-semester groups", icon: "timetable" },
        { label: "Sections", value: String(new Set(students.map((item) => item.section)).size), helper: "Sections represented in your list", icon: "dashboard" },
        { label: "Reachable Emails", value: String(students.length), helper: "Profiles with login access", icon: "materials" }
      ])}
      ${createTableCard({
        title: "Assigned students",
        subtitle: "Faculty-facing student roster",
        headers: ["Student", "Roll Number", "Registration", "Department", "Semester"],
        rows: students.map(
          (student) => `
            <tr>
              <td><strong>${escapeHtml(student.full_name)}</strong><div class="muted-text">${escapeHtml(student.email)}</div></td>
              <td>${escapeHtml(student.roll_number)}</td>
              <td>${escapeHtml(student.registration_number)}</td>
              <td>${escapeHtml(student.department_name)}</td>
              <td>Semester ${escapeHtml(student.semester)} • Section ${escapeHtml(student.section)}</td>
            </tr>
          `
        ),
        emptyMessage: "No students are assigned to this faculty account yet."
      })}
    `;
    return;
  }

  const [studentsData, facultyData] = await Promise.all([api("/students"), api("/faculty")]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Admin Action",
        title: "Create student account",
        body: `
          <form id="studentCreateForm" class="form-grid">
            <label class="field"><span>Full name</span><input type="text" name="fullName" placeholder="Student full name" required /></label>
            <label class="field"><span>Email</span><input type="email" name="email" placeholder="student@college.edu" required /></label>
            <label class="field"><span>Password</span><input type="password" name="password" placeholder="At least 8 characters" required /></label>
            <label class="field"><span>Department</span><select name="departmentCode" required><option value="">Select department</option>${buildDepartmentOptions()}</select></label>
            <label class="field"><span>Semester</span><select name="semester" required>${Array.from({ length: 8 }, (_, index) => `<option value="${index + 1}">Semester ${index + 1}</option>`).join("")}</select></label>
            <label class="field"><span>Section</span><input type="text" name="section" placeholder="A" required /></label>
            <label class="field"><span>Roll number</span><input type="text" name="rollNumber" placeholder="CSE2026-010" required /></label>
            <label class="field"><span>Registration number</span><input type="text" name="registrationNumber" placeholder="REG2026-010" required /></label>
            <label class="field full-width">
              <span>Advisor faculty</span>
              <select name="advisorFacultyId">
                <option value="">Auto-assign first faculty in department</option>
                ${facultyData.faculty.map((faculty) => `<option value="${faculty.id}">${escapeHtml(faculty.full_name)} • ${escapeHtml(faculty.department_name)}</option>`).join("")}
              </select>
            </label>
            <button class="button button-primary full-width" type="submit">Create Student</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Overview",
        title: "Student directory summary",
        body: createStatsGrid([
          { label: "Students", value: String(studentsData.students.length), helper: "Total active student records", icon: "students" },
          { label: "Departments", value: String(new Set(studentsData.students.map((item) => item.department_name)).size), helper: "Represented academic departments", icon: "faculty" },
          { label: "Sections", value: String(new Set(studentsData.students.map((item) => item.section)).size), helper: "Section distribution", icon: "dashboard" },
          { label: "Advisors", value: String(new Set(studentsData.students.map((item) => item.advisor_name || "None")).size), helper: "Faculty advisor coverage", icon: "attendance" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Student master list",
      subtitle: "All student records available to the admin",
      headers: ["Student", "Roll Number", "Registration", "Advisor", "Department"],
      rows: studentsData.students.map(
        (student) => `
          <tr>
            <td><strong>${escapeHtml(student.full_name)}</strong><div class="muted-text">${escapeHtml(student.email)}</div></td>
            <td>${escapeHtml(student.roll_number)}</td>
            <td>${escapeHtml(student.registration_number)}</td>
            <td>${escapeHtml(student.advisor_name || "Not assigned")}</td>
            <td>${escapeHtml(student.department_name)} • Semester ${escapeHtml(student.semester)}</td>
          </tr>
        `
      ),
      emptyMessage: "No students are available yet."
    })}
  `;

  document.getElementById("studentCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/students", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Student created successfully.");
      await renderStudentsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderFacultyPage() {
  const pageContent = document.getElementById("pageContent");
  const [facultyData, academicData] = await Promise.all([api("/faculty"), api("/academics/overview")]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Create faculty account",
        body: `
          <form id="facultyCreateForm" class="form-grid">
            <label class="field"><span>Full name</span><input type="text" name="fullName" placeholder="Faculty full name" required /></label>
            <label class="field"><span>Email</span><input type="email" name="email" placeholder="faculty@college.edu" required /></label>
            <label class="field"><span>Password</span><input type="password" name="password" placeholder="At least 8 characters" required /></label>
            <label class="field">
              <span>Department</span>
              <select name="departmentCode" id="facultyDepartmentCreate" required>
                <option value="">Select department</option>
                ${academicData.departments
                  .map(
                    (department) =>
                      `<option value="${department.code}" data-department-id="${department.id}">${escapeHtml(department.name)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="facultyBranchCreate" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field"><span>Designation</span><input type="text" name="designation" placeholder="Assistant Professor" required /></label>
            <label class="field"><span>Employee code</span><input type="text" name="employeeCode" placeholder="FAC010" required /></label>
            <button class="button button-primary" type="submit">Create Faculty</button>
          </form>
        `
      })}
      ${panel({
        title: "Faculty structure",
        body: createStatsGrid([
          { label: "Faculty", value: String(facultyData.faculty.length), icon: "faculty" },
          { label: "Departments", value: String(new Set(facultyData.faculty.map((item) => item.department_name)).size), icon: "students" },
          { label: "Branches", value: String(new Set(facultyData.faculty.map((item) => item.branch_name || "General")).size), icon: "timetable" },
          { label: "Salary Credited", value: String(facultyData.faculty.filter((item) => item.salary_status === "credited").length), icon: "fees" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Faculty directory",
      headers: ["Faculty", "Employee Code", "Department", "Branch", "Salary"],
      rows: facultyData.faculty.map(
        (faculty) => `
          <tr>
            <td>${escapeHtml(faculty.full_name)}<div class="muted-text">${escapeHtml(faculty.email)}</div></td>
            <td>${escapeHtml(faculty.employee_code)}<div class="muted-text">${escapeHtml(faculty.designation)}</div></td>
            <td>${escapeHtml(faculty.department_name)}</td>
            <td>${escapeHtml(faculty.branch_name || "-")}</td>
            <td class="inline-actions">
              ${statusBadge(faculty.salary_status || "pending")}
              <button class="button button-ghost button-small" type="button" data-credit-salary="${faculty.id}">Mark Credited</button>
              <button
                class="icon-action icon-action-danger"
                type="button"
                data-delete-faculty="${faculty.id}"
                aria-label="Delete faculty"
                title="Delete faculty"
              >
                ${icon("trash")}
              </button>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No faculty records available."
    })}
  `;

  const departmentSelect = document.getElementById("facultyDepartmentCreate");
  const branchSelect = document.getElementById("facultyBranchCreate");

  const syncBranches = () => {
    const selectedDepartmentId = departmentSelect.selectedOptions[0]?.dataset.departmentId || "";
    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${buildBranchOptionsFromData(academicData.branches, selectedDepartmentId)}
    `;
  };

  departmentSelect?.addEventListener("change", syncBranches);

  document.getElementById("facultyCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/faculty", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Faculty created successfully.");
      await renderFacultyPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-credit-salary]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/academics/faculty/${button.dataset.creditSalary}/assignment`, {
          method: "PUT",
          body: JSON.stringify({ salaryStatus: "credited" })
        });
        showToast("Salary status updated.");
        await renderFacultyPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  document.querySelectorAll("[data-delete-faculty]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteFaculty(button.dataset.deleteFaculty, button);
    });
  });
}

async function deleteFaculty(facultyId, button = null) {
  const parsedFacultyId = Number(facultyId);

  if (!parsedFacultyId) {
    showToast("Faculty selection is invalid.", "error");
    return;
  }

  const confirmed = window.confirm("Are you sure you want to delete this faculty? This action cannot be undone.");
  if (!confirmed) {
    return;
  }

  if (button) {
    button.disabled = true;
  }

  try {
    await api(`/faculty/${parsedFacultyId}`, { method: "DELETE" });
    button?.closest("tr")?.remove();
    showToast("Faculty deleted successfully.");
    await renderFacultyPage();
  } catch (error) {
    if (button) {
      button.disabled = false;
    }
    showToast(error.message, "error");
  }
}

async function renderAttendancePage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const [attendanceData, subjectsData] = await Promise.all([api("/attendance/my"), api("/students/me/courses")]);

    const renderSubjectAttendance = (subjectId) => {
      const filtered =
        subjectId && subjectId !== "all"
          ? attendanceData.summary.byCourse.filter((item) => String(item.course_id) === String(subjectId))
          : attendanceData.summary.byCourse;

      return createTableCard({
        title: "Subject-wise attendance",
        headers: ["Subject", "Attended", "Total", "Percentage"],
        rows: filtered.map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.course_name)}<div class="muted-text">${escapeHtml(item.course_code)}</div></td>
              <td>${escapeHtml(item.attended_classes)}</td>
              <td>${escapeHtml(item.total_classes)}</td>
              <td>${statusBadge(`${item.percentage}%`)}</td>
            </tr>
          `
        ),
        emptyMessage: "No attendance records are available for the selected subject."
      });
    };

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Overall", value: `${attendanceData.summary.overallPercentage || 0}%`, icon: "attendance" },
        { label: "Subjects", value: String(attendanceData.summary.byCourse.length), icon: "timetable" },
        { label: "Recent Logs", value: String(attendanceData.summary.recent.length), icon: "dashboard" },
        { label: "Above 75%", value: String(attendanceData.summary.byCourse.filter((item) => Number(item.percentage) >= 75).length), icon: "results" }
      ])}
      ${panel({
        title: "Select subject",
        body: `
          <label class="field">
            <span>Subject</span>
            <select id="attendanceSubjectFilter">
              <option value="all">All subjects</option>
              ${subjectsData.courses
                .map((subject) => `<option value="${subject.id}">${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}</option>`)
                .join("")}
            </select>
          </label>
        `
      })}
      <div id="studentAttendanceTable">${renderSubjectAttendance("all")}</div>
      ${createTableCard({
        title: "Recent attendance log",
        headers: ["Date", "Subject", "Status"],
        rows: attendanceData.summary.recent.map(
          (item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${escapeHtml(item.course_name)}<div class="muted-text">${escapeHtml(item.course_code)}</div></td>
              <td>${statusBadge(item.status)}</td>
            </tr>
          `
        ),
        emptyMessage: "No recent attendance logs available."
      })}
    `;

    document.getElementById("attendanceSubjectFilter")?.addEventListener("change", (event) => {
      document.getElementById("studentAttendanceTable").innerHTML = renderSubjectAttendance(event.currentTarget.value);
    });
    return;
  }

  const isAdmin = STATE.user.role === "admin";
  const [coursesData, studentsData] = await Promise.all([
    api("/faculty/courses"),
    api(isAdmin ? "/students" : "/students/assigned")
  ]);

  const departmentOptions = [
    ...new Map(
      coursesData.courses.map((course) => [String(course.department_id), { id: course.department_id, name: course.department_name }])
    ).values()
  ];

  pageContent.innerHTML = `
    ${panel({
      title: isAdmin ? "Mark attendance by subject" : "Mark attendance",
      body: `
        <form id="attendanceForm" class="stack-form">
          <div class="form-grid">
            ${
              isAdmin
                ? `
                  <label class="field">
                    <span>Department</span>
                    <select id="attendanceDepartment">
                      <option value="">Select department</option>
                      ${departmentOptions.map((department) => `<option value="${department.id}">${escapeHtml(department.name)}</option>`).join("")}
                    </select>
                  </label>
                  <label class="field">
                    <span>Branch</span>
                    <select id="attendanceBranch">
                      <option value="">Select branch</option>
                    </select>
                  </label>
                `
                : ""
            }
            <label class="field">
              <span>Subject</span>
              <select name="courseId" id="attendanceCourse" required>
                <option value="">Select subject</option>
              </select>
            </label>
            <label class="field">
              <span>Date</span>
              <input type="date" name="date" id="attendanceDate" required />
            </label>
          </div>
          <div id="attendanceRoster">${emptyState("Choose a subject to load the student roster.")}</div>
          <button class="button button-primary" type="submit">Save Attendance</button>
        </form>
      `
    })}
    <div id="attendanceHistory"></div>
  `;

  const departmentSelect = document.getElementById("attendanceDepartment");
  const branchSelect = document.getElementById("attendanceBranch");
  const courseSelect = document.getElementById("attendanceCourse");
  const dateInput = document.getElementById("attendanceDate");
  const rosterRoot = document.getElementById("attendanceRoster");
  const historyRoot = document.getElementById("attendanceHistory");
  dateInput.value = new Date().toISOString().slice(0, 10);

  const getVisibleCourses = () =>
    coursesData.courses
      .filter((course) => !isAdmin || !departmentSelect.value || String(course.department_id) === String(departmentSelect.value))
      .filter((course) => !isAdmin || !branchSelect.value || String(course.branch_id) === String(branchSelect.value));

  const syncBranchOptions = () => {
    if (!isAdmin || !branchSelect) return;

    const visibleBranches = [
      ...new Map(
        coursesData.courses
          .filter((course) => !departmentSelect.value || String(course.department_id) === String(departmentSelect.value))
          .map((course) => [String(course.branch_id), { id: course.branch_id, name: course.branch_name }])
      ).values()
    ];

    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${visibleBranches.map((branch) => `<option value="${branch.id}">${escapeHtml(branch.name || "-")}</option>`).join("")}
    `;
  };

  const syncSubjectOptions = () => {
    courseSelect.innerHTML = `
      <option value="">Select subject</option>
      ${getVisibleCourses()
        .map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`)
        .join("")}
    `;
  };

  const renderRoster = async () => {
    const selectedCourse = coursesData.courses.find((course) => String(course.id) === courseSelect.value);
    if (!selectedCourse) {
      rosterRoot.innerHTML = emptyState("Choose a subject to load the student roster.");
      historyRoot.innerHTML = "";
      return;
    }

    const roster = studentsData.students.filter(
      (student) =>
        student.department_name === selectedCourse.department_name &&
        String(student.branch_id || "") === String(selectedCourse.branch_id || "") &&
        Number(student.semester) === Number(selectedCourse.semester)
    );

    rosterRoot.innerHTML = roster.length
      ? `
          <section class="roster-card">
            <div class="roster-header">
              <div>
                <h3 style="margin: 0;">${escapeHtml(selectedCourse.name)}</h3>
                <p class="muted-text">${escapeHtml(selectedCourse.code)} - ${escapeHtml(selectedCourse.branch_name || selectedCourse.department_name)}</p>
              </div>
              ${statusBadge("ready")}
            </div>
            <div class="roster-grid">
              ${roster
                .map(
                  (student) => `
                    <div class="roster-item">
                      <div>
                        <strong>${escapeHtml(student.full_name)}</strong>
                        <div class="muted-text">${escapeHtml(student.roll_number)} - Section ${escapeHtml(student.section)}</div>
                      </div>
                      <label class="field" style="margin: 0;">
                        <span>Status</span>
                        <select name="status-${student.id}" data-student-id="${student.id}">
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                        </select>
                      </label>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      : emptyState("No students are mapped to this subject yet.");

    const history = await api(`/attendance/course/${selectedCourse.id}`);
    historyRoot.innerHTML = createTableCard({
      title: "Attendance history",
      headers: ["Date", "Student", "Roll Number", "Status"],
      rows: history.records.map(
        (record) => `
          <tr>
            <td>${formatDate(record.date)}</td>
            <td>${escapeHtml(record.full_name)}</td>
            <td>${escapeHtml(record.roll_number)}</td>
            <td>${statusBadge(record.status)}</td>
          </tr>
        `
      ),
      emptyMessage: "No attendance history found for this subject."
    });
  };

  departmentSelect?.addEventListener("change", () => {
    syncBranchOptions();
    syncSubjectOptions();
    renderRoster();
  });
  branchSelect?.addEventListener("change", () => {
    syncSubjectOptions();
    renderRoster();
  });
  courseSelect?.addEventListener("change", renderRoster);

  syncBranchOptions();
  syncSubjectOptions();

  document.getElementById("attendanceForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!courseSelect.value) {
      showToast("Please select a subject first.", "error");
      return;
    }

    const records = [...document.querySelectorAll("[data-student-id]")].map((field) => ({
      studentId: Number(field.dataset.studentId),
      status: field.value
    }));

    try {
      await api("/attendance", {
        method: "POST",
        body: JSON.stringify({
          courseId: Number(courseSelect.value),
          date: dateInput.value,
          records
        })
      });
      showToast("Attendance saved successfully.");
      await renderRoster();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderExamsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const [resultsData, examsData] = await Promise.all([api("/results/my"), api("/results/exams")]);

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Results", value: String(resultsData.results.length), icon: "results" },
        { label: "Scheduled Exams", value: String(examsData.exams.length), icon: "attendance" },
        { label: "Passed Subjects", value: String(resultsData.results.filter((item) => item.grade !== "F").length), icon: "students" },
        { label: "Top Grade", value: resultsData.results[0] ? resultsData.results[0].grade : "-", icon: "dashboard" }
      ])}
      ${createTableCard({
        title: "Upcoming exams",
        headers: ["Subject", "Branch", "Date", "Time"],
        rows: examsData.exams.map(
          (exam) => `
            <tr>
              <td>${escapeHtml(exam.course_name)}<div class="muted-text">${escapeHtml(exam.course_code)}</div></td>
              <td>${escapeHtml(exam.department_name || "-")}<div class="muted-text">${escapeHtml(exam.branch_name || "-")}</div></td>
              <td>${formatDate(exam.exam_date)}</td>
              <td>${escapeHtml(exam.exam_time)}</td>
            </tr>
          `
        ),
        emptyMessage: "No exams are scheduled yet."
      })}
      ${createTableCard({
        title: "Published results",
        headers: ["Subject", "Exam", "Score", "Grade", "Published"],
        rows: resultsData.results.map(
          (result) => `
            <tr>
              <td>${escapeHtml(result.course_name)}<div class="muted-text">${escapeHtml(result.course_code)}</div></td>
              <td>${escapeHtml(result.exam_type)}</td>
              <td>${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</td>
              <td>${statusBadge(result.grade)}</td>
              <td>${formatDateTime(result.published_at)}</td>
            </tr>
          `
        ),
        emptyMessage: "Results are not available yet."
      })}
    `;
    return;
  }

  const isAdmin = STATE.user.role === "admin";
  const [resultsData, examsData, coursesData, studentsData] = await Promise.all([
    api("/results"),
    api("/results/exams"),
    api("/faculty/courses"),
    api(isAdmin ? "/students" : "/students/assigned")
  ]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Publish marks",
        body: `
          <form id="resultForm" class="form-grid">
            <label class="field">
              <span>Subject</span>
              <select name="courseId" id="resultCourse" required>
                <option value="">Select subject</option>
                ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Student</span>
              <select name="studentId" id="resultStudent" required><option value="">Select student</option></select>
            </label>
            <label class="field"><span>Exam type</span><input type="text" name="examType" placeholder="Mid Semester" required /></label>
            <label class="field"><span>Marks obtained</span><input type="number" name="marksObtained" min="0" required /></label>
            <label class="field"><span>Maximum marks</span><input type="number" name="maxMarks" min="1" required /></label>
            <label class="field full-width"><span>Remarks</span><textarea name="remarks" placeholder="Optional note"></textarea></label>
            <button class="button button-primary" type="submit">Publish Result</button>
          </form>
        `
      })}
      ${
        isAdmin
          ? panel({
              title: "Create exam schedule",
              body: `
                <form id="examCreateForm" class="form-grid">
                  <label class="field">
                    <span>Subject</span>
                    <select name="courseId" required>
                      <option value="">Select subject</option>
                      ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`).join("")}
                    </select>
                  </label>
                  <label class="field"><span>Exam name</span><input type="text" name="examName" placeholder="Mid Semester" required /></label>
                  <label class="field"><span>Date</span><input type="date" name="examDate" required /></label>
                  <label class="field"><span>Time</span><input type="time" name="examTime" required /></label>
                  <button class="button button-primary" type="submit">Create Exam</button>
                </form>
              `
            })
          : panel({
              title: "Exam overview",
              body: createStatsGrid([
                { label: "Results", value: String(resultsData.results.length), icon: "results" },
                { label: "Scheduled", value: String(examsData.exams.length), icon: "attendance" },
                { label: "Subjects", value: String(coursesData.courses.length), icon: "timetable" },
                { label: "Students", value: String(studentsData.students.length), icon: "students" }
              ])
            })
      }
    </section>
    ${createTableCard({
      title: "Exam schedule",
      headers: ["Subject", "Branch", "Date", "Time"],
      rows: examsData.exams.map(
        (exam) => `
          <tr>
            <td>${escapeHtml(exam.course_name)}<div class="muted-text">${escapeHtml(exam.course_code)}</div></td>
            <td>${escapeHtml(exam.department_name || "-")}<div class="muted-text">${escapeHtml(exam.branch_name || "-")}</div></td>
            <td>${formatDate(exam.exam_date)}</td>
            <td>${escapeHtml(exam.exam_time)}</td>
          </tr>
        `
      ),
      emptyMessage: "No exam schedule available yet."
    })}
    ${createTableCard({
      title: "Published results",
      headers: ["Student", "Subject", "Exam", "Score", "Grade"],
      rows: resultsData.results.map(
        (result) => `
          <tr>
            <td>${escapeHtml(result.student_name)}<div class="muted-text">${escapeHtml(result.roll_number)}</div></td>
            <td>${escapeHtml(result.course_name)}<div class="muted-text">${escapeHtml(result.course_code)}</div></td>
            <td>${escapeHtml(result.exam_type)}</td>
            <td>${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</td>
            <td>${statusBadge(result.grade)}</td>
          </tr>
        `
      ),
      emptyMessage: "No results have been published yet."
    })}
  `;

  const courseSelect = document.getElementById("resultCourse");
  const studentSelect = document.getElementById("resultStudent");

  const populateStudents = () => {
    const selectedCourse = coursesData.courses.find((course) => String(course.id) === courseSelect.value);
    const filteredStudents = selectedCourse
      ? studentsData.students.filter(
          (student) =>
            student.department_name === selectedCourse.department_name &&
            String(student.branch_id || "") === String(selectedCourse.branch_id || "") &&
            Number(student.semester) === Number(selectedCourse.semester)
        )
      : [];

    studentSelect.innerHTML = filteredStudents.length
      ? filteredStudents
          .map((student) => `<option value="${student.id}">${escapeHtml(student.full_name)} - ${escapeHtml(student.roll_number)}</option>`)
          .join("")
      : `<option value="">Select student</option>`;
  };

  courseSelect?.addEventListener("change", populateStudents);
  populateStudents();

  document.getElementById("resultForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/results", {
        method: "POST",
        body: JSON.stringify({
          studentId: Number(formData.get("studentId")),
          courseId: Number(formData.get("courseId")),
          examType: formData.get("examType"),
          marksObtained: Number(formData.get("marksObtained")),
          maxMarks: Number(formData.get("maxMarks")),
          remarks: formData.get("remarks")
        })
      });
      showToast("Result published successfully.");
      await renderExamsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("examCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/results/exams", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Exam created successfully.");
      await renderExamsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderFacultyPageLegacy() {
  const pageContent = document.getElementById("pageContent");
  const facultyData = await api("/faculty");

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Admin Action",
        title: "Create faculty account",
        body: `
          <form id="facultyCreateForm" class="form-grid">
            <label class="field"><span>Full name</span><input type="text" name="fullName" placeholder="Faculty full name" required /></label>
            <label class="field"><span>Email</span><input type="email" name="email" placeholder="faculty@college.edu" required /></label>
            <label class="field"><span>Password</span><input type="password" name="password" placeholder="At least 8 characters" required /></label>
            <label class="field"><span>Department</span><select name="departmentCode" required><option value="">Select department</option>${buildDepartmentOptions()}</select></label>
            <label class="field"><span>Designation</span><input type="text" name="designation" placeholder="Assistant Professor" required /></label>
            <label class="field"><span>Employee code</span><input type="text" name="employeeCode" placeholder="FAC010" required /></label>
            <button class="button button-primary full-width" type="submit">Create Faculty</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Overview",
        title: "Faculty roster summary",
        body: createStatsGrid([
          { label: "Faculty", value: String(facultyData.faculty.length), helper: "Total faculty accounts", icon: "faculty" },
          { label: "Departments", value: String(new Set(facultyData.faculty.map((item) => item.department_name)).size), helper: "Academic departments covered", icon: "students" },
          { label: "Designations", value: String(new Set(facultyData.faculty.map((item) => item.designation)).size), helper: "Role diversity among faculty", icon: "dashboard" },
          { label: "Mail IDs", value: String(facultyData.faculty.length), helper: "Reachable faculty accounts", icon: "materials" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Faculty directory",
      subtitle: "All faculty profiles visible to the admin",
      headers: ["Faculty", "Employee Code", "Designation", "Department"],
      rows: facultyData.faculty.map(
        (faculty) => `
          <tr>
            <td><strong>${escapeHtml(faculty.full_name)}</strong><div class="muted-text">${escapeHtml(faculty.email)}</div></td>
            <td>${escapeHtml(faculty.employee_code)}</td>
            <td>${escapeHtml(faculty.designation)}</td>
            <td>${escapeHtml(faculty.department_name)}</td>
          </tr>
        `
      ),
      emptyMessage: "No faculty records available."
    })}
  `;

  document.getElementById("facultyCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/faculty", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Faculty created successfully.");
      await renderFacultyPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderAttendancePageLegacy() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const attendanceData = await api("/attendance/my");
    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Overall Attendance", value: `${attendanceData.summary.overallPercentage || 0}%`, helper: "Across all your courses", icon: "attendance" },
        { label: "Courses Tracked", value: String(attendanceData.summary.byCourse.length), helper: "Course-level attendance records", icon: "timetable" },
        { label: "Recent Logs", value: String(attendanceData.summary.recent.length), helper: "Latest attendance updates", icon: "dashboard" },
        { label: "Eligible Courses", value: String(attendanceData.summary.byCourse.filter((item) => Number(item.percentage) >= 75).length), helper: "Courses above 75%", icon: "results" }
      ])}
      ${createTableCard({
        title: "Attendance by course",
        subtitle: "Percentage and class count for each course",
        headers: ["Course", "Attended", "Total", "Percentage"],
        rows: attendanceData.summary.byCourse.map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.course_name)} <div class="muted-text">${escapeHtml(item.course_code)}</div></td>
              <td>${escapeHtml(item.attended_classes)}</td>
              <td>${escapeHtml(item.total_classes)}</td>
              <td>${statusBadge(`${item.percentage}%`)}</td>
            </tr>
          `
        ),
        emptyMessage: "No attendance records are available yet."
      })}
      ${createTableCard({
        title: "Recent attendance log",
        subtitle: "Most recent status updates from faculty",
        headers: ["Date", "Course", "Status"],
        rows: attendanceData.summary.recent.map(
          (item) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${escapeHtml(item.course_name)} <div class="muted-text">${escapeHtml(item.course_code)}</div></td>
              <td>${statusBadge(item.status)}</td>
            </tr>
          `
        ),
        emptyMessage: "No recent attendance logs available."
      })}
    `;
    return;
  }

  const [coursesData, studentsData] = await Promise.all([api("/faculty/courses"), api("/faculty/assigned-students")]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Faculty Action",
        title: "Mark attendance",
        body: `
          <form id="attendanceForm" class="stack-form">
            <div class="form-grid">
              <label class="field">
                <span>Course</span>
                <select name="courseId" id="attendanceCourse" required>
                  <option value="">Select course</option>
                  ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} • ${escapeHtml(course.name)}</option>`).join("")}
                </select>
              </label>
              <label class="field">
                <span>Date</span>
                <input type="date" name="date" id="attendanceDate" required />
              </label>
            </div>
            <div id="attendanceRoster">${emptyState("Choose a course to load the student roster.")}</div>
            <button class="button button-primary" type="submit">Save Attendance</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Snapshot",
        title: "Attendance operations",
        body: createStatsGrid([
          { label: "Courses", value: String(coursesData.courses.length), helper: "Available for attendance entry", icon: "timetable" },
          { label: "Students", value: String(studentsData.students.length), helper: "Roster available to mark", icon: "students" },
          { label: "Role", value: getRoleLabel(STATE.user.role), helper: "Permission scope on this page", icon: "dashboard" },
          { label: "Tracking", value: "Daily", helper: "Attendance captured by date", icon: "attendance" }
        ])
      })}
    </section>
    <div id="attendanceHistory"></div>
  `;

  const courseSelect = document.getElementById("attendanceCourse");
  const dateInput = document.getElementById("attendanceDate");
  const rosterRoot = document.getElementById("attendanceRoster");
  const historyRoot = document.getElementById("attendanceHistory");

  dateInput.value = new Date().toISOString().slice(0, 10);

  const renderRoster = async () => {
    const selectedCourse = coursesData.courses.find((course) => String(course.id) === courseSelect.value);
    if (!selectedCourse) {
      rosterRoot.innerHTML = emptyState("Choose a course to load the student roster.");
      historyRoot.innerHTML = "";
      return;
    }

    const roster = studentsData.students.filter(
      (student) => student.department_name === selectedCourse.department_name && Number(student.semester) === Number(selectedCourse.semester)
    );

    rosterRoot.innerHTML = roster.length
      ? `
          <section class="roster-card">
            <div class="roster-header">
              <div>
                <h3 style="margin: 0;">${escapeHtml(selectedCourse.name)}</h3>
                <p class="muted-text">${escapeHtml(selectedCourse.code)} • Semester ${escapeHtml(selectedCourse.semester)}</p>
              </div>
              ${statusBadge("ready")}
            </div>
            <div class="roster-grid">
              ${roster
                .map(
                  (student) => `
                    <div class="roster-item">
                      <div>
                        <strong>${escapeHtml(student.full_name)}</strong>
                        <div class="muted-text">${escapeHtml(student.roll_number)} • Section ${escapeHtml(student.section)}</div>
                      </div>
                      <label class="field" style="margin: 0;">
                        <span>Status</span>
                        <select name="status-${student.id}" data-student-id="${student.id}">
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                        </select>
                      </label>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      : emptyState("No students are mapped to this course yet.");

    const history = await api(`/attendance/course/${selectedCourse.id}`);
    historyRoot.innerHTML = createTableCard({
      title: "Recent attendance history",
      subtitle: `Past submissions for ${selectedCourse.code}`,
      headers: ["Date", "Student", "Roll Number", "Status"],
      rows: history.records.map(
        (record) => `
          <tr>
            <td>${formatDate(record.date)}</td>
            <td>${escapeHtml(record.full_name)}</td>
            <td>${escapeHtml(record.roll_number)}</td>
            <td>${statusBadge(record.status)}</td>
          </tr>
        `
      ),
      emptyMessage: "No attendance history found for this course."
    });
  };

  courseSelect?.addEventListener("change", renderRoster);

  document.getElementById("attendanceForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selectedCourse = coursesData.courses.find((course) => String(course.id) === courseSelect.value);
    if (!selectedCourse) {
      showToast("Please select a course first.", "error");
      return;
    }

    const records = [...document.querySelectorAll("[data-student-id]")].map((field) => ({
      studentId: Number(field.dataset.studentId),
      status: field.value
    }));

    try {
      await api("/attendance", {
        method: "POST",
        body: JSON.stringify({
          courseId: Number(courseSelect.value),
          date: dateInput.value,
          records
        })
      });
      showToast("Attendance saved successfully.");
      await renderRoster();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderExamsPageLegacy() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const resultsData = await api("/results/my");
    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Published Results", value: String(resultsData.results.length), helper: "Exam records available", icon: "results" },
        { label: "Top Grade", value: resultsData.results[0] ? resultsData.results[0].grade : "-", helper: "Most recent published grade", icon: "dashboard" },
        { label: "Passed Courses", value: String(resultsData.results.filter((item) => item.grade !== "F").length), helper: "Courses above failing threshold", icon: "students" },
        { label: "Assessments", value: String(new Set(resultsData.results.map((item) => item.exam_type)).size), helper: "Different exam categories", icon: "attendance" }
      ])}
      ${createTableCard({
        title: "Published results",
        subtitle: "Exam records available to the student",
        headers: ["Course", "Exam", "Score", "Grade", "Published"],
        rows: resultsData.results.map(
          (result) => `
            <tr>
              <td>${escapeHtml(result.course_name)} <div class="muted-text">${escapeHtml(result.course_code)}</div></td>
              <td>${escapeHtml(result.exam_type)}</td>
              <td>${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</td>
              <td>${statusBadge(result.grade)}</td>
              <td>${formatDateTime(result.published_at)}</td>
            </tr>
          `
        ),
        emptyMessage: "Results are not available yet."
      })}
    `;
    return;
  }

  const [resultsData, coursesData, studentsData] = await Promise.all([api("/results"), api("/faculty/courses"), api("/faculty/assigned-students")]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Faculty Action",
        title: "Publish result",
        body: `
          <form id="resultForm" class="form-grid">
            <label class="field">
              <span>Subject</span>
              <select name="courseId" id="resultCourse" required>
                <option value="">Select subject</option>
                ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} • ${escapeHtml(course.name)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Student</span>
              <select name="studentId" id="resultStudent" required><option value="">Select student</option></select>
            </label>
            <label class="field"><span>Exam type</span><input type="text" name="examType" placeholder="Mid Semester" required /></label>
            <label class="field"><span>Marks obtained</span><input type="number" name="marksObtained" min="0" required /></label>
            <label class="field"><span>Maximum marks</span><input type="number" name="maxMarks" min="1" required /></label>
            <label class="field full-width"><span>Remarks</span><textarea name="remarks" placeholder="Optional performance notes"></textarea></label>
            <button class="button button-primary full-width" type="submit">Publish Result</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Summary",
        title: "Result publication",
        body: createStatsGrid([
          { label: "Results", value: String(resultsData.results.length), helper: "Published academic records", icon: "results" },
          { label: "Courses", value: String(coursesData.courses.length), helper: "Courses available for grading", icon: "timetable" },
          { label: "Students", value: String(studentsData.students.length), helper: "Student roster in scope", icon: "students" },
          { label: "Role", value: getRoleLabel(STATE.user.role), helper: "Publishing permissions active", icon: "dashboard" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Published results",
      subtitle: "Latest result records for accessible courses",
      headers: ["Student", "Course", "Exam", "Score", "Grade"],
      rows: resultsData.results.map(
        (result) => `
          <tr>
            <td>${escapeHtml(result.student_name)} <div class="muted-text">${escapeHtml(result.roll_number)}</div></td>
            <td>${escapeHtml(result.course_name)} <div class="muted-text">${escapeHtml(result.course_code)}</div></td>
            <td>${escapeHtml(result.exam_type)}</td>
            <td>${escapeHtml(result.marks_obtained)}/${escapeHtml(result.max_marks)}</td>
            <td>${statusBadge(result.grade)}</td>
          </tr>
        `
      ),
      emptyMessage: "No results have been published yet."
    })}
  `;

  const courseSelect = document.getElementById("resultCourse");
  const studentSelect = document.getElementById("resultStudent");

  const populateStudents = () => {
    const selectedCourse = coursesData.courses.find((course) => String(course.id) === courseSelect.value);
    const filtered = selectedCourse
      ? studentsData.students.filter(
          (student) => student.department_name === selectedCourse.department_name && Number(student.semester) === Number(selectedCourse.semester)
        )
      : [];

    studentSelect.innerHTML = filtered.length
      ? filtered.map((student) => `<option value="${student.id}">${escapeHtml(student.full_name)} • ${escapeHtml(student.roll_number)}</option>`).join("")
      : `<option value="">Select student</option>`;
  };

  courseSelect?.addEventListener("change", populateStudents);
  populateStudents();

  document.getElementById("resultForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/results", {
        method: "POST",
        body: JSON.stringify({
          studentId: Number(formData.get("studentId")),
          courseId: Number(formData.get("courseId")),
          examType: formData.get("examType"),
          marksObtained: Number(formData.get("marksObtained")),
          maxMarks: Number(formData.get("maxMarks")),
          remarks: formData.get("remarks")
        })
      });
      showToast("Result published successfully.");
      await renderExamsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function buildSemesterOptions(selectedValue = "") {
  return Array.from({ length: 8 }, (_, index) => {
    const value = String(index + 1);
    const selected = String(selectedValue) === value ? "selected" : "";
    return `<option value="${value}" ${selected}>Semester ${value}</option>`;
  }).join("");
}

function buildTimetableBoard(timetable, emptyMessage = "No classes scheduled for this day.") {
  const canManageTimetable = STATE.user?.role === "admin";

  return `
    <section class="schedule-grid">
      ${WEEK_DAYS.map((day) => {
        const entries = timetable.filter((item) => item.day_of_week === day);
        return `
          <article class="schedule-day-card">
            <div class="split-row schedule-day-head">
              <div class="panel-heading">
                <h2>${escapeHtml(day)}</h2>
              </div>
              <div class="inline-actions">
                <span class="muted-text">${entries.length} slot${entries.length === 1 ? "" : "s"}</span>
                ${
                  canManageTimetable && entries.length
                    ? `<button class="button button-danger button-small" type="button" data-delete-day="${day}">Delete All</button>`
                    : ""
                }
              </div>
            </div>
            ${
              entries.length
                ? `<div class="schedule-slot-list">
                    ${entries
                      .map((entry) => {
                        const details = [
                          entry.course_code,
                          entry.faculty_name,
                          entry.department_name,
                          entry.room_no ? `Room ${entry.room_no}` : null
                        ]
                          .filter(Boolean)
                          .map((item) => escapeHtml(item))
                          .join(" / ");

                        return `
                          <article class="schedule-slot">
                            ${
                              canManageTimetable
                                ? `
                                  <button
                                    class="schedule-slot-delete"
                                    type="button"
                                    data-delete-slot="${entry.id}"
                                    aria-label="Delete timetable slot"
                                    title="Delete timetable slot"
                                  >
                                    ${icon("trash")}
                                  </button>
                                `
                                : ""
                            }
                            <div class="schedule-slot-time">${escapeHtml(entry.start_time)} - ${escapeHtml(entry.end_time)}</div>
                            <h3>${escapeHtml(entry.course_name)}</h3>
                            <p>${details}</p>
                          </article>
                        `;
                      })
                      .join("")}
                  </div>`
                : `<div class="empty-inline">${escapeHtml(emptyMessage)}</div>`
            }
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function bindTimetableAdminActions() {
  if (STATE.user?.role !== "admin") {
    return;
  }

  document.querySelectorAll("[data-delete-slot]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteTimetableSlot(button.dataset.deleteSlot, button);
    });
  });

  document.querySelectorAll("[data-delete-day]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteDaySlots(button.dataset.deleteDay, button);
    });
  });
}

async function deleteTimetableSlot(slotId, button = null) {
  const parsedSlotId = Number(slotId);

  if (!parsedSlotId) {
    showToast("Timetable slot selection is invalid.", "error");
    return;
  }

  const confirmed = window.confirm("Delete this timetable slot?");
  if (!confirmed) {
    return;
  }

  if (button) {
    button.disabled = true;
  }

  try {
    await api(`/faculty/timetable/${parsedSlotId}`, { method: "DELETE" });
    showToast("Timetable slot deleted successfully.");
    await renderTimetablePage();
  } catch (error) {
    if (button) {
      button.disabled = false;
    }
    showToast(error.message, "error");
  }
}

async function deleteDaySlots(day, button = null) {
  if (!day) {
    showToast("Timetable day selection is invalid.", "error");
    return;
  }

  const confirmed = window.confirm(`Delete all timetable slots for ${day}?`);
  if (!confirmed) {
    return;
  }

  if (button) {
    button.disabled = true;
  }

  try {
    const response = await api(`/faculty/timetable/day/${encodeURIComponent(day)}`, { method: "DELETE" });
    showToast(response.message || "Day timetable deleted successfully.");
    await renderTimetablePage();
  } catch (error) {
    if (button) {
      button.disabled = false;
    }
    showToast(error.message, "error");
  }
}

function buildDepartmentOptionsFromData(departments, selectedValue = "") {
  return departments
    .map((department) => {
      const selected = String(selectedValue) === String(department.id) ? "selected" : "";
      return `<option value="${department.id}" ${selected}>${escapeHtml(department.name)}</option>`;
    })
    .join("");
}

function buildBranchOptionsFromData(branches, departmentId, selectedValue = "") {
  return branches
    .filter((branch) => !departmentId || String(branch.department_id) === String(departmentId))
    .map((branch) => {
      const selected = String(selectedValue) === String(branch.id) ? "selected" : "";
      return `<option value="${branch.id}" ${selected}>${escapeHtml(branch.name)}</option>`;
    })
    .join("");
}

function buildSubjectOptions(subjects, { departmentId = "", branchId = "", facultyOnly = false } = {}) {
  return subjects
    .filter((subject) => !departmentId || String(subject.department_id) === String(departmentId))
    .filter((subject) => !branchId || String(subject.branch_id) === String(branchId))
    .filter((subject) => (facultyOnly ? Boolean(subject.faculty_id) : true))
    .map(
      (subject) =>
        `<option value="${subject.id}">${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}</option>`
    )
    .join("");
}

function buildFacultyAssignmentOptions(facultyList, selectedValue = "") {
  return facultyList
    .map((faculty) => {
      const selected = String(selectedValue) === String(faculty.id) ? "selected" : "";
      const descriptor = faculty.branch_name || faculty.department_name || faculty.employee_code || "Faculty";
      return `<option value="${faculty.id}" ${selected}>${escapeHtml(faculty.full_name)} - ${escapeHtml(descriptor)}</option>`;
    })
    .join("");
}

async function fetchCurrentTimetableData() {
  if (STATE.user.role === "student") {
    const studentId = STATE.user.studentProfile?.id;
    if (!studentId) {
      throw new Error("Student profile is unavailable for timetable lookup.");
    }

    return api(`/timetable/${studentId}`);
  }

  return api("/faculty/timetable");
}

async function renderTimetablePageLegacy() {
  const pageContent = document.getElementById("pageContent");
  const data = await fetchCurrentTimetableData();
  const timetable = data.timetable;
  const grouped = timetable.reduce((acc, item) => {
    acc[item.day_of_week] = acc[item.day_of_week] || [];
    acc[item.day_of_week].push(item);
    return acc;
  }, {});

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Classes", value: String(timetable.length), helper: "Timetable entries available", icon: "timetable" },
      { label: "Working Days", value: String(Object.keys(grouped).length), helper: "Days with scheduled sessions", icon: "attendance" },
      { label: "Rooms", value: String(new Set(timetable.map((item) => item.room_no)).size), helper: "Rooms involved in the schedule", icon: "dashboard" },
      { label: "Courses", value: String(new Set(timetable.map((item) => item.course_code)).size), helper: "Distinct scheduled courses", icon: "results" }
    ])}
    <section class="section-grid two-column">
      ${Object.keys(grouped).length
        ? Object.entries(grouped)
            .map(
              ([day, entries]) => `
                <section class="panel">
                  <div class="panel-heading">
                    <span class="eyebrow">Weekly Plan</span>
                    <h2>${escapeHtml(day)}</h2>
                  </div>
                  <div class="subtle-divider" style="margin: 18px 0;"></div>
                  <div class="timeline">
                    ${entries
                      .map(
                        (entry) => `
                          <article class="timeline-item">
                            <div class="meta-row">
                              ${tag(`${entry.start_time} - ${entry.end_time}`)}
                              ${statusBadge(entry.room_no)}
                            </div>
                            <h3>${escapeHtml(entry.course_name)}</h3>
                            <p>${escapeHtml(entry.course_code)}${entry.faculty_name ? ` • ${escapeHtml(entry.faculty_name)}` : ""}</p>
                          </article>
                        `
                      )
                      .join("")}
                  </div>
                </section>
              `
            )
            .join("")
        : emptyState("No timetable entries available.")}
    </section>
  `;

  bindTimetableAdminActions();
}

async function renderFeesPageLegacy() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const feesData = await api("/students/me/fees");
    const current = feesData.fees[0];

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Current Status", value: current ? current.status.toUpperCase() : "N/A", helper: "Latest fee record status", icon: "fees" },
        { label: "Total Amount", value: current ? formatCurrency(current.total_amount) : formatCurrency(0), helper: "Semester fee billed", icon: "dashboard" },
        { label: "Paid", value: current ? formatCurrency(current.paid_amount) : formatCurrency(0), helper: "Amount already paid", icon: "results" },
        { label: "Balance", value: current ? formatCurrency(current.balance) : formatCurrency(0), helper: "Amount still due", icon: "attendance" }
      ])}
      ${createTableCard({
        title: "Fee history",
        subtitle: "Student-facing fee record details",
        headers: ["Semester", "Total", "Paid", "Balance", "Status", "Due Date"],
        rows: feesData.fees.map(
          (fee) => `
            <tr>
              <td>Semester ${escapeHtml(fee.semester)}</td>
              <td>${formatCurrency(fee.total_amount)}</td>
              <td>${formatCurrency(fee.paid_amount)}</td>
              <td>${formatCurrency(fee.balance)}</td>
              <td>${statusBadge(fee.status)}</td>
              <td>${formatDate(fee.due_date)}</td>
            </tr>
          `
        ),
        emptyMessage: "No fee records found."
      })}
    `;
    return;
  }

  const feesData = await api("/students/fees");
  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Fee Records", value: String(feesData.fees.length), helper: "Student fee entries on file", icon: "fees" },
      { label: "Pending Balance", value: formatCurrency(feesData.fees.reduce((sum, fee) => sum + Number(fee.balance), 0)), helper: "Outstanding collection amount", icon: "dashboard" },
      { label: "Paid Records", value: String(feesData.fees.filter((fee) => fee.status === "paid").length), helper: "Accounts with full settlement", icon: "results" },
      { label: "Partial Records", value: String(feesData.fees.filter((fee) => fee.status === "partial").length), helper: "Accounts needing follow-up", icon: "attendance" }
    ])}
    ${createTableCard({
      title: "Fee ledger",
      subtitle: "Admin-wide view of fee records",
      headers: ["Student", "Semester", "Total", "Balance", "Status", "Due Date"],
      rows: feesData.fees.map(
        (fee) => `
          <tr>
            <td>${escapeHtml(fee.full_name)} <div class="muted-text">${escapeHtml(fee.roll_number)}</div></td>
            <td>Semester ${escapeHtml(fee.semester)}</td>
            <td>${formatCurrency(fee.total_amount)}</td>
            <td>${formatCurrency(fee.balance)}</td>
            <td>${statusBadge(fee.status)}</td>
            <td>${formatDate(fee.due_date)}</td>
          </tr>
        `
      ),
      emptyMessage: "No fee records available."
    })}
  `;
}

async function renderAssignmentsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const [assignmentsData, submissionsData] = await Promise.all([api("/assignments"), api("/submissions/my")]);

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Assignments", value: String(assignmentsData.assignments.length), helper: "Tasks available for this semester", icon: "assignments" },
        { label: "Submitted", value: String(submissionsData.submissions.length), helper: "Assignments already uploaded", icon: "materials" },
        { label: "Pending", value: String(assignmentsData.assignments.filter((item) => !submissionsData.submissions.some((submission) => submission.assignment_id === item.id)).length), helper: "Assignments still open", icon: "attendance" },
        { label: "Late", value: String(submissionsData.submissions.filter((item) => item.status === "late").length), helper: "Submissions past the deadline", icon: "dashboard" }
      ])}
      <section class="assignment-grid">
        ${
          assignmentsData.assignments.length
            ? assignmentsData.assignments
                .map((assignment) => {
                  const submission = submissionsData.submissions.find((item) => item.assignment_id === assignment.id);
                  return `
                    <article class="assignment-card">
                      <div class="split-row">
                        <div>
                          <div class="meta-row">
                            ${statusBadge(submission ? submission.status : "pending")}
                            ${tag(assignment.course_code)}
                          </div>
                          <h3 style="margin: 12px 0 8px;">${escapeHtml(assignment.title)}</h3>
                          <p>${escapeHtml(assignment.description)}</p>
                        </div>
                        <div class="muted-text">Due ${formatDateTime(assignment.deadline)}</div>
                      </div>
                      <div class="inline-actions">
                        ${
                          assignment.attachmentUrl
                            ? `<a class="button button-secondary button-small" href="${normalizeAssetUrl(assignment.attachmentUrl)}" target="_blank" rel="noreferrer">Download Brief</a>`
                            : ""
                        }
                        ${
                          submission
                            ? `<a class="button button-secondary button-small" href="${normalizeAssetUrl(submission.downloadUrl)}" target="_blank" rel="noreferrer">View Submission</a>`
                            : ""
                        }
                      </div>
                      <form class="compact-form" data-submission-form="${assignment.id}">
                        <label class="field">
                          <span>Notes</span>
                          <textarea name="notes" placeholder="Optional submission notes">${escapeHtml(submission?.notes || "")}</textarea>
                        </label>
                        <label class="field">
                          <span>Submission file</span>
                          <input type="file" name="file" ${submission ? "" : "required"} />
                        </label>
                        <button class="button button-primary" type="submit">${submission ? "Update Submission" : "Submit Assignment"}</button>
                      </form>
                    </article>
                  `;
                })
                .join("")
            : emptyState("No assignments are available right now.")
        }
      </section>
    `;

    document.querySelectorAll("[data-submission-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const assignmentId = event.currentTarget.dataset.submissionForm;
        const formData = new FormData(event.currentTarget);
        formData.append("assignmentId", assignmentId);

        try {
          await api("/submissions", {
            method: "POST",
            body: formData
          });
          showToast("Assignment submitted successfully.");
          await renderAssignmentsPage();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });
    return;
  }

  const [assignmentsData, coursesData] = await Promise.all([api("/assignments"), api("/faculty/courses")]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Faculty Action",
        title: "Create assignment",
        body: `
          <form id="assignmentCreateForm" class="form-grid">
            <label class="field">
              <span>Course</span>
              <select name="courseId" required>
                <option value="">Select course</option>
                ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} • ${escapeHtml(course.name)}</option>`).join("")}
              </select>
            </label>
            <label class="field"><span>Deadline</span><input type="datetime-local" name="deadline" required /></label>
            <label class="field full-width"><span>Title</span><input type="text" name="title" placeholder="Assignment title" required /></label>
            <label class="field full-width"><span>Description</span><textarea name="description" placeholder="Explain the task and expected outcome" required></textarea></label>
            <label class="field full-width"><span>Attachment (optional)</span><input type="file" name="attachment" /></label>
            <button class="button button-primary full-width" type="submit">Create Assignment</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Overview",
        title: "Assignment delivery",
        body: createStatsGrid([
          { label: "Assignments", value: String(assignmentsData.assignments.length), helper: "Current academic tasks", icon: "assignments" },
          { label: "Subjects", value: String(coursesData.courses.length), helper: "Subjects available for posting", icon: "timetable" },
          { label: "Attachments", value: String(assignmentsData.assignments.filter((item) => item.attachmentUrl).length), helper: "Assignments with files attached", icon: "materials" },
          { label: "Submissions", value: String(assignmentsData.assignments.reduce((sum, item) => sum + Number(item.submissions_count || 0), 0)), helper: "Total uploaded student work", icon: "students" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Assignment register",
      subtitle: "Assignments available for your accessible subjects",
      headers: ["Assignment", "Subject", "Deadline", "Submissions", "Actions"],
      rows: assignmentsData.assignments.map(
        (assignment) => `
          <tr>
            <td><strong>${escapeHtml(assignment.title)}</strong><div class="muted-text">${escapeHtml(assignment.description)}</div></td>
            <td>${escapeHtml(assignment.course_code)}</td>
            <td>${formatDateTime(assignment.deadline)}</td>
            <td>${escapeHtml(assignment.submissions_count || 0)}</td>
            <td class="inline-actions">
              ${assignment.attachmentUrl ? `<a class="button button-secondary button-small" href="${normalizeAssetUrl(assignment.attachmentUrl)}" target="_blank" rel="noreferrer">Brief</a>` : ""}
              <button class="button button-ghost button-small" type="button" data-view-submissions="${assignment.id}">View Submissions</button>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No assignments have been created yet."
    })}
    <div id="assignmentSubmissionViewer"></div>
  `;

  document.getElementById("assignmentCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/assignments", {
        method: "POST",
        body: formData
      });
      showToast("Assignment created successfully.");
      await renderAssignmentsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-view-submissions]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const assignmentId = button.dataset.viewSubmissions;
        const data = await api(`/submissions/${assignmentId}`);
        document.getElementById("assignmentSubmissionViewer").innerHTML = createTableCard({
          title: "Student submissions",
          subtitle: "Uploaded files for the selected assignment",
          headers: ["Student", "Submitted At", "Status", "Download"],
          rows: data.submissions.map(
            (submission) => `
              <tr>
                <td>${escapeHtml(submission.student_name)} <div class="muted-text">${escapeHtml(submission.roll_number)}</div></td>
                <td>${formatDateTime(submission.submitted_at)}</td>
                <td>${statusBadge(submission.status)}</td>
                <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(submission.downloadUrl)}" target="_blank" rel="noreferrer">Open</a></td>
              </tr>
            `
          ),
          emptyMessage: "No student submissions found for this assignment."
        });
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function renderNoticesPageLegacy() {
  const pageContent = document.getElementById("pageContent");
  const noticesData = await api("/notices");

  pageContent.innerHTML = `
    ${
      STATE.user.role === "admin"
        ? `
          <section class="section-grid two-column">
            ${panel({
              eyebrow: "Admin Action",
              title: "Publish notice",
              body: `
                <form id="noticeCreateForm" class="form-grid">
                  <label class="field full-width"><span>Notice title</span><input type="text" name="title" placeholder="Academic or campus notice title" required /></label>
                  <label class="field"><span>Audience</span><select name="audience" required><option value="all">All</option><option value="students">Students</option><option value="faculty">Faculty</option><option value="admins">Admins</option></select></label>
                  <label class="field full-width"><span>Content</span><textarea name="content" placeholder="Write the notice details" required></textarea></label>
                  <button class="button button-primary full-width" type="submit">Publish Notice</button>
                </form>
              `
            })}
            ${panel({
              eyebrow: "Overview",
              title: "Communication centre",
              body: createStatsGrid([
                { label: "Notices", value: String(noticesData.notices.length), helper: "Published notices visible to you", icon: "notices" },
                { label: "All Audience", value: String(noticesData.notices.filter((item) => item.audience === "all").length), helper: "Institution-wide notices", icon: "students" },
                { label: "Faculty Notices", value: String(noticesData.notices.filter((item) => item.audience === "faculty").length), helper: "Faculty-only updates", icon: "faculty" },
                { label: "Student Notices", value: String(noticesData.notices.filter((item) => item.audience === "students").length), helper: "Student-only communication", icon: "dashboard" }
              ])
            })}
          </section>
        `
        : ""
    }
    <section class="notice-list">
      ${
        noticesData.notices.length
          ? noticesData.notices
              .map(
                (notice) => `
                  <article class="notice-card">
                    <div class="split-row">
                      <div>
                        <div class="meta-row">
                          ${statusBadge(notice.audience)}
                          <span class="muted-text">${formatDateTime(notice.posted_at)}</span>
                        </div>
                        <h3>${escapeHtml(notice.title)}</h3>
                      </div>
                      <span class="muted-text">${escapeHtml(notice.posted_by_name)}</span>
                    </div>
                    <p>${escapeHtml(notice.content)}</p>
                  </article>
                `
              )
              .join("")
          : emptyState("No notices have been posted yet.")
      }
    </section>
  `;

  document.getElementById("noticeCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/notices", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Notice published successfully.");
      await renderNoticesPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderMaterialsPageLegacy() {
  const pageContent = document.getElementById("pageContent");
  const materialsData = await api("/materials");

  if (STATE.user.role === "student") {
    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Materials", value: String(materialsData.materials.length), helper: "Files available to download", icon: "materials" },
        { label: "Courses", value: String(new Set(materialsData.materials.map((item) => item.course_code)).size), helper: "Courses with uploaded resources", icon: "timetable" },
        { label: "Faculty Sources", value: String(new Set(materialsData.materials.map((item) => item.faculty_name)).size), helper: "Distinct uploaders", icon: "faculty" },
        { label: "Latest Upload", value: materialsData.materials[0] ? formatDate(materialsData.materials[0].uploaded_at) : "-", helper: "Most recent uploaded material", icon: "dashboard" }
      ])}
      ${createTableCard({
        title: "Material library",
        subtitle: "Faculty-uploaded course materials ready to download",
        headers: ["Title", "Course", "Faculty", "Uploaded", "Download"],
        rows: materialsData.materials.map(
          (material) => `
            <tr>
              <td><strong>${escapeHtml(material.title)}</strong><div class="muted-text">${escapeHtml(material.description)}</div></td>
              <td>${escapeHtml(material.course_code)}</td>
              <td>${escapeHtml(material.faculty_name || "Faculty")}</td>
              <td>${formatDateTime(material.uploaded_at)}</td>
              <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(material.downloadUrl)}" target="_blank" rel="noreferrer">Download</a></td>
            </tr>
          `
        ),
        emptyMessage: "No materials are available yet."
      })}
    `;
    return;
  }

  const coursesData = await api("/faculty/courses");

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        eyebrow: "Faculty Action",
        title: "Upload material",
        body: `
          <form id="materialCreateForm" class="form-grid">
            <label class="field">
              <span>Course</span>
              <select name="courseId" required>
                <option value="">Select course</option>
                ${coursesData.courses.map((course) => `<option value="${course.id}">${escapeHtml(course.code)} • ${escapeHtml(course.name)}</option>`).join("")}
              </select>
            </label>
            <label class="field full-width"><span>Title</span><input type="text" name="title" placeholder="Material title" required /></label>
            <label class="field full-width"><span>Description</span><textarea name="description" placeholder="What does this file help students with?" required></textarea></label>
            <label class="field full-width"><span>File</span><input type="file" name="file" required /></label>
            <button class="button button-primary full-width" type="submit">Upload Material</button>
          </form>
        `
      })}
      ${panel({
        eyebrow: "Overview",
        title: "Resource distribution",
        body: createStatsGrid([
          { label: "Materials", value: String(materialsData.materials.length), helper: "Uploaded resource files", icon: "materials" },
          { label: "Courses", value: String(coursesData.courses.length), helper: "Courses ready for upload", icon: "timetable" },
          { label: "Downloads", value: "Live", helper: "Files served directly from the backend", icon: "students" },
          { label: "Latest Upload", value: materialsData.materials[0] ? formatDate(materialsData.materials[0].uploaded_at) : "-", helper: "Most recent upload date", icon: "dashboard" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Uploaded materials",
      subtitle: "All materials accessible to this role",
      headers: ["Title", "Course", "Uploaded", "Download"],
      rows: materialsData.materials.map(
        (material) => `
          <tr>
            <td><strong>${escapeHtml(material.title)}</strong><div class="muted-text">${escapeHtml(material.description)}</div></td>
            <td>${escapeHtml(material.course_code)}</td>
            <td>${formatDateTime(material.uploaded_at)}</td>
            <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(material.downloadUrl)}" target="_blank" rel="noreferrer">Open</a></td>
          </tr>
        `
      ),
      emptyMessage: "No materials uploaded yet."
    })}
  `;

  document.getElementById("materialCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/materials", {
        method: "POST",
        body: formData
      });
      showToast("Material uploaded successfully.");
      await renderMaterialsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderOutingPageLegacy() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const outingData = await api("/outing/my");
    const pendingRequests = outingData.requests.filter((item) => item.status === "pending");
    const approvedRequests = outingData.requests.filter((item) => item.status === "approved");
    const rejectedRequests = outingData.requests.filter((item) => item.status === "rejected");
    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          eyebrow: "Student Action",
          title: "Request outing approval",
          body: `
            <form id="outingCreateForm" class="form-grid">
              <label class="field full-width"><span>Purpose</span><input type="text" name="purpose" placeholder="Reason for the outing request" required /></label>
              <label class="field"><span>Destination</span><input type="text" name="destination" placeholder="Destination" required /></label>
              <label class="field"><span>Outing date</span><input type="date" name="outingDate" required /></label>
              <label class="field"><span>Return date</span><input type="date" name="returnDate" required /></label>
              <button class="button button-primary full-width" type="submit">Submit Request</button>
            </form>
          `
        })}
        ${panel({
          eyebrow: "Overview",
          title: "Request tracker",
          body: createStatsGrid([
            { label: "Requests", value: String(outingData.requests.length), helper: "Total requests submitted", icon: "outing" },
            { label: "Pending", value: String(pendingRequests.length), helper: "Requests awaiting review", icon: "attendance" },
            { label: "Approved", value: String(approvedRequests.length), helper: "Requests approved so far", icon: "results" },
            { label: "Rejected", value: String(rejectedRequests.length), helper: "Requests rejected", icon: "dashboard" }
          ])
        })}
      </section>
      ${createTableCard({
        title: "Pending requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: pendingRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "No comments yet")}</td>
            </tr>
          `
        ),
        emptyMessage: "No pending outing requests."
      })}
      ${createTableCard({
        title: "Approved requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: approvedRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "Approved")}</td>
            </tr>
          `
        ),
        emptyMessage: "No approved outing requests yet."
      })}
      ${createTableCard({
        title: "Rejected requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: rejectedRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "No comments yet")}</td>
            </tr>
          `
        ),
        emptyMessage: "No rejected outing requests."
      })}
    `;

    document.getElementById("outingCreateForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      try {
        await api("/outing", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });
        showToast("Outing request submitted successfully.");
        await renderOutingPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
    return;
  }

  const outingData = await api("/outing");
  const pendingRequests = outingData.requests.filter((item) => item.status === "pending");
  const approvedRequests = outingData.requests.filter((item) => item.status === "approved");
  const rejectedRequests = outingData.requests.filter((item) => item.status === "rejected");
  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Requests", value: String(outingData.requests.length), helper: "Requests visible to your role", icon: "outing" },
      { label: "Pending", value: String(pendingRequests.length), helper: "Awaiting your review", icon: "attendance" },
      { label: "Approved", value: String(approvedRequests.length), helper: "Requests approved", icon: "results" },
      { label: "Rejected", value: String(rejectedRequests.length), helper: "Requests declined", icon: "dashboard" }
    ])}
    <section class="outing-grid">
      ${
        outingData.requests.length
          ? outingData.requests
              .map(
                (request) => `
                  <article class="outing-card">
                    <div class="split-row">
                      <div>
                        <div class="meta-row">
                          ${statusBadge(request.status)}
                          ${tag(request.roll_number)}
                        </div>
                        <h3 style="margin: 12px 0 8px;">${escapeHtml(request.student_name)}</h3>
                        <p>${escapeHtml(request.purpose)} • ${escapeHtml(request.destination)}</p>
                      </div>
                      <div class="muted-text">${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</div>
                    </div>
                    <form class="compact-form" data-outing-review="${request.id}">
                      <label class="field">
                        <span>Reviewer comment</span>
                        <textarea name="facultyComment" placeholder="Optional comment for the student">${escapeHtml(request.faculty_comment || "")}</textarea>
                      </label>
                      <div class="inline-actions">
                        <button class="button button-primary button-small" type="submit" name="status" value="approved">Approve</button>
                        <button class="button button-danger button-small" type="submit" name="status" value="rejected">Reject</button>
                      </div>
                    </form>
                  </article>
                `
              )
              .join("")
          : emptyState("No outing requests require review right now.")
      }
    </section>
  `;

  document.querySelectorAll("[data-outing-review]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.submitter;
      const formData = new FormData(event.currentTarget);

      try {
        await api(`/outing/${event.currentTarget.dataset.outingReview}`, {
          method: "PUT",
          body: JSON.stringify({
            status: button.value,
            facultyComment: formData.get("facultyComment")
          })
        });
        showToast(`Outing request ${button.value}.`);
        await renderOutingPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function renderOutingPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const outingData = await api("/outing/my");
    const pendingRequests = outingData.requests.filter((item) => item.status === "pending");
    const approvedRequests = outingData.requests.filter((item) => item.status === "approved");
    const rejectedRequests = outingData.requests.filter((item) => item.status === "rejected");

    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          eyebrow: "Student Action",
          title: "Request outing approval",
          body: `
            <form id="outingCreateForm" class="form-grid">
              <label class="field full-width"><span>Purpose</span><input type="text" name="purpose" placeholder="Reason for the outing request" required /></label>
              <label class="field"><span>Destination</span><input type="text" name="destination" placeholder="Destination" required /></label>
              <label class="field"><span>Outing date</span><input type="date" name="outingDate" required /></label>
              <label class="field"><span>Return date</span><input type="date" name="returnDate" required /></label>
              <button class="button button-primary full-width" type="submit">Submit Request</button>
            </form>
          `
        })}
        ${panel({
          eyebrow: "Overview",
          title: "Request tracker",
          body: createStatsGrid([
            { label: "Requests", value: String(outingData.requests.length), icon: "outing" },
            { label: "Pending", value: String(pendingRequests.length), icon: "attendance" },
            { label: "Approved", value: String(approvedRequests.length), icon: "results" },
            { label: "Rejected", value: String(rejectedRequests.length), icon: "dashboard" }
          ])
        })}
      </section>
      ${createTableCard({
        title: "Pending requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: pendingRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "No comments yet")}</td>
            </tr>
          `
        ),
        emptyMessage: "No pending outing requests."
      })}
      ${createTableCard({
        title: "Approved requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: approvedRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "Approved")}</td>
            </tr>
          `
        ),
        emptyMessage: "No approved outing requests yet."
      })}
      ${createTableCard({
        title: "Rejected requests",
        headers: ["Purpose", "Destination", "Dates", "Status", "Comment"],
        rows: rejectedRequests.map(
          (request) => `
            <tr>
              <td>${escapeHtml(request.purpose)}</td>
              <td>${escapeHtml(request.destination)}</td>
              <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
              <td>${statusBadge(request.status)}</td>
              <td>${escapeHtml(request.faculty_comment || "No comments yet")}</td>
            </tr>
          `
        ),
        emptyMessage: "No rejected outing requests."
      })}
    `;

    document.getElementById("outingCreateForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      try {
        await api("/outing", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });
        showToast("Outing request submitted successfully.");
        await renderOutingPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
    return;
  }

  const outingData = await api("/outing");
  const pendingRequests = outingData.requests.filter((item) => item.status === "pending");
  const approvedRequests = outingData.requests.filter((item) => item.status === "approved");
  const rejectedRequests = outingData.requests.filter((item) => item.status === "rejected");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Requests", value: String(outingData.requests.length), icon: "outing" },
      { label: "Pending", value: String(pendingRequests.length), icon: "attendance" },
      { label: "Approved", value: String(approvedRequests.length), icon: "results" },
      { label: "Rejected", value: String(rejectedRequests.length), icon: "dashboard" }
    ])}
    ${panel({
      title: "Pending outing requests",
      body: pendingRequests.length
        ? `<section class="outing-grid">
            ${pendingRequests
              .map(
                (request) => `
                  <article class="outing-card">
                    <div class="split-row">
                      <div>
                        <div class="meta-row">
                          ${statusBadge(request.status)}
                          ${tag(request.roll_number)}
                        </div>
                        <h3 style="margin: 12px 0 8px;">${escapeHtml(request.student_name)}</h3>
                        <p>${escapeHtml(request.purpose)} &middot; ${escapeHtml(request.destination)}</p>
                      </div>
                      <div class="muted-text">${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</div>
                    </div>
                    <form class="compact-form" data-outing-review="${request.id}">
                      <label class="field">
                        <span>Reviewer comment</span>
                        <textarea name="facultyComment" placeholder="Optional comment for the student">${escapeHtml(request.faculty_comment || "")}</textarea>
                      </label>
                      <div class="inline-actions">
                        <button class="button button-primary button-small" type="submit" name="status" value="approved">Approve</button>
                        <button class="button button-danger button-small" type="submit" name="status" value="rejected">Reject</button>
                      </div>
                    </form>
                  </article>
                `
              )
              .join("")}
          </section>`
        : emptyState("No outing requests require review right now.")
    })}
    ${createTableCard({
      title: "Approved requests",
      headers: ["Student", "Roll Number", "Purpose", "Dates", "Comment"],
      rows: approvedRequests.map(
        (request) => `
          <tr>
            <td>${escapeHtml(request.student_name)}</td>
            <td>${escapeHtml(request.roll_number)}</td>
            <td>${escapeHtml(request.purpose)}</td>
            <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
            <td>${escapeHtml(request.faculty_comment || "Approved")}</td>
          </tr>
        `
      ),
      emptyMessage: "No approved outing requests yet."
    })}
    ${createTableCard({
      title: "Rejected requests",
      headers: ["Student", "Roll Number", "Purpose", "Dates", "Comment"],
      rows: rejectedRequests.map(
        (request) => `
          <tr>
            <td>${escapeHtml(request.student_name)}</td>
            <td>${escapeHtml(request.roll_number)}</td>
            <td>${escapeHtml(request.purpose)}</td>
            <td>${formatDate(request.outing_date)} to ${formatDate(request.return_date)}</td>
            <td>${escapeHtml(request.faculty_comment || "Rejected")}</td>
          </tr>
        `
      ),
      emptyMessage: "No rejected outing requests."
    })}
  `;

  document.querySelectorAll("[data-outing-review]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.submitter;
      const formData = new FormData(event.currentTarget);

      try {
        await api(`/outing/${event.currentTarget.dataset.outingReview}`, {
          method: "PUT",
          body: JSON.stringify({
            status: button.value,
            facultyComment: formData.get("facultyComment")
          })
        });
        showToast(`Outing request ${button.value}.`);
        await renderOutingPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function renderAcademicsPage() {
  const pageContent = document.getElementById("pageContent");
  const overview = await api("/academics/overview");

  const facultyOptions = overview.faculty
    .map(
      (faculty) =>
        `<option value="${faculty.id}">${escapeHtml(faculty.full_name)} - ${escapeHtml(faculty.employee_code)}</option>`
    )
    .join("");

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Departments", value: String(overview.departments.length), icon: "faculty" },
      { label: "Branches", value: String(overview.branches.length), icon: "students" },
      { label: "Subjects", value: String(overview.subjects.length), icon: "results" },
      { label: "Faculty Linked", value: String(overview.subjects.filter((subject) => subject.faculty_id).length), icon: "timetable" }
    ])}
    <section class="section-grid two-column">
      ${panel({
        title: "Department management",
        body: `
          <form id="departmentCreateForm" class="form-grid">
            <label class="field">
              <span>Department name</span>
              <input type="text" name="name" placeholder="BTech" required />
            </label>
            <label class="field">
              <span>Code</span>
              <input type="text" name="code" placeholder="BTECH" required />
            </label>
            <button class="button button-primary" type="submit">Add Department</button>
          </form>
        `
      })}
      ${panel({
        title: "Branch management",
        body: `
          <form id="branchCreateForm" class="form-grid">
            <label class="field">
              <span>Department</span>
              <select name="departmentId" required>
                <option value="">Select department</option>
                ${buildDepartmentOptionsFromData(overview.departments)}
              </select>
            </label>
            <label class="field">
              <span>Branch name</span>
              <input type="text" name="name" placeholder="CSE Core" required />
            </label>
            <label class="field">
              <span>Code</span>
              <input type="text" name="code" placeholder="CSE-CORE" required />
            </label>
            <button class="button button-primary" type="submit">Add Branch</button>
          </form>
        `
      })}
    </section>
    <section class="section-grid two-column">
      ${panel({
        title: "Subject management",
        body: `
          <form id="subjectCreateForm" class="form-grid">
            <label class="field">
              <span>Department</span>
              <select name="departmentId" id="subjectDepartment" required>
                <option value="">Select department</option>
                ${buildDepartmentOptionsFromData(overview.departments)}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="subjectBranch" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field">
              <span>Subject name</span>
              <input type="text" name="name" placeholder="Database Systems" required />
            </label>
            <label class="field">
              <span>Subject code</span>
              <input type="text" name="code" placeholder="CSE501" required />
            </label>
            <label class="field">
              <span>Semester</span>
              <select name="semester" required>
                <option value="">Select semester</option>
                ${buildSemesterOptions()}
              </select>
            </label>
            <label class="field">
              <span>Credits</span>
              <input type="number" name="credits" min="1" placeholder="4" required />
            </label>
            <label class="field">
              <span>Faculty</span>
              <select name="facultyId">
                <option value="">Assign later</option>
                ${facultyOptions}
              </select>
            </label>
            <button class="button button-primary" type="submit">Add Subject</button>
          </form>
        `
      })}
      ${panel({
        title: "Faculty assignment",
        body: `
          <form id="facultyAssignmentForm" class="form-grid">
            <label class="field">
              <span>Faculty</span>
              <select name="facultyId" required>
                <option value="">Select faculty</option>
                ${facultyOptions}
              </select>
            </label>
            <label class="field">
              <span>Department</span>
              <select name="departmentId" id="facultyDepartment" required>
                <option value="">Select department</option>
                ${buildDepartmentOptionsFromData(overview.departments)}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="facultyBranch" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field">
              <span>Salary status</span>
              <select name="salaryStatus" required>
                <option value="pending">Pending</option>
                <option value="credited">Salary credited</option>
              </select>
            </label>
            <button class="button button-primary" type="submit">Update Faculty</button>
          </form>
        `
      })}
    </section>
    ${createTableCard({
      title: "Departments and branches",
      headers: ["Department", "Code", "Branches"],
      rows: overview.departments.map((department) => {
        const relatedBranches = overview.branches.filter((branch) => String(branch.department_id) === String(department.id));
        return `
          <tr>
            <td>${escapeHtml(department.name)}</td>
            <td>${escapeHtml(department.code)}</td>
            <td>${relatedBranches.map((branch) => `<div class="muted-text">${escapeHtml(branch.name)}</div>`).join("") || "No branches"}</td>
          </tr>
        `;
      }),
      emptyMessage: "No departments configured yet."
    })}
    ${createTableCard({
      title: "Subject allocation",
      headers: ["Subject", "Branch", "Semester", "Faculty", "Assign"],
      rows: overview.subjects.map(
        (subject) => `
          <tr>
            <td>${escapeHtml(subject.name)}<div class="muted-text">${escapeHtml(subject.code)}</div></td>
            <td>${escapeHtml(subject.department_name || "-")}<div class="muted-text">${escapeHtml(subject.branch_name || "-")}</div></td>
            <td>Semester ${escapeHtml(subject.semester)}<div class="muted-text">${escapeHtml(subject.credits)} credits</div></td>
            <td>${escapeHtml(subject.faculty_name || "Not assigned")}</td>
            <td class="inline-actions">
              <select class="compact-select" data-subject-faculty="${subject.id}">
                <option value="">Select faculty</option>
                ${facultyOptions.replace(`value="${subject.faculty_id}"`, `value="${subject.faculty_id}" selected`)}
              </select>
              <button class="button button-ghost button-small" type="button" data-subject-assign="${subject.id}">Save</button>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No subjects configured yet."
    })}
    ${createTableCard({
      title: "Faculty structure and salary",
      headers: ["Faculty", "Department", "Branch", "Salary Status"],
      rows: overview.faculty.map(
        (faculty) => `
          <tr>
            <td>${escapeHtml(faculty.full_name)}<div class="muted-text">${escapeHtml(faculty.employee_code)}</div></td>
            <td>${escapeHtml(faculty.department_name || "-")}</td>
            <td>${escapeHtml(faculty.branch_name || "-")}</td>
            <td>${statusBadge(faculty.salary_status || "pending")}</td>
          </tr>
        `
      ),
      emptyMessage: "No faculty records available."
    })}
  `;

  const syncBranchSelect = (departmentSelect, branchSelect) => {
    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${buildBranchOptionsFromData(overview.branches, departmentSelect.value)}
    `;
  };

  const subjectDepartment = document.getElementById("subjectDepartment");
  const subjectBranch = document.getElementById("subjectBranch");
  const facultyDepartment = document.getElementById("facultyDepartment");
  const facultyBranch = document.getElementById("facultyBranch");

  subjectDepartment?.addEventListener("change", () => syncBranchSelect(subjectDepartment, subjectBranch));
  facultyDepartment?.addEventListener("change", () => syncBranchSelect(facultyDepartment, facultyBranch));

  document.getElementById("departmentCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/academics/departments", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Department created successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("branchCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/academics/branches", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Branch created successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("subjectCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/academics/subjects", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Subject created successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.getElementById("facultyAssignmentForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const facultyId = formData.get("facultyId");

    try {
      await api(`/academics/faculty/${facultyId}/assignment`, {
        method: "PUT",
        body: JSON.stringify({
          departmentId: Number(formData.get("departmentId")),
          branchId: Number(formData.get("branchId")),
          salaryStatus: formData.get("salaryStatus")
        })
      });
      showToast("Faculty assignment updated successfully.");
      await renderAcademicsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-subject-assign]").forEach((button) => {
    button.addEventListener("click", async () => {
      const subjectId = button.dataset.subjectAssign;
      const select = document.querySelector(`[data-subject-faculty="${subjectId}"]`);

      if (!select?.value) {
        showToast("Select a faculty member first.", "error");
        return;
      }

      try {
        await api(`/academics/subjects/${subjectId}/faculty`, {
          method: "PUT",
          body: JSON.stringify({ facultyId: Number(select.value) })
        });
        showToast("Faculty assigned successfully.");
        await renderAcademicsPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function renderTimetablePage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role !== "student") {
    const timetablePromise = api("/faculty/timetable");
    const coursesPromise = api("/faculty/courses");
    const facultyPromise = STATE.user.role === "admin" ? api("/faculty") : Promise.resolve({ faculty: [] });
    const [timetableData, coursesData, facultyData] = await Promise.all([
      timetablePromise,
      coursesPromise,
      facultyPromise
    ]);
    const timetable = timetableData.timetable;
    const canSelectFaculty = STATE.user.role === "admin";

    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          title: "Create timetable slot",
          body: `
            <form id="timetableCreateForm" class="form-grid">
              <label class="field">
                <span>Subject</span>
                <select name="courseId" required>
                  <option value="">Select subject</option>
                  ${coursesData.courses
                    .map(
                      (course) =>
                        `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`
                    )
                    .join("")}
                </select>
              </label>
              ${
                canSelectFaculty
                  ? `
                    <label class="field">
                      <span>Faculty</span>
                      <select name="facultyId" required>
                        <option value="">Select faculty</option>
                        ${facultyData.faculty
                          .map(
                            (faculty) =>
                              `<option value="${faculty.id}">${escapeHtml(faculty.full_name)} - ${escapeHtml(faculty.employee_code)}</option>`
                          )
                          .join("")}
                      </select>
                    </label>
                  `
                  : ""
              }
              <label class="field">
                <span>Day</span>
                <select name="dayOfWeek" required>
                  <option value="">Select day</option>
                  ${WEEK_DAYS.map((day) => `<option value="${day}">${escapeHtml(day)}</option>`).join("")}
                </select>
              </label>
              <label class="field">
                <span>Classroom</span>
                <input type="text" name="roomNo" placeholder="Room 204" required />
              </label>
              <label class="field">
                <span>Start time</span>
                <input type="time" name="startTime" required />
              </label>
              <label class="field">
                <span>End time</span>
                <input type="time" name="endTime" required />
              </label>
              <button class="button button-primary" type="submit">${canSelectFaculty ? "Create Slot" : "Add My Slot"}</button>
            </form>
          `
        })}
        ${panel({
          title: "Timetable overview",
          body: createStatsGrid(
            canSelectFaculty
              ? [
                  { label: "Slots", value: String(timetable.length), icon: "timetable" },
                  { label: "Working Days", value: String(new Set(timetable.map((item) => item.day_of_week)).size), icon: "attendance" },
                  { label: "Faculty", value: String(new Set(timetable.map((item) => item.faculty_name).filter(Boolean)).size), icon: "faculty" },
                  { label: "Subjects", value: String(new Set(timetable.map((item) => item.course_code)).size), icon: "results" }
                ]
              : [
                  { label: "Slots", value: String(timetable.length), icon: "timetable" },
                  { label: "Working Days", value: String(new Set(timetable.map((item) => item.day_of_week)).size), icon: "attendance" },
                  { label: "Rooms", value: String(new Set(timetable.map((item) => item.room_no).filter(Boolean)).size), icon: "dashboard" },
                  { label: "Subjects", value: String(new Set(timetable.map((item) => item.course_code)).size), icon: "results" }
                ]
          )
        })}
      </section>
      ${buildTimetableBoard(timetable)}
    `;

    bindTimetableAdminActions();

    document.getElementById("timetableCreateForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      try {
        await api("/faculty/timetable", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(formData.entries()))
        });
        showToast(canSelectFaculty ? "Timetable slot created successfully." : "Your timetable slot was added successfully.");
        await renderTimetablePage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
    return;
  }

  const data = await fetchCurrentTimetableData();
  const timetable = data.timetable;

  pageContent.innerHTML = `
    ${createStatsGrid([
      { label: "Classes", value: String(timetable.length), icon: "timetable" },
      { label: "Working Days", value: String(new Set(timetable.map((item) => item.day_of_week)).size), icon: "attendance" },
      { label: "Rooms", value: String(new Set(timetable.map((item) => item.room_no).filter(Boolean)).size), icon: "dashboard" },
      { label: "Subjects", value: String(new Set(timetable.map((item) => item.course_code)).size), icon: "results" }
    ])}
    ${buildTimetableBoard(timetable)}
  `;

  bindTimetableAdminActions();
}

async function renderFeesPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "student") {
    const feesData = await api("/students/me/fees");
    const current = feesData.fees[0];

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Status", value: current ? current.status.toUpperCase() : "N/A", icon: "fees" },
        { label: "Total", value: current ? formatCurrency(current.total_amount) : formatCurrency(0), icon: "dashboard" },
        { label: "Paid", value: current ? formatCurrency(current.paid_amount) : formatCurrency(0), icon: "results" },
        { label: "Due", value: current ? formatCurrency(current.balance) : formatCurrency(0), icon: "attendance" }
      ])}
      ${createTableCard({
        title: "Fee status",
        headers: ["Semester", "Total", "Paid", "Balance", "Status", "Due Date"],
        rows: feesData.fees.map(
          (fee) => `
            <tr>
              <td>Semester ${escapeHtml(fee.semester)}</td>
              <td>${formatCurrency(fee.total_amount)}</td>
              <td>${formatCurrency(fee.paid_amount)}</td>
              <td>${formatCurrency(fee.balance)}</td>
              <td>${statusBadge(fee.status)}</td>
              <td>${formatDate(fee.due_date)}</td>
            </tr>
          `
        ),
        emptyMessage: "No fee records found."
      })}
    `;
    return;
  }

  const [feesData, studentsData] = await Promise.all([api("/students/fees"), api("/students")]);
  const feeRecords = feesData.fees;

  const renderFeeTable = (records) =>
    createTableCard({
      title: "Fee ledger",
      headers: ["Student", "Semester", "Total", "Paid", "Due", "Status", "Due Date", "Actions"],
      rows: records.map(
        (fee) => `
          <tr>
            <td>${escapeHtml(fee.full_name)}<div class="muted-text">${escapeHtml(fee.roll_number)}</div></td>
            <td>Semester ${escapeHtml(fee.semester)}</td>
            <td>${formatCurrency(fee.total_amount)}</td>
            <td>${formatCurrency(fee.paid_amount)}</td>
            <td>${formatCurrency(fee.balance)}</td>
            <td>${statusBadge(fee.status)}</td>
            <td>${formatDate(fee.due_date)}</td>
            <td><button class="button button-ghost button-small" type="button" data-fee-edit="${fee.id}">Edit</button></td>
          </tr>
        `
      ),
      emptyMessage: "No fee records available."
    });

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Update fee status",
        body: `
          <form id="feeForm" class="form-grid">
            <input type="hidden" name="feeId" value="" />
            <label class="field">
              <span>Student</span>
              <select name="studentId" required>
                <option value="">Select student</option>
                ${studentsData.students
                  .map(
                    (student) =>
                      `<option value="${student.id}">${escapeHtml(student.full_name)} - ${escapeHtml(student.roll_number)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field">
              <span>Semester</span>
              <select name="semester" required>
                <option value="">Select semester</option>
                ${buildSemesterOptions()}
              </select>
            </label>
            <label class="field">
              <span>Total amount</span>
              <input type="number" name="totalAmount" min="0" step="0.01" placeholder="85000" required />
            </label>
            <label class="field">
              <span>Paid amount</span>
              <input type="number" name="paidAmount" min="0" step="0.01" placeholder="0" />
            </label>
            <label class="field">
              <span>Due amount</span>
              <input id="feeDuePreview" type="text" value="${escapeHtml(formatCurrency(0))}" readonly />
            </label>
            <label class="field">
              <span>Due date</span>
              <input type="date" name="dueDate" required />
            </label>
            <div class="inline-actions full-width">
              <button class="button button-primary" id="feeSubmitButton" type="submit">Save Fee Record</button>
              <button class="button button-secondary" id="feeResetButton" type="button">Clear</button>
            </div>
          </form>
        `
      })}
      ${panel({
        title: "Fee overview",
        body: createStatsGrid([
          { label: "Records", value: String(feeRecords.length), icon: "fees" },
          { label: "Collected", value: formatCurrency(feeRecords.reduce((sum, fee) => sum + Number(fee.paid_amount), 0)), icon: "results" },
          { label: "Due", value: formatCurrency(feeRecords.reduce((sum, fee) => sum + Number(fee.balance), 0)), icon: "attendance" },
          { label: "Paid in Full", value: String(feeRecords.filter((fee) => fee.status === "paid").length), icon: "dashboard" }
        ])
      })}
    </section>
    <div id="feeLedger">${renderFeeTable(feeRecords)}</div>
  `;

  const feeForm = document.getElementById("feeForm");
  const feeIdField = feeForm?.querySelector('[name="feeId"]');
  const studentField = feeForm?.querySelector('[name="studentId"]');
  const semesterField = feeForm?.querySelector('[name="semester"]');
  const totalField = feeForm?.querySelector('[name="totalAmount"]');
  const paidField = feeForm?.querySelector('[name="paidAmount"]');
  const dueField = document.getElementById("feeDuePreview");
  const dueDateField = feeForm?.querySelector('[name="dueDate"]');
  const submitButton = document.getElementById("feeSubmitButton");

  const syncDuePreview = () => {
    const total = Number(totalField?.value || 0);
    const paid = Number(paidField?.value || 0);
    dueField.value = formatCurrency(Math.max(total - paid, 0));
  };

  const resetFeeForm = () => {
    feeForm?.reset();
    if (feeIdField) feeIdField.value = "";
    if (studentField) studentField.disabled = false;
    if (submitButton) submitButton.textContent = "Save Fee Record";
    syncDuePreview();
  };

  totalField?.addEventListener("input", syncDuePreview);
  paidField?.addEventListener("input", syncDuePreview);
  document.getElementById("feeResetButton")?.addEventListener("click", resetFeeForm);

  document.querySelectorAll("[data-fee-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = feeRecords.find((item) => String(item.id) === button.dataset.feeEdit);
      if (!record || !feeForm) return;

      feeIdField.value = record.id;
      studentField.value = record.student_id;
      studentField.disabled = true;
      semesterField.value = record.semester;
      totalField.value = record.total_amount;
      paidField.value = record.paid_amount;
      dueDateField.value = record.due_date;
      submitButton.textContent = "Update Fee Record";
      syncDuePreview();
      feeForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  feeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const feeId = feeIdField.value;
    const payload = {
      semester: Number(formData.get("semester")),
      totalAmount: Number(formData.get("totalAmount")),
      paidAmount: Number(formData.get("paidAmount") || 0),
      dueDate: formData.get("dueDate")
    };

    if (!feeId) {
      payload.studentId = Number(formData.get("studentId"));
    }

    try {
      await api(feeId ? `/students/fees/${feeId}` : "/students/fees", {
        method: feeId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      showToast(feeId ? "Fee record updated successfully." : "Fee record saved successfully.");
      await renderFeesPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  syncDuePreview();
}

async function renderNoticesPage() {
  const pageContent = document.getElementById("pageContent");
  const noticesData = await api("/notices");
  const notices = noticesData.notices;
  const isAdmin = STATE.user.role === "admin";
  const canPost = ["admin", "faculty"].includes(STATE.user.role);

  pageContent.innerHTML = `
    ${
      canPost
        ? `<section class="section-grid two-column">
            ${panel({
              title: isAdmin ? "Manage notices" : "Share notice",
              body: `
                <form id="noticeForm" class="form-grid">
                  <input type="hidden" name="noticeId" value="" />
                  <label class="field full-width">
                    <span>Notice title</span>
                    <input type="text" name="title" placeholder="Notice title" required />
                  </label>
                  ${
                    isAdmin
                      ? `<label class="field">
                          <span>Audience</span>
                          <select name="audience" required>
                            <option value="all">All</option>
                            <option value="students">Students</option>
                            <option value="faculty">Faculty</option>
                            <option value="admins">Admins</option>
                          </select>
                        </label>`
                      : ""
                  }
                  <label class="field full-width">
                    <span>Content</span>
                    <textarea name="content" placeholder="Write the notice details" required></textarea>
                  </label>
                  <div class="inline-actions full-width">
                    <button class="button button-primary" id="noticeSubmitButton" type="submit">${
                      isAdmin ? "Publish Notice" : "Share Notice"
                    }</button>
                    ${
                      isAdmin
                        ? `<button class="button button-secondary" id="noticeResetButton" type="button">Clear</button>`
                        : ""
                    }
                  </div>
                </form>
              `
            })}
            ${panel({
              title: "Notice overview",
              body: createStatsGrid([
                { label: "Visible", value: String(notices.length), icon: "notices" },
                { label: "For Students", value: String(notices.filter((item) => item.audience === "students").length), icon: "students" },
                { label: "For Faculty", value: String(notices.filter((item) => item.audience === "faculty").length), icon: "faculty" },
                { label: "For All", value: String(notices.filter((item) => item.audience === "all").length), icon: "dashboard" }
              ])
            })}
          </section>`
        : createStatsGrid([
            { label: "Visible", value: String(notices.length), icon: "notices" },
            { label: "Faculty", value: String(notices.filter((item) => item.posted_by_role === "faculty").length), icon: "faculty" },
            { label: "Admin", value: String(notices.filter((item) => item.posted_by_role === "admin").length), icon: "dashboard" },
            { label: "This Week", value: String(notices.filter((item) => Date.now() - new Date(item.posted_at).getTime() < 604800000).length), icon: "attendance" }
          ])
    }
    <section class="notice-list">
      ${
        notices.length
          ? notices
              .map(
                (notice) => `
                  <article class="notice-card">
                    <div class="split-row">
                      <div>
                        <div class="meta-row">
                          ${statusBadge(notice.audience)}
                          ${tag(getRoleLabel(notice.posted_by_role || "admin"))}
                        </div>
                        <h3>${escapeHtml(notice.title)}</h3>
                      </div>
                      <span class="muted-text">${formatDateTime(notice.posted_at)}</span>
                    </div>
                    <p>${escapeHtml(notice.content)}</p>
                    <div class="split-row notice-footer">
                      <span class="muted-text">${escapeHtml(notice.posted_by_name || "System")}</span>
                      ${
                        isAdmin
                          ? `<div class="inline-actions">
                              <button class="button button-ghost button-small" type="button" data-notice-edit="${notice.id}">Edit</button>
                              <button class="button button-danger button-small" type="button" data-notice-delete="${notice.id}">Delete</button>
                            </div>`
                          : ""
                      }
                    </div>
                  </article>
                `
              )
              .join("")
          : emptyState("No notices have been posted yet.")
      }
    </section>
  `;

  const noticeForm = document.getElementById("noticeForm");
  const noticeIdField = noticeForm?.querySelector('[name="noticeId"]');
  const titleField = noticeForm?.querySelector('[name="title"]');
  const audienceField = noticeForm?.querySelector('[name="audience"]');
  const contentField = noticeForm?.querySelector('[name="content"]');
  const submitButton = document.getElementById("noticeSubmitButton");

  const resetNoticeForm = () => {
    noticeForm?.reset();
    if (noticeIdField) noticeIdField.value = "";
    if (submitButton) submitButton.textContent = isAdmin ? "Publish Notice" : "Share Notice";
  };

  document.getElementById("noticeResetButton")?.addEventListener("click", resetNoticeForm);

  document.querySelectorAll("[data-notice-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const notice = notices.find((item) => String(item.id) === button.dataset.noticeEdit);
      if (!notice || !noticeForm) return;

      noticeIdField.value = notice.id;
      titleField.value = notice.title;
      if (audienceField) audienceField.value = notice.audience;
      contentField.value = notice.content;
      submitButton.textContent = "Update Notice";
      noticeForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-notice-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const noticeId = button.dataset.noticeDelete;
      if (!window.confirm("Delete this notice?")) return;

      try {
        await api(`/notices/${noticeId}`, { method: "DELETE" });
        showToast("Notice deleted successfully.");
        await renderNoticesPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  noticeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const noticeId = formData.get("noticeId");
    const payload = {
      title: formData.get("title"),
      content: formData.get("content")
    };

    if (isAdmin) {
      payload.audience = formData.get("audience");
    }

    try {
      await api(noticeId ? `/notices/${noticeId}` : "/notices", {
        method: noticeId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      showToast(noticeId ? "Notice updated successfully." : "Notice published successfully.");
      await renderNoticesPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function renderMaterialsPage() {
  const pageContent = document.getElementById("pageContent");
  const isStudent = STATE.user.role === "student";
  const [materialsData, coursesData] = await Promise.all([
    api("/materials"),
    api(isStudent ? "/students/me/courses" : "/faculty/courses")
  ]);
  const materials = materialsData.materials;
  const subjects = coursesData.courses;

  const renderLibrary = (filterValue) => {
    const filteredMaterials =
      filterValue && filterValue !== "all"
        ? materials.filter((material) => String(material.course_id) === String(filterValue))
        : materials;

    return createTableCard({
      title: "Material library",
      headers: isStudent
        ? ["Title", "Subject", "Faculty", "Uploaded", "Download"]
        : ["Title", "Subject", "Uploaded", "Download"],
      rows: filteredMaterials.map(
        (material) => `
          <tr>
            <td><strong>${escapeHtml(material.title)}</strong><div class="muted-text">${escapeHtml(material.description)}</div></td>
            <td>${escapeHtml(material.course_code)}<div class="muted-text">${escapeHtml(material.course_name)}</div></td>
            ${
              isStudent
                ? `<td>${escapeHtml(material.faculty_name || "Faculty")}</td>`
                : ""
            }
            <td>${formatDateTime(material.uploaded_at)}</td>
            <td><a class="button button-secondary button-small" href="${normalizeAssetUrl(material.downloadUrl)}" target="_blank" rel="noreferrer">Open</a></td>
          </tr>
        `
      ),
      emptyMessage: "No materials are available for the selected subject."
    });
  };

  const subjectOptions = `
    <option value="all">All subjects</option>
    ${subjects
      .map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`)
      .join("")}
  `;

  if (isStudent) {
    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          title: "Browse materials",
          body: `
            <label class="field">
              <span>Subject</span>
              <select id="materialSubjectFilter">${subjectOptions}</select>
            </label>
          `
        })}
        ${panel({
          title: "Library overview",
          body: createStatsGrid([
            { label: "Files", value: String(materials.length), icon: "materials" },
            { label: "Subjects", value: String(new Set(materials.map((item) => item.course_id)).size), icon: "timetable" },
            { label: "Faculty", value: String(new Set(materials.map((item) => item.faculty_name).filter(Boolean)).size), icon: "faculty" },
            { label: "Latest", value: materials[0] ? formatDate(materials[0].uploaded_at) : "-", icon: "dashboard" }
          ])
        })}
      </section>
      <div id="materialsLibrary">${renderLibrary("all")}</div>
    `;
  } else {
    pageContent.innerHTML = `
      <section class="section-grid two-column">
        ${panel({
          title: "Upload material",
          body: `
            <form id="materialCreateForm" class="form-grid">
              <label class="field">
                <span>Subject</span>
                <select name="courseId" required>
                  <option value="">Select subject</option>
                  ${subjects
                    .map((course) => `<option value="${course.id}">${escapeHtml(course.code)} - ${escapeHtml(course.name)}</option>`)
                    .join("")}
                </select>
              </label>
              <label class="field full-width">
                <span>Title</span>
                <input type="text" name="title" placeholder="Material title" required />
              </label>
              <label class="field full-width">
                <span>Description</span>
                <textarea name="description" placeholder="Short description" required></textarea>
              </label>
              <label class="field full-width">
                <span>File</span>
                <input type="file" name="file" required />
              </label>
              <button class="button button-primary" type="submit">Upload Material</button>
            </form>
          `
        })}
        ${panel({
          title: "Resource overview",
          body: `
            <div class="stack-form">
              <label class="field">
                <span>Filter by subject</span>
                <select id="materialSubjectFilter">${subjectOptions}</select>
              </label>
              ${createStatsGrid([
                { label: "Files", value: String(materials.length), icon: "materials" },
                { label: "Subjects", value: String(subjects.length), icon: "timetable" },
                { label: "Uploads", value: String(materials.filter((item) => item.downloadUrl).length), icon: "dashboard" },
                { label: "Latest", value: materials[0] ? formatDate(materials[0].uploaded_at) : "-", icon: "attendance" }
              ])}
            </div>
          `
        })}
      </section>
      <div id="materialsLibrary">${renderLibrary("all")}</div>
    `;

    document.getElementById("materialCreateForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      try {
        await api("/materials", {
          method: "POST",
          body: formData
        });
        showToast("Material uploaded successfully.");
        await renderMaterialsPage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  document.getElementById("materialSubjectFilter")?.addEventListener("change", (event) => {
    document.getElementById("materialsLibrary").innerHTML = renderLibrary(event.currentTarget.value);
  });
}

async function renderStudentsPage() {
  const pageContent = document.getElementById("pageContent");

  if (STATE.user.role === "faculty") {
    const { students } = await api("/students/assigned");

    pageContent.innerHTML = `
      ${createStatsGrid([
        { label: "Students", value: String(students.length), icon: "students" },
        { label: "Branches", value: String(new Set(students.map((item) => item.branch_name || "General")).size), icon: "faculty" },
        { label: "Semesters", value: String(new Set(students.map((item) => item.semester)).size), icon: "timetable" },
        { label: "Sections", value: String(new Set(students.map((item) => item.section)).size), icon: "dashboard" }
      ])}
      ${createTableCard({
        title: "Students under your subjects",
        headers: ["Student", "Roll Number", "Branch", "Semester", "Contact"],
        rows: students.map(
          (student) => `
            <tr>
              <td>${escapeHtml(student.full_name)}</td>
              <td>${escapeHtml(student.roll_number)}</td>
              <td>${escapeHtml(student.department_name)}<div class="muted-text">${escapeHtml(student.branch_name || "-")}</div></td>
              <td>Semester ${escapeHtml(student.semester)}<div class="muted-text">Section ${escapeHtml(student.section)}</div></td>
              <td>${escapeHtml(student.email)}</td>
            </tr>
          `
        ),
        emptyMessage: "No students are mapped to your subjects yet."
      })}
    `;
    return;
  }

  const [studentsData, facultyData, academicData] = await Promise.all([
    api("/students"),
    api("/faculty"),
    api("/academics/overview")
  ]);

  pageContent.innerHTML = `
    <section class="section-grid two-column">
      ${panel({
        title: "Create student account",
        body: `
          <form id="studentCreateForm" class="form-grid">
            <label class="field"><span>Full name</span><input type="text" name="fullName" placeholder="Student full name" required /></label>
            <label class="field"><span>Email</span><input type="email" name="email" placeholder="student@college.edu" required /></label>
            <label class="field"><span>Password</span><input type="password" name="password" placeholder="At least 8 characters" required /></label>
            <label class="field">
              <span>Department</span>
              <select name="departmentCode" id="studentDepartment" required>
                <option value="">Select department</option>
                ${academicData.departments
                  .map(
                    (department) =>
                      `<option value="${department.code}" data-department-id="${department.id}">${escapeHtml(department.name)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field">
              <span>Branch</span>
              <select name="branchId" id="studentBranch" required>
                <option value="">Select branch</option>
              </select>
            </label>
            <label class="field"><span>Semester</span><select name="semester" required>${buildSemesterOptions("1")}</select></label>
            <label class="field"><span>Section</span><input type="text" name="section" placeholder="A" required /></label>
            <label class="field"><span>Roll number</span><input type="text" name="rollNumber" placeholder="CSE2026-010" required /></label>
            <label class="field"><span>Registration number</span><input type="text" name="registrationNumber" placeholder="REG2026-010" required /></label>
            <label class="field full-width">
              <span>Mentor</span>
              <select name="advisorFacultyId">
                <option value="">Assign later</option>
                ${facultyData.faculty
                  .map(
                    (faculty) =>
                      `<option value="${faculty.id}">${escapeHtml(faculty.full_name)} - ${escapeHtml(faculty.branch_name || faculty.department_name)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <button class="button button-primary" type="submit">Create Student</button>
          </form>
        `
      })}
      ${panel({
        title: "Student structure",
        body: createStatsGrid([
          { label: "Students", value: String(studentsData.students.length), icon: "students" },
          { label: "Departments", value: String(new Set(studentsData.students.map((item) => item.department_name)).size), icon: "faculty" },
          { label: "Branches", value: String(new Set(studentsData.students.map((item) => item.branch_name || "General")).size), icon: "timetable" },
          { label: "Mentors", value: String(new Set(studentsData.students.map((item) => item.advisor_name || "Unassigned")).size), icon: "attendance" }
        ])
      })}
    </section>
    ${createTableCard({
      title: "Student directory",
      headers: ["Student", "Roll Number", "Registration", "Structure", "Mentor", "Actions"],
      rows: studentsData.students.map(
        (student) => `
          <tr>
            <td>${escapeHtml(student.full_name)}<div class="muted-text">${escapeHtml(student.email)}</div></td>
            <td>${escapeHtml(student.roll_number)}</td>
            <td>${escapeHtml(student.registration_number)}</td>
            <td>${escapeHtml(student.department_name)}<div class="muted-text">${escapeHtml(student.branch_name || "-")} - Semester ${escapeHtml(student.semester)}</div></td>
            <td>${escapeHtml(student.advisor_name || "Not assigned")}</td>
            <td>
              <div class="inline-actions">
                <select class="compact-select" data-student-faculty="${student.id}">
                  <option value="">Select mentor</option>
                  ${buildFacultyAssignmentOptions(facultyData.faculty, student.faculty_id)}
                </select>
                <button class="button button-ghost button-small" type="button" data-student-assign="${student.id}">Save</button>
                <button
                  class="icon-action icon-action-danger"
                  type="button"
                  data-delete-student="${student.id}"
                  aria-label="Delete student"
                  title="Delete student"
                >
                  ${icon("trash")}
                </button>
              </div>
            </td>
          </tr>
        `
      ),
      emptyMessage: "No students are available yet."
    })}
  `;

  const departmentSelect = document.getElementById("studentDepartment");
  const branchSelect = document.getElementById("studentBranch");

  const syncBranches = () => {
    const selectedDepartmentId = departmentSelect.selectedOptions[0]?.dataset.departmentId || "";
    branchSelect.innerHTML = `
      <option value="">Select branch</option>
      ${buildBranchOptionsFromData(academicData.branches, selectedDepartmentId)}
    `;
  };

  departmentSelect?.addEventListener("change", syncBranches);

  document.getElementById("studentCreateForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await api("/students", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      showToast("Student created successfully.");
      await renderStudentsPage();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelectorAll("[data-student-assign]").forEach((button) => {
    button.addEventListener("click", async () => {
      const studentId = button.dataset.studentAssign;
      const select = document.querySelector(`[data-student-faculty="${studentId}"]`);

      if (!select?.value) {
        showToast("Select a faculty member first.", "error");
        return;
      }

      button.disabled = true;

      try {
        await api("/assign-student", {
          method: "POST",
          body: JSON.stringify({
            student_id: Number(studentId),
            faculty_id: Number(select.value)
          })
        });
        showToast("Student assigned successfully.");
        await renderStudentsPage();
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });

  document.querySelectorAll("[data-delete-student]").forEach((button) => {
    button.addEventListener("click", async () => {
      const studentId = button.dataset.deleteStudent;
      if (!studentId) return;

      const confirmed = window.confirm("Are you sure you want to delete this student? This action cannot be undone.");
      if (!confirmed) return;

      button.disabled = true;

      try {
        await api(`/students/${studentId}`, { method: "DELETE" });
        button.closest("tr")?.remove();
        showToast("Student deleted successfully");
        await renderStudentsPage();
      } catch (error) {
        button.disabled = false;
        showToast(error.message, "error");
      }
    });
  });
}
