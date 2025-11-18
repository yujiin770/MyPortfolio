document.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const currentUser = sessionStorage.getItem('currentUser');

    if (!rememberedUser && !currentUser) {
        window.location.href = "index.html"; // Redirect to login page
    }
});

// ../Js/dailytransaction.js

// --- UTILITY FUNCTIONS --- (getLocalDateString, formatDateMMDDYYYY - keep as is)
function getLocalDateString() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatDateMMDDYYYY(dateInput) {
    const parsedDate = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(parsedDate.getTime())) {
        // console.error("Invalid date provided to formatDateMMDDYYYY:", dateInput);
        return "Invalid Date";
    }
    const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(parsedDate.getDate()).padStart(2, '0');
    const yyyy = parsedDate.getFullYear();
    return `${mm}-${dd}-${yyyy}`; // MM-DD-YYYY
}


document.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const currentUserSessionData = sessionStorage.getItem('currentUser'); // Renamed to avoid conflict

    if (!rememberedUser && !currentUserSessionData) { // Check session data
        window.location.href = "index.html"; // Redirect to login page
    }
});


// --- MODAL LOGIC & FORM HANDLING ---
function openModal() {
    document.getElementById("transactionModal").style.display = "block";
    const form = document.getElementById("newTransactionForm");
    if (form) form.reset();

    const contactValidationMsg = document.getElementById('contact-validation-msg');
    if (contactValidationMsg) {
        contactValidationMsg.style.display = 'none';
        contactValidationMsg.textContent = '';
    }

    const reasonSelect = document.getElementById("reason-for-visit");
    const dateInput = document.getElementById("transaction-date");
    if (dateInput) {
        dateInput.value = getLocalDateString();
    }

    if (reasonSelect) {
        toggleHealthIssueInput(reasonSelect.value);
        reasonSelect.onchange = function () {
            toggleHealthIssueInput(this.value);
        };
    }
    handleRoleChange();
}


function closeModal() {
    const modal = document.getElementById("transactionModal");
    if (modal) modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function() {
    const newTransactionForm = document.getElementById("newTransactionForm");
    if (newTransactionForm) {
        newTransactionForm.onsubmit = function (event) {
            event.preventDefault();

            // --- CORRECTED PART (OPTION 1) ---
            let handledBy = localStorage.getItem("displayName"); // Prefer display name if set

            if (!handledBy) { // Fallback if displayName is not in localStorage
                const usernameFromSession = sessionStorage.getItem('currentUser'); // Get the raw username string
                // Use the retrieved username string directly, or default to 'System'
                handledBy = usernameFromSession || 'System'; // Use the string or default
                console.log(`[dailytransaction.js] Using handledBy from session or default: ${handledBy}`); // Log which source is used
            } else {
                console.log(`[dailytransaction.js] Using handledBy from localStorage (displayName): ${handledBy}`);
            }
            // --- END OF CORRECTED PART ---

            // --- Form data retrieval ---
            const name = document.getElementById("transaction-name").value;
            const role = document.getElementById("transaction-role").value;
            const course = document.getElementById("transaction-course").value;
            const schoolid = document.getElementById("transaction-schoolid").value;
            const contactMainInput = document.getElementById("transaction-contact-main");
            const contactMainValue = contactMainInput ? contactMainInput.value : "";
            const contactValidationMsg = document.getElementById('contact-validation-msg');

            // --- Contact Validation ---
            if (contactValidationMsg) {
                contactValidationMsg.style.display = 'none';
                contactValidationMsg.textContent = '';
            }
            if (contactMainValue.length !== 10) {
                if (contactValidationMsg) {
                    contactValidationMsg.textContent = "Please enter exactly 10 digits.";
                    contactValidationMsg.style.display = 'block';
                }
                if (contactMainInput) contactMainInput.focus();
                return; // Stop submission
            }
            else if (contactMainValue.charAt(0) !== '9') {
                if (contactValidationMsg) {
                    contactValidationMsg.textContent = "Mobile number must start with '9'.";
                    contactValidationMsg.style.display = 'block';
                }
                if (contactMainInput) {
                    contactMainInput.value = "";
                    contactMainInput.focus();
                }
                return; // Stop submission
            }

            const contact = "+63" + contactMainValue;
            const contactFullHiddenInput = document.getElementById("transaction-contact-full");
            if(contactFullHiddenInput) contactFullHiddenInput.value = contact;

            // --- Continue retrieving form data ---
            const age = document.getElementById("transaction-age").value;
            const sex = document.getElementById("transaction-sex").value;
            const date = document.getElementById("transaction-date").value;
            const actions = document.getElementById("actions-taken").value;
            const reasonSelectValue = document.getElementById("reason-for-visit").value;
            const healthIssueInput = document.getElementById("health-issue").value;

            let reason = reasonSelectValue;
            let healthIssueFromInput = "";
            if (reasonSelectValue === "") { // If "Other" is selected
                reason = healthIssueInput || "Other Health Issue"; // Use input or default text
                healthIssueFromInput = healthIssueInput;
            }

            const now = new Date();
            const timeIn = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            // --- Create Transaction Object ---
            const newTransaction = {
                name, role,
                course: role === "Student" ? course : "",
                schoolid: role === "Student" ? schoolid : "",
                contact,
                age, sex, date, timeIn,
                timeOut: "", // Initially empty
                reason,
                healthIssue: healthIssueFromInput,
                actions,
                handledBy // Use the correctly determined handledBy value
            };

            // --- Save to LocalStorage ---
            let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
            transactions.push(newTransaction);
            localStorage.setItem("transactions", JSON.stringify(transactions));

            // --- Reset and Close ---
            newTransactionForm.reset();
            closeModal();
            renderTransactions(); // Update the displayed list
        };
    }

    // --- Event listener for role change to enable/disable student fields ---
    const roleSelect = document.getElementById("transaction-role");
    if (roleSelect) {
       roleSelect.addEventListener("change", handleRoleChange);
    }

    // Initialize student fields state based on default role
    handleRoleChange();
}); // End of DOMContentLoaded for form submission

function handleRoleChange() {
    const roleSelect = document.getElementById("transaction-role");
    const courseSelect = document.getElementById("transaction-course");
    const schoolidInput = document.getElementById("transaction-schoolid");

    if (!roleSelect || !courseSelect || !schoolidInput) return; // Exit if elements not found

    const isStudent = roleSelect.value === "Student";
    courseSelect.disabled = !isStudent;
    schoolidInput.disabled = !isStudent;

    if (!isStudent) { // Clear fields if not a student
        courseSelect.value = "";
        schoolidInput.value = "";
    }
}

function toggleHealthIssueInput(reason) {
    const healthIssueInput = document.getElementById("health-issue");
    if (!healthIssueInput) return;

    const isOther = reason === ""; // Assuming "" value corresponds to "Other"
    healthIssueInput.disabled = !isOther;

    if (!isOther) {
        healthIssueInput.value = ""; // Clear if not "Other"
    }
}


// --- TRANSACTION RENDERING AND MANAGEMENT ---
function renderTransactions(filteredData = null) {
    const tbody = document.querySelector("table tbody");
    if (!tbody) {
        console.error("[renderTransactions] Table body not found!");
        return;
    }
    tbody.innerHTML = ""; // Clear existing rows

    const allTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const todayDateForFilter_MMDDYYYY = formatDateMMDDYYYY(new Date());

    // Determine which data set to render: filtered search results or today's transactions
    const dataToRender = filteredData !== null
        ? filteredData // Use provided filtered data if available
        : allTransactions.filter(t => { // Otherwise, filter all transactions for today
            // Add safety check for t.date
            if (!t || !t.date) return false;
            const transactionDateFormatted_MMDDYYYY = formatDateMMDDYYYY(new Date(t.date));
            return transactionDateFormatted_MMDDYYYY === todayDateForFilter_MMDDYYYY;
        });

    if (dataToRender.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6; // Adjust colspan to match your table columns
        cell.textContent = "No transactions for today yet.";
        cell.style.textAlign = "center";
    } else {
        dataToRender.forEach(t => {
            // Find the original index in the *full* transactions list to ensure setTimeOut works correctly
             const masterListIndex = allTransactions.findIndex(item =>
                item.name === t.name &&
                item.date === t.date &&
                item.timeIn === t.timeIn &&
                item.role === t.role && // Add more conditions for uniqueness if needed
                item.actions === t.actions
            );


            if (!t) return; // Skip if transaction object is somehow invalid

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${t.name || 'N/A'}</td>
                <td>${t.role || 'N/A'}</td>
                <td>${t.actions || 'N/A'}</td>
                <td>${t.date ? formatDateMMDDYYYY(new Date(t.date)) : 'Invalid Date'}</td>
                <td>${t.timeIn || 'N/A'}</td>
                <td>
                    ${t.timeOut
                        ? t.timeOut // Display time out if already set
                        : (masterListIndex !== -1 // Ensure we have a valid index for the button
                           ? `<button onclick="setTimeOut(${masterListIndex})">Set Time Out</button>`
                           : 'Error: Index not found' // Fallback if index not found
                          )
                    }
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}


function setTimeOut(index) {
    console.log(`[setTimeOut] Called for index: ${index}`);
    const now = new Date();
    const timeOut = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentDateKeyYYYYMMDD = getLocalDateString();

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    if (transactions[index]) {
        const t = transactions[index]; // Get the transaction object

        // Prevent setting time out multiple times
        if (t.timeOut) {
            console.warn(`[setTimeOut] Time out already set for transaction index ${index}.`);
            return;
        }

        // Update the transaction object
        transactions[index].timeOut = timeOut;
        localStorage.setItem("transactions", JSON.stringify(transactions));
        console.log(`[setTimeOut] Time out set to ${timeOut} for transaction index ${index}`);

        // --- Update Stats ---

        // 1. Overall Visit Stats
        const visitData = JSON.parse(localStorage.getItem("visitStats")) || {};
        visitData[currentDateKeyYYYYMMDD] = (visitData[currentDateKeyYYYYMMDD] || 0) + 1;
        localStorage.setItem("visitStats", JSON.stringify(visitData));

        // 2. Daily Count by Role
        const dailyCount = JSON.parse(localStorage.getItem("dailyCount")) || {};
        if (!dailyCount[currentDateKeyYYYYMMDD]) {
            dailyCount[currentDateKeyYYYYMMDD] = { student: 0, staff: 0 };
        }
        const role = t.role ? t.role.toLowerCase() : null; // Check if role exists
        if (role === "student" || role === "staff") {
            dailyCount[currentDateKeyYYYYMMDD][role] += 1;
        }
        localStorage.setItem("dailyCount", JSON.stringify(dailyCount));

        // 3. Reason Counts
        const reasonList = ["Headache", "Stomachache", "Dizziness", "Fever", "Cough", "Colds", "sorethroat", "Toothache", "Menstrualcramps", "Minorcutorwound", "MusclepainBodypain", "Sprainorminorinjury", "Skinrashorirritation", "Allergicreactionmild", "Followupcheck", "Medicationrequest", "Nauseaorvomiting", "Eyeirritation", "Earpain"];
        const reasonCounts = JSON.parse(localStorage.getItem("reasonCounts")) || {};
        if (!reasonCounts[currentDateKeyYYYYMMDD]) {
            reasonCounts[currentDateKeyYYYYMMDD] = {};
            reasonList.forEach(r => reasonCounts[currentDateKeyYYYYMMDD][r] = 0);
        }
        if (t.reason) { // Check if reason exists
            if (reasonList.includes(t.reason)) {
                reasonCounts[currentDateKeyYYYYMMDD][t.reason] = (reasonCounts[currentDateKeyYYYYMMDD][t.reason] || 0) + 1;
                localStorage.setItem("reasonCounts", JSON.stringify(reasonCounts));
            } else { // Handle "Other" reasons
                 const otherCounts = JSON.parse(localStorage.getItem("otherCounts")) || {};
                 if (!otherCounts[currentDateKeyYYYYMMDD]) {
                     otherCounts[currentDateKeyYYYYMMDD] = {};
                 }
                 otherCounts[currentDateKeyYYYYMMDD][t.reason] = (otherCounts[currentDateKeyYYYYMMDD][t.reason] || 0) + 1;
                 localStorage.setItem("otherCounts", JSON.stringify(otherCounts));
            }
        }

        // 4. Hourly Counts
        const hourlyCounts = JSON.parse(localStorage.getItem("hourlyCounts")) || {};
        const hours = ["12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];
        if (!hourlyCounts[currentDateKeyYYYYMMDD]) {
            hourlyCounts[currentDateKeyYYYYMMDD] = {};
            hours.forEach(h => hourlyCounts[currentDateKeyYYYYMMDD][h] = 0);
        }
        const currentHour = now.getHours();
        const timeSlot = hours[currentHour];
        if (timeSlot) {
            hourlyCounts[currentDateKeyYYYYMMDD][timeSlot] = (hourlyCounts[currentDateKeyYYYYMMDD][timeSlot] || 0) + 1;
        }
        localStorage.setItem("hourlyCounts", JSON.stringify(hourlyCounts));

        // 5. Add to manageRecords (Archive)
        const manageRecords = JSON.parse(localStorage.getItem("manageRecords")) || [];
        // Check if this specific record already exists to avoid duplicates
        const alreadyExistsInManage = manageRecords.some(r =>
            r.name === t.name &&
            r.date === t.date &&
            r.timeIn === t.timeIn &&
            r.role === t.role // Add more checks if necessary
        );
        if (!alreadyExistsInManage) {
            // Push a copy of the *updated* transaction object 't' (now including timeOut)
            manageRecords.push({...t});
            localStorage.setItem("manageRecords", JSON.stringify(manageRecords));
            console.log(`[setTimeOut] Transaction index ${index} added to manageRecords.`);
        } else {
            console.log(`[setTimeOut] Transaction index ${index} already exists in manageRecords.`);
        }

        // Re-render the daily transactions list to show the time out
        renderTransactions();
    } else {
        console.error(`[setTimeOut] Invalid index provided: ${index}. Transaction not found.`);
    }
}


// --- DATE CHANGE HANDLING & DAILY RESET ---
function resetTransactionsIfNewDay() {
    const todayFormatted_MMDDYYYY = formatDateMMDDYYYY(new Date());
    const lastTransactionDateStored_MMDDYYYY = localStorage.getItem("lastTransactionDate");

    if (lastTransactionDateStored_MMDDYYYY !== todayFormatted_MMDDYYYY) {
        console.log(`[resetTransactionsIfNewDay] New day detected (${todayFormatted_MMDDYYYY}). Resetting daily transactions.`);
        // Clear only the *daily* transactions list
        localStorage.setItem("transactions", JSON.stringify([]));

        // Initialize today's visit count if needed (optional, setTimeOut handles incrementing)
        const todayKey_YYYYMMDD = getLocalDateString();
        const visitStats = JSON.parse(localStorage.getItem("visitStats")) || {};
        if (visitStats[todayKey_YYYYMMDD] === undefined) { // Only set to 0 if it doesn't exist for today
             visitStats[todayKey_YYYYMMDD] = 0;
             localStorage.setItem("visitStats", JSON.stringify(visitStats));
        }

        // Update the stored date marker
        localStorage.setItem("lastTransactionDate", todayFormatted_MMDDYYYY);

        // Re-render the (now empty) list
        renderTransactions();
    }
}


// --- INITIALIZATION AND EVENT LISTENERS FOR DATE CHECK ---
window.onload = function () {
    console.log("[dailytransaction.js] Window loaded.");
    const today_MMDDYYYY = formatDateMMDDYYYY(new Date());
    // Set the initial date marker if it doesn't exist
    if (!localStorage.getItem("lastTransactionDate")) {
        localStorage.setItem("lastTransactionDate", today_MMDDYYYY);
        console.log("[dailytransaction.js] Initialized lastTransactionDate to:", today_MMDDYYYY);
    }
    resetTransactionsIfNewDay(); // Check immediately on load
    renderTransactions();        // Render whatever is current for today
};

const dateCheckInterval = setInterval(resetTransactionsIfNewDay, 1000); 

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        resetTransactionsIfNewDay();
    }
});

window.addEventListener('focus', () => {
    resetTransactionsIfNewDay();
});

window.addEventListener('unload', () => { 
    clearInterval(dateCheckInterval);
});

// --- SEARCH FUNCTIONALITY ---
function searchTransactions() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    const searchValue = searchInput.value.toLowerCase();

    const allTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const todayDateForFilter_MMDDYYYY = formatDateMMDDYYYY(new Date());

    const transactionsForToday = allTransactions.filter(t => {
        const transactionDateFormatted_MMDDYYYY = formatDateMMDDYYYY(new Date(t.date));
        return transactionDateFormatted_MMDDYYYY === todayDateForFilter_MMDDYYYY;
    });

    const filteredBySearch = transactionsForToday.filter(transaction => {
        const nameMatch = transaction.name.toLowerCase().includes(searchValue);
        const dateDisplay = formatDateMMDDYYYY(new Date(transaction.date)).toLowerCase();
        const dateMatch = dateDisplay.includes(searchValue);
        const roleMatch = transaction.role.toLowerCase().includes(searchValue);
        return nameMatch || dateMatch || roleMatch;
    });
    renderTransactions(filteredBySearch);
}

// --- LOGOUT FUNCTIONALITY ---
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

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

});

// --- SIDEBAR MENU TOGGLE ---
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('aside');
    const body = document.body;

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); 
            sidebar.classList.toggle('sidebar-visible');
            body.classList.toggle('sidebar-active');
            menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('sidebar-visible').toString());
        });
    }
    document.addEventListener('click', (event) => {
        if (sidebar && sidebar.classList.contains('sidebar-visible') &&
            menuToggle && 
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)) {
            sidebar.classList.remove('sidebar-visible');
            body.classList.remove('sidebar-active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

// --- DELETE CONFIRMATION MODAL (basic structure, needs integration if used) ---
let recordToDeleteIndexForModal = null; 

function openDeleteConfirmationModalForTransaction(index) { 
    recordToDeleteIndexForModal = index;
    const modal = document.getElementById("deleteConfirmationModal");
    if(modal) modal.style.display = "block";
}

function closeDeleteModal() {
    const modal = document.getElementById("deleteConfirmationModal");
    if(modal) modal.style.display = "none";
    recordToDeleteIndexForModal = null;
}

const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = function() {
        if (recordToDeleteIndexForModal !== null) {
            // This is for deleting from the 'transactions' (daily visits) list.
            // If you implement this, ensure it correctly updates all related stats
            // or decide if deletion is allowed from this view.
            // For now, it's just a placeholder.
            // let daily_transactions = JSON.parse(localStorage.getItem("transactions")) || [];
            // daily_transactions.splice(recordToDeleteIndexForModal, 1);
            // localStorage.setItem("transactions", JSON.stringify(daily_transactions));
            // renderTransactions(); 
            // console.log("Daily transaction at index", recordToDeleteIndexForModal, "would be deleted here.");
        }
        closeDeleteModal();
    };
}