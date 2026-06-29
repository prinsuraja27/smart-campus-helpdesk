// Admin page JavaScript
const API_BASE = "https://smart-campus-helpdesk.onrender.com";

const loadAdminBtn = document.getElementById("loadAdminBtn");
const adminResult = document.getElementById("adminResult");
const adminDashboard = document.getElementById("adminDashboard");
const stats = document.getElementById("stats");
const requestTable = document.getElementById("requestTable");
const detailPanel = document.getElementById("detailPanel");
const detailContent = document.getElementById("detailContent");
let latestRequests = {};

function showBox(element, message, type = "success") {
    element.className = `result-box show ${type}`;
    element.innerHTML = message;
}

async function safeJson(response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { detail: text || "Unknown response" };
    }
}

function getAdminKey() {
    return document.getElementById("adminKey").value.trim();
}

async function loadAdmin() {
    const key = getAdminKey();
    if (!key) {
        showBox(adminResult, "Enter admin key first.", "error");
        return;
    }

    try {
        const [dashboardRes, requestsRes] = await Promise.all([
            fetch(`${API_BASE}/api/admin/dashboard`, { headers: { "x-admin-key": key } }),
            fetch(`${API_BASE}/api/admin/requests`, { headers: { "x-admin-key": key } }),
        ]);

        const dashboard = await safeJson(dashboardRes);
        const requestData = await safeJson(requestsRes);

        if (!dashboardRes.ok || !requestsRes.ok) {
            showBox(adminResult, dashboard.detail || requestData.detail || "Admin request failed", "error");
            return;
        }

        showBox(adminResult, "Admin login successful. Student request details loaded.", "success");
        adminDashboard.classList.remove("hidden");
        renderStats(dashboard);
        renderTable(requestData.requests || {});
    } catch (error) {
        showBox(adminResult, "Backend is not running or API URL is wrong.", "error");
    }
}

function renderStats(data) {
    stats.innerHTML = `
        <div class="stat-card">Total<strong>${data.total_requests}</strong></div>
        <div class="stat-card">Pending<strong>${data.pending}</strong></div>
        <div class="stat-card">In Progress<strong>${data.in_progress}</strong></div>
        <div class="stat-card">Solved<strong>${data.solved}</strong></div>
    `;
}

function renderTable(requests) {
    latestRequests = requests;

    const rows = Object.values(requests).map((item) => `
        <tr>
            <td><b>${item.request_id || "Not available"}</b></td>
            <td>${item.student_name || "Not available"}</td>
            <td>${item.enrollment || "Not available"}</td>
            <td>${item.department || "Not available"}</td>
            <td>${item.phone || "Not available"}</td>
            <td>${item.request_type || "Not available"}</td>
            <td class="problem-message">${item.message || "No message"}</td>
            <td><span class="status">${item.status || "pending"}</span></td>
            <td>
                <div class="action-row">
                    <button class="small-btn view" onclick="viewDetails('${item.request_id}')">View</button>
                    <button class="small-btn" onclick="updateStatus('${item.request_id}', 'in_progress')">Progress</button>
                    <button class="small-btn" onclick="updateStatus('${item.request_id}', 'solved')">Solved</button>
                    <button class="small-btn danger" onclick="deleteRequest('${item.request_id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");

    requestTable.innerHTML = rows || `<tr><td colspan="9">No requests found</td></tr>`;
}

function viewDetails(requestId) {
    const item = latestRequests[requestId];
    if (!item) {
        alert("Request details not found. Load dashboard again.");
        return;
    }

    detailPanel.classList.remove("hidden");
    detailContent.innerHTML = `
        <div class="detail-grid">
            <div><b>Request ID</b><span>${item.request_id || requestId}</span></div>
            <div><b>Student Name</b><span>${item.student_name || "Not available"}</span></div>
            <div><b>Enrollment Number</b><span>${item.enrollment || "Not available"}</span></div>
            <div><b>Department</b><span>${item.department || "Not available"}</span></div>
            <div><b>Phone Number</b><span>${item.phone || "Not available"}</span></div>
            <div><b>Request Type</b><span>${item.request_type || "Not available"}</span></div>
            <div><b>Status</b><span>${item.status || "pending"}</span></div>
            <div><b>Submitted Time</b><span>${item.created_at || "Not available"}</span></div>
        </div>
        <div class="message-box">
            <b>Student Problem / Message</b>
            <p>${item.message || "No message available"}</p>
        </div>
    `;

    detailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function updateStatus(requestId, status) {
    const key = getAdminKey();
    if (!key) {
        showBox(adminResult, "Enter admin key first.", "error");
        return;
    }

    const response = await fetch(`${API_BASE}/api/admin/requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "x-admin-key": key,
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        const data = await safeJson(response);
        showBox(adminResult, data.detail || "Status update failed", "error");
        return;
    }

    await loadAdmin();
}

async function deleteRequest(requestId) {
    const key = getAdminKey();
    if (!key) {
        showBox(adminResult, "Enter admin key first.", "error");
        return;
    }

    if (!confirm("Delete this request?")) {
        return;
    }

    const response = await fetch(`${API_BASE}/api/admin/requests/${requestId}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
    });

    if (!response.ok) {
        const data = await safeJson(response);
        showBox(adminResult, data.detail || "Delete failed", "error");
        return;
    }

    await loadAdmin();
}

loadAdminBtn.addEventListener("click", loadAdmin);
