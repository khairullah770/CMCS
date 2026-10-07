const roleData = {
  ceo: {
    title: "Good morning, Ahmad", copy: "Here’s the business pulse across Chinar TV today.",
    labels: ["Active productions", "On-air this week", "Team utilisation", "Monthly spend"], metrics: ["24", "86.4", "78", "$284.6"], panels: ["Broadcast schedule", "Recent activity", "Performance overview"]
  },
  production: {
    title: "Good morning, Sarah", copy: "Keep today’s productions moving smoothly and on schedule.",
    labels: ["Today’s programmes", "Crew on assignment", "Production readiness", "Open incidents"], metrics: ["10", "42", "91", "03"], panels: ["Today’s production plan", "Production activity", "Output overview"]
  },
  hoo: {
    title: "Good morning, Sarah", copy: "Coordinate today’s projects, teams, and field operations.",
    labels: ["Today's projects", "Pending assignments", "Delayed projects", "Field teams active"], metrics: ["08", "05", "03", "12"], panels: ["Today's operations", "Assignment queue", "Operational alerts"]
  },
  finance: {
    title: "Good morning, Sarah", copy: "Stay on top of invoices, payments, and the month’s financial health.",
    labels: ["Outstanding invoices", "Paid this month", "Awaiting approval", "Monthly spend"], metrics: ["18", "$184.2", "07", "$284.6"], panels: ["Invoices & payments", "Finance activity", "Cash flow overview"]
  },
  hr: {
    title: "Good morning, Sarah", copy: "Support your people with a clear view of attendance and team wellbeing.",
    labels: ["Total employees", "Present today", "On leave", "Open requests"], metrics: ["148", "136", "12", "08"], panels: ["Today’s attendance", "People activity", "People overview"]
  },
  employee: {
    title: "Good morning, Sarah", copy: "Here’s the work assigned to you today.",
    labels: ["My open tasks", "Due today", "Completed this week", "Leave balance"], metrics: ["08", "03", "17", "12 days"], panels: ["My tasks today", "My recent activity", "My workload"]
  },
  technical: {
    title: "Good morning, Sarah", copy: "Keep studios, systems, and broadcast infrastructure reliable.",
    labels: ["Open incidents", "Systems online", "Maintenance due", "Assets assigned"], metrics: ["04", "99.8", "06", "128"], panels: ["Technical operations", "Incident activity", "Infrastructure health"]
  },
  admin: {
    title: "Good morning, Sarah", copy: "Manage the workspace, requests, and day-to-day administration.",
    labels: ["Pending requests", "Active users", "Documents due", "Open actions"], metrics: ["14", "148", "09", "22"], panels: ["Admin requests", "Latest activity", "Workspace health"]
  }
};

const roleSelect = document.querySelector("#roleSelect");
const title = document.querySelector("#dashboardTitle");
const copy = document.querySelector("#dashboardCopy");
const metricIds = ["metricOne", "metricTwo", "metricThree", "metricFour"];
const metricLabelIds = ["metricLabelOne", "metricLabelTwo", "metricLabelThree", "metricLabelFour"];
const toast = document.querySelector("#toast");
const roleWorkspace = document.querySelector("#roleWorkspace");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector(".app-shell");
const loginForm = document.querySelector("#loginForm");
const authTitle = document.querySelector("#authTitle");
const authCopy = document.querySelector("#authCopy");
const demoUsers = {
  ceo: { employeeId: "CHN-CEO-001", email: "ceo@demo.chinar.tv", password: "ChinarCEO@2026", name: "Ahmad Khan", firstName: "Ahmad", role: "CEO", department: "Management" },
  hoo: { employeeId: "CHN-HOO-001", email: "hoo@demo.chinar.tv", password: "ChinarOps@2026", name: "Wali Khan", firstName: "Wali", role: "Head of Operations", department: "Operations" },
  production: { employeeId: "CHN-PROD-001", email: "production@demo.chinar.tv", password: "ChinarProd@2026", name: "Hafizullah Khan", firstName: "Hafizullah", role: "Production Manager", department: "Production" },
  technical: { employeeId: "CHN-TECH-001", email: "technical@demo.chinar.tv", password: "ChinarTech@2026", name: "Shoaib Ahmad", firstName: "Shoaib", role: "Technical Manager", department: "Technical / IT" },
  finance: { employeeId: "CHN-FIN-001", email: "finance@demo.chinar.tv", password: "ChinarFinance@2026", name: "Farid Ahmad", firstName: "Farid", role: "Finance Officer", department: "Finance" },
  hr: { employeeId: "CHN-HR-001", email: "hr@demo.chinar.tv", password: "ChinarHR@2026", name: "Zainab Ahmad", firstName: "Zainab", role: "HR Manager", department: "Human Resources" },
  admin: { employeeId: "CHN-ADM-001", email: "admin@demo.chinar.tv", password: "ChinarAdmin@2026", name: "Mohammad Wali", firstName: "Mohammad", role: "System Administrator", department: "Administration" },
  employee: { employeeId: "CHN-EMP-001", email: "employee@demo.chinar.tv", password: "ChinarEmployee@2026", name: "Ahmad Rahimi", firstName: "Ahmad", role: "Employee", department: "Production" }
};

const setCurrentUser = (user, remember = false) => {
  localStorage.setItem("ctmsCurrentUser", JSON.stringify(user));
  if (remember) localStorage.setItem("ctmsRememberedUser", JSON.stringify(user));
  document.querySelector("#currentUserName").textContent = user.name;
  document.querySelector("#currentUserRole").textContent = user.role;
  document.querySelector("#topbarAvatar").textContent = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  document.querySelector("#sidebarAvatar").textContent = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  document.querySelector(".sidebar-footer strong").textContent = user.name;
  document.querySelector(".sidebar-footer span").textContent = user.role;
};

const roleRoutes = { ceo: "ceo/dashboard", hoo: "operations/dashboard", production: "production/dashboard", technical: "technical/dashboard", finance: "finance/dashboard", hr: "hr/dashboard", admin: "admin/dashboard", employee: "employee/dashboard" };

const demoAccountMarkup = Object.entries(demoUsers).map(([key, user]) => `<div class="demo-account"><span>${user.role}</span><button type="button" data-demo-role="${key}">Login</button></div>`).join("");
document.querySelector("#demoAccounts").innerHTML = demoAccountMarkup;
document.querySelector("#demoAccountsToggle").addEventListener("click", () => {
  const panel = document.querySelector("#demoAccounts");
  panel.hidden = !panel.hidden;
});
document.querySelector("#demoAccounts").addEventListener("click", (event) => {
  const role = event.target.dataset.demoRole;
  if (!role) return;
  const user = demoUsers[role];
  setCurrentUser(user, false);
  roleSelect.value = role;
  roleSelect.dispatchEvent(new Event("change"));
  window.location.hash = roleRoutes[role];
  showApp(`${user.role} workspace loaded`);
});
document.querySelector("#forgotPassword").addEventListener("click", () => showToast("Contact Admin or HR to reset your password"));
const rememberedUser = JSON.parse(localStorage.getItem("ctmsRememberedUser") || "null");
if (rememberedUser) {
  const rememberedRole = Object.keys(demoUsers).find((key) => demoUsers[key].employeeId === rememberedUser.employeeId);
  if (rememberedRole) {
    setCurrentUser(rememberedUser, false);
    roleSelect.value = rememberedRole;
    roleSelect.dispatchEvent(new Event("change"));
    showApp(`Welcome back, ${rememberedUser.firstName}`);
  }
}

const roleNavigation = {
  ceo: [["Workspace", [["Dashboard", "overview"], ["Projects", "projects"], ["Assignments", "assignments"], ["Calendar", "calendar"]]], ["Operations", [["OB Vans", "ob-vans"], ["Equipment", "equipment"], ["Rentals", "rentals"]]], ["People", [["Employees", "people"], ["Attendance", "attendance"], ["Leave", "leave"]]], ["Finance", [["Invoices", "invoices"], ["Payments", "payments"], ["Expenses", "expenses"]]], ["Reports", [["Reports", "reports"], ["Analytics", "analytics"]]], ["System", [["Notifications", "notifications"], ["Audit Logs", "audit"]]]],
  hoo: [["Workspace", [["Dashboard", "overview"], ["Projects", "projects"], ["Assignments", "assignments"], ["Operations Calendar", "calendar"], ["Delayed Projects", "delayed"]]], ["Teams", [["Field Teams", "teams"], ["Employee Availability", "availability"]]], ["Resources", [["OB Vans", "ob-vans"], ["Equipment", "equipment"], ["Rentals", "rentals"]]], ["Reports", [["Operations Reports", "reports"], ["Notifications", "notifications"], ["My Profile", "profile"]]]],
  production: [["Workspace", [["Dashboard", "overview"], ["Projects", "projects"], ["Production Schedule", "programming"], ["Assignments", "assignments"], ["Calendar", "calendar"]]], ["Field Operations", [["Field Teams", "teams"], ["OB Vans", "ob-vans"], ["Equipment", "equipment"]]], ["My Work", [["My Attendance", "attendance"], ["My Leave", "leave"], ["Notifications", "notifications"], ["My Profile", "profile"]]]],
  technical: [["Workspace", [["Dashboard", "overview"], ["Projects", "projects"], ["Assignments", "assignments"], ["Calendar", "calendar"]]], ["Resources", [["OB Vans", "ob-vans"], ["Equipment", "equipment"], ["Resource Bookings", "bookings"], ["Maintenance", "maintenance"], ["Rentals", "rentals"]]], ["Reports", [["Resource Reports", "reports"], ["Notifications", "notifications"], ["My Profile", "profile"]]]],
  finance: [["Workspace", [["Dashboard", "overview"], ["Projects", "projects"], ["Finance Queue", "finance"]]], ["Finance", [["Invoices", "invoices"], ["Payments", "payments"], ["Expenses", "expenses"], ["Clients", "clients"], ["Statements", "statements"]]], ["Reports", [["Financial Reports", "reports"], ["Revenue", "revenue"], ["Outstanding", "outstanding"], ["Notifications", "notifications"], ["My Profile", "profile"]]]],
  hr: [["Workspace", [["Dashboard", "overview"], ["Employees", "people"], ["Attendance", "attendance"], ["Leave", "leave"], ["Employee Documents", "documents"]]], ["Reports", [["Reports", "reports"], ["Notifications", "notifications"], ["My Profile", "profile"]]]],
  admin: [["Workspace", [["Dashboard", "overview"], ["Employees", "people"], ["Departments", "departments"], ["Roles & Permissions", "permissions"], ["Projects", "projects"], ["Assignments", "assignments"], ["Approvals", "approvals"], ["Documents", "documents"]]], ["Reports", [["Reports", "reports"], ["Audit Logs", "audit"], ["Settings", "settings"], ["Notifications", "notifications"], ["My Profile", "profile"]]]],
  employee: [["Workspace", [["Dashboard", "overview"]]], ["My Work", [["My Projects", "projects"], ["My Assignments", "assignments"], ["Calendar", "calendar"]]], ["My Attendance", [["Attendance", "attendance"], ["Leave", "leave"], ["Notifications", "notifications"], ["My Profile", "profile"]]]]
};

const navIcon = { Dashboard: "⌂", Projects: "◈", Assignments: "▤", Calendar: "◷", "Production Schedule": "▦", "Operations Calendar": "◷", "OB Vans": "▣", Equipment: "◉", Rentals: "↗", Employees: "♙", Attendance: "◷", Leave: "▱", Invoices: "▤", Payments: "$", Expenses: "⌁", Reports: "▤", Analytics: "⌁", Notifications: "♢", "Audit Logs": "▤", "Finance Queue": "▣", "Field Teams": "♙", "Employee Availability": "◉", Maintenance: "!", "Resource Bookings": "◷", "Resource Reports": "▤", Clients: "♙", Statements: "▤", Revenue: "↗", Outstanding: "$", "My Profile": "●", Departments: "▦", "Roles & Permissions": "⚙", Approvals: "✓", Documents: "▤", Settings: "⚙", "My Projects": "◈", "My Assignments": "▤", "My Attendance": "◷", "My Leave": "▱", "Delayed Projects": "!" };

const invoiceTemplate = () => `
  <div class="invoice-page">
    <div class="invoice-breadcrumb"><span>Finance</span><b>/</b><span>Finance Queue</span><b>/</b><span>UNDP Videography</span><b>/</b><strong>Create Invoice</strong></div>
    <div class="invoice-page-head"><div><p class="eyebrow">FINANCE · INVOICE WORKFLOW</p><h2>Create Invoice</h2><p>Prepare an invoice for the completed project.</p></div><span class="invoice-draft-badge">Draft</span></div>
    <div class="invoice-layout">
      <div class="invoice-main">
        <article class="invoice-card project-context-card"><div class="invoice-section-kicker">PROJECT</div><div class="project-context-top"><div><h3>UNDP Videography</h3><span class="project-code">CHN-PRJ-2026-018</span></div><button class="text-button" data-invoice-action="project">View Project <span>→</span></button></div><div class="project-context-grid"><div><span>Client</span><b>UNDP</b></div><div><span>Service</span><b>Videography</b></div><div><span>Completed</span><b>October 06, 2026</b></div><div><span>Agreed amount</span><b>$5,000</b></div></div></article>
        <article class="invoice-card"><div class="invoice-card-head"><div><h3>Invoice Information</h3><p>Confirm the details for this invoice.</p></div></div><div class="invoice-fields invoice-fields-four"><label>Invoice Number<span class="readonly-field">INV-2026-001 <i>System generated</i></span></label><label>Invoice Date<input type="text" value="October 07, 2026"></label><label>Due Date<input type="text" value="October 30, 2026"></label><label>Currency<select><option>USD</option><option>AFN</option></select></label></div></article>
        <article class="invoice-card"><div class="invoice-card-head"><div><h3>Bill To</h3><p>Client information from the completed project.</p></div><button class="text-button" data-invoice-action="client">Change Client</button></div><div class="client-card"><div class="client-logo">U</div><div class="client-details"><h4>UNDP</h4><p>United Nations Development Programme</p><div class="client-meta"><span><b>Contact Person</b>John Smith</span><span><b>Email</b>john.smith@example.com</span><span><b>Phone</b>+93 XXX XXX XXX</span><span><b>Address</b>Kabul, Afghanistan</span></div></div></div></article>
        <article class="invoice-card"><div class="invoice-card-head"><div><h3>Invoice Items</h3><p>Add the services or charges included in this invoice.</p></div><button class="button button-secondary" data-invoice-action="add-item">+ Add Line Item</button></div><div class="invoice-items-wrap"><table class="invoice-items-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th><th></th></tr></thead><tbody id="invoiceItems"><tr><td><input class="item-description" value="Videography Service"></td><td><input class="item-qty" type="number" min="1" value="1"></td><td><input class="item-price" type="number" min="0" value="5000"></td><td class="item-amount">$5,000</td><td><button class="remove-item" aria-label="Remove item">×</button></td></tr></tbody></table></div><div class="invoice-item-empty" hidden>No invoice items yet. Add a line item to continue.</div></article>
        <article class="invoice-card"><div class="invoice-card-head"><div><h3>Invoice Notes</h3><p>Optional information for the client.</p></div></div><textarea class="invoice-notes" placeholder="Add any additional information for the client...">Thank you for your business.</textarea></article>
        <article class="invoice-card"><div class="invoice-card-head"><div><h3>Attachments</h3><p>Add supporting documents for Admin review.</p></div></div><label class="upload-zone"><input type="file" id="invoiceFile"><span class="upload-icon">↑</span><strong>Upload Documents</strong><small>Drag and drop or browse files</small><em>PDF, JPG, PNG, DOCX, XLSX</em></label><div class="uploaded-file" id="uploadedFile" hidden><span class="file-icon">PDF</span><div><b>invoice-supporting-document.pdf</b><small>2.4 MB</small></div><button data-invoice-action="remove-file">Remove</button></div></article>
      </div>
      <aside class="invoice-summary-column"><article class="invoice-summary-card"><div class="invoice-summary-head"><div><span class="invoice-section-kicker">INVOICE SUMMARY</span><h3>Review totals</h3></div><span class="summary-check">✓</span></div><div class="summary-lines"><div><span>Subtotal</span><b data-summary="subtotal">$5,000</b></div><div class="summary-input-line"><label>Discount</label><div><span>$</span><input id="invoiceDiscount" type="number" min="0" value="0"></div></div><div class="summary-input-line"><label>Tax <small>percentage</small></label><div><input id="invoiceTax" type="number" min="0" value="10"><span>%</span></div></div><div><span>Tax amount</span><b data-summary="tax">$500</b></div></div><div class="summary-total"><span>Total</span><strong data-summary="total">$5,500</strong></div><button class="button button-secondary invoice-preview-button" data-invoice-action="preview">Preview Invoice <span>↗</span></button></article><div class="invoice-submit-hint"><span>i</span><p>Invoices are reviewed and approved by Admin before being sent to the client.</p></div></aside>
    </div>
    <div class="invoice-action-bar"><button class="button button-quiet" data-invoice-action="cancel">Cancel</button><div><button class="button button-secondary" data-invoice-action="save">Save Draft</button><button class="button button-primary" data-invoice-action="submit">Submit for Admin Review</button></div></div>
    <div class="invoice-overlay" data-overlay="confirm" hidden><div class="invoice-modal"><button class="modal-close" data-invoice-action="close-modal">×</button><span class="modal-icon warning">!</span><h3>Submit Invoice for Review?</h3><p>This invoice will be sent to the Admin Department for review and approval.</p><small>You can no longer edit it until it is returned for correction.</small><div class="modal-actions"><button class="button button-secondary" data-invoice-action="close-modal">Cancel</button><button class="button button-primary" data-invoice-action="confirm-submit">Submit for Review</button></div></div></div>
    <div class="invoice-overlay" data-overlay="preview" hidden><div class="invoice-preview-modal"><div class="preview-toolbar"><strong>Invoice Preview</strong><button class="modal-close" data-invoice-action="close-modal">×</button></div><div class="print-invoice"><div class="print-invoice-head"><div><img src="assets/chinar-logo.png" alt="Chinar TV"><span>CHINAR TV MANAGEMENT SYSTEM</span></div><strong>INVOICE</strong></div><div class="print-meta"><span><b>Invoice #</b>INV-2026-001</span><span><b>Date</b>Oct 07, 2026</span><span><b>Due</b>Oct 30, 2026</span></div><div class="print-bill"><span>BILL TO</span><b>UNDP</b><p>John Smith · Kabul, Afghanistan</p></div><table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody id="previewItems"></tbody></table><div class="print-totals"><span>Subtotal <b data-preview="subtotal">$5,000</b></span><span>Tax <b data-preview="tax">$500</b></span><strong>Total <b data-preview="total">$5,500</b></strong></div><div class="print-notes"><span>Notes</span><p>Thank you for your business.</p></div></div><div class="preview-actions"><button class="button button-secondary" data-invoice-action="close-modal">Close Preview</button><button class="button button-primary" data-invoice-action="print">Print / Download</button></div></div></div>
    <div class="invoice-overlay" data-overlay="success" hidden><div class="invoice-modal success-modal"><span class="modal-icon success">✓</span><h3>Invoice Submitted</h3><p><b>INV-2026-001</b> has been submitted successfully for Admin review.</p><div class="success-status"><span>Status</span><b>Admin Review</b></div><div class="modal-actions"><button class="button button-secondary" data-invoice-action="view-invoice">View Invoice</button><button class="button button-primary" data-invoice-action="queue">Back to Finance Queue</button></div></div></div>
  </div>`;

const ceoTemplate = () => `
  <div class="ceo-dashboard">
    <div class="ceo-dashboard-head"><div><p class="eyebrow">EXECUTIVE OVERVIEW</p><h2>Good Morning, Ahmad</h2><p>Here’s an overview of Chinar TV’s current operations.</p></div><div class="ceo-head-date"><span>Today</span><strong>October 07, 2026</strong></div></div>
    <div class="ceo-kpis">
      <article class="ceo-kpi"><span class="ceo-icon blue">▣</span><span class="ceo-kpi-label">Active Projects</span><strong>18</strong><small class="positive">↑ 8.2% <i>vs last month</i></small></article>
      <article class="ceo-kpi"><span class="ceo-icon purple">◷</span><span class="ceo-kpi-label">Upcoming Projects</span><strong>12</strong><small>5 starting this week</small></article>
      <article class="ceo-kpi alert-kpi"><span class="ceo-icon orange">!</span><span class="ceo-kpi-label">Delayed Projects</span><strong>3</strong><small class="negative">Requires attention</small></article>
      <article class="ceo-kpi"><span class="ceo-icon green">✓</span><span class="ceo-kpi-label">Completed This Month</span><strong>46</strong><small class="positive">↑ 12% <i>vs last month</i></small></article>
    </div>
    <section class="ceo-financial-row"><div><span>Total Revenue</span><strong>$248,500</strong></div><div><span>Paid</span><strong>$186,200</strong></div><div><span>Outstanding</span><strong>$62,300</strong></div><div><span>Overdue</span><strong class="negative-text">$18,750</strong></div><div class="ceo-financial-month"><span>Revenue this month</span><strong>$48,200</strong><small class="positive">↑ 12.4%</small></div></section>
    <div class="ceo-main-grid">
      <article class="ceo-panel project-overview"><div class="ceo-panel-head"><div><h3>Project Overview</h3><p>Current project distribution by status</p></div><select class="ceo-filter"><option>This Month</option><option>This Quarter</option><option>This Year</option></select></div><div class="ceo-chart"><div class="ceo-bars"><i style="height:22%"><b>4</b></i><i style="height:34%"><b>6</b></i><i style="height:52%"><b>12</b></i><i style="height:70%"><b>18</b></i><i class="bar-active" style="height:96%"><b>46</b></i><i style="height:25%"><b>3</b></i><i style="height:19%"><b>2</b></i></div><div class="ceo-chart-labels"><span>Draft</span><span>Assigned</span><span>Upcoming</span><span>In progress</span><span>Completed</span><span>On hold</span><span>Cancelled</span></div></div></article>
      <article class="ceo-panel attention-panel"><div class="ceo-panel-head"><div><h3>Requires Attention</h3><p>Important items for your review</p></div><span class="attention-count">4</span></div><div class="ceo-attention-list"><button data-ceo-action="attention"><b class="danger-bg">3</b><span><strong>Delayed Projects</strong><small>Needs intervention</small></span><em>View →</em></button><button data-ceo-action="attention"><b class="warning-bg">5</b><span><strong>Assignments Awaiting Response</strong><small>Across 2 projects</small></span><em>View →</em></button><button data-ceo-action="attention"><b class="info-bg">4</b><span><strong>Invoices Awaiting Review</strong><small>Admin queue</small></span><em>View →</em></button><button data-ceo-action="attention"><b class="warning-bg">2</b><span><strong>OB Vans Require Attention</strong><small>Maintenance due</small></span><em>View →</em></button></div></article>
    </div>
    <article class="ceo-panel ceo-operations"><div class="ceo-panel-head"><div><h3>Today’s Operations</h3><p>Projects and field activities scheduled for today.</p></div><button class="text-button" data-ceo-action="operations">View schedule <span>→</span></button></div><div class="ceo-table-wrap"><table class="ceo-table"><thead><tr><th>Project</th><th>Client</th><th>Project Lead</th><th>Team</th><th>Time</th><th>Location</th><th>Status</th></tr></thead><tbody><tr data-ceo-action="project"><td><b>UNDP Videography</b><small>CHN-PRJ-2026-018</small></td><td>UNDP</td><td>Hafizullah Khan</td><td>5 members</td><td>09:00</td><td>Kabul</td><td><span class="ceo-status progress">In Progress</span></td></tr><tr><td><b>Sports Coverage</b><small>CHN-PRJ-2026-021</small></td><td>AFG Sports</td><td>Shoaib Ahmad</td><td>6 members</td><td>11:00</td><td>Kabul Stadium</td><td><span class="ceo-status upcoming">Upcoming</span></td></tr><tr><td><b>News Production</b><small>CHN-PRJ-2026-023</small></td><td>Client XYZ</td><td>Ahmad Rahimi</td><td>3 members</td><td>13:00</td><td>Kabul</td><td><span class="ceo-status delayed">Delayed</span></td></tr><tr><td><b>Documentary Production</b><small>CHN-PRJ-2026-024</small></td><td>TOLO Media</td><td>Farid Khan</td><td>4 members</td><td>15:00</td><td>Kabul</td><td><span class="ceo-status upcoming">Upcoming</span></td></tr></tbody></table></div></article>
    <div class="ceo-lower-grid"><article class="ceo-panel"><div class="ceo-panel-head"><div><h3>Department Performance</h3><p>Current operating health</p></div></div><div class="department-performance"><div><span class="dept-avatar purple">P</span><p><b>Production</b><small>24 projects · 18 completed</small></p><strong>92%</strong></div><div><span class="dept-avatar blue">T</span><p><b>Technical</b><small>19 projects · 16 completed</small></p><strong>87%</strong></div><div><span class="dept-avatar green">F</span><p><b>Finance</b><small>32 invoices · 25 paid</small></p><strong>$62.3k</strong></div><div><span class="dept-avatar orange">H</span><p><b>HR</b><small>74 employees · 94% attendance</small></p><strong>94%</strong></div></div></article><article class="ceo-panel"><div class="ceo-panel-head"><div><h3>Resource Snapshot</h3><p>Availability across operations</p></div><button class="text-button" data-ceo-action="resources">View resources <span>→</span></button></div><div class="resource-snapshot"><div><span class="resource-icon blue">▣</span><p><b>OB Vans</b><small>3 available · 2 deployed</small></p><strong>1 <i>maintenance</i></strong></div><div><span class="resource-icon purple">◈</span><p><b>Equipment</b><small>42 available · 15 issued</small></p><strong>4 <i>maintenance</i></strong></div><div><span class="resource-icon orange">↗</span><p><b>Rentals</b><small>6 active · 3 due this week</small></p><strong>1 <i>overdue</i></strong></div></div></article></div>
    <div class="ceo-lower-grid"><article class="ceo-panel"><div class="ceo-panel-head"><div><h3>Recent Activity</h3><p>Latest organization updates</p></div><button class="text-button" data-ceo-action="activity">View all <span>→</span></button></div><div class="ceo-timeline"><div><span class="timeline-avatar green">HK</span><p><b>Hafizullah accepted assignment</b><small>UNDP Videography · 10 minutes ago</small></p></div><div><span class="timeline-avatar purple">FI</span><p><b>Finance submitted INV-2026-001</b><small>UNDP · 25 minutes ago</small></p></div><div><span class="timeline-avatar blue">SA</span><p><b>Shoaib completed project work</b><small>Sports Coverage · 42 minutes ago</small></p></div><div><span class="timeline-avatar orange">AD</span><p><b>Admin approved invoice INV-2026-002</b><small>AFG Sports · 1 hour ago</small></p></div></div></article><article class="ceo-panel critical-alerts"><div class="ceo-panel-head"><div><h3>Critical Alerts</h3><p>Issues requiring visibility</p></div></div><div class="critical-list"><button data-ceo-action="alert"><span class="alert-line danger-line"></span><p><b>Delayed Project</b><small>UNDP Videography · 2 days behind schedule</small></p><em>View Details →</em></button><button data-ceo-action="alert"><span class="alert-line warning-line"></span><p><b>Invoice Overdue</b><small>INV-2026-003 · $8,500 · 12 days overdue</small></p><em>View Details →</em></button><button data-ceo-action="alert"><span class="alert-line info-line"></span><p><b>OB Van Maintenance</b><small>CHN-OB-003 · Scheduled maintenance required</small></p><em>View Details →</em></button></div></article></div>
    <article class="ceo-panel financial-overview"><div class="ceo-panel-head"><div><h3>Financial Overview</h3><p>Revenue and collection visibility</p></div><div class="chart-filters"><button class="active">30 Days</button><button>3 Months</button><button>12 Months</button></div></div><div class="financial-overview-grid"><div class="revenue-chart"><div class="revenue-line"></div><div class="chart-axis"><span>Sep 08</span><span>Sep 22</span><span>Oct 07</span></div></div><div class="top-clients"><strong>Top Clients by Revenue</strong><span><b>UNDP</b>$54,000</span><span><b>AFG Sports</b>$38,500</span><span><b>TOLO Media</b>$31,200</span><span><b>Client XYZ</b>$24,800</span></div></div></article>
    <div class="ceo-state-card" hidden><strong>Unable to load dashboard data.</strong><span>Try again to refresh this overview.</span><button class="button button-secondary" data-ceo-action="retry">Try Again</button></div>
  </div>`;

const workspaceTemplates = {
  ceo: ceoTemplate(),
  production: `<div class="workspace-head"><div><h2>Production operations</h2><p>Everything your teams need to keep today’s work on track.</p></div><button class="button button-primary">+ Create production</button></div><div class="workspace-grid"><article class="workspace-card wide-card"><div class="workspace-card-title"><span class="workspace-icon purple">▣</span><div><strong>Active productions</strong><span>5 projects need your attention</span></div><button class="text-button">View all <span>→</span></button></div><div class="production-list"><div><span class="project-thumb thumb-purple">CL</span><p><b>City Life — S02</b><small>Post-production · Due 18 Oct</small></p><span class="pill pill-progress">72%</span></div><div><span class="project-thumb thumb-orange">BM</span><p><b>Business Morning</b><small>Pre-production · Due 24 Oct</small></p><span class="pill pill-review">Review</span></div><div><span class="project-thumb thumb-blue">IP</span><p><b>Inside Pakistan</b><small>Field production · Due 12 Oct</small></p><span class="pill pill-ready">On track</span></div></div></article><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon green">♙</span><div><strong>Crew availability</strong><span>Today · 42 assigned</span></div></div><div class="crew-ring"><strong>86%</strong><span>available</span></div><div class="mini-stat-row"><span>On assignment <b>42</b></span><span>Available <b>18</b></span></div></article></div>`,
  hoo: `<div class="hoo-workspace"><div class="workspace-head"><div><p class="eyebrow">OPERATIONS CONTROL</p><h2>Head of Operations</h2><p>Coordinate projects, field teams, assignments, and daily delivery.</p></div><div class="hoo-actions"><button class="button button-secondary">Assign employee</button><button class="button button-primary">+ Create project</button></div></div><div class="hoo-kpis"><article><span class="workspace-icon blue">▦</span><p>Today's projects<strong>08</strong><small>Scheduled for field delivery</small></p></article><article><span class="workspace-icon orange">▤</span><p>Pending assignments<strong>05</strong><small>Awaiting employee response</small></p></article><article><span class="workspace-icon red">!</span><p>Delayed projects<strong>03</strong><small>Requires an operations decision</small></p></article><article><span class="workspace-icon green">♙</span><p>Active field teams<strong>12</strong><small>Currently deployed</small></p></article></div><div class="hoo-grid"><article class="workspace-card wide-card"><div class="workspace-card-title"><span class="workspace-icon purple">◷</span><div><strong>Today's operations</strong><span>Live project schedule and delivery status</span></div><button class="text-button">Open calendar <span>→</span></button></div><div class="hoo-operations"><div><b>09:00</b><p><strong>UNDP Videography</strong><small>Hafizullah Khan · Kabul · 5 members</small></p><span class="pill pill-progress">In progress</span></div><div><b>11:00</b><p><strong>Sports Coverage</strong><small>Shoaib Ahmad · Kabul Stadium · 6 members</small></p><span class="pill pill-ready">Upcoming</span></div><div><b>13:00</b><p><strong>News Production</strong><small>Ahmad Rahimi · Kabul · 3 members</small></p><span class="pill pill-review">Delayed</span></div></div></article><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon orange">!</span><div><strong>Assignment queue</strong><span>Actions required today</span></div></div><div class="hoo-queue"><div><p><b>Camera Operator</b><small>UNDP Videography</small></p><button class="text-button">Assign</button></div><div><p><b>Production Assistant</b><small>Sports Coverage</small></p><button class="text-button">Replace</button></div><div><p><b>Driver</b><small>Documentary Production</small></p><button class="text-button">Assign</button></div></div></article></div><div class="hoo-grid"><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon green">♙</span><div><strong>Team availability</strong><span>Employees ready for assignment</span></div></div><div class="hoo-team-stat"><strong>18</strong><span>Available employees</span><i style="width:72%"></i></div><div class="mini-stat-row"><span>On field <b>42</b></span><span>On leave <b>06</b></span></div></article><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon red">!</span><div><strong>Operational alerts</strong><span>Needs your decision</span></div></div><div class="risk-list"><div><span class="risk-dot red"></span><p><b>News Production</b><small>2 days behind schedule</small></p></div><div><span class="risk-dot yellow"></span><p><b>OB Van CHN-OB-003</b><small>Maintenance required today</small></p></div><div><span class="risk-dot blue"></span><p><b>Sports Coverage</b><small>3 assignment responses pending</small></p></div></div></article></div></div>`,
  finance: `<div class="finance-workspace"><div class="workspace-head"><div><h2>Finance dashboard</h2><p>Monitor invoices, payments and financial activity.</p></div><div class="finance-actions"><span class="finance-date">October 07, 2026</span><button class="button button-secondary">Export</button><button class="button button-primary" data-invoice-action="open">+ Create invoice</button></div></div><div class="finance-kpis"><article><span class="finance-kpi-icon blue">▣</span><p>Awaiting finance<strong>8</strong><small>Completed projects ready for invoicing</small></p><button data-invoice-action="open">View queue →</button></article><article><span class="finance-kpi-icon purple">✓</span><p>Admin review<strong>4</strong><small>Invoices awaiting approval</small></p><button>View invoices →</button></article><article><span class="finance-kpi-icon green">$</span><p>Outstanding<strong>$24,500</strong><small>Amount yet to be received</small></p><button>View outstanding →</button></article><article><span class="finance-kpi-icon red">!</span><p>Overdue<strong>$8,200</strong><small>Requires follow-up</small></p><button>View overdue →</button></article></div><div class="finance-stats"><span>Paid this month <b>$46,700</b></span><span>Invoices this month <b>18</b></span><span>Returned invoices <b>2</b></span><span>Expenses this month <b>$12,400</b></span></div><div class="finance-main-grid"><article class="workspace-card invoice-pipeline"><div class="workspace-card-title"><span class="workspace-icon purple">◈</span><div><strong>Invoice pipeline</strong><span>Current invoice movement</span></div><button class="text-button">View all <span>→</span></button></div><div class="pipeline-steps"><div><i class="pipe-blue"></i><b>8</b><span>Completed</span></div><em>→</em><div><i class="pipe-purple"></i><b>5</b><span>Processing</span></div><em>→</em><div><i class="pipe-orange"></i><b>4</b><span>Admin review</span></div><em>→</em><div><i class="pipe-green"></i><b>7</b><span>Approved</span></div><em>→</em><div><i class="pipe-teal"></i><b>24</b><span>Paid</span></div></div></article><article class="workspace-card attention-panel"><div class="workspace-card-title"><span class="workspace-icon orange">!</span><div><strong>Requires attention</strong><span>Action items for Finance</span></div></div><div class="finance-attention"><div><b class="attention-red">3</b><p>Overdue invoices<small>View overdue →</small></p></div><div><b class="attention-orange">4</b><p>Invoices awaiting review<small>Review invoices →</small></p></div><div><b class="attention-blue">8</b><p>Completed projects<small>Create invoices →</small></p></div></div></article></div><article class="workspace-card finance-table-card"><div class="workspace-card-title"><span class="workspace-icon blue">▤</span><div><strong>Recent invoices</strong><span>Latest finance activity</span></div><button class="text-button">View all <span>→</span></button></div><div class="finance-table-wrap"><table class="finance-table"><thead><tr><th>Invoice</th><th>Client</th><th>Project</th><th>Amount</th><th>Due date</th><th>Status</th><th></th></tr></thead><tbody><tr><td><b>INV-2026-001</b></td><td>UNDP</td><td>UNDP Videography</td><td><strong>$5,500</strong></td><td>Oct 30</td><td><span class="finance-status review">Admin review</span></td><td>•••</td></tr><tr><td><b>INV-2026-002</b></td><td>North Media</td><td>Studio campaign</td><td><strong>$8,200</strong></td><td>Nov 04</td><td><span class="finance-status sent">Sent</span></td><td>•••</td></tr><tr><td><b>INV-2026-003</b></td><td>City Transport</td><td>Outside broadcast</td><td><strong>$3,600</strong></td><td>Nov 08</td><td><span class="finance-status paid">Paid</span></td><td>•••</td></tr></tbody></table></div></article></div>`,
  hr: `<div class="workspace-head"><div><h2>People operations</h2><p>Attendance, leave requests, and employee wellbeing at a glance.</p></div><button class="button button-primary">+ Add employee</button></div><div class="workspace-grid"><article class="workspace-card wide-card"><div class="workspace-card-title"><span class="workspace-icon green">♙</span><div><strong>Today’s attendance</strong><span>Wednesday · 07 October</span></div><button class="text-button">View directory <span>→</span></button></div><div class="attendance-summary"><div><strong>136</strong><span>Present</span></div><div><strong>08</strong><span>Remote</span></div><div><strong>04</strong><span>Absent</span></div><div><strong>12</strong><span>On leave</span></div></div><div class="attendance-bar"><i style="width:92%"></i></div></article><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon purple">✓</span><div><strong>Leave requests</strong><span>3 pending approvals</span></div></div><div class="request-list"><div><div class="avatar avatar-blue">AS</div><p><b>Ali Shah</b><small>Annual leave · 10–12 Oct</small></p><span>Review</span></div><div><div class="avatar avatar-green">FN</div><p><b>Farah Noor</b><small>Personal leave · 14 Oct</small></p><span>Review</span></div></div></article></div>`,
  employee: `<div class="workspace-head"><div><h2>My work centre</h2><p>Your assigned work, schedule, and requests in one place.</p></div><button class="button button-primary">+ Request leave</button></div><div class="workspace-grid"><article class="workspace-card wide-card"><div class="workspace-card-title"><span class="workspace-icon blue">✓</span><div><strong>My tasks today</strong><span>3 items due today</span></div><button class="text-button">Open tasks <span>→</span></button></div><div class="task-list"><div><span class="task-check done">✓</span><p><b>Review Morning Focus brief</b><small>Production · Due 10:30 AM</small></p><span class="pill pill-ready">Done</span></div><div><span class="task-check"></span><p><b>Confirm studio access</b><small>Technical · Due 12:00 PM</small></p><span class="pill pill-progress">In progress</span></div><div><span class="task-check"></span><p><b>Submit end-of-day report</b><small>Operations · Due 05:00 PM</small></p><span class="pill pill-review">To do</span></div></div></article><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon orange">◷</span><div><strong>My schedule</strong><span>Today</span></div></div><div class="personal-schedule"><div><b>10:00</b><p>Morning Focus<strong>Studio A</strong></p></div><div><b>02:00</b><p>Production review<strong>Meeting room 2</strong></p></div></div></article></div>`,
  technical: `<div class="workspace-head"><div><h2>Technical operations</h2><p>Monitor broadcast systems, infrastructure, and technical incidents.</p></div><button class="button button-primary">+ Log incident</button></div><div class="workspace-grid"><article class="workspace-card wide-card"><div class="workspace-card-title"><span class="workspace-icon blue">⚙</span><div><strong>Systems monitor</strong><span>Last checked 2 minutes ago</span></div><span class="system-online"><i></i>All systems operational</span></div><div class="system-list"><div><span>Broadcast playout</span><b>99.9%</b><i><em style="width:99%"></em></i></div><div><span>Studio A</span><b>100%</b><i><em style="width:100%"></em></i></div><div><span>Studio B</span><b>98.4%</b><i><em style="width:98%"></em></i></div></div></article><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon orange">!</span><div><strong>Open incidents</strong><span>4 active incidents</span></div></div><div class="incident-list"><div><span class="risk-dot red"></span><p><b>Studio B audio</b><small>High · Assigned to you</small></p><span>2h</span></div><div><span class="risk-dot yellow"></span><p><b>Camera 04 battery</b><small>Medium · Equipment</small></p><span>5h</span></div></div></article></div>`,
  admin: `<div class="workspace-head"><div><h2>Administration centre</h2><p>Manage access, requests, documents, and workspace configuration.</p></div><button class="button button-primary">+ New request</button></div><div class="workspace-grid"><article class="workspace-card wide-card"><div class="workspace-card-title"><span class="workspace-icon purple">▤</span><div><strong>Pending requests</strong><span>14 requests across departments</span></div><button class="text-button">View all <span>→</span></button></div><div class="request-list"><div><div class="avatar avatar-orange">MK</div><p><b>New equipment request</b><small>Production · 22 minutes ago</small></p><span>Review</span></div><div><div class="avatar avatar-blue">AS</div><p><b>Access change request</b><small>Finance · 1 hour ago</small></p><span>Review</span></div><div><div class="avatar avatar-green">FN</div><p><b>Document renewal</b><small>HR · 2 hours ago</small></p><span>Review</span></div></div></article><article class="workspace-card"><div class="workspace-card-title"><span class="workspace-icon green">✓</span><div><strong>Workspace health</strong><span>Configuration status</span></div></div><div class="admin-health"><div><span>Active users</span><b>148</b></div><div><span>Roles configured</span><b>07</b></div><div><span>Pending actions</span><b>22</b></div></div></article></div>`
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function showApp(message) {
  authScreen.classList.add("is-hidden");
  appShell.classList.add("is-visible");
  showToast(message);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const identity = loginForm.elements.identity.value.trim();
  const password = loginForm.elements.password.value;
  const user = Object.values(demoUsers).find((account) => [account.employeeId, account.email].some((value) => value.toLowerCase() === identity.toLowerCase()) && account.password === password);
  if (!user) {
    showToast("Invalid demo credentials");
    return;
  }
  const role = Object.keys(demoUsers).find((key) => demoUsers[key] === user);
  setCurrentUser(user, loginForm.elements.remember.checked);
  roleSelect.value = role;
  roleSelect.dispatchEvent(new Event("change"));
  window.location.hash = roleRoutes[role];
  showApp(`Welcome, ${user.firstName}`);
});

document.querySelectorAll(".password-toggle").forEach((button) => button.addEventListener("click", () => {
  const input = button.parentElement.querySelector("input");
  input.type = input.type === "password" ? "text" : "password";
  button.textContent = input.type === "password" ? "Show" : "Hide";
}));

function renderRoleWorkspace(role) {
  roleWorkspace.innerHTML = workspaceTemplates[role] || workspaceTemplates.employee;
  if (role === "finance") {
    roleWorkspace.querySelectorAll('[data-invoice-action="open"]').forEach((button) => button.addEventListener("click", openInvoiceWorkspace));
  }
  if (role === "ceo") bindCeoActions();
}

function bindCeoActions() {
  roleWorkspace.querySelectorAll("[data-ceo-action]").forEach((element) => element.addEventListener("click", () => {
    const action = element.dataset.ceoAction;
    if (action === "project") {
      roleWorkspace.innerHTML = `<div class="ceo-project-detail"><button class="text-button" data-ceo-back>← Back to dashboard</button><div class="ceo-project-head"><div><p class="eyebrow">PROJECT DETAIL</p><h2>UNDP Videography</h2><span>CHN-PRJ-2026-018</span></div><b class="ceo-status progress">In Progress</b></div><div class="ceo-project-meta"><div><span>Client</span><b>UNDP</b></div><div><span>Project Lead</span><b>Hafizullah Khan</b></div><div><span>Start Date</span><b>Oct 05, 2026</b></div><div><span>End Date</span><b>Oct 10, 2026</b></div><div><span>Location</span><b>Kabul</b></div><div><span>Agreed Amount</span><b>$5,000</b></div></div><div class="ceo-project-tabs"><button class="active">Overview</button><button>Team</button><button>Resources</button><button>Updates</button><button>Documents</button><button>Finance</button><button>History</button></div><div class="ceo-project-columns"><article class="ceo-panel"><div class="ceo-panel-head"><div><h3>Project Team</h3><p>Assignment and work status</p></div></div><div class="department-performance"><div><span class="timeline-avatar green">HK</span><p><b>Hafizullah Khan</b><small>Project Lead · Accepted</small></p><span class="ceo-status progress">Started</span></div><div><span class="timeline-avatar blue">SA</span><p><b>Shoaib Ahmad</b><small>Camera Operator · Accepted</small></p><span class="ceo-status progress">Active</span></div><div><span class="timeline-avatar purple">AR</span><p><b>Ahmad Rahimi</b><small>Video Editor · Accepted</small></p><span class="ceo-status upcoming">Pending</span></div><div><span class="timeline-avatar orange">FK</span><p><b>Farid Khan</b><small>Production Assistant · Completed</small></p><span class="ceo-status upcoming">Done</span></div></div></article><article class="ceo-panel"><div class="ceo-panel-head"><div><h3>Financial Visibility</h3><p>Finance remains responsible for processing</p></div></div><div class="project-finance-stats"><span><small>Agreed amount</small><b>$5,000</b></span><span><small>Invoice status</small><b>Admin Review</b></span><span><small>Expenses</small><b>$1,240</b></span></div></article></div></div>`;
      roleWorkspace.querySelector("[data-ceo-back]").addEventListener("click", () => renderRoleWorkspace("ceo"));
    } else if (action === "retry") {
      renderRoleWorkspace("ceo");
      showToast("Dashboard data refreshed");
    } else {
      showToast(action === "attention" ? "Executive attention list opened" : "CEO oversight view opened");
    }
  }));
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function updateInvoiceTotals() {
  const rows = [...document.querySelectorAll("#invoiceItems tr")];
  let subtotal = 0;
  rows.forEach((row) => {
    const qty = Number(row.querySelector(".item-qty")?.value || 0);
    const price = Number(row.querySelector(".item-price")?.value || 0);
    const amount = qty * price;
    subtotal += amount;
    const cell = row.querySelector(".item-amount");
    if (cell) cell.textContent = formatMoney(amount);
  });
  const discount = Number(document.querySelector("#invoiceDiscount")?.value || 0);
  const taxRate = Number(document.querySelector("#invoiceTax")?.value || 0);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * taxRate / 100;
  const total = taxable + tax;
  document.querySelector('[data-summary="subtotal"]').textContent = formatMoney(subtotal);
  document.querySelector('[data-summary="tax"]').textContent = formatMoney(tax);
  document.querySelector('[data-summary="total"]').textContent = formatMoney(total);
  document.querySelector('[data-preview="subtotal"]').textContent = formatMoney(subtotal);
  document.querySelector('[data-preview="tax"]').textContent = formatMoney(tax);
  document.querySelector('[data-preview="total"]').textContent = formatMoney(total);
  return { subtotal, tax, total };
}

function openInvoiceWorkspace() {
  roleWorkspace.innerHTML = invoiceTemplate();
  document.querySelector("#overview").hidden = false;
  document.querySelector("#programming").hidden = true;
  document.querySelector("#overview").classList.add("role-specific");
  const roleLabels = { ceo: "CEO", hoo: "Head of Operations", production: "Production", technical: "Technical", finance: "Finance", hr: "HR & People", admin: "Administrator", employee: "Employee" };
  document.querySelector("#currentUserRole").textContent = roleLabels[event.target.value];
  document.querySelector(".breadcrumbs strong").textContent = "Create Invoice";
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelector('.nav-item[href="#finance"]').classList.add("active");
  bindInvoiceActions();
  roleWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindInvoiceActions() {
  roleWorkspace.querySelectorAll("[data-invoice-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.invoiceAction;
      if (action === "open") openInvoiceWorkspace();
      if (action === "add-item") {
        const row = document.createElement("tr");
        row.innerHTML = '<td><input class="item-description" placeholder="Describe the service"></td><td><input class="item-qty" type="number" min="1" value="1"></td><td><input class="item-price" type="number" min="0" value="0"></td><td class="item-amount">$0</td><td><button class="remove-item" aria-label="Remove item">×</button></td>';
        document.querySelector("#invoiceItems").appendChild(row);
        updateInvoiceTotals();
        bindInvoiceActions();
      }
      if (action === "remove-file") {
        document.querySelector("#uploadedFile").hidden = true;
        document.querySelector("#invoiceFile").value = "";
      }
      if (action === "save") showToast("Draft saved successfully · INV-2026-001");
      if (action === "submit") document.querySelector('[data-overlay="confirm"]').hidden = false;
      if (action === "confirm-submit") {
        document.querySelector('[data-overlay="confirm"]').hidden = true;
        document.querySelector('[data-overlay="success"]').hidden = false;
      }
      if (action === "preview") {
        const rows = [...document.querySelectorAll("#invoiceItems tr")];
        document.querySelector("#previewItems").innerHTML = rows.map((row) => `<tr><td>${row.querySelector(".item-description")?.value || "Service"}</td><td>${row.querySelector(".item-qty")?.value || 0}</td><td>${formatMoney(row.querySelector(".item-price")?.value || 0)}</td><td>${row.querySelector(".item-amount")?.textContent || "$0"}</td></tr>`).join("");
        document.querySelector('[data-overlay="preview"]').hidden = false;
      }
      if (action === "close-modal") button.closest(".invoice-overlay").hidden = true;
      if (action === "print") showToast("Invoice preview ready to print");
      if (action === "queue" || action === "cancel") renderRoleWorkspace("finance");
      if (action === "view-invoice") {
        document.querySelector('[data-overlay="success"]').hidden = true;
        document.querySelector('[data-overlay="preview"]').hidden = false;
      }
    });
  });
  roleWorkspace.querySelectorAll(".item-qty, .item-price, #invoiceDiscount, #invoiceTax").forEach((input) => input.addEventListener("input", updateInvoiceTotals));
  roleWorkspace.querySelectorAll(".remove-item").forEach((button) => button.addEventListener("click", () => {
    button.closest("tr").remove();
    document.querySelector(".invoice-item-empty").hidden = document.querySelectorAll("#invoiceItems tr").length > 0;
    updateInvoiceTotals();
  }));
  document.querySelector("#invoiceFile")?.addEventListener("change", (event) => {
    if (event.target.files[0]) document.querySelector("#uploadedFile").hidden = false;
  });
  updateInvoiceTotals();
}

roleSelect.addEventListener("change", (event) => {
  const data = roleData[event.target.value];
  const currentUser = JSON.parse(localStorage.getItem("ctmsCurrentUser") || "null");
  const roleCopy = {
    ceo: "Here's an overview of Chinar TV's current operations.",
    hoo: "Here's today's operational overview.",
    production: "Here's your production overview for today.",
    technical: "Here's your technical resource overview.",
    finance: "Here's your financial overview.",
    hr: "Here's today's people and attendance overview.",
    admin: "Here's your system administration overview.",
    employee: "Here's what you need to take care of today."
  };
  title.textContent = `Good Morning, ${currentUser?.firstName || "Sarah"}`;
  copy.textContent = roleCopy[event.target.value] || data.copy;
  metricLabelIds.forEach((id, index) => {
    document.querySelector(`#${id}`).textContent = data.labels[index];
  });
  ["primaryPanelTitle", "secondaryPanelTitle", "tertiaryPanelTitle"].forEach((id, index) => {
    document.querySelector(`#${id}`).textContent = data.panels[index];
  });
  metricIds.forEach((id, index) => {
    const value = data.metrics[index];
    const suffix = event.target.value === "ceo"
      ? [ "", " hrs", "%", "k" ][index]
      : event.target.value === "finance" && index === 1
        ? ""
        : event.target.value === "employee" && index === 3
          ? ""
          : "";
    document.querySelector(`#${id}`).innerHTML = `${value}${suffix ? `<span class="metric-unit">${suffix}</span>` : ""}`;
  });
  document.querySelector("#overview").hidden = false;
  document.querySelector("#programming").hidden = true;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelector('.nav-item[href="#overview"]').classList.add("active");
  document.querySelector(".breadcrumbs strong").textContent = "Overview";
  updateNavigation(event.target.value);
  renderRoleWorkspace(event.target.value);
  showToast(`${roleSelect.options[roleSelect.selectedIndex].text} dashboard loaded`);
});

function updateNavigation(role) {
  const navigation = roleNavigation[role] || roleNavigation.employee;
  const primary = document.querySelector(".primary-nav");
  const secondary = document.querySelector(".secondary-nav");
  const ceoNav = document.querySelector("#ceoOnlyNav");
  const renderGroup = (group) => `<div class="workspace-label nav-section-label">${group[0]}</div>${group[1].map(([label, href]) => `<a class="nav-item${href === "overview" ? " active" : ""}" href="#${href}" data-view="${href === "programming" ? "programming" : ""}"><span class="nav-icon">${navIcon[label] || "•"}</span>${label}${label === "Notifications" ? '<span class="nav-count">7</span>' : ""}</a>`).join("")}`;
  primary.innerHTML = navigation.slice(0, 1).map(renderGroup).join("");
  secondary.innerHTML = navigation.slice(1).map(renderGroup).join("");
  ceoNav.classList.remove("is-visible");
  document.querySelectorAll(".nav-item").forEach((item) => item.hidden = false);
}

updateNavigation(roleSelect.value);
document.querySelector("#overview").classList.add("role-specific");
renderRoleWorkspace(roleSelect.value);

roleWorkspace.addEventListener("click", (event) => {
  const action = event.target.closest("[data-invoice-action]")?.dataset.invoiceAction;
  if (action === "open" && !roleWorkspace.querySelector(".invoice-page")) openInvoiceWorkspace();
});

document.querySelector("#newAction").addEventListener("click", () => showToast("Action centre is ready"));
document.querySelector(".notification-button").addEventListener("click", () => {
  let panel = document.querySelector("#notificationPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "notificationPanel";
    panel.className = "notification-panel";
    panel.innerHTML = `<div><strong>Notifications</strong><button aria-label="Close notifications">×</button></div><p><b>3 projects are delayed.</b><small>Executive attention required</small></p><p><b>Invoice INV-2026-003 is overdue.</b><small>Finance · 12 days ago</small></p><p><b>OB Van CHN-OB-003 requires maintenance.</b><small>Technical · Today</small></p><p><b>Monthly revenue increased by 12%.</b><small>Finance · Today</small></p>`;
    document.querySelector(".topbar").appendChild(panel);
    panel.querySelector("button").addEventListener("click", () => panel.remove());
  } else panel.remove();
});
document.querySelector(".topbar-actions .avatar").addEventListener("click", () => showToast("Ahmad Khan · CEO · Profile menu"));
document.querySelector("#logoutButton").addEventListener("click", () => {
  localStorage.removeItem("ctmsCurrentUser");
  localStorage.removeItem("ctmsRememberedUser");
  appShell.classList.remove("is-visible");
  authScreen.classList.remove("is-hidden");
  window.location.hash = "login";
  loginForm.reset();
  showToast("You have been logged out");
});
document.querySelector("#openSidebar").addEventListener("click", () => document.querySelector("#sidebar").classList.add("open"));
document.querySelector("#closeSidebar").addEventListener("click", () => document.querySelector("#sidebar").classList.remove("open"));
document.querySelector(".sidebar").addEventListener("click", (event) => {
  const item = event.target.closest(".nav-item");
  if (!item) return;
  document.querySelectorAll(".nav-item").forEach((navItem) => navItem.classList.remove("active"));
  item.classList.add("active");
  const view = item.dataset.view;
  document.querySelector("#overview").hidden = Boolean(view);
  document.querySelector("#programming").hidden = view !== "programming";
  document.querySelector(".breadcrumbs strong").textContent = view === "programming" ? "Programming" : item.textContent.trim();
  document.querySelector("#sidebar").classList.remove("open");
});

document.querySelector("#newProgramme").addEventListener("click", () => showToast("New programme form is ready"));
document.querySelectorAll(".filter-button").forEach((filter) => filter.addEventListener("click", () => {
  document.querySelectorAll(".filter-button").forEach((button) => button.classList.remove("active"));
  filter.classList.add("active");
  showToast(`${filter.textContent} filter applied`);
}));
