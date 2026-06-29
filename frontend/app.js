const API_BASE = "https://smart-campus-helpdesk.onrender.com";

const requestForm = document.getElementById("requestForm");
const submitResult = document.getElementById("submitResult");
const trackBtn = document.getElementById("trackBtn");
const trackResult = document.getElementById("trackResult");
const loadAdminBtn = document.getElementById("loadAdminBtn");
const stats = document.getElementById("stats");
const requestTable = document.getElementById("requestTable");

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

requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        student_name: document.getElementById("student_name").value.trim(),
        enrollment: document.getElementById("enrollment").value.trim(),
        department: document.getElementById("department").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        request_type: document.getElementById("request_type").value,
        message: document.getElementById("message").value.trim(),
    };

    try {
        const response = await fetch(`${API_BASE}/api/requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await safeJson(response);

        if (!response.ok) {
            showBox(submitResult, `<b>Error:</b> ${data.detail || "Request failed"}`, "error");
            return;
        }

        showBox(
            submitResult,
            `<b>Request submitted successfully!</b><br>Your Request ID is: <b>${data.request_id}</b><br>Save this ID to track status.`,
            "success"
        );
        requestForm.reset();
    } catch (error) {
        showBox(submitResult, "Backend is not running. Start FastAPI server first.", "error");
    }
});

trackBtn.addEventListener("click", async () => {
    const requestId = document.getElementById("trackId").value.trim();
    if (!requestId) {
        showBox(trackResult, "Please enter a request ID.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/track/${requestId}`);
        const data = await safeJson(response);

        if (!response.ok) {
            showBox(trackResult, `<b>Error:</b> ${data.detail || "Request not found"}`, "error");
            return;
        }

        showBox(
            trackResult,
            `<b>Status:</b> ${data.status}<br><b>Student:</b> ${data.student_name}<br><b>Type:</b> ${data.request_type}`,
            "success"
        );
    } catch (error) {
        showBox(trackResult, "Backend is not running. Start FastAPI server first.", "error");
    }
});

function getAdminKey() {
    return document.getElementById("adminKey").value.trim();
}

async function loadAdmin() {
    const key = getAdminKey();
    if (!key) {
        alert("Enter admin key first.");
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
            alert(dashboard.detail || requestData.detail || "Admin request failed");
            return;
        }

        renderStats(dashboard);
        renderTable(requestData.requests || {});
    } catch (error) {
        alert("Backend is not running. Start FastAPI server first.");
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
    const rows = Object.values(requests).map((item) => `
        <tr>
            <td><b>${item.request_id}</b></td>
            <td class="detail-cell">
                <b>${item.student_name}</b><br>
                Enrollment: ${item.enrollment}<br>
                Department: ${item.department}<br>
                Phone: ${item.phone}
            </td>
            <td class="detail-cell">
                <b>${item.request_type}</b><br>
                Submitted: ${item.created_at || "Not available"}
            </td>
            <td class="problem-message">${item.message}</td>
            <td><span class="status">${item.status}</span></td>
            <td>
                <div class="action-row">
                    <button class="small-btn" onclick="updateStatus('${item.request_id}', 'in_progress')">Progress</button>
                    <button class="small-btn" onclick="updateStatus('${item.request_id}', 'solved')">Solved</button>
                    <button class="small-btn danger" onclick="deleteRequest('${item.request_id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");

    requestTable.innerHTML = rows || `<tr><td colspan="6">No requests found</td></tr>`;
}

async function updateStatus(requestId, status) {
    const key = getAdminKey();
    if (!key) {
        alert("Enter admin key first.");
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
        alert(data.detail || "Status update failed");
        return;
    }

    await loadAdmin();
}

async function deleteRequest(requestId) {
    const key = getAdminKey();
    if (!key) {
        alert("Enter admin key first.");
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
        alert(data.detail || "Delete failed");
        return;
    }

    await loadAdmin();
}

loadAdminBtn.addEventListener("click", loadAdmin);
