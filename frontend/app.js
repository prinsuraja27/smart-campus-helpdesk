// Student page JavaScript
const API_BASE = "https://smart-campus-helpdesk.onrender.com";

const requestForm = document.getElementById("requestForm");
const submitResult = document.getElementById("submitResult");
const trackBtn = document.getElementById("trackBtn");
const trackResult = document.getElementById("trackResult");

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
        showBox(submitResult, "Backend is not running or API URL is wrong.", "error");
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
        showBox(trackResult, "Backend is not running or API URL is wrong.", "error");
    }
});
