let currentDisplayableBackupRecords = [];
let indicesToDelete = [];
let indicesToRestore = [];

document.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const currentUser = sessionStorage.getItem('currentUser');

    if (!rememberedUser && !currentUser) {
        window.location.href = "index.html";
    }

    refreshBackupTable();

    document.getElementById("startDate").addEventListener("input", applyFiltersAndRenderRecords);
    document.getElementById("endDate").addEventListener("input", applyFiltersAndRenderRecords);
    document.getElementById("selectAllCheckbox").addEventListener("change", handleSelectAllCheckboxes);
    
    // Restore Selected Button Listener
    document.getElementById("restoreSelectedBtn").addEventListener("click", handleRestoreSelectedRecords);

    // Delete Selected Button Listener (New)
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener("click", handleDeleteSelectedRecords);
    }


    // --- Logout modal logic ---
     console.log("[BackupRestore Logout Setup] Starting logout modal setup...");
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    // Log whether elements were found
    console.log("[BackupRestore Logout Check] logoutBtn element:", logoutBtn);
    console.log("[BackupRestore Logout Check] logoutModal element:", logoutModal);
    console.log("[BackupRestore Logout Check] confirmLogout element:", confirmLogout);
    console.log("[BackupRestore Logout Check] cancelLogout element:", cancelLogout);

    if (logoutBtn && logoutModal && confirmLogout && cancelLogout) {
        console.log("[BackupRestore Logout Setup] All logout elements found. Adding listeners.");

        logoutBtn.addEventListener("click", function(e) {
            console.log("[BackupRestore Logout Action] logoutBtn clicked!");
            e.preventDefault();
            console.log("[BackupRestore Logout Action] Modal display style BEFORE change:", logoutModal.style.display);
            logoutModal.style.display = "flex";
            console.log("[BackupRestore Logout Action] Modal display style AFTER change:", logoutModal.style.display);
        });

        confirmLogout.addEventListener("click", function() {
            console.log("[BackupRestore Logout Action] Confirm button clicked.");

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
                        console.log("[BackupRestore.js] Logout time recorded for session:", activeSessionId);
                    } else {
                        console.warn("[BackupRestore.js] Could not find active session log (sessionId:", activeSessionId, "and logoutTime: null) to record logout. Creating orphan entry.");
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
                    console.error("[BackupRestore.js] Error updating logout time in userLogs:", error);
                }
            } else {
                console.warn("[BackupRestore.js] No activeLoginSessionId found in sessionStorage. Cannot record specific logout time.");
            }
            // ***** END: RECORD LOGOUT TIME *****

            localStorage.removeItem("rememberedUser");
            sessionStorage.removeItem("currentUser");
            sessionStorage.removeItem('activeLoginSessionId'); // Clear the active session ID
            window.location.href = "../Html/index.html";
        });

        cancelLogout.addEventListener("click", function() {
            console.log("[BackupRestore Logout Action] Cancel button clicked.");
            logoutModal.style.display = "none";
        });

    } else {
         console.warn("[BackupRestore Logout Setup] FAILED: One or more logout modal elements NOT found. Listeners not attached.");
         if (!logoutBtn) console.warn(" - #logoutBtn missing");
         if (!logoutModal) console.warn(" - #logoutModal missing");
         if (!confirmLogout) console.warn(" - #confirmLogout missing");
         if (!cancelLogout) console.warn(" - #cancelLogout missing");
    }

    // --- Delete Confirmation Modal Logic (Revised) ---
    const deleteConfirmModal = document.getElementById("deleteConfirmModal");
    const deleteYesBtn = document.getElementById("deleteYesBtn");
    const deleteNoBtn = document.getElementById("deleteNoBtn");
    const closeDeleteConfirmModalBtn = document.getElementById("closeDeleteConfirmModal"); // The <span> X button

    if (deleteYesBtn) {
        deleteYesBtn.addEventListener("click", confirmActualDeletion);
    }
    if (deleteNoBtn) {
        deleteNoBtn.addEventListener("click", closeDeleteConfirmModal);
    }
    if (closeDeleteConfirmModalBtn) {
        closeDeleteConfirmModalBtn.addEventListener("click", closeDeleteConfirmModal);
    }
    // Optional: Close modal if clicking outside of its content
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('click', function(event) {
            if (event.target === deleteConfirmModal) { // Clicked on the overlay
                closeDeleteConfirmModal();
            }
        });
    }

    // --- Restore Confirmation Modal Logic ---
    const restoreConfirmModal = document.getElementById("restoreConfirmModal"); // Assuming this modal exists in your HTML
    const restoreYesBtn = document.getElementById("restoreYesBtn"); // Assuming this button exists
    const restoreNoBtn = document.getElementById("restoreNoBtn"); // Assuming this button exists
    const closeRestoreConfirmModalBtn = document.getElementById("closeRestoreConfirmModalBtn"); // Assuming this button exists

    if (restoreYesBtn) {
        restoreYesBtn.addEventListener("click", confirmActualRestoration);
    }
    if (restoreNoBtn) {
        restoreNoBtn.addEventListener("click", closeRestoreConfirmModal);
    }
    if (closeRestoreConfirmModalBtn) {
        closeRestoreConfirmModalBtn.addEventListener("click", closeRestoreConfirmModal);
    }
    if (restoreConfirmModal) {
        restoreConfirmModal.addEventListener('click', function(event) {
            if (event.target === restoreConfirmModal) {
                closeRestoreConfirmModal();
            }
        });
    }
    // Initial call to ensure buttons state is correct based on no selection
    updateActionButtonsStatus();
});

window.addEventListener('beforeunload', function() {
    // localStorage.removeItem('rememberedUser');
});

window.history.pushState(null, null, window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, null, window.location.href);
};

// This function should be in the JavaScript file for your "Archive Records" page

// Place this in your backuprestore.js (or the JS file for your archive page)

function refreshBackupTable() {
    console.log("--- refreshBackupTable() CALLED ---", new Date().toLocaleString());

    // 1. Load records directly from storage
    let backupRecordsFromStorage = JSON.parse(localStorage.getItem("backupRestore")) || [];
    console.log("1. Initial records loaded from localStorage['backupRestore']:",
                backupRecordsFromStorage.length + " records.");

    // 2. Skip the 30-day filter. Use all loaded records.
    console.log("2. Skipping 30-day retention filter. Using all loaded records.");
    const recordsToKeepInArchive = backupRecordsFromStorage; // Use the records as they are

    // 3. Update the global variable used for display and filtering
    currentDisplayableBackupRecords = recordsToKeepInArchive;
    console.log("3. currentDisplayableBackupRecords set. Count:", currentDisplayableBackupRecords.length);

    // 4. Apply user-driven filters (search, date range) and render the table
    applyFiltersAndRenderRecords(); // This will use the full currentDisplayableBackupRecords

    console.log("--- refreshBackupTable() END ---");
}
function renderFilteredBackupRecords(recordsToDisplay) {
    const tableBody = document.getElementById("archivedRecordsTableBody"); // Use ID selector

    if (!tableBody) {
        console.error("ERROR: <tbody id='archivedRecordsTableBody'> element not found.");
        return;
    }
    tableBody.innerHTML = ''; // Clear previous content

    const selectAllCheckbox = document.getElementById("selectAllCheckbox");

    if (recordsToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">No archive records found matching your criteria.</td>
            </tr>
        `;
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.disabled = true;
        }
        updateActionButtonsStatus(); // Update buttons status even when empty
        return; // Exit function
    }

    // Re-enable selectAllCheckbox if previously disabled
    if (selectAllCheckbox) {
        selectAllCheckbox.disabled = false;
    }

    // --- Populate table rows (your existing loop) ---
    recordsToDisplay.forEach((record, index) => { // Using index from filtered list temporarily
        // Find the original index from the master list for data attributes
        const originalIndex = currentDisplayableBackupRecords.findIndex(r => r === record);

        // --- Your existing row creation logic ---
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="recordCheckbox" data-original-index="${originalIndex}"></td>
            <td>${record.name || "N/A"}</td>
            <td>${record.role || "N/A"}</td>
            <td>${record.actions || "N/A"}</td>
            <td>${record.date ? formatDate(record.date) : "N/A"}</td>
            <td>${record.dateRemoved ? formatDate(record.dateRemoved) : "N/A"}</td>
            <td>
                <button class="button-view" data-index="${originalIndex}">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // --- Re-attach listeners and update states AFTER rows are in the DOM ---
    addIndividualRowButtonListeners(); // For View/Restore/Delete
    addRowCheckboxListeners();         // Attach listeners to the new checkboxes
    updateSelectAllCheckboxVisualState(); // Set initial state of "Select All"
    updateActionButtonsStatus();       // Set initial state of action buttons
}

// --- Checkbox and Selection Logic ---
function addRowCheckboxListeners() {
    document.querySelectorAll("#archivedRecordsTableBody .recordCheckbox").forEach(checkbox => {

        const handler = () => {
            updateSelectAllCheckboxVisualState();
            updateActionButtonsStatus();
        };
        checkbox.removeEventListener("change", handler); // Attempt removal first
        checkbox.addEventListener("change", handler);    // Add the listener

    });
}

document.getElementById("restoreSelectedBtn").addEventListener("click", function() {
    handleRestoreSelectedRecords(); 
});

function handleRestoreSelectedRecords() {
    const selectedOriginalIndices = [];
    document.querySelectorAll(".recordCheckbox:checked").forEach(checkbox => {
        selectedOriginalIndices.push(parseInt(checkbox.dataset.originalIndex));
    });

    if (selectedOriginalIndices.length === 0) {
        // alert("Please select records to restore."); // Optional user feedback
        return;
    }
    openRestoreConfirmModal(selectedOriginalIndices); // Open modal
}

function confirmActualRestoration() {
    if (indicesToRestore.length === 0) {
        closeRestoreConfirmModal();
        return;
    }

    // Sort indices in descending order to correctly splice from array if `restoreRecord`
    // were to modify a shared array reference (it fetches fresh, but good practice).
    indicesToRestore.sort((a, b) => b - a);

    let restoredCount = 0;
    indicesToRestore.forEach(originalIndex => {
        // `originalIndex` is an index into `currentDisplayableBackupRecords`.
        // `restoreRecord` uses this index on a freshly parsed `backupRestore` array from localStorage.
        // This is correct because `currentDisplayableBackupRecords` is derived from localStorage
        // in `refreshBackupTable` preserving relative order for existing items.
        if (restoreRecord(originalIndex)) {
            restoredCount++;
        }
    });
  if (restoredCount > 0) {
        // You can add an alert here if desired, e.g., alert(`${restoredCount} record(s) restored successfully.`);
    } else if (indicesToRestore.length > 0 && restoredCount === 0) {
        // alert("No records were restored. They might have been invalid or already processed.");
    }
    
    closeRestoreConfirmModal();
    refreshBackupTable(); // Refresh the table to show changes
}











function handleSelectAllCheckboxes() {
    const selectAll = document.getElementById("selectAllCheckbox").checked;
    // Target only checkboxes within the specific table body
    document.querySelectorAll("#archivedRecordsTableBody .recordCheckbox").forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    updateActionButtonsStatus(); // Ensure buttons update after bulk change
}

function updateSelectAllCheckboxVisualState() {
    // Use more specific selectors to target checkboxes ONLY within this table's body
    const allCheckboxesInTable = document.querySelectorAll("#archivedRecordsTableBody .recordCheckbox");
    const checkedCheckboxesInTable = document.querySelectorAll("#archivedRecordsTableBody .recordCheckbox:checked");

    const totalCheckboxes = allCheckboxesInTable.length;
    const totalChecked = checkedCheckboxesInTable.length;

    const selectAllCheckbox = document.getElementById("selectAllCheckbox");

    if (totalCheckboxes === 0) {
        // No rows, disable and uncheck "Select All"
        selectAllCheckbox.checked = false;
        selectAllCheckbox.disabled = true;
    } else {
        // Enable "Select All" and set its state based on row checkboxes
        selectAllCheckbox.disabled = false;
        selectAllCheckbox.checked = (totalCheckboxes === totalChecked); // Checked if all rows are checked
    }
}

function updateActionButtonsStatus() {
    const anyChecked = document.querySelectorAll(".recordCheckbox:checked").length > 0;
    document.getElementById("restoreSelectedBtn").disabled = !anyChecked;
    document.getElementById("deleteSelectedBtn").disabled = !anyChecked;
}


// --- Restore Logic ---
function addRestoreButtonListeners() {
  const restoreButtons = document.querySelectorAll(".button-restore");
  restoreButtons.forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      newButton.addEventListener("click", function () {
          const originalIndex = parseInt(this.getAttribute("data-index"));
          openRestoreConfirmModal(originalIndex); // <<< MODIFIED: Open modal instead of direct restore
      });
  });
}
function openRestoreConfirmModal(data) { // data can be a single index or an array of indices
    indicesToRestore = Array.isArray(data) ? data : [data];

    if (indicesToRestore.length === 0) {
        // No records selected, don't open the modal
        return;
    }

    const restoreModal = document.getElementById("restoreConfirmModal");
    if (!restoreModal) {
        console.error("Restore confirmation modal not found!");
        // Fallback or error handling might be needed here
        return;
    }

    const modalTitleElement = restoreModal.querySelector("h2"); // Make sure 'h2' is the correct selector for your modal title
    if (modalTitleElement) {
        const count = indicesToRestore.length; // Get the count

        // --- CORRECTED LOGIC ---
        if (count === 1) {
            // Exactly one record selected
            modalTitleElement.textContent = "Are you sure you want to restore this record?";
        } else {
            // More than one record selected (count > 1, since count 0 is handled above)
            modalTitleElement.textContent = `Are you sure you want to restore these records?`;
        }
        // --- END OF CORRECTION ---

    } else {
        console.error("Modal title element (h2) not found within #restoreConfirmModal!");
    }

    restoreModal.style.display = "flex"; // Or "block"
}


function closeRestoreConfirmModal() {
    const restoreModal = document.getElementById("restoreConfirmModal");
    if (restoreModal) {
        restoreModal.style.display = "none";
    }
    indicesToRestore = []; // Clear the indices
}


function confirmActualRestoration() {
    if (indicesToRestore.length === 0) {
        closeRestoreConfirmModal();
        return;
    }

    indicesToRestore.sort((a, b) => b - a); // Sort descending for safe splicing

    let restoredCount = 0;
    indicesToRestore.forEach(originalIndex => {
        if (restoreRecord(originalIndex)) { // restoreRecord uses the index from the full backupRestore list
            restoredCount++;
        }
    });

    if (restoredCount > 0) {
        // alert(`${restoredCount} record(s) restored successfully.`); // Optional
    } else if (indicesToRestore.length > 0 && restoredCount === 0) {
        // alert("No records were restored. They might have been invalid or already processed."); // Optional
    }

    closeRestoreConfirmModal();
    refreshBackupTable(); // Refresh the table to show changes
}

function restoreRecord(originalIndex) { // Parameter is originalIndex from backupRestore
    let manageRecords = JSON.parse(localStorage.getItem("manageRecords")) || [];
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let backupRestore = JSON.parse(localStorage.getItem("backupRestore")) || []; // Get fresh copy

    let reasonCounts = JSON.parse(localStorage.getItem("reasonCounts")) || {};
    let dailyCount = JSON.parse(localStorage.getItem("dailyCount")) || {};
    let visitStats = JSON.parse(localStorage.getItem("visitStats")) || {};
    let hourlyCounts = JSON.parse(localStorage.getItem("hourlyCounts")) || {};
    let otherCounts = JSON.parse(localStorage.getItem("otherCounts")) || {};

    if (originalIndex >= 0 && originalIndex < backupRestore.length) {
        const recordToRestore = backupRestore[originalIndex];

        if (!recordToRestore || !recordToRestore.date || !recordToRestore.timeIn || !recordToRestore.role) {
            console.error("Record to restore is invalid or missing key fields:", recordToRestore);
            return false;
        }
        let recordDate = recordToRestore.date;
        const formattedDate = recordDate; // Assuming it's already YYYY-MM-DD

        manageRecords.push(recordToRestore);
        transactions.push(recordToRestore);

        visitStats[formattedDate] = (visitStats[formattedDate] || 0) + 1;

        if (!dailyCount[formattedDate]) {
            dailyCount[formattedDate] = { student: 0, staff: 0 };
        }
        const role = (recordToRestore.role || "").toLowerCase().trim();
        if (role === "student") dailyCount[formattedDate].student++;
        if (role === "staff") dailyCount[formattedDate].staff++;

        let reason = recordToRestore.reason || "Other Health Issue";
        reasonCounts[formattedDate] = reasonCounts[formattedDate] || {};
        reasonCounts[formattedDate][reason] = (reasonCounts[formattedDate][reason] || 0) + 1;

        if (recordToRestore.timeIn) {
            const hourKey = getHourKey(recordToRestore.timeIn);
            hourlyCounts[formattedDate] = hourlyCounts[formattedDate] || {};
            hourlyCounts[formattedDate][hourKey] = (hourlyCounts[formattedDate][hourKey] || 0) + 1;
        }

        const healthIssue = recordToRestore.healthIssue;
        if (healthIssue && healthIssue.trim() !== "") {
            if (!otherCounts[formattedDate]) {
                otherCounts[formattedDate] = {};
            }
            otherCounts[formattedDate][healthIssue] = (otherCounts[formattedDate][healthIssue] || 0) + 1;
        }

        localStorage.setItem("manageRecords", JSON.stringify(manageRecords));
        localStorage.setItem("transactions", JSON.stringify(transactions));
        localStorage.setItem("visitStats", JSON.stringify(visitStats));
        localStorage.setItem("dailyCount", JSON.stringify(dailyCount));
        localStorage.setItem("reasonCounts", JSON.stringify(reasonCounts));
        localStorage.setItem("hourlyCounts", JSON.stringify(hourlyCounts));
        localStorage.setItem("otherCounts", JSON.stringify(otherCounts));

        backupRestore.splice(originalIndex, 1);
        localStorage.setItem("backupRestore", JSON.stringify(backupRestore));

        const todayDate = formatDate(new Date());
        if (formattedDate === todayDate) {
            if (typeof updateRecentFeed === 'function') updateRecentFeed();
            if (typeof addRecordToTransactionsTable === 'function') addRecordToTransactionsTable(recordToRestore);
        }
        return true;
    }
    console.warn("Attempted to restore invalid index or record not found:", originalIndex);
    return false;
}


// --- Delete Logic (Revised/New) ---
function openDeleteConfirmModal(data) { // data is an array of indices from the displayed list
    // Set the global variable for confirmActualDeletion to use
    indicesToDelete = Array.isArray(data) ? data : [data];

    if (indicesToDelete.length === 0) {
        console.log("openDeleteConfirmModal called with empty data.");
        return; // Don't open if nothing is selected
    }

    const deleteModal = document.getElementById("deleteConfirmModal");
    if (!deleteModal) {
        console.error("Delete confirmation modal not found!");
        // Fallback: Maybe alert the user?
        // alert("Error: Delete confirmation dialog is missing.");
        return;
    }

    // Update the modal title
    const modalTitleElement = deleteModal.querySelector(".modal-content h2"); // Adjust selector if needed
    if (modalTitleElement) {
        const count = indicesToDelete.length;
        if (count === 1) {
            modalTitleElement.textContent = "Are you sure you want to permanently remove this record?";
        } else {
            modalTitleElement.textContent = `Are you sure you want to permanently remove these records?`;
        }
    } else {
        console.warn("Could not find title element in delete confirmation modal.");
    }

    deleteModal.style.display = "flex"; // Or "block", depending on your modal's CSS
}
function closeDeleteConfirmModal() {
    const deleteModal = document.getElementById("deleteConfirmModal");
    if (deleteModal) {
        deleteModal.style.display = "none";
    }
    indicesToDelete = []; // Clear the indices after closing
}

function handleDeleteSelectedRecords() {
    const selectedOriginalIndices = [];
    // Select checkboxes that are checked AND belong to a visible row (important if filtering is applied)
    document.querySelectorAll(".recordCheckbox:checked").forEach(checkbox => {
        // Check if the parent row is currently displayed
        const parentRow = checkbox.closest('tr');
        if (parentRow && (!parentRow.style.display || parentRow.style.display !== 'none')) {
             selectedOriginalIndices.push(parseInt(checkbox.dataset.originalIndex));
        }
    });

    if (selectedOriginalIndices.length === 0) {
        // alert("Please select records to delete."); // Optional feedback
        return;
    }
    // Pass the array of indices corresponding to currentDisplayableBackupRecords
    openDeleteConfirmModal(selectedOriginalIndices);
}

function confirmActualDeletion() {
    // indicesToDelete should be populated by openDeleteConfirmModal based on selections
    if (!indicesToDelete || indicesToDelete.length === 0) {
        console.log("No indices marked for deletion.");
        closeDeleteConfirmModal();
        return;
    }

    // Get the details of the records selected in the UI
    // using the indices relative to the currentDisplayableBackupRecords array.
    let recordsToRemoveDetails = [];
    indicesToDelete.forEach(displayIndex => {
        // Ensure displayIndex is valid for the currently displayed records
        if (displayIndex >= 0 && displayIndex < currentDisplayableBackupRecords.length) {
            recordsToRemoveDetails.push(currentDisplayableBackupRecords[displayIndex]);
        } else {
            console.warn("confirmActualDeletion: Invalid displayIndex found:", displayIndex, "Max valid index:", currentDisplayableBackupRecords.length - 1);
        }
    });

    if (recordsToRemoveDetails.length === 0) {
        console.error("Could not identify any valid record details from the selected indices. Aborting deletion.");
        closeDeleteConfirmModal();
        // Optional: Maybe refresh the table if the state seems inconsistent
        // refreshBackupTable();
        return;
    }

    // --- DETAILED LOGGING STARTS ---
    console.clear(); // Clear console for cleaner debugging output for this specific run
    console.log("--- DEBUGGING ARCHIVE DELETION PROCESS ---");
    console.log("Number of records selected by checkboxes (recordsToRemoveDetails):", recordsToRemoveDetails.length);

    const recordsToDeleteIdentifiers = new Set();

    console.log("\n--- STEP 1: Generating Keys for SELECTED Records (from UI selection) ---");
    recordsToRemoveDetails.forEach((rtd, i) => {
        console.log(`\nSelected Record (rtd) #${i + 1} Details:`);
        console.log("  Raw rtd object:", JSON.parse(JSON.stringify(rtd))); // Deep copy for clean logging

        // Use the same key fields as in managerecord.js, ensure they exist in backup records
        const rtdDateForKey = formatDate(rtd.date);
        const rtdDateRemovedForKey = formatDate(rtd.dateRemoved); // Include dateRemoved if it's part of uniqueness

        // Construct the key from multiple fields for robustness
        const rtdKeyParts = [
            `name:${getKeyVal(rtd.name)}`, `role:${getKeyVal(rtd.role)}`, `date:${getKeyVal(rtdDateForKey)}`, `timeIn:${getKeyVal(rtd.timeIn)}`,
            `schoolid:${getKeyVal(rtd.schoolid)}`, `actions:${getKeyVal(rtd.actions)}`, `course:${getKeyVal(rtd.course)}`, `contact:${getKeyVal(rtd.contact)}`,
            `age:${getKeyVal(rtd.age)}`, `sex:${getKeyVal(rtd.sex)}`, `reason:${getKeyVal(rtd.reason)}`, `healthIssue:${getKeyVal(rtd.healthIssue)}`,
            `handledBy:${getKeyVal(rtd.handledBy)}`, `timeOut:${getKeyVal(rtd.timeOut)}`, `dateRemoved:${getKeyVal(rtdDateRemovedForKey)}` // Add dateRemoved to key
        ];
        const rtdKey = rtdKeyParts.join('|');
        recordsToDeleteIdentifiers.add(rtdKey);
        console.log(`  Generated Key (rtd #${i + 1}): ${rtdKey}`);
    });
    console.log("\nSet of keys to delete (from rtd objects):", recordsToDeleteIdentifiers);
    // --- END OF STEP 1 LOGGING ---


    // Fetch the full, current list from localStorage
    const allBackupRecordsFromStorage = JSON.parse(localStorage.getItem("backupRestore")) || [];
    console.log("\n--- STEP 2: Comparing Keys against ALL Records in localStorage['backupRestore'] ---");
    console.log("Total records in localStorage:", allBackupRecordsFromStorage.length);


    const updatedBackupRecords = []; // This will hold the records to KEEP
    let deletedCount = 0;

    allBackupRecordsFromStorage.forEach((recordInStorage, i) => {
        console.log(`\nProcessing localStorage Record #${i + 1}:`);
        console.log("  Raw lsRecord object:", JSON.parse(JSON.stringify(recordInStorage)));

        // Generate the key for the record from localStorage using the same logic
        const lsDateForKey = formatDate(recordInStorage.date);
        const lsDateRemovedForKey = formatDate(recordInStorage.dateRemoved);

        const lsKeyParts = [
             `name:${getKeyVal(recordInStorage.name)}`, `role:${getKeyVal(recordInStorage.role)}`, `date:${getKeyVal(lsDateForKey)}`, `timeIn:${getKeyVal(recordInStorage.timeIn)}`,
            `schoolid:${getKeyVal(recordInStorage.schoolid)}`, `actions:${getKeyVal(recordInStorage.actions)}`, `course:${getKeyVal(recordInStorage.course)}`, `contact:${getKeyVal(recordInStorage.contact)}`,
            `age:${getKeyVal(recordInStorage.age)}`, `sex:${getKeyVal(recordInStorage.sex)}`, `reason:${getKeyVal(recordInStorage.reason)}`, `healthIssue:${getKeyVal(recordInStorage.healthIssue)}`,
            `handledBy:${getKeyVal(recordInStorage.handledBy)}`, `timeOut:${getKeyVal(recordInStorage.timeOut)}`, `dateRemoved:${getKeyVal(lsDateRemovedForKey)}`
        ];
        const lsKey = lsKeyParts.join('|');
        console.log(`  Generated Key (lsRecord #${i + 1}): ${lsKey}`);

        // Check if this record's key is in the set of keys to delete
        if (recordsToDeleteIdentifiers.has(lsKey)) {
            console.log("  ✅ MATCH FOUND! Record will be permanently deleted (skipped from updated list).");
            deletedCount++;
        } else {
            console.log("  ❌ NO MATCH. Record will be kept.");
            updatedBackupRecords.push(recordInStorage); // Keep this record
        }
    });
    // --- END OF STEP 2 LOGGING ---

    console.log("\n--- STEP 3: Results of Deletion Attempt ---");
    console.log("Number of records identified for removal from localStorage:", deletedCount);
    console.log("Number of records remaining (to be saved back):", updatedBackupRecords.length);

    // Only update localStorage if records were actually identified for deletion based on keys
    if (deletedCount > 0) {
        localStorage.setItem("backupRestore", JSON.stringify(updatedBackupRecords));
        console.log("LocalStorage 'backupRestore' updated successfully.");
         // Optional: User feedback
         // alert(`${deletedCount} record(s) permanently deleted from archive.`);
    } else if (recordsToRemoveDetails.length > 0) {
         // This indicates a mismatch between UI selection and localStorage data
         console.error("CRITICAL: Records were selected from UI, but NO matching keys found in localStorage 'backupRestore'. Review key generation differences in logs above. No data was changed in localStorage.");
         // Optional: User feedback
         // alert("Could not find the selected records in the archive storage. They may have already been removed or data has changed.");
    } else {
         // This case shouldn't happen if initial checks pass, but good for completeness
         console.log("No records were selected or no deletions were performed.");
    }

    closeDeleteConfirmModal(); // Close the modal window
    refreshBackupTable();      // Refresh the UI table with the updated data
    // Update button states after refresh (refreshBackupTable should call this)
    // toggleControls(); // Or whatever function updates button/checkbox states
}

// --- Individual Row Button Listeners ---
function addIndividualRowButtonListeners() {
    addRestoreButtonListeners(); // MODIFIED to use modal
    addDeleteButtonListeners();  // Assumed to use its own modal or direct action
    addViewArchivedRecordButtonListeners();
}

function addRestoreButtonListeners() {
  const restoreButtons = document.querySelectorAll(".button-restore");
  restoreButtons.forEach(button => {
      // Clone and replace to remove old listeners, then add new one
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      newButton.addEventListener("click", function () {
          const originalIndex = parseInt(this.getAttribute("data-index"));
          openRestoreConfirmModal(originalIndex); // Open modal for single restore too
      });
  });
}

function addDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll(".button-delete");
    deleteButtons.forEach(button => {
        // Clone and replace to remove old listeners, then add new one
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener("click", function() {
            const originalIndex = parseInt(this.getAttribute("data-index"));
            openDeleteConfirmModal(originalIndex); // Pass single index
        });
    });
}

// --- Utility functions ---
// Helper function to format the date consistently (YYYY-MM-DD)
function formatDate(dateInput) {
    if (!dateInput) return "N/A";

    // If dateInput is already a "YYYY-MM-DD" string from your localStorage
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const parts = dateInput.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10); // Month is 1-12
        const day = parseInt(parts[2], 10);   // Day is 1-31

        // Basic validation to ensure it's a plausible date string
        if (year > 1900 && year < 3000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            // To be fully sure, create a date and check if it's valid and matches
            const testDate = new Date(Date.UTC(year, month - 1, day)); // Use UTC to avoid local timezone interpretation
            if (testDate.getUTCFullYear() === year && testDate.getUTCMonth() === month - 1 && testDate.getUTCDate() === day) {
                return dateInput; // It's a valid YYYY-MM-DD string, return as is
            }
        }
    }

    // Fallback for actual Date objects or other parsable date strings
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
        // console.warn("formatDate encountered an invalid date:", dateInput);
        return "N/A"; // Invalid date
    }

    // For Date objects, format using their local date parts
    const year = d.getFullYear();
    const monthVal = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    return `${year}-${monthVal}-${dayVal}`;
}


// Helper to get a standardized string value for key generation, handling null/undefined
const getKeyVal = (val) => (val === null || val === undefined ? "" : String(val).trim());
function getHourKey(timeIn) {
    if (!timeIn) return "Unknown";
    const timeParts = timeIn.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (timeParts) {
        let hour = parseInt(timeParts[1]);
        const ampm = timeParts[3].toLowerCase();

        if (ampm === "pm" && hour !== 12) hour += 12;
        if (ampm === "am" && hour === 12) hour = 0; // Midnight

        const displayHour = (hour % 12 === 0) ? 12 : hour % 12;
        return displayHour + ampm;
    }
    return "Unknown";
}

function addViewArchivedRecordButtonListeners() {
    const viewButtons = document.querySelectorAll(".button-view");
    viewButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener("click", function() {
            const originalIndex = parseInt(this.getAttribute("data-index"));
            viewArchivedRecordDetails(originalIndex); // Call the new/adapted function
        });
    });
}
function openViewArchivedRecordModal(originalIndex) {
    if (originalIndex < 0 || originalIndex >= currentDisplayableBackupRecords.length) {
        console.error("Invalid index for viewing archived record:", originalIndex);
        alert("Error: Could not find record to view.");
        return;
    }
    const recordToView = currentDisplayableBackupRecords[originalIndex];

    const modal = document.getElementById("viewArchivedRecordModal");
    if (!modal) {
        console.error("Modal with ID 'viewArchivedRecordModal' not found!");
        alert("Error: View modal is missing.");
        return;
    }

    // Populate the modal
    document.getElementById("archivedViewName").textContent = recordToView.name || "N/A";
    document.getElementById("archivedViewRole").textContent = recordToView.role || "N/A";
    document.getElementById("archivedViewActions").textContent = recordToView.actions || "N/A";
    document.getElementById("archivedViewDate").textContent = recordToView.date ? formatDate(recordToView.date) : "N/A";
    // ... populate any other fields in your #viewArchivedRecordModal ...

    modal.style.display = "flex"; // Or "block", depending on your CSS

    // Handle closing the modal
    const closeBtn = document.getElementById("closeViewArchivedModalBtn");
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
        }
    }
    // Optional: Close if clicking outside the modal content
    modal.onclick = function(event) { // Changed from window.onclick to modal.onclick to be more specific
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}


function viewArchivedRecordDetails(originalIndex) {
    if (originalIndex < 0 || originalIndex >= currentDisplayableBackupRecords.length) {
        console.error("Invalid index for viewing archived record:", originalIndex);
        alert("Error: Could not find record to view.");
        return;
    }
    const record = currentDisplayableBackupRecords[originalIndex]; // Get the specific archived record

    // Get the modal element
    const viewArchivedModal = document.getElementById("viewArchivedRecordModal");
    if (!viewArchivedModal) {
        console.error("Modal with ID 'viewArchivedRecordModal' not found!");
        alert("Error: View modal is missing.");
        return;
    }

    // Populate the modal fields (using the IDs from your new modal)
    // Ensure all these elements exist in your viewArchivedRecordModal HTML
    document.getElementById("archivedViewName").value = record.name || "";
    document.getElementById("archivedViewRole").value = record.role || "";
    document.getElementById("archivedViewCourse").value = record.course || ""; // Archived records may not have this
    document.getElementById("archivedViewSchoolid").value = record.schoolid || ""; // Or this
    document.getElementById("archivedViewContact").value = record.contact || "";
    document.getElementById("archivedViewAge").value = record.age || "";
    document.getElementById("archivedViewSex").value = record.sex || "";
    document.getElementById("archivedViewTimeIn").value = record.timeIn || "";
    document.getElementById("archivedViewTimeOut").value = record.timeOut || "";

    // For reason, if 'healthIssue' is the "Other" value
    let displayReason = record.reason || "";
    if (record.reason === "Other Health Issue" && record.healthIssue) {
        displayReason = record.healthIssue;
    }
    document.getElementById("archivedViewReason").value = displayReason;

    document.getElementById("archivedViewActionTaken").value = record.actions || "";
    document.getElementById("archivedViewHandledBy").value = record.handledBy || "";
    document.getElementById("archivedViewDateArchived").value = record.date ? formatDate(record.date) : ""; // The date it was archived/occurred
    document.getElementById("archivedViewDateRemoved").value = record.dateRemoved ? formatDate(record.dateRemoved) : "";

    viewArchivedModal.style.display = "flex"; // Or "block"

    // Handle closing the modal
    const closeBtn = document.getElementById("closeViewArchivedModalBtn");
    if (closeBtn) {
        closeBtn.onclick = function() {
            viewArchivedModal.style.display = "none";
        }
    }
    viewArchivedModal.onclick = function(event) {
        if (event.target == viewArchivedModal) {
            viewArchivedModal.style.display = "none";
        }
    }
}
function applyFiltersAndRenderRecords() {
    const startDateString = document.getElementById("startDate").value; // Format: "YYYY-MM-DD" or ""
    const endDateString = document.getElementById("endDate").value;   // Format: "YYYY-MM-DD" or ""
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();

    console.log("--- applyFiltersAndRenderRecords ---");
    console.log("Inputs - Start:", startDateString, "End:", endDateString, "Search:", searchTerm);

    // Start with the full set potentially filtered by the 30-day rule
    let recordsToDisplay = [...currentDisplayableBackupRecords];
    console.log("Initial records count:", recordsToDisplay.length);
     // console.log("Initial records list:", JSON.stringify(currentDisplayableBackupRecords)); // Uncomment for detailed view

    // 1. Date Range Filtering (based on record.date which is "Date Visit")
    if (startDateString) {
         console.log(`Filtering by Start Date >= ${startDateString}`);
        recordsToDisplay = recordsToDisplay.filter(record => {
            const recordDateVisitStr = record.date ? formatDate(record.date) : "";
             // console.log(` Record: ${record.name}, Raw Date: ${record.date}, Formatted Date: ${recordDateVisitStr}, Comparing >= ${startDateString}`); // Log comparison details
            if (recordDateVisitStr === "N/A" || !recordDateVisitStr) {
                return false; // Exclude records with invalid/missing visit dates
            }
            const keep = recordDateVisitStr >= startDateString;
            // console.log(` Keep? ${keep}`);
            return keep;
        });
         console.log("Count after start date filter:", recordsToDisplay.length);
    }

    if (endDateString) {
         console.log(`Filtering by End Date <= ${endDateString}`);
        recordsToDisplay = recordsToDisplay.filter(record => {
            const recordDateVisitStr = record.date ? formatDate(record.date) : "";
            // console.log(` Record: ${record.name}, Raw Date: ${record.date}, Formatted Date: ${recordDateVisitStr}, Comparing <= ${endDateString}`); // Log comparison details
            if (recordDateVisitStr === "N/A" || !recordDateVisitStr) {
                return false; // Exclude records with invalid/missing visit dates
            }
             const keep = recordDateVisitStr <= endDateString;
             // console.log(` Keep? ${keep}`);
            return keep;
        });
         console.log("Count after end date filter:", recordsToDisplay.length);
    }

    // 2. Search Term Filtering
    if (searchTerm) {
         console.log(`Filtering by Search Term: "${searchTerm}"`);
        recordsToDisplay = recordsToDisplay.filter(record => {
            const name = (record.name || "").toLowerCase();
            const role = (record.role || "").toLowerCase();
            const actions = (record.actions || "").toLowerCase();
            const dateVisitSearchStr = record.date ? formatDate(record.date).toLowerCase() : "";
            const dateRemovedSearchStr = record.dateRemoved ? formatDate(record.dateRemoved).toLowerCase() : "";

             const found = name.includes(searchTerm) ||
                   role.includes(searchTerm) ||
                   actions.includes(searchTerm) ||
                   dateVisitSearchStr.includes(searchTerm) ||
                   dateRemovedSearchStr.includes(searchTerm);
             // if (found) console.log(` Search found in record: ${record.name}`);
            return found;
        });
         console.log("Count after search term filter:", recordsToDisplay.length);
    }
     console.log("--- Rendering filtered records ---");
    renderFilteredBackupRecords(recordsToDisplay);
}
