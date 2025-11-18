// ../Js/dashboard.js

// --- UTILITY FUNCTIONS ---
function getLocalDateString() { // Returns YYYY-MM-DD
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
}

function formatDateMMDDYYYY(dateInput) { // Returns MM-DD-YYYY
    const parsedDate = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(parsedDate.getTime())) {
        console.error("Invalid date provided to formatDateMMDDYYYY:", dateInput);
        return "Invalid Date";
    }
    const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(parsedDate.getDate()).padStart(2, '0');
    const yyyy = parsedDate.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
}

function getWeekNumber(dateStr) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - dayOfWeek + 3);
    const firstThursday = new Date(date.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);
    return 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000) / 7);
}


// --- CHART INSTANCE ---
let visitChartInstance = null;

// --- CORE DASHBOARD DATA PROCESSING AND RENDERING FUNCTION ---
function refreshDashboardDisplayData() {
    console.log("Refreshing dashboard display data for date:", getLocalDateString());

    // --- MOVE THESE DEFINITIONS TO THE TOP ---
    const today_YYYYMMDD = getLocalDateString();
    const currentDateObj = new Date(today_YYYYMMDD);
    const currentWeekNum = getWeekNumber(today_YYYYMMDD);
    const currentYearNum = currentDateObj.getFullYear();
    // ----------------------------------------

    // 1. Welcome Message (Uses displayName from localStorage or a generic fallback)
    const welcomeMessage = document.getElementById("welcomeMessage");
    const displayName = localStorage.getItem("displayName"); // Check for the specific display name
    if (welcomeMessage) {
        if (displayName) {
            // Use the stored displayName if it exists
            welcomeMessage.textContent = `Welcome, ${displayName}!`;
        } else {
            // Generic fallback if displayName is not set in localStorage
            welcomeMessage.textContent = `Welcome, User!`; // Or just "Welcome!"
        }
    }

    // 2. Week Change Logic
    let totalWeekData = JSON.parse(localStorage.getItem("totalweek"));
    if (!totalWeekData || typeof totalWeekData.year === 'undefined') {
        // Now currentWeekNum and currentYearNum are defined when needed here
        totalWeekData = { week: currentWeekNum, year: currentYearNum };
        localStorage.setItem("totalweek", JSON.stringify(totalWeekData));
        localStorage.setItem("weeklyVisit", JSON.stringify({ monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }));
        localStorage.removeItem("weeklyVisitCounted");
    }

    const previousWeekStored = totalWeekData.week;
    const previousYearStored = totalWeekData.year;

    if (currentWeekNum !== previousWeekStored || currentYearNum !== previousYearStored) {
        console.log(`New week/year detected. Old: W${previousWeekStored}/${previousYearStored}, New: W${currentWeekNum}/${currentYearNum}`);
        const previousWeeklyVisitData = JSON.parse(localStorage.getItem("weeklyVisit")) || {};
        const totalPreviousWeekVisits = Object.values(previousWeeklyVisitData).reduce((sum, val) => sum + Number(val), 0);

        if (previousWeekStored !== null && previousYearStored !== null) {
            const yearToLogFor = previousYearStored;
            const yearLogKey = `weeklyTotals_${yearToLogFor}`;
            const weeklyLog = JSON.parse(localStorage.getItem(yearLogKey)) || {};
            weeklyLog[`Week ${previousWeekStored}`] = totalPreviousWeekVisits;
            localStorage.setItem(yearLogKey, JSON.stringify(weeklyLog));
            console.log(`Logged ${totalPreviousWeekVisits} visits for Week ${previousWeekStored} of ${yearToLogFor}`);
        }

        localStorage.setItem("weeklyVisit", JSON.stringify({ monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }));
        localStorage.removeItem("weeklyVisitCounted");
        localStorage.setItem("totalweek", JSON.stringify({ week: currentWeekNum, year: currentYearNum }));

        const weeklyTotalElement = document.getElementById("weeklyTotalCount");
        if (weeklyTotalElement) {
            weeklyTotalElement.textContent = "0";
        }
    }

    // 3. Process Transactions
    const transactions = JSON.parse(localStorage.getItem("manageRecords")) || [];
    let weeklyVisitDataForCurrentWeek = JSON.parse(localStorage.getItem("weeklyVisit")) || { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 };
    const tempWeeklyData = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 };
    const countedForWeeklyThisRefresh = new Set();
    let dailyVisitsTodayCount = 0;

    transactions.forEach(t => {
        if (t.timeOut) {
            const transactionDateObj = new Date(t.date); // Can define this here locally if only needed here
            // today_YYYYMMDD, currentWeekNum, currentYearNum are already defined above
            if (t.date === today_YYYYMMDD) {
                dailyVisitsTodayCount++;
            }
            if (getWeekNumber(t.date) === currentWeekNum && transactionDateObj.getFullYear() === currentYearNum) {
                const transactionKey = `${t.name}_${t.date}_${t.timeIn}_${t.timeOut}`;
                if (!countedForWeeklyThisRefresh.has(transactionKey)) {
                    const dayIndex = (transactionDateObj.getDay() + 6) % 7;
                    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const dayName = dayNames[dayIndex];
                    tempWeeklyData[dayName] = (tempWeeklyData[dayName] || 0) + 1;
                    countedForWeeklyThisRefresh.add(transactionKey);
                }
            }
        }
    });
    localStorage.setItem("weeklyVisit", JSON.stringify(tempWeeklyData));
    weeklyVisitDataForCurrentWeek = tempWeeklyData;

    // 4. Update "Total Visits Today" display
    const totalVisitsTodayElement = document.getElementById("totalVisitsToday");
    if (totalVisitsTodayElement) {
        totalVisitsTodayElement.textContent = dailyVisitsTodayCount;
    }

    // 5. Generate/Update Bar Chart
    generateVisitBarChart(weeklyVisitDataForCurrentWeek);

    // 6. Update Recent Feed
    // today_YYYYMMDD is already defined above
    updateRecentFeed(today_YYYYMMDD);
}


function generateVisitBarChart(dataForChart) {
    const weeklyVisitStats = dataForChart || JSON.parse(localStorage.getItem("weeklyVisit")) || {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
        friday: 0, saturday: 0, sunday: 0
    };
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const orderedKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeklyVisitsDataValues = orderedKeys.map(day => weeklyVisitStats[day] || 0);
    const totalWeekVisits = weeklyVisitsDataValues.reduce((sum, count) => sum + count, 0);
    const weeklyTotalElement = document.getElementById("weeklyTotalCount");
    if (weeklyTotalElement) {
        weeklyTotalElement.textContent = totalWeekVisits;
    }
    const ctx = document.getElementById('visitBarChart')?.getContext('2d');
    if (!ctx) return;
    if (visitChartInstance) {
        visitChartInstance.destroy();
    }
    visitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: daysOfWeek,
            datasets: [{
                label: 'Visits Per Day This Week',
                data: weeklyVisitsDataValues,
                backgroundColor: 'rgba(100, 7, 18, 0.7)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, callback: value => Number.isInteger(value) ? value : null },
                    title: { display: true, text: 'Number of Visits' }
                },
                x: { title: { display: true, text: 'Day of the Week' } }
            },
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

function updateRecentFeed(today_YYYYMMDD_str) {
    const recentFeedList = document.querySelector('.recent-feed ul');
    if (!recentFeedList) return;
    recentFeedList.innerHTML = "";
    const transactions = JSON.parse(localStorage.getItem("manageRecords")) || [];
    const todaysCompletedTransactions = transactions.filter(t => t.date === today_YYYYMMDD_str && t.timeOut);
    if (todaysCompletedTransactions.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No Recent Visits Today.";
        recentFeedList.appendChild(li);
        return;
    }
    const sortedTransactions = todaysCompletedTransactions.sort((a, b) => {
        const timeA = a.timeIn ? new Date(`${a.date}T${a.timeIn.match(/\d{1,2}:\d{2}/) ? a.timeIn.replace(/(\d{1,2}:\d{2})\s*(AM|PM)?/i, (match, time, meridiem) => {
            if (meridiem) {
                let [hours, minutes] = time.split(':');
                hours = parseInt(hours);
                if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
                return `${String(hours).padStart(2, '0')}:${minutes}`;
            }
            return time;
        }) : '00:00'}`).getTime() : 0;
        const timeB = b.timeIn ? new Date(`${b.date}T${b.timeIn.match(/\d{1,2}:\d{2}/) ? b.timeIn.replace(/(\d{1,2}:\d{2})\s*(AM|PM)?/i, (match, time, meridiem) => {
             if (meridiem) {
                let [hours, minutes] = time.split(':');
                hours = parseInt(hours);
                if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
                return `${String(hours).padStart(2, '0')}:${minutes}`;
            }
            return time;
        }) : '00:00'}`).getTime() : 0;
        return timeB - timeA;
    });
    sortedTransactions.slice(0, 3).forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${t.name || 'Unknown'}</strong> (${t.role || 'N/A'}) visited on
            <em>${formatDateMMDDYYYY(new Date(t.date))}</em> –
            <span style="color: green;">${t.actions || 'No actions recorded'}</span>
        `;
        recentFeedList.appendChild(li);
    });
}

function initLogoutModal() {   

       const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    // Log whether elements were found
    console.log("[ManageRecord Logout Check] logoutBtn element:", logoutBtn);
    console.log("[ManageRecord Logout Check] logoutModal element:", logoutModal);
    console.log("[ManageRecord Logout Check] confirmLogout element:", confirmLogout);
    console.log("[ManageRecord Logout Check] cancelLogout element:", cancelLogout);

    if (logoutBtn && logoutModal && confirmLogout && cancelLogout) {
        console.log("[ManageRecord Logout Setup] All logout elements found. Adding listeners.");

        logoutBtn.addEventListener("click", function(e) {
            console.log("[ManageRecord Logout Action] logoutBtn clicked!");
            e.preventDefault();
            console.log("[ManageRecord Logout Action] Modal display style BEFORE change:", logoutModal.style.display);
            logoutModal.style.display = "flex";
            console.log("[ManageRecord Logout Action] Modal display style AFTER change:", logoutModal.style.display);
        });

        confirmLogout.addEventListener("click", function() {
            console.log("[ManageRecord Logout Action] Confirm button clicked.");

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
                        console.log("[managerecord.js] Logout time recorded for session:", activeSessionId);
                    } else {
                        console.warn("[managerecord.js] Could not find active session log (sessionId:", activeSessionId, "and logoutTime: null) to record logout. Creating orphan entry.");
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
                    console.error("[managerecord.js] Error updating logout time in userLogs:", error);
                }
            } else {
                console.warn("[managerecord.js] No activeLoginSessionId found in sessionStorage. Cannot record specific logout time.");
            }
            // ***** END: RECORD LOGOUT TIME *****

            localStorage.removeItem("rememberedUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem('activeLoginSessionId'); // Clear the active session ID
            window.location.href = "../Html/index.html"; // Ensure correct path
        });

        cancelLogout.addEventListener("click", function() {
            console.log("[ManageRecord Logout Action] Cancel button clicked.");
            logoutModal.style.display = "none";
        });
    } else {
        console.warn("[ManageRecord Logout Setup] FAILED: One or more logout modal elements NOT found. Listeners not attached.");
        if (!logoutBtn) console.warn(" - #logoutBtn missing");
        if (!logoutModal) console.warn(" - #logoutModal missing");
        if (!confirmLogout) console.warn(" - #confirmLogout missing");
        if (!cancelLogout) console.warn(" - #cancelLogout missing");
    }

}


// --- DATE CHANGE DETECTION AND AUTO-REFRESH ---
let lastDashboardRenderDate_MMDDYYYY = localStorage.getItem('lastDashboardRenderDate_MMDDYYYY') || "";

function checkDateAndTriggerRefresh() {
    const currentSystemDate_MMDDYYYY = formatDateMMDDYYYY(new Date());
    if (currentSystemDate_MMDDYYYY !== lastDashboardRenderDate_MMDDYYYY) {
        console.log(`Dashboard: System date changed from ${lastDashboardRenderDate_MMDDYYYY} to ${currentSystemDate_MMDDYYYY}. Refreshing data.`);
        lastDashboardRenderDate_MMDDYYYY = currentSystemDate_MMDDYYYY;
        localStorage.setItem('lastDashboardRenderDate_MMDDYYYY', currentSystemDate_MMDDYYYY);
        refreshDashboardDisplayData();
    }
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', function () {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const currentUser = sessionStorage.getItem('currentUser');
    if (!rememberedUser && !currentUser) {
        window.location.href = "../Html/index.html";
        return;
    }
    if (!localStorage.getItem('lastDashboardRenderDate_MMDDYYYY')) {
        localStorage.setItem('lastDashboardRenderDate_MMDDYYYY', formatDateMMDDYYYY(new Date()));
    }
    lastDashboardRenderDate_MMDDYYYY = localStorage.getItem('lastDashboardRenderDate_MMDDYYYY');
    refreshDashboardDisplayData();
    initLogoutModal();
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function (event) {
            if (localStorage.getItem('rememberedUser') || sessionStorage.getItem('currentUser')) {
                window.history.pushState(null, null, window.location.href);
            } else {
                window.location.href = "../Html/index.html";
            }
        };
    }
    setInterval(checkDateAndTriggerRefresh, 1500);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkDateAndTriggerRefresh();
        }
    });
    window.addEventListener('focus', checkDateAndTriggerRefresh);
});