// ../Js/usermanagement.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("[usermanagement.js] DOM fully loaded."); // Log start

    // --- 1. Authentication Check ---
    const rememberedUser = localStorage.getItem('rememberedUser');
    const currentUser = sessionStorage.getItem('currentUser');
    if (!rememberedUser && !currentUser) {
        console.log("[usermanagement.js] User not logged in, redirecting to index.html");
        window.location.href = "../Html/index.html"; // Use relative path
        return; // Stop further execution if redirecting
    }
    console.log("[usermanagement.js] User is logged in.");

    // --- 2. Element Finding (for table/search) ---
    const tableBody = document.querySelector("table tbody");
    const searchInput = document.querySelector(".search-bar input");

    let elementsFound = true;
    if (!tableBody) {
        console.error("[usermanagement.js] CRITICAL ERROR: Cannot find table body element using selector 'table tbody'. Table cannot be populated.");
        elementsFound = false;
    } else {
        console.log("[usermanagement.js] Table body element found:", tableBody);
    }
    if (!searchInput) {
        console.warn("[usermanagement.js] Search input element ('.search-bar input') not found.");
    } else {
        console.log("[usermanagement.js] Search input element found:", searchInput);
    }

    // Stop script if essential table element is missing
    if (!elementsFound) {
         console.error("[usermanagement.js] Stopping script because essential table elements were not found.");
         return;
    }

    // --- 3. Data Loading and Validation (for table) ---
    let userLogs = [];
    try {
        const storedLogs = localStorage.getItem("userLogs");
        console.log("[usermanagement.js] Raw 'userLogs' string from localStorage:", storedLogs);

        if (storedLogs) {
            userLogs = JSON.parse(storedLogs);
            if (!Array.isArray(userLogs)) {
                 console.warn("[usermanagement.js] Parsed 'userLogs' is not an array. Resetting to empty.", userLogs);
                 userLogs = [];
            } else {
                 // Check structure of the first item for the new format
                 if (userLogs.length > 0 &&
                     (typeof userLogs[0] !== 'object' || userLogs[0] === null ||
                      !userLogs[0].hasOwnProperty('name') ||
                      !userLogs[0].hasOwnProperty('loginTime')
                      // logoutTime can be null, so we don't strictly require its presence here for initial validation
                     )) {
                    console.warn("[usermanagement.js] First item in 'userLogs' does not have expected structure ({name:..., loginTime:..., logoutTime:...}). Data might be incompatible.", userLogs[0]);
                 } else if (userLogs.length > 0) {
                    console.log("[usermanagement.js] Sample log entry (first item):", JSON.stringify(userLogs[0]));
                 }
            }
        } else {
            console.log("[usermanagement.js] 'userLogs' item not found in localStorage.");
        }
    } catch (error) {
        console.error("[usermanagement.js] Error parsing 'userLogs' from localStorage:", error);
        userLogs = [];
    }
    console.log(`[usermanagement.js] Final 'userLogs' array ready for rendering. Count: ${userLogs.length}`);

    // --- 4. Table Rendering Function Definition ---
    function renderTable(logsToRender) {
        if (!tableBody) {
            console.error("[renderTable] tableBody element is missing. Cannot render.");
            return;
        }
        tableBody.innerHTML = ''; // Clear table
        console.log("[renderTable] Table body cleared.");

        if (!logsToRender || logsToRender.length === 0) {
            console.log("[renderTable] No logs to render. Displaying 'No history' message.");
            try {
                const row = tableBody.insertRow();
                const cell = row.insertCell();
                cell.textContent = "No login history found.";
                cell.colSpan = 3; // Adjusted for 3 columns
                cell.style.textAlign = "center";
            } catch(e) {
                console.error("[renderTable] Error inserting 'No history' row:", e);
            }
        } else {
            console.log("[renderTable] Rendering log entries...");
            // Sort logs by loginTime (newest first)
            logsToRender.sort((a, b) => {
                const dateA = (a && a.loginTime) ? new Date(a.loginTime) : null;
                const dateB = (b && b.loginTime) ? new Date(b.loginTime) : null;
                const isAInvalid = !dateA || isNaN(dateA.getTime());
                const isBInvalid = !dateB || isNaN(dateB.getTime());

                if (isAInvalid && isBInvalid) return 0;
                if (isAInvalid) return 1; // Invalid dates go to the end
                if (isBInvalid) return -1; // Invalid dates go to the end
                return dateB - dateA; // Descending (newest first)
            });
            console.log("[renderTable] Logs sorted by loginTime (attempted).");

            // Add rows
            logsToRender.forEach((logEntry, index) => {
                // Validate structure before rendering
                if (!logEntry || typeof logEntry !== 'object' || logEntry === null ||
                    !logEntry.hasOwnProperty('name') ||
                    !logEntry.hasOwnProperty('loginTime')
                    // logoutTime is optional (can be null)
                   ) {
                     console.warn(`[renderTable] Skipping invalid/incomplete log entry at index ${index} after sort:`, logEntry);
                     return;
                }
                try {
                    const row = tableBody.insertRow();
                    const nameCell = row.insertCell();
                    const loginCell = row.insertCell();
                    const logoutCell = row.insertCell();

                    nameCell.textContent = logEntry.name || "N/A";
                    loginCell.textContent = logEntry.loginTime ? new Date(logEntry.loginTime).toLocaleString() : "N/A";
                    logoutCell.textContent = logEntry.logoutTime ? new Date(logEntry.logoutTime).toLocaleString() : "Still Logged In";

                } catch (error) {
                     console.error(`[renderTable] Error creating row/cell for log at index ${index}:`, error, "Log data:", logEntry);
                }
            });
            console.log("[renderTable] Finished rendering log entries.");
        }
    } // End renderTable function

    // --- 5. Initial Render ---
    renderTable(userLogs);

    // --- 6. Search Functionality ---
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            const searchValue = event.target.value.toLowerCase().trim();
            console.log(`[Search] Term: "${searchValue}"`);
            const filteredLogs = userLogs.filter(log => {
                 if (!log || typeof log !== 'object') return false;

                 const name = (log.name || "").toLowerCase();
                 const loginTime = (log.loginTime ? new Date(log.loginTime).toLocaleString() : "").toLowerCase();
                 const logoutTime = (log.logoutTime ? new Date(log.logoutTime).toLocaleString() : "still logged in").toLowerCase(); // Include "still logged in" in search

                 return name.includes(searchValue) ||
                        loginTime.includes(searchValue) ||
                        logoutTime.includes(searchValue);
            });
            console.log(`[Search] Found ${filteredLogs.length} logs matching search.`);
            renderTable(filteredLogs);
        });
    }

    // --- 7. Logout Modal Logic ---
    console.log("[Logout Setup] Starting logout modal setup...");
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    console.log("[Logout Check] logoutBtn element:", logoutBtn);
    console.log("[Logout Check] logoutModal element:", logoutModal);
    console.log("[Logout Check] confirmLogout element:", confirmLogout);
    console.log("[Logout Check] cancelLogout element:", cancelLogout);

    if (logoutBtn && logoutModal && confirmLogout && cancelLogout) {
        console.log("[Logout Setup] All logout elements found. Adding listeners.");

        logoutBtn.addEventListener("click", function (e) {
          console.log("[Logout Action] logoutBtn clicked!");
          e.preventDefault();
          console.log("[Logout Action] Modal display style BEFORE change:", logoutModal.style.display);
          logoutModal.style.display = "flex";
          console.log("[Logout Action] Modal display style AFTER change:", logoutModal.style.display);
        });

        confirmLogout.addEventListener("click", function () {
            console.log("[Logout Action] Confirm button clicked.");

            // ***** START: RECORD LOGOUT TIME *****
            const activeSessionId = sessionStorage.getItem('activeLoginSessionId');
            if (activeSessionId) {
                try {
                    let currentLogs = JSON.parse(localStorage.getItem("userLogs")) || [];
                    const now = new Date();
                    const logoutTimestamp = now.toLocaleString(); // Use toLocaleString for consistency

                    const logIndex = currentLogs.findIndex(log => log.sessionId === activeSessionId && log.logoutTime === null);

                    if (logIndex !== -1) {
                        currentLogs[logIndex].logoutTime = logoutTimestamp; // Store as string
                        localStorage.setItem("userLogs", JSON.stringify(currentLogs));
                        console.log("[usermanagement.js] Logout time recorded for session:", activeSessionId);
                    } else {
                        console.warn("[usermanagement.js] Could not find active session log (sessionId:", activeSessionId, "and logoutTime: null) to record logout. This might happen if the log was manually altered or if the session ID is stale.");
                        // Fallback: Create a new log entry if no matching login is found but a session ID exists.
                        // This is less ideal but captures the logout event.
                        const displayName = localStorage.getItem("displayName") || sessionStorage.getItem("currentUser") || "Unknown User (Logout Only)";
                        currentLogs.push({
                            sessionId: `logout_orphan_${Date.now()}`, // Mark as orphan
                            name: displayName,
                            loginTime: null, // No corresponding login time
                            logoutTime: logoutTimestamp
                        });
                        localStorage.setItem("userLogs", JSON.stringify(currentLogs));
                        console.warn("[usermanagement.js] Created an orphan logout entry.");
                    }
                    sessionStorage.removeItem('activeLoginSessionId'); // Clear the active session ID
                } catch (error) {
                    console.error("[usermanagement.js] Error updating logout time in userLogs:", error);
                }
            } else {
                console.warn("[usermanagement.js] No activeLoginSessionId found in sessionStorage. Cannot record specific logout time for a session.");
                // Optional: Record a generic logout event if no session ID is found (less specific)
                // This part depends on desired behavior if session tracking fails.
                // For now, we'll just log a warning.
            }
            // ***** END: RECORD LOGOUT TIME *****

            localStorage.removeItem("rememberedUser");
            sessionStorage.removeItem("currentUser");
            // sessionStorage.removeItem('activeLoginSessionId'); // Moved this up to ensure it's cleared even if other parts fail slightly
            window.location.href = "../Html/index.html";
        });

        cancelLogout.addEventListener("click", function () {
          console.log("[Logout Action] Cancel button clicked.");
          logoutModal.style.display = "none";
        });

    } else {
         console.warn("[Logout Setup] FAILED: One or more logout modal elements NOT found. Listeners not attached.");
         if (!logoutBtn) console.warn(" - #logoutBtn missing");
         if (!logoutModal) console.warn(" - #logoutModal missing");
         if (!confirmLogout) console.warn(" - #confirmLogout missing");
         if (!cancelLogout) console.warn(" - #cancelLogout missing");
    }
    // --- End of Logout Modal Logic ---

    console.log("[usermanagement.js] Script finished execution.");

}); // --- END of DOMContentLoaded Listener ---