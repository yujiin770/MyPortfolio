document.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const currentUser = sessionStorage.getItem('currentUser');

    if (!rememberedUser && !currentUser) {
        window.location.href = "index.html"; // Redirect to login page if not logged in
    } 
});
window.addEventListener('beforeunload', function() {
    localStorage.removeItem('rememberedUser'); // Clear remembered user from localStorage when the browser is closed or page is reloaded
});

const exportBtn = document.getElementById("exportBtn");
exportBtn.disabled = true; // Disable by default
document.getElementById("generateReportBtn").addEventListener("click", function () {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    exportBtn.disabled = false;

    function parseDate(dateStr) {
        return new Date(dateStr); // Assumes YYYY-MM-DD format
    }

    function normalizeDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    if (startDate && endDate) {
        const startd = normalizeDate(new Date(startDate));
        const endd = normalizeDate(new Date(endDate));

        // === Other Health Issues ===
        const otherIssueCell = document.getElementById("otherissue");
        const otherCountsStr = localStorage.getItem("otherCounts");
        const otherCounts = otherCountsStr ? JSON.parse(otherCountsStr) : {};

        const otherIssueMap = {};

        for (let dateStr in otherCounts) {
            const parsed = normalizeDate(parseDate(dateStr));
            if (parsed >= startd && parsed <= endd) {
                const dayData = otherCounts[dateStr];
                for (let issue in dayData) {
                    otherIssueMap[issue] = (otherIssueMap[issue] || 0) + dayData[issue];
                }
            }
        }

        const otherIssueText = Object.keys(otherIssueMap).length > 0
            ? Object.entries(otherIssueMap)
                .map(([issue, count]) => `<div>${issue} (${count})</div>`)
                .join("")
            : `<div>No custom health issues recorded.</div>`;

        otherIssueCell.innerHTML = otherIssueText;


        // Total Visits
        const totalVisitsCell = document.getElementById("totalVisitsCell");
        const visitDataStr = localStorage.getItem("visitStats");
        const visitData = visitDataStr ? JSON.parse(visitDataStr) : {};
        let totalVisits = 0;

        for (let date in visitData) {
            const parsed = normalizeDate(parseDate(date));
            if (parsed >= startd && parsed <= endd) {
                totalVisits += visitData[date];
            }
        }
        totalVisitsCell.textContent = totalVisits;

        // User Type
        const userTypeCell = document.getElementById("userTypeCell");
        const dailyCountStr = localStorage.getItem("dailyCount");
        const dailyCount = dailyCountStr ? JSON.parse(dailyCountStr) : {};

        let studentCount = 0;
        let staffCount = 0;
        let othersCount = 0;

        for (let dateStr in dailyCount) {
            const parsed = normalizeDate(parseDate(dateStr));
            if (parsed >= startd && parsed <= endd) {
                const dayData = dailyCount[dateStr];
                studentCount += dayData.student || 0;
                staffCount += dayData.staff || 0;
                othersCount += dayData.others || 0;
            }
        }

        let userTypeText = [];
        if (studentCount > 0) userTypeText.push(`Student (${studentCount})`);
        if (staffCount > 0) userTypeText.push(`Staff (${staffCount})`);
        if (othersCount > 0) userTypeText.push(`Others (${othersCount})`);

        userTypeCell.innerHTML = userTypeText.length
        ? userTypeText.map(item => `<div>${item}</div>`).join("")
        : `<div>No role recorded.</div>`;

        // Common Reason
        const commonReasonCell = document.getElementById("commonReasonCell");
        const reasonCountsStr = localStorage.getItem("reasonCounts");
        const reasonCounts = reasonCountsStr ? JSON.parse(reasonCountsStr) : {};

        const reasonsList = {
            "Headache": 0,
            "Stomachache": 0,
            "Dizziness": 0,
            "Fever": 0,
            "Cough": 0,
            "Colds": 0,
            "sorethroat": 0,
            "Toothache": 0,
            "Menstrualcramps": 0,
            "Minorcutorwound": 0,
            "MusclepainBodypain": 0,
            "Sprainorminorinjury": 0,
            "Skinrashorirritation": 0,
            "Allergicreactionmild": 0,
            "Followupcheck": 0,
            "Medicationrequest": 0,
            "Nauseaorvomiting": 0,
            "Eyeirritation": 0,
            "Earpain": 0
        };

        for (let dateStr in reasonCounts) {
            const parsed = normalizeDate(parseDate(dateStr));
            if (parsed >= startd && parsed <= endd) {
                const dayData = reasonCounts[dateStr];
                for (let reason in reasonsList) {
                    if (dayData[reason]) {
                        reasonsList[reason] += dayData[reason];
                    }
                }
            }
        }

        const reasonText = [];
        for (let reason in reasonsList) {
            if (reasonsList[reason] > 0) {
                reasonText.push(`${reason} (${reasonsList[reason]})`);
            }
        }

        commonReasonCell.innerHTML = reasonText.length > 0
            ? reasonText.map(item => `<div>${item}</div>`).join("")
            : `<div>No reasons recorded.</div>`;

        // Peak Hours
        const peakHoursCell = document.getElementById("peakHoursCell");
        const hourlyCountsStr = localStorage.getItem("hourlyCounts");
        const hourlyCounts = hourlyCountsStr ? JSON.parse(hourlyCountsStr) : {};

        const hours = {
            "6am": 0, "7am": 0, "8am": 0, "9am": 0, "10am": 0, "11am": 0,
            "12pm": 0, "1pm": 0, "2pm": 0, "3pm": 0, "4pm": 0, "5pm": 0,
            "6pm": 0, "7pm": 0, "8pm": 0, "9pm": 0, "10pm": 0, "11pm": 0,
            "12am": 0, "1am": 0, "2am": 0, "3am": 0, "4am": 0, "5am": 0
        };

        for (let dateStr in hourlyCounts) {
            const parsed = normalizeDate(parseDate(dateStr));
            if (parsed >= startd && parsed <= endd) {
                const dayData = hourlyCounts[dateStr];
                for (let hour in hours) {
                    hours[hour] += dayData[hour] || 0;
                }
            }
        }

        let peakHour = "";
        let maxCount = 0;
        for (let hour in hours) {
            if (hours[hour] > maxCount) {
                maxCount = hours[hour];
                peakHour = hour;
            }
        }

        peakHoursCell.innerHTML = maxCount > 0
            ? `<div>${peakHour} </div>`
            : `<div>No peak hour recorded.</div>`;
    }
});

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const generateReportBtn = document.getElementById("generateReportBtn");

// Function to check if both dates are filled
function toggleGenerateButton() {
    if (startDateInput.value && endDateInput.value) {
        generateReportBtn.disabled = false;
    } else {
        generateReportBtn.disabled = true;
    }
}

// Initial check when the page loads
toggleGenerateButton();

// Add event listeners to the date inputs
startDateInput.addEventListener("input", toggleGenerateButton);
endDateInput.addEventListener("input", toggleGenerateButton);
// Converts "4/20/2025" or "2025-04-20" → Date object
function parseDate(dateStr) {
    if (dateStr.includes('/')) {
        // Format: MM/DD/YYYY
        const [month, day, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    } else if (dateStr.includes('-')) {
        // Format: YYYY-MM-DD (or ISO string)
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    } else {
        // Unknown format, fallback
        return new Date(dateStr);
    }
}

document.addEventListener("DOMContentLoaded", function () {
const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    // Log whether elements were found
    console.log("[Reports Logout Check] logoutBtn element:", logoutBtn);
    console.log("[Reports Logout Check] logoutModal element:", logoutModal);
    console.log("[Reports Logout Check] confirmLogout element:", confirmLogout);
    console.log("[Reports Logout Check] cancelLogout element:", cancelLogout);

    if (logoutBtn && logoutModal && confirmLogout && cancelLogout) {
        console.log("[Reports Logout Setup] All logout elements found. Adding listeners.");

        logoutBtn.addEventListener("click", function(e) {
            console.log("[Reports Logout Action] logoutBtn clicked!");
            e.preventDefault();
            console.log("[Reports Logout Action] Modal display style BEFORE change:", logoutModal.style.display);
            logoutModal.style.display = "flex";
            console.log("[Reports Logout Action] Modal display style AFTER change:", logoutModal.style.display);
        });

        confirmLogout.addEventListener("click", function() {
            console.log("[Reports Logout Action] Confirm button clicked.");

            // ***** START: RECORD LOGOUT TIME *****
            const activeSessionId = sessionStorage.getItem('activeLoginSessionId');
            if (activeSessionId) {
                try {
                    let userLogs = JSON.parse(localStorage.getItem("userLogs")) || [];
                    const now = new Date();
                    const logoutTimestamp = now.toLocaleString();

                    const logIndex = userLogs.findIndex(log => log.sessionId === activeSessionId && log.logoutTime === null);

                    if (logIndex !== -1) {
                        userLogs[logIndex].logoutTime = logoutTimestamp;
                        localStorage.setItem("userLogs", JSON.stringify(userLogs));
                        console.log("[reports.js] Logout time recorded for session:", activeSessionId);
                    } else {
                        console.warn("[reports.js] Could not find active session log (sessionId:", activeSessionId, "and logoutTime: null) to record logout. Creating orphan entry.");
                        const displayName = localStorage.getItem("displayName") || sessionStorage.getItem("currentUser") || "Unknown User (Logout Only)";
                        userLogs.push({
                            sessionId: `logout_orphan_${Date.now()}`,
                            name: displayName,
                            loginTime: null,
                            logoutTime: logoutTimestamp
                        });
                        localStorage.setItem("userLogs", JSON.stringify(userLogs));
                    }
                } catch (error) {
                    console.error("[reports.js] Error updating logout time in userLogs:", error);
                }
            } else {
                console.warn("[reports.js] No activeLoginSessionId found in sessionStorage. Cannot record specific logout time.");
            }
            // ***** END: RECORD LOGOUT TIME *****

            localStorage.removeItem("rememberedUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem('activeLoginSessionId'); // Clear the active session ID
            window.location.href = "../Html/index.html"; // Ensure correct path
        });

        cancelLogout.addEventListener("click", function() {
            console.log("[Reports Logout Action] Cancel button clicked.");
            logoutModal.style.display = "none";
        });
    } else {
        console.warn("[Reports Logout Setup] FAILED: One or more logout modal elements NOT found. Listeners not attached.");
        if (!logoutBtn) console.warn(" - #logoutBtn missing");
        if (!logoutModal) console.warn(" - #logoutModal missing");
        if (!confirmLogout) console.warn(" - #confirmLogout missing");
        if (!cancelLogout) console.warn(" - #cancelLogout missing");
    }
});
  document.addEventListener("DOMContentLoaded", () => {
    const exportBtn = document.getElementById("exportBtn");

    if (exportBtn) { // Check if the button exists
        exportBtn.addEventListener("click", () => {
            exportReportToPDF();
        });
    }

    function exportReportToPDF() {
        // Select the values from your page
        const totalVisits = document.getElementById("totalVisitsCell").textContent;
        const userTypesHTML = document.getElementById("userTypeCell").innerHTML; // Get innerHTML to preserve <div>s
        const commonReasonsHTML = document.getElementById("commonReasonCell").innerHTML; // Get innerHTML
        const otherIssuesHTML = document.getElementById("otherissue").innerHTML; // Get innerHTML for other issues
        const peakHours = document.getElementById("peakHoursCell").textContent;

        // Get the selected date range
        const startDateValue = document.getElementById("start-date").value;
        const endDateValue = document.getElementById("end-date").value;
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }; // Added timeZone: 'UTC' for consistency

        let formattedStartDate = "N/A";
        if (startDateValue) {
            const startDateObj = new Date(startDateValue + 'T00:00:00Z'); // Treat as UTC to avoid timezone shifts
            if (!isNaN(startDateObj.getTime())) {
                formattedStartDate = startDateObj.toLocaleDateString('en-US', dateOptions);
            }
        }

        let formattedEndDate = "N/A";
        if (endDateValue) {
            const endDateObj = new Date(endDateValue + 'T00:00:00Z'); // Treat as UTC
            if (!isNaN(endDateObj.getTime())) {
                formattedEndDate = endDateObj.toLocaleDateString('en-US', dateOptions);
            }
        }
        const dateRangeText = `Date Range: ${formattedStartDate} - ${formattedEndDate}`;

        // Get the Print Date (current date)
        const today = new Date();
        const formattedPrintDate = today.toLocaleDateString('en-US', dateOptions); // Used dateOptions for consistency

        // Create a new element to format the content
        const content = document.createElement("div");
        content.innerHTML = `
        <style>
            body { font-family: Arial, sans-serif; } /* Basic font for PDF */
            table, th, td {
                border: 1px solid #000;
                border-collapse: collapse;
                box-sizing: border-box;
                font-size: 10px; /* Smaller font for table content */
            }
            th, td {
                padding: 6px; /* Slightly reduced padding */
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .header-dates {
                display: flex;
                justify-content: space-between;
                font-size: 11px; /* Slightly smaller for header dates */
                margin-bottom: 10px;
            }
            .header-dates .date-range {
                text-align: left;
            }
            .header-dates .print-date {
                text-align: right;
            }
            .report-title {
                text-align: center;
                margin-bottom: 15px;
                font-size: 16px; /* Title font size */
            }
            /* Style for the multi-line content within cells */
            td div { 
                margin-bottom: 3px; /* Add a little space between lines */
            }
            td div:last-child {
                margin-bottom: 0; /* No margin for the last line in a cell */
            }
        </style>
        <div class="header-dates">
            <div class="date-range">${dateRangeText}</div>
            <div class="print-date">Print Date: ${formattedPrintDate}</div>
        </div>
        <div class="report-title">
            <h2>School Clinic Visit Report</h2>
        </div>

        <table style="width: 100%;">
            <thead>
                <tr>
                    <th style="width: 25%;">Category</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Visits</td>
                    <td>${totalVisits}</td>
                </tr>
                <tr>
                    <td>Role Types</td>
                    <td>${userTypesHTML}</td>
                </tr>
                <tr>
                    <td>Common Reasons For Visit</td>
                    <td>${commonReasonsHTML}</td>
                </tr>
                <tr>
                    <td>Other Health Issues</td>
                    <td>${otherIssuesHTML}</td>
                </tr>
                <tr>
                    <td>Peak Hours</td>
                    <td>${peakHours}</td>
                </tr>
            </tbody>
        </table>
    `;


        // Use html2pdf to generate and download PDF
        html2pdf()
            .from(content)
            .set({
                margin: [10, 10, 10, 10], // top, right, bottom, left margins
                filename: 'Clinic_Report.pdf',
                html2canvas: { scale: 2, useCORS: true }, // Added useCORS
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            })
            .save();
    }
});

