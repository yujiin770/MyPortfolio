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
document.addEventListener("DOMContentLoaded", function () { 
    loadRecordsFromStorage();
});

// Modal Elements
const viewModal = document.getElementById("viewRecordModal");
const closeViewBtn = document.getElementById("closeViewModal");

const editModal = document.getElementById("editRecordModal");
const closeEditBtn = document.getElementById("closeEditModal");
const saveEditBtn = document.getElementById("saveEditBtn");

const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const closeDeleteConfirmBtn = document.getElementById("closeDeleteConfirmModal");
const deleteYesBtn = document.getElementById("deleteYesBtn");
const deleteNoBtn = document.getElementById("deleteNoBtn");

const recordsTable = document.getElementById("recordsTable").getElementsByTagName('tbody')[0];


// Close modals
closeViewBtn.onclick = function () {
    viewModal.style.display = "none";
};

closeEditBtn.onclick = function () {
    editModal.style.display = "none";
};

closeDeleteConfirmBtn.onclick = function () {
    deleteConfirmModal.style.display = "none";
};

window.onclick = function (event) {
    if (event.target == viewModal) {
        viewModal.style.display = "none";
    }
    if (event.target == editModal) {
        editModal.style.display = "none";
    }
    if (event.target == deleteConfirmModal) {
        deleteConfirmModal.style.display = "none";
    }
};

// Load Records from localStorage
function loadRecordsFromStorage() {
    const records = JSON.parse(localStorage.getItem("manageRecords")) || [];
    const reasonCounts = JSON.parse(localStorage.getItem("reasonCounts")) || {};

    const currentDate = new Date().toLocaleDateString();

    // Sort records by date (in descending order)
    records.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
       
        return 0;
    });



            
            

    // --- Rebuild visitStats from scratch based on current manageRecords ---
    const visitStats = {};
    records.forEach(record => {
        if (record.date) {
            visitStats[record.date] = (visitStats[record.date] || 0) + 1;          

        }
    });
    localStorage.setItem("visitStats", JSON.stringify(visitStats));

    // Clear the previous table data
    recordsTable.innerHTML = '';

    // Loop through sorted records to populate the table
    records.forEach((record, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" class="recordCheckbox" data-index="${index}"></td>
            <td>${record.name}</td>
            <td>${record.role}</td>
            <td>${record.actions}</td>
            <td>${record.date}</td>
            <td>
                <button class="button-view" data-index="${index}">View</button>
                <button class="button-edit" data-index="${index}">Edit</button>
            </td>
        `;
        recordsTable.appendChild(row);
    });

    updateDailyCounts(currentDate, reasonCounts);
    addEventListenersToButtons();
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    filterRowsByDate(); // Apply date filters which also update checkbox states
    toggleControls();  
}



function addEventListenersToButtons() {
    document.querySelectorAll('.button-view').forEach(button => {
        button.onclick = () => {
            const index = button.getAttribute('data-index');
            viewRecord(index);
        };
    });

    document.querySelectorAll('.button-edit').forEach(button => {
        button.onclick = () => {
            const index = button.getAttribute('data-index');
            editRecord(index);
        };
    });

    document.querySelectorAll('.button-delete').forEach(button => {
        button.onclick = () => {
            const index = button.getAttribute('data-index');
            confirmDeleteRecord(index);
        };
    });
}


// Update the daily student and staff counts, including reason for visit counts and visit times
function updateDailyCounts(currentDate, reasonCounts) {
    const records = JSON.parse(localStorage.getItem("manageRecords")) || [];
    
    // Initialize manually reason counters
    let Headachecount = 0;
    let Stomachachecount = 0;
    let Dizzinesscount = 0;
    let Fevercount = 0;
    let Coughcount = 0;
    let ColdsCount = 0;
    let sorethroatcount = 0;
    let Toothachecount = 0;
    let MenstrualcrampsCount = 0;
    let MinorcutorwoundCount = 0;
    let MusclepainBodypainCount = 0;
    let SprainorminorinjuryCount = 0;
    let SkinrashorirritationCount = 0;
    let AllergicreactionmildCount = 0;
    let FollowupcheckCount = 0;
    let MedicationrequestCount = 0;
    let NauseaorvomitingCount = 0;
    let EyeirritationCount = 0;
    let EarpainCount = 0;

    // Initialize role counters
    let studentCount = 0;
    let staffCount = 0;
    let todayTimeVisits = {}; // This will hold the hourly time visits

    // Initialize hour counter
    let hourlyCount = {
        "6am": 0,
        "7am": 0,
        "8am": 0,
        "9am": 0,
        "10am": 0,
        "11am": 0,
        "12pm": 0,
        "1pm": 0,
        "2pm": 0,
        "3pm": 0,
        "4pm": 0,
        "5pm": 0,
        "6pm": 0,
        "7pm": 0,
        "8pm": 0,
        "9pm": 0,
        "10pm": 0,
        "11pm": 0,
        "12am": 0,
        "1am": 0,
        "2am": 0,
        "3am": 0,
        "4am": 0,
        "5am": 0
    };


    const todayRecords = records.filter(record => record.date === currentDate);

    todayRecords.forEach(record => {
        if (record.role === 'Student') studentCount++;
        if (record.role === 'Staff') staffCount++;

        const reason = record.reason;
        // Increment the reason counters manually
        if (record.reason === "Headache") Headachecount++;
        if (record.reason === "Stomachache") Stomachachecount++;
        if (record.reason === "Dizziness") Dizzinesscount++;
        if (record.reason === "Fever") Fevercount++;
        if (record.reason === "Cough") Coughcount++;
        if (record.reason === "Colds") ColdsCount++;
        if (record.reason === "sorethroat") sorethroatcount++;
        if (record.reason === "Toothache") Toothachecount++;
        if (record.reason === "Menstrualcramps") MenstrualcrampsCount++;
        if (record.reason === "Minorcutorwound") MinorcutorwoundCount++;
        if (record.reason === "MusclepainBodypain") MusclepainBodypainCount++;
        if (record.reason === "Sprainorminorinjury") SprainorminorinjuryCount++;
        if (record.reason === "Skinrashorirritation") SkinrashorirritationCount++;
        if (record.reason === "Allergicreactionmild") AllergicreactionmildCount++;
        if (record.reason === "Followupcheck") FollowupcheckCount++;
        if (record.reason === "Medicationrequest") MedicationrequestCount++;
        if (record.reason === "Nauseaorvomiting") NauseaorvomitingCount++;
        if (record.reason === "Eyeirritation") EyeirritationCount++;
        if (record.reason === "Earpain") EarpainCount++;

        if (record.timeIn) {
            todayTimeVisits[record.timeIn] = (todayTimeVisits[record.timeIn] || 0) + 1;
        }


    });

    // Save the counts in the dailyCounts object for later use




    // Save to localStorage
    localStorage.setItem("hourlycounts", JSON.stringify(hourlyCount));
    localStorage.setItem("reasonCounts", JSON.stringify(reasonCounts));
}




// Display Record in View Modal
// In ../Js/managerecord.js

// ... (other parts of your managerecord.js) ...

// Display Record in View Modal
function viewRecord(index) {
    // Retrieve records from localStorage.
    // The records are already sorted by date (descending) when loadRecordsFromStorage runs.
    // So, the 'index' here corresponds to the index in that sorted list.
    let records = JSON.parse(localStorage.getItem("manageRecords")) || [];
     // Re-sort here to ensure consistency with what's displayed in the table,
    // as the index comes from the displayed table row.
    records.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        return 0;
    });

    const record = records[index];

    if (!record) {
        console.error("Record not found at index:", index);
        // Optionally, display an error to the user or close the modal
        viewModal.style.display = "none";
        return;
    }


    document.getElementById("viewName").value = record.name || "N/A";
    document.getElementById("viewRole").value = record.role || "N/A";
    document.getElementById("viewCourse").value = record.course || "N/A"; // Display N/A if course is empty/undefined
    document.getElementById("viewSchoolid").value = record.schoolid || "N/A"; // Display N/A if schoolid is empty/undefined

    // --- Format Contact for View Modal ---
    let displayContact = "N/A"; // Default to N/A
    const storedContact = record.contact;

    if (storedContact) {
        if (storedContact.startsWith("+63")) {
            displayContact = storedContact; // Already has +63, display as is
        } else if (storedContact.length === 10 && storedContact.startsWith("9")) {
            displayContact = "+63" + storedContact; // Prepend +63 to "9XXXXXXXXX"
        } else if (storedContact.startsWith("09") && storedContact.length === 11) {
            displayContact = "+63" + storedContact.substring(1); // Convert "09..." to "+639..."
        } else {
            displayContact = storedContact; // If in another format, display as is (or N/A if truly invalid)
        }
    }
    document.getElementById("viewContact").value = displayContact;
    // --- End of Contact Formatting ---

    document.getElementById("viewAge").value = record.age || "N/A";
    document.getElementById("viewSex").value = record.sex || "N/A";
    document.getElementById("viewTimeIn").value = record.timeIn || "N/A";
    document.getElementById("viewTimeOut").value = record.timeOut || "N/A";

    // Handle reason display: if "Other Health Issue" was selected, show the custom healthIssue text.
    let reasonForDisplay = record.reason || "N/A";
    if (record.reason === "Other Health Issue" && record.healthIssue) {
        reasonForDisplay = record.healthIssue;
    } else if (record.reason === "Other Health Issue" && !record.healthIssue) {
        // If reason is "Other..." but healthIssue field is empty, show "Other Health Issue"
        reasonForDisplay = "Other Health Issue";
    }
    document.getElementById("viewReason").value = reasonForDisplay;

    document.getElementById("viewActionTaken").value = record.actions || "N/A";
    document.getElementById("viewHandledBy").value = record.handledBy || "N/A";

    // Store the visit date on the export button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn && record.date) {
        exportBtn.setAttribute("data-visit-date", record.date);
    } else if (exportBtn) {
        exportBtn.removeAttribute("data-visit-date"); // Clear if no date
    }

    viewModal.style.display = "block";
}

// ... (rest of your managerecord.js) ...


// Open Edit Modal with the current record's data
function editRecord(index) {
    const records = JSON.parse(localStorage.getItem("manageRecords")) || [];
    // Ensure transactionsData is fetched if you're updating it too.
    const transactionsData = JSON.parse(localStorage.getItem("transactions")) || [];
    const record = records[index]; // This is the original record data

    const editForm = document.getElementById("editForm");
    const editContactInput = document.getElementById("editContact");
    const editContactValidationMsg = document.getElementById("edit-contact-validation-msg");

    // Clear previous validation messages for contact when modal opens
    if (editContactValidationMsg) {
        editContactValidationMsg.textContent = '';
        editContactValidationMsg.style.display = 'none';
    }

    // Set common form values
    document.getElementById("editName").value = record.name;
    document.getElementById("editRole").value = record.role;
    document.getElementById("editCourse").value = record.course || "";
    document.getElementById("editSchoolid").value = record.schoolid || "";
    document.getElementById("editAge").value = record.age;
    document.getElementById("editSex").value = record.sex;
    document.getElementById("editTimeIn").value = record.timeIn;
    document.getElementById("editTimeOut").value = record.timeOut;
    document.getElementById("editReason").value = record.reason;
    document.getElementById("editActionTaken").value = record.actions;
    document.getElementById("editHandledBy").value = record.handledBy;

    // --- Handle Contact Number Loading for Edit Modal (copied & adapted from dailytransaction) ---
    let displayContactPart = "";
    const rawStoredContact = record.contact || "";

    if (rawStoredContact.startsWith("+63")) {
        displayContactPart = rawStoredContact.substring(3); // Get "9123456789"
    } else if (rawStoredContact.startsWith("09") && rawStoredContact.length === 11) {
        displayContactPart = rawStoredContact.substring(1); // Get "9123456789" from "09123456789"
    } else if (rawStoredContact.length === 10 && rawStoredContact.startsWith("9")) {
        displayContactPart = rawStoredContact; // Already "9123456789"
    } else {
        // Attempt to clean up or default if format is unexpected
        displayContactPart = rawStoredContact.replace(/\D/g, ''); // Remove non-digits
        if (displayContactPart.startsWith("63") && displayContactPart.length === 12) { // Handle "639..."
            displayContactPart = displayContactPart.substring(2);
        }
        // Final check if it's 10 digits and starts with 9 for the input part
        if (!(displayContactPart.length === 10 && displayContactPart.startsWith("9"))) {
            displayContactPart = ""; // Clear if not valid for the 10-digit part
        }
    }
    editContactInput.value = displayContactPart; // Set only the 10-digit part into the input field

    handleEditRoleChange(record.role); // Make sure this function is defined and works
    editModal.style.display = "block";

    // saveEditBtn is already global or defined earlier in your managerecord.js
    saveEditBtn.onclick = function () {
        // --- CONTACT VALIDATION FOR EDIT MODAL (copied & adapted from dailytransaction) ---
        const contactMainValue = editContactInput.value.trim(); // This is the 10-digit part

        // Hide validation message initially for this save attempt
        if (editContactValidationMsg) {
            editContactValidationMsg.textContent = '';
            editContactValidationMsg.style.display = 'none';
        }

        let isContactValid = true;
        // Determine if contact is mandatory. Example: mandatory for Students, optional for Staff.
        // You can adjust this rule. If always mandatory, remove the role check.
        const isContactMandatory = (document.getElementById("editRole").value === "Student"); // Example rule

        if (isContactMandatory && !contactMainValue) { // If mandatory and empty
            if (editContactValidationMsg) {
                editContactValidationMsg.textContent = "Contact number is required.";
                editContactValidationMsg.style.display = 'block';
            }
            if (editContactInput) editContactInput.focus();
            isContactValid = false;
        } else if (contactMainValue) { // If not empty, validate format
            if (contactMainValue.length !== 10) {
                if (editContactValidationMsg) {
                    editContactValidationMsg.textContent = "Please enter exactly 10 digits.";
                    editContactValidationMsg.style.display = 'block';
                }
                if (editContactInput) editContactInput.focus();
                isContactValid = false;
            } else if (contactMainValue.charAt(0) !== '9') {
                if (editContactValidationMsg) {
                    editContactValidationMsg.textContent = "Mobile number must start with '9'.";
                    editContactValidationMsg.style.display = 'block';
                }
                if (editContactInput) {
                    // Consider if you want to clear: editContactInput.value = "";
                    editContactInput.focus();
                }
                isContactValid = false;
            }
        }
        // If contact is not mandatory and empty, isContactValid remains true.

        if (!isContactValid) {
            return; // Stop if contact validation failed
        }
        // --- END OF CONTACT VALIDATION ---

        // Proceed with other form validations if needed (e.g., using editForm.checkValidity())
        // For fields like name, age, etc., if they have `required` attribute.
        if (!editForm.checkValidity()) {
             editForm.reportValidity(); // Show HTML5 validation messages for other fields
             return;
        }


        // If all validations pass, construct the final contact number
        const finalContactToSave = contactMainValue ? "+63" + contactMainValue : "";

        const updatedRecord = {
            name: document.getElementById("editName").value,
            role: document.getElementById("editRole").value,
            course: document.getElementById("editCourse").disabled ? undefined : document.getElementById("editCourse").value,
            schoolid: document.getElementById("editSchoolid").disabled ? undefined : document.getElementById("editSchoolid").value,
            contact: finalContactToSave, // Use the validated and constructed full contact number
            age: document.getElementById("editAge").value,
            sex: document.getElementById("editSex").value,
            timeIn: document.getElementById("editTimeIn").value, // Original timeIn
            timeOut: document.getElementById("editTimeOut").value, // Original timeOut
            reason: document.getElementById("editReason").value,
            actions: document.getElementById("editActionTaken").value,
            handledBy: document.getElementById("editHandledBy").value, // Original handledBy
            date: record.date, // Preserve original date from the record being edited
        };

        records[index] = updatedRecord;
        localStorage.setItem("manageRecords", JSON.stringify(records));

        // Also update the corresponding record in 'transactions' if it exists
        // Match using key fields from the *original* record to find the correct transaction
        const transactionIndex = transactionsData.findIndex(t =>
            t.name === record.name &&       // Original name
            t.role === record.role &&       // Original role
            t.date === record.date &&       // Original date
            t.timeIn === record.timeIn &&   // Original timeIn
            // Optionally, add more fields from 'record' (the original state) for a truly unique match
            (t.schoolid === record.schoolid || (t.schoolid === undefined && record.schoolid === undefined)) &&
            (t.actions === record.actions)
        );

        if (transactionIndex !== -1) {
            // Update the found transaction by merging existing fields with updated ones
            transactionsData[transactionIndex] = {
                ...transactionsData[transactionIndex], // Preserve any fields not in updatedRecord
                ...updatedRecord                     // Overwrite with new values from the form
            };
            localStorage.setItem("transactions", JSON.stringify(transactionsData));
        }

        editModal.style.display = "none";
        loadRecordsFromStorage(); // Refresh the main table
    };
}

// ... (rest of your managerecord.js) ...


// NEW FUNCTION 🔥
function handleEditRoleChange(role) {
    const editCourse = document.getElementById("editCourse");
    const editSchoolid = document.getElementById("editSchoolid");

    if (role === "Student") {
        editCourse.disabled = false;
        editSchoolid.disabled = false;
    } else {
        editCourse.disabled = true;
        editCourse.value = "";
        editSchoolid.disabled = true;
        editSchoolid.value = "";
    }
}

// Confirmation delete function
function confirmDeleteRecord(index) {
    // Show confirmation modal
    deleteConfirmModal.style.display = "block";

    // When 'Yes' is clicked, move to backupRestore, delete from manageRecords, and close the modal
    deleteYesBtn.onclick = function () {
        moveToBackup(index);
        deleteRecord(index);
        deleteConfirmModal.style.display = "none"; // Close the modal after deletion
    };

    // When 'No' is clicked, just close the modal
    deleteNoBtn.onclick = function () {
        deleteConfirmModal.style.display = "none"; // Close the modal without deleting
    };
}

// Move the deleted record to 'backupRestore'
function moveToBackup(index) {
    let manageRecords = JSON.parse(localStorage.getItem("manageRecords")) || [];
    let backupRestore = JSON.parse(localStorage.getItem("backupRestore")) || [];

    if (manageRecords[index]) {
        const recordToBackup = { ...manageRecords[index] }; // Create a copy to avoid modifying original if needed elsewhere

        // --- ADD THIS LINE ---
        recordToBackup.dateRemoved = formatDate(new Date()); // Add the current date as dateRemoved

        backupRestore.push(recordToBackup);
        localStorage.setItem("backupRestore", JSON.stringify(backupRestore));
    }
}

function deleteRecord(index) {
    let manageRecords = JSON.parse(localStorage.getItem("manageRecords")) || [];
    let reasonCounts = JSON.parse(localStorage.getItem("reasonCounts")) || {};
    let dailyCount = JSON.parse(localStorage.getItem("dailyCount")) || {};  
    let visitStats = JSON.parse(localStorage.getItem("visitStats")) || {};
    let hourlyCounts = JSON.parse(localStorage.getItem("hourlyCounts")) || {};
    let otherCounts = JSON.parse(localStorage.getItem("otherCounts")) || {};

    if (manageRecords[index]) {
        const recordToDelete = manageRecords[index];
        const formattedDate = formatDate(recordToDelete.date);
        const recordDate = formattedDate; // ensure consistency across all stats
        
        // === REMOVE RECORD FROM manageRecords ===
        manageRecords.splice(index, 1);

        // === REMOVE RECORD FROM TRANSACTIONS ===
        let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        const transactionIndex = transactions.findIndex(record =>
            record.name === recordToDelete.name &&
            record.date === recordToDelete.date &&
            record.timeIn === recordToDelete.timeIn
        );
        if (transactionIndex !== -1) {
            transactions.splice(transactionIndex, 1);
        }

        // 1. Decrement total visits for the day (visitStats)
        if (visitStats[recordDate] !== undefined) {
            visitStats[recordDate] = Math.max(visitStats[recordDate] - 1, 0);
        }

        // 2. Decrement the student/staff counts in dailyCount
        if (!dailyCount[formattedDate]) {
            dailyCount[formattedDate] = { student: 0, staff: 0 };
        }

        const role = (recordToDelete.role || "").toLowerCase().trim();
        if (role === "student" && dailyCount[formattedDate].student !== undefined) {
            dailyCount[formattedDate].student = Math.max(dailyCount[formattedDate].student - 1, 0);
        }
        if (role === "staff" && dailyCount[formattedDate].staff !== undefined) {
            dailyCount[formattedDate].staff = Math.max(dailyCount[formattedDate].staff - 1, 0);
        }

        // 3. Decrement reason counts (reasonCounts)
        let reason = recordToDelete.reason || "Other Health Issue";
        if (!reasonCounts[formattedDate]) {
            reasonCounts[formattedDate] = {};
        }
        if (reasonCounts[formattedDate][reason] !== undefined) {
            reasonCounts[formattedDate][reason] = Math.max(reasonCounts[formattedDate][reason] - 1, 0);
        }

        // 4. Decrement hourly counts (hourlyCounts)
        if (!hourlyCounts[formattedDate]) {
            hourlyCounts[formattedDate] = {};
        }

        if (recordToDelete.timeIn) {
            const hourKey = getHourKey(recordToDelete.timeIn);
            if (hourlyCounts[formattedDate][hourKey] !== undefined) {
                hourlyCounts[formattedDate][hourKey] = Math.max(hourlyCounts[formattedDate][hourKey] - 1, 0);
            }
        }

        // 5. Decrement custom health issue in otherCounts
        const healthIssue = recordToDelete.healthIssue || "";
        if (healthIssue && healthIssue.trim() !== "") {
            if (otherCounts[formattedDate] && otherCounts[formattedDate][healthIssue] !== undefined) {
                otherCounts[formattedDate][healthIssue] -= 1;
        
                if (otherCounts[formattedDate][healthIssue] <= 0) {
                    // ⏳ Move to backupRestore before deleting
                    const backupRestore = JSON.parse(localStorage.getItem("backupRestore")) || {};
                    if (!backupRestore[formattedDate]) {
                        backupRestore[formattedDate] = {};
                    }
                    backupRestore[formattedDate][healthIssue] = 0;
        
                    localStorage.setItem("backupRestore", JSON.stringify(backupRestore));
        
                    // 🗑️ Then delete the key from otherCounts
                    delete otherCounts[formattedDate][healthIssue];
                }
        
                // 🧹 Remove the date if it's now empty
                if (Object.keys(otherCounts[formattedDate]).length === 0) {
                    delete otherCounts[formattedDate];
                }
            }
        
            localStorage.setItem("otherCounts", JSON.stringify(otherCounts));
        }
        
        

        // === UPDATE LOCAL STORAGE ===
        localStorage.setItem("manageRecords", JSON.stringify(manageRecords));
        localStorage.setItem("transactions", JSON.stringify(transactions));
        localStorage.setItem("visitStats", JSON.stringify(visitStats));
        localStorage.setItem("dailyCount", JSON.stringify(dailyCount));  
        localStorage.setItem("reasonCounts", JSON.stringify(reasonCounts));
        localStorage.setItem("hourlyCounts", JSON.stringify(hourlyCounts));
        localStorage.setItem("otherCounts", JSON.stringify(otherCounts));

        console.log("After deletion:");
        console.log("dailyCount:", dailyCount);

        loadRecordsFromStorage(); // Refresh table or UI
    }
}


// Helper function to format the date consistently as MM/DD/YYYY
function formatDate(dateInput) {
    if (!dateInput) return "N/A"; // Or throw an error, or return a specific invalid marker
    const d = new Date(dateInput);
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const parts = dateInput.split('-');
        // new Date(year, monthIndex, day)
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        if (isNaN(d.getTime())) return "N/A"; // Invalid date
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } else { // If it's a full Date object or other string
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return "N/A"; // Invalid date
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}






// Helper function to extract hour in AM/PM format
function getHourKey(timeIn) {
    const timeParts = timeIn.split(":");
    if (timeParts.length > 0) {
        let hour = parseInt(timeParts[0]); // 8
        let ampm = timeIn.toLowerCase().includes("pm") ? "pm" : "am";

        if (ampm === "pm" && hour !== 12) hour += 12;
        if (ampm === "am" && hour === 12) hour = 0;

        const hourStr = (hour % 12 === 0 ? 12 : hour % 12) + ampm;
        return hourStr;
    }
    return "Unknown"; // If time is invalid, return "Unknown"
}



// Function to format date as MM/DD/YYYY (ensure no duplicate formats)


// Render manage records (updated to include the delete button)
function renderTransactions(filtered = null) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear the existing rows

    const manageRecords = JSON.parse(localStorage.getItem("manageRecords")) || [];
    const data = filtered || manageRecords;

    data.forEach((t, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.name}</td>
            <td>${t.role}</td>
            <td>${t.course || ''}</td>
            <td>${t.schoolid}</td>
            <td>${t.contact}</td>
            <td>${t.age}</td>
            <td>${t.sex}</td>
            <td>${t.date}</td>
            <td>${t.reason || ''}</td>
            <td>${t.healthIssue || ''}</td>
            <td>${t.actions}</td>
            <td>${t.handledBy}</td>
            <td>${t.timeIn || ''}</td>
            <td>
                ${t.timeOut 
                    ? t.timeOut 
                    : `<button onclick="setTimeOut(${index})">Set Time Out</button>`}
            </td>
            <td><button onclick="deleteRecord(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
    updateTotalVisitsFromManageRecords()
}


// Add event listener for Export to DOCX

// Sync between tabs
window.addEventListener("storage", function (event) {
    if (event.key === "manageRecords" || event.key === "dailyCounts" || event.key === "timeVisits") {
        loadRecordsFromStorage();
    }
});

// Add event listener for Export to PDF (ensure this is within your DOMContentLoaded or similar setup)
document.addEventListener("DOMContentLoaded", () => {
    const exportBtn = document.getElementById("exportBtn");

    if (exportBtn) { // Ensure exportBtn exists before adding listener
        exportBtn.addEventListener("click", () => {
            exportRecordToPDF();
        });
    }

    function exportRecordToPDF() {
        const name = document.getElementById("viewName").value;
        const role = document.getElementById("viewRole").value;
        const course = document.getElementById("viewCourse").value;
        const schoolid = document.getElementById("viewSchoolid").value;
        const contact = document.getElementById("viewContact").value;
        const age = document.getElementById("viewAge").value;
        const sex = document.getElementById("viewSex").value;
        const timeIn = document.getElementById("viewTimeIn").value;
        const timeOut = document.getElementById("viewTimeOut").value;
        const reasonForVisit = document.getElementById("viewReason").value;
        const actionTaken = document.getElementById("viewActionTaken").value;
        const handledBy = document.getElementById("viewHandledBy").value;

        // Get the Print Date (current date)
        const today = new Date();
        const printDateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedPrintDate = today.toLocaleDateString('en-US', printDateOptions);

        // Get the Print Time (current time)
        const printTimeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedPrintTime = today.toLocaleTimeString('en-US', printTimeOptions);


        // Get the Visit Date from the button's data attribute
        let formattedVisitDate = "N/A";
        const exportButton = document.getElementById("exportBtn");
        if (exportButton) {
            const visitDateString = exportButton.getAttribute("data-visit-date");
            if (visitDateString && visitDateString !== "N/A") {
                // Assuming visitDateString is YYYY-MM-DD or a format Date can parse
                const parts = visitDateString.split('-');
                let visitDateObj;
                if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) { // Check if it looks like YYYY-MM-DD
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                    const day = parseInt(parts[2], 10);
                    visitDateObj = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues if date is just YYYY-MM-DD
                } else {
                     visitDateObj = new Date(visitDateString); // Try direct parsing for other formats
                }

                if (!isNaN(visitDateObj.getTime())) { // Check if date is valid
                    const visitDateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }; // Specify timezone if using UTC for consistency
                    formattedVisitDate = visitDateObj.toLocaleDateString('en-US', visitDateOptions);
                } else {
                     formattedVisitDate = visitDateString; // if parsing fails, show original string or "Invalid Date"
                }
            }
        }


        const content = document.createElement("div");

        content.innerHTML = `
            <style>
            body { /* Ensure body has some base font size if not inherited */
                font-family: Arial, sans-serif;
                font-size: 10pt; /* Base font size for the PDF */
            }
            table, th, td {
                border: 1px solid #000;
                border-collapse: collapse;
                box-sizing: border-box;
            }
            th, td {
                padding: 6px; /* Adjusted padding for a tighter look */
                text-align: left;
                font-size: 9pt; /* Slightly smaller for table content */
            }
            th {
                background-color: #f2f2f2;
            }
            .header-section { /* Combined date and title header */
                margin-bottom: 15px;
            }
            .date-info-container {
                display: flex;
                justify-content: space-between;
                font-size: 9pt; /* Smaller font for date info */
                margin-bottom: 10px;
            }
            .date-left-pdf {
                text-align: left;
            }
            .date-right-pdf {
                text-align: right;
            }
            .pdf-title {
                text-align: center;
                font-size: 12pt; /* Title font size */
                font-weight: bold;
                margin-bottom: 15px;
            }
            .signature-section {
                margin-top: 30px; /* Space above signatures */
                padding-top: 20px; /* Additional space for visual separation */
                font-size: 9pt;   /* Font size for signature lines */
            }
            .signature-block { /* To float to the right */
                float: right;
                width: 45%; /* Adjust as needed */
                text-align: left; /* Align text within the block to left */
            }
            .signature-line {
                margin-bottom: 25px; /* Increased space between signature lines */
                display: block;
            }
            .clear-float {
                clear: both;
            }
            </style>

            <div class="header-section">
                <div class="date-info-container">
                    <div class="date-left-pdf">
                        Print Date: ${formattedPrintDate}<br>
                        Time Created: ${formattedPrintTime}
                    </div>
                    <div class="date-right-pdf">
                        Visit Date: ${formattedVisitDate}
                    </div>
                </div>
                <div class="pdf-title">
                    Datamex College of St. Adeline School Clinic Visit Record
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="width: 30%;">Category</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Name</td><td>${name}</td></tr>
                    <tr><td>Role</td><td>${role}</td></tr>
                    <tr><td>Course</td><td>${course || ''}</td></tr>
                    <tr><td>School Id</td><td>${schoolid || ''}</td></tr>
                    <tr><td>Contact</td><td>${contact}</td></tr>
                    <tr><td>Age</td><td>${age}</td></tr>
                    <tr><td>Sex</td><td>${sex}</td></tr>
                    <tr><td>Time In</td><td>${timeIn}</td></tr>
                    <tr><td>Time Out</td><td>${timeOut}</td></tr>
                    <tr><td>Reason for Visit</td><td>${reasonForVisit}</td></tr>
                    <tr><td>Action Taken</td><td>${actionTaken}</td></tr>
                    <tr><td>Handled By</td><td>${handledBy}</td></tr>
                </tbody>
            </table>

            <div class="signature-section">
                <div class="signature-block">
                    <span class="signature-line">Approved by: _________________________</span>
                    <span class="signature-line">Created by:   _________________________</span>
                    <span class="signature-line">Received by: _________________________</span>
                </div>
                <div class="clear-float"></div>
            </div>
        `;

        // Export to PDF
        html2pdf()
            .from(content)
            .set({
                margin: [10, 10, 10, 10], // top, right, bottom, left margins in mm
                filename: `${name}_Clinic_Record.pdf`,
                html2canvas: { scale: 2, useCORS: true }, // Added useCORS, might help with some rendering
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Added pagebreak options
            })
            .save();
    }
});



// Add event listener to the search input
// Add event listener to the search input
document.getElementById("searchInput").addEventListener("input", function() {
    const searchTerm = this.value.trim().toLowerCase();
    searchTable(searchTerm); // This is the old function
});

// Search function to filter visible table rows based on search term
function searchTable(searchTerm) {
    const table = document.querySelector("table"); // Reference to the table
    const rows = table.querySelectorAll("tr"); // Get all rows in the table
    
    rows.forEach((row, index) => {
        if (index === 0) return; // Skip the header row

        const cells = row.getElementsByTagName("td");
        let rowContainsSearchTerm = false;

        for (let i = 0; i < cells.length; i++) { // This loop searches ALL cells
            const cellText = cells[i].textContent || cells[i].innerText;
            if (cellText.toLowerCase().includes(searchTerm)) {
                rowContainsSearchTerm = true;
                break; 
            }
        }

        if (rowContainsSearchTerm) {
            row.style.display = "";
        } else {
            row.style.display = "none"; // Hide row if no match
        }
    });
}
document.addEventListener("DOMContentLoaded", function () {
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

  });
document.addEventListener("DOMContentLoaded", () => {
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");


    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.addEventListener("change", () => {
            const checkboxes = document.querySelectorAll(".recordCheckbox:not(:disabled)"); // Only target enabled checkboxes
            checkboxes.forEach(cb => {
                if (!cb.closest('tr').style.display || cb.closest('tr').style.display !== 'none') { // Only if row is visible
                    cb.checked = selectAllCheckbox.checked;
                }
            });
            toggleControls();
        });
    }
    if (deleteSelectedBtn) {
        deleteSelectedBtn.disabled = true; // Initial state
    }
     document.addEventListener("change", (e) => {
        if (e.target.classList.contains("recordCheckbox")) {
            updateSelectAllVisualState(); // New function to update selectAll based on individual checks
            toggleControls();
        }
    });


    const dateInputs = [startDateInput, endDateInput];
    dateInputs.forEach(input => {
        input.addEventListener("input", () => {
            const bothFilled = startDateInput.value && endDateInput.value;
            deleteSelectedBtn.disabled = !bothFilled;

            if (bothFilled) {
                filterRowsByDate();
            } else {
                const rows = document.querySelectorAll("table tr");
                rows.forEach((row, index) => {
                    if (index === 0) return;
                    row.style.display = "";
                });
            }
                filterRowsByDate();
                toggleControls(); 

        });
    });
});
function toggleControls() {
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
    if (!deleteSelectedBtn) return;

    const checkedVisibleCheckboxes = document.querySelectorAll(".recordCheckbox:checked:not(:disabled)").length;
    // Also consider if any records are visible due to filtering for the selectAll state
    const anyVisibleRows = Array.from(document.querySelectorAll("#recordsTable tbody tr")).some(
        row => !row.querySelector('td[colspan="6"]') && (!row.style.display || row.style.display !== 'none')
    );

    deleteSelectedBtn.disabled = checkedVisibleCheckboxes === 0;

    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    if (selectAllCheckbox) {
         selectAllCheckbox.disabled = !anyVisibleRows; // Disable selectAll if no records are visible
    }
}

function updateSelectAllVisualState() {
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    if (!selectAllCheckbox) return;

    const allVisibleCheckboxes = Array.from(document.querySelectorAll(".recordCheckbox:not(:disabled)")).filter(
        cb => !cb.closest('tr').style.display || cb.closest('tr').style.display !== 'none'
    );
    const allVisibleAndChecked = allVisibleCheckboxes.length > 0 && allVisibleCheckboxes.every(cb => cb.checked);
    
    selectAllCheckbox.checked = allVisibleAndChecked;
}

// Filter rows based on selected date range
function filterRowsByDate() {
    const startDateValue = document.getElementById("startDate").value;
    const endDateValue = document.getElementById("endDate").value;
    const rows = document.querySelectorAll("#recordsTable tbody tr"); // More specific selector

    let hasVisibleRows = false;

    rows.forEach((row) => {
        // Skip "No records" row
        if (row.querySelector('td[colspan="6"]')) {
            // If it's the "no records" row, its display depends on whether other rows become visible
            return;
        }

        const checkbox = row.querySelector(".recordCheckbox");
        const dateCell = row.cells[4]; // Assuming date is the 5th cell (index 4)

        if (!dateCell || !checkbox) return;

        // If date filters are not set, show all rows
        if (!startDateValue && !endDateValue) {
            row.style.display = "";
            checkbox.disabled = false;
            hasVisibleRows = true;
            return;
        }

        const rowDateStr = dateCell.textContent.trim();
        if (!rowDateStr || rowDateStr === 'N/A') { // Handle rows with no valid date
            row.style.display = "none";
            checkbox.checked = false;
            checkbox.disabled = true;
            return;
        }
        
        const rowDate = new Date(rowDateStr);
        rowDate.setHours(0,0,0,0); // Normalize row date for comparison

        let showRow = true;
        if (startDateValue) {
            const start = new Date(startDateValue);
            start.setHours(0,0,0,0);
            if (rowDate < start) {
                showRow = false;
            }
        }
        if (endDateValue) {
            const end = new Date(endDateValue);
            end.setHours(23, 59, 59, 999); // Compare with end of day
            if (rowDate > end) {
                showRow = false;
            }
        }

        if (showRow) {
            row.style.display = "";
            checkbox.disabled = false;
            hasVisibleRows = true;
        } else {
            row.style.display = "none";
            checkbox.checked = false; // Uncheck if hidden by filter
            checkbox.disabled = true;
        }
    });

    // Handle "No records found" message display
    const tableBody = document.querySelector("#recordsTable tbody");
    let noRecordsRow = tableBody.querySelector('tr td[colspan="6"]');
    if (!hasVisibleRows && !noRecordsRow) {
        // Add "no records" row if none exist and it's not already there
        const newNoRecordsRow = tableBody.insertRow();
        const cell = newNoRecordsRow.insertCell();
        cell.colSpan = 6; // Adjust colspan to match your table
        cell.textContent = "No records found matching your criteria.";
        cell.style.textAlign = "center";
    } else if (hasVisibleRows && noRecordsRow) {
        // Remove "no records" row if records are now visible
        noRecordsRow.parentElement.remove();
    }


    updateSelectAllVisualState(); // Update the main checkbox state
    toggleControls(); // Update button states
}


const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", () => {
        const checkedCheckboxes = document.querySelectorAll(".recordCheckbox:checked:not(:disabled)");

        if (checkedCheckboxes.length === 0) {
            return;
        }

        let recordDetailsForDeletion = [];
        // To be absolutely sure cb.dataset.index matches the displayed (sorted) records
        let recordsForMatching = JSON.parse(localStorage.getItem("manageRecords")) || [];
        recordsForMatching.sort((a, b) => { // Same sort as in loadRecordsFromStorage
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA < dateB) return 1;
            if (dateA > dateB) return -1;
            return 0;
        });

        checkedCheckboxes.forEach(cb => {
            const index = parseInt(cb.dataset.index);
            if (index >= 0 && index < recordsForMatching.length) {
                recordDetailsForDeletion.push(recordsForMatching[index]);
            }
        });

        if (recordDetailsForDeletion.length === 0) {
            console.warn("No valid records selected for deletion based on current data.");
            return;
        }

        const modalTitleElement = deleteConfirmModal.querySelector("h2") || deleteConfirmModal.querySelector(".modal-title");
        if (modalTitleElement) {
            if (recordDetailsForDeletion.length === 1) {
                modalTitleElement.textContent = "Are you sure you want to remove this record?";
            } else {
                modalTitleElement.textContent = `Are you sure you want to remove these records?`;
            }
        }
        deleteConfirmModal.style.display = "block";

        // Helper to get a standardized value for key generation
        const getKeyVal = (val) => (val === null || val === undefined ? "" : String(val).trim());

        deleteYesBtn.onclick = function () {
            const initialManageRecords = JSON.parse(localStorage.getItem("manageRecords")) || [];
            let backupRestore = JSON.parse(localStorage.getItem("backupRestore")) || [];

            const recordsToDeleteIdentifiers = new Set();
            
            // --- DETAILED LOGGING STARTS ---
            console.clear(); // Clear console for cleaner debugging output for this specific run
            console.log("--- DEBUGGING DELETION PROCESS ---");
            console.log("Current Date for 'dateRemoved':", formatDate(new Date()));
            console.log("Number of records selected by checkboxes (recordDetailsForDeletion):", recordDetailsForDeletion.length);

            if (recordDetailsForDeletion.length === 0) {
                console.error("No records were identified from checkboxes. Aborting deletion logic.");
                deleteConfirmModal.style.display = "none";
                return;
            }

            console.log("\n--- STEP 1: Generating Keys for SELECTED Records (from UI selection) ---");
            recordDetailsForDeletion.forEach((rtd, i) => {
                console.log(`\nSelected Record (rtd) #${i + 1} Details:`);
                console.log("  Raw rtd object:", JSON.parse(JSON.stringify(rtd))); // Deep copy for clean logging

                const rtdDateForKey = formatDate(rtd.date); // Standardize date format for the key

                // Log each part of the key for the selected record (rtd)
                const rtdKeyParts = [
                    `name:${getKeyVal(rtd.name)}`, `role:${getKeyVal(rtd.role)}`, `date:${getKeyVal(rtdDateForKey)}`, `timeIn:${getKeyVal(rtd.timeIn)}`,
                    `schoolid:${getKeyVal(rtd.schoolid)}`, `actions:${getKeyVal(rtd.actions)}`, `course:${getKeyVal(rtd.course)}`, `contact:${getKeyVal(rtd.contact)}`,
                    `age:${getKeyVal(rtd.age)}`, `sex:${getKeyVal(rtd.sex)}`, `reason:${getKeyVal(rtd.reason)}`, `healthIssue:${getKeyVal(rtd.healthIssue)}`,
                    `handledBy:${getKeyVal(rtd.handledBy)}`, `timeOut:${getKeyVal(rtd.timeOut)}`
                ];
                const rtdKey = rtdKeyParts.join('|');
                recordsToDeleteIdentifiers.add(rtdKey);
                console.log("  rtd Original Values & Key Components:");
                console.log(`    name: (original: '${rtd.name}', keyPart: '${getKeyVal(rtd.name)}')`);
                console.log(`    role: (original: '${rtd.role}', keyPart: '${getKeyVal(rtd.role)}')`);
                console.log(`    date: (original: '${rtd.date}', formattedForKey: '${rtdDateForKey}', keyPart: '${getKeyVal(rtdDateForKey)}')`);
                console.log(`    timeIn: (original: '${rtd.timeIn}', keyPart: '${getKeyVal(rtd.timeIn)}')`);
                console.log(`    schoolid: (original: '${rtd.schoolid}', keyPart: '${getKeyVal(rtd.schoolid)}')`);
                console.log(`    actions: (original: '${rtd.actions}', keyPart: '${getKeyVal(rtd.actions)}')`);
                console.log(`    course: (original: '${rtd.course}', keyPart: '${getKeyVal(rtd.course)}')`);
                console.log(`    contact: (original: '${rtd.contact}', keyPart: '${getKeyVal(rtd.contact)}')`);
                console.log(`    age: (original: '${rtd.age}', keyPart: '${getKeyVal(rtd.age)}')`);
                console.log(`    sex: (original: '${rtd.sex}', keyPart: '${getKeyVal(rtd.sex)}')`);
                console.log(`    reason: (original: '${rtd.reason}', keyPart: '${getKeyVal(rtd.reason)}')`);
                console.log(`    healthIssue: (original: '${rtd.healthIssue}', keyPart: '${getKeyVal(rtd.healthIssue)}')`);
                console.log(`    handledBy: (original: '${rtd.handledBy}', keyPart: '${getKeyVal(rtd.handledBy)}')`);
                console.log(`    timeOut: (original: '${rtd.timeOut}', keyPart: '${getKeyVal(rtd.timeOut)}')`);
                console.log("  >>> GENERATED KEY for rtd:", rtdKey);
            });
            console.log("\nSet of keys to delete (from rtd objects):", recordsToDeleteIdentifiers);
            // --- END OF STEP 1 LOGGING ---

            const remainingRecords = [];
            const actuallyRemovedForStats = [];

            console.log("\n--- STEP 2: Matching against localStorage 'manageRecords' ---");
            if (initialManageRecords.length === 0) {
                console.warn("localStorage 'manageRecords' is empty. Nothing to match against.");
            }

            initialManageRecords.forEach((lsRecord, i) => {
                console.log(`\nLocalStorage Record (lsRecord) #${i + 1} Details:`);
                console.log("  Raw lsRecord object:", JSON.parse(JSON.stringify(lsRecord)));

                const lsDateForKey = formatDate(lsRecord.date); // Standardize date format for the key

                // Log each part of the key for the localStorage record (lsRecord)
                 const lsKeyParts = [
                    `name:${getKeyVal(lsRecord.name)}`, `role:${getKeyVal(lsRecord.role)}`, `date:${getKeyVal(lsDateForKey)}`, `timeIn:${getKeyVal(lsRecord.timeIn)}`,
                    `schoolid:${getKeyVal(lsRecord.schoolid)}`, `actions:${getKeyVal(lsRecord.actions)}`, `course:${getKeyVal(lsRecord.course)}`, `contact:${getKeyVal(lsRecord.contact)}`,
                    `age:${getKeyVal(lsRecord.age)}`, `sex:${getKeyVal(lsRecord.sex)}`, `reason:${getKeyVal(lsRecord.reason)}`, `healthIssue:${getKeyVal(lsRecord.healthIssue)}`,
                    `handledBy:${getKeyVal(lsRecord.handledBy)}`, `timeOut:${getKeyVal(lsRecord.timeOut)}`
                ];
                const lsKey = lsKeyParts.join('|');
                console.log("  lsRecord Original Values & Key Components:");
                console.log(`    name: (original: '${lsRecord.name}', keyPart: '${getKeyVal(lsRecord.name)}')`);
                console.log(`    role: (original: '${lsRecord.role}', keyPart: '${getKeyVal(lsRecord.role)}')`);
                console.log(`    date: (original: '${lsRecord.date}', formattedForKey: '${lsDateForKey}', keyPart: '${getKeyVal(lsDateForKey)}')`);
                console.log(`    timeIn: (original: '${lsRecord.timeIn}', keyPart: '${getKeyVal(lsRecord.timeIn)}')`);
                console.log(`    schoolid: (original: '${lsRecord.schoolid}', keyPart: '${getKeyVal(lsRecord.schoolid)}')`);
                console.log(`    actions: (original: '${lsRecord.actions}', keyPart: '${getKeyVal(lsRecord.actions)}')`);
                console.log(`    course: (original: '${lsRecord.course}', keyPart: '${getKeyVal(lsRecord.course)}')`);
                console.log(`    contact: (original: '${lsRecord.contact}', keyPart: '${getKeyVal(lsRecord.contact)}')`);
                console.log(`    age: (original: '${lsRecord.age}', keyPart: '${getKeyVal(lsRecord.age)}')`);
                console.log(`    sex: (original: '${lsRecord.sex}', keyPart: '${getKeyVal(lsRecord.sex)}')`);
                console.log(`    reason: (original: '${lsRecord.reason}', keyPart: '${getKeyVal(lsRecord.reason)}')`);
                console.log(`    healthIssue: (original: '${lsRecord.healthIssue}', keyPart: '${getKeyVal(lsRecord.healthIssue)}')`);
                console.log(`    handledBy: (original: '${lsRecord.handledBy}', keyPart: '${getKeyVal(lsRecord.handledBy)}')`);
                console.log(`    timeOut: (original: '${lsRecord.timeOut}', keyPart: '${getKeyVal(lsRecord.timeOut)}')`);
                console.log("  >>> GENERATED KEY for lsRecord:", lsKey);

                if (recordsToDeleteIdentifiers.has(lsKey)) {
                    console.log("  ✅ MATCH FOUND! Record will be backed up and removed.");
                    const recordToBackup = { ...lsRecord }; // Create a copy
                    recordToBackup.dateRemoved = formatDate(new Date()); // Add the current date as dateRemoved
                    backupRestore.push(recordToBackup);
                    actuallyRemovedForStats.push(lsRecord);
                } else {
                    console.log("  ❌ NO MATCH.");
                    remainingRecords.push(lsRecord);
                }
            });
            // --- END OF STEP 2 LOGGING ---

            console.log("\n--- STEP 3: Results of Deletion Attempt ---");
            console.log("Number of records actually identified for removal/backup:", actuallyRemovedForStats.length);
            if (actuallyRemovedForStats.length > 0) {
                console.log("Newly backed up records (snapshot):", JSON.parse(JSON.stringify(backupRestore.slice(-actuallyRemovedForStats.length))));
            }
            console.log("Number of records remaining in 'manageRecords':", remainingRecords.length);


            if (actuallyRemovedForStats.length > 0) {
                // Only update localStorage if changes were actually made
                localStorage.setItem("manageRecords", JSON.stringify(remainingRecords));
                localStorage.setItem("backupRestore", JSON.stringify(backupRestore));

                actuallyRemovedForStats.forEach(recordToDelete => {
                    updateStatsAfterDeletion(recordToDelete);
                });

                console.log("Reloading records from storage to update UI...");
                loadRecordsFromStorage(); // Call once after all changes
            } else if (recordDetailsForDeletion.length > 0 && actuallyRemovedForStats.length === 0) {
                // This is the critical case where selected items didn't match anything
                console.error("CRITICAL: Records were selected from UI, but NO matches found in localStorage 'manageRecords'. Review key generation differences in logs above. No data was changed in localStorage.");
            }


            deleteConfirmModal.style.display = "none";
            const selectAllCheckbox = document.getElementById("selectAllCheckbox");
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            toggleControls();
        };
        // --- DETAILED LOGGING ENDS ---

        deleteNoBtn.onclick = function () {
            deleteConfirmModal.style.display = "none";
        };
    });
}
function updateStatsAfterDeletion(recordToDelete) {
    // Fetch all stats objects once
    let visitStats = JSON.parse(localStorage.getItem("visitStats")) || {};
    let dailyCount = JSON.parse(localStorage.getItem("dailyCount")) || {};
    let reasonCounts = JSON.parse(localStorage.getItem("reasonCounts")) || {};
    let hourlyCounts = JSON.parse(localStorage.getItem("hourlyCounts")) || {};
    let otherCounts = JSON.parse(localStorage.getItem("otherCounts")) || {};
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Ensure recordToDelete.date is consistently formatted, e.g., YYYY-MM-DD
    // Your existing formatDate function should handle this.
    const recordDate = formatDate(recordToDelete.date); // formatDate must be accessible here

    // === REMOVE RECORD FROM TRANSACTIONS ===
    // (If 'transactions' are a separate list that mirrors 'manageRecords' for some items)
    const transactionIndex = transactions.findIndex(record =>
        record.name === recordToDelete.name &&
        formatDate(record.date) === recordDate && // Compare formatted dates
        record.timeIn === recordToDelete.timeIn &&
        record.role === recordToDelete.role &&
        record.schoolid === recordToDelete.schoolid &&
        record.actions === recordToDelete.actions &&
        record.course === recordToDelete.course &&
        record.contact === recordToDelete.contact &&
        record.age === recordToDelete.age &&
        record.sex === recordToDelete.sex &&
        record.reason === recordToDelete.reason &&
        record.healthIssue === recordToDelete.healthIssue &&
        record.handledBy === recordToDelete.handledBy &&
        record.timeOut === recordToDelete.timeOut
    );
    if (transactionIndex !== -1) {
        transactions.splice(transactionIndex, 1);
    }

    // 1. Decrement total visits for the day (visitStats)
    if (visitStats[recordDate] !== undefined) {
        visitStats[recordDate] = Math.max(0, visitStats[recordDate] - 1);
    }

    // 2. Decrement the student/staff counts in dailyCount
    if (!dailyCount[recordDate]) {
        dailyCount[recordDate] = { student: 0, staff: 0 };
    }
    const role = (recordToDelete.role || "").toLowerCase().trim();
    if (role === "student" && dailyCount[recordDate].student !== undefined) {
        dailyCount[recordDate].student = Math.max(0, dailyCount[recordDate].student - 1);
    }
    if (role === "staff" && dailyCount[recordDate].staff !== undefined) {
        dailyCount[recordDate].staff = Math.max(0, dailyCount[recordDate].staff - 1);
    }

    // 3. Decrement reason counts (reasonCounts)
    let reason = recordToDelete.reason || "Other Health Issue";
    if (recordToDelete.reason === "Other Health Issue" && recordToDelete.healthIssue) { // If you store custom issues under a generic reason
         reason = recordToDelete.healthIssue; // Or handle as per your reasonCounts structure for "Other"
    }

    if (!reasonCounts[recordDate]) {
        reasonCounts[recordDate] = {};
    }
    if (reasonCounts[recordDate][reason] !== undefined) {
        reasonCounts[recordDate][reason] = Math.max(0, reasonCounts[recordDate][reason] - 1);
        if (reasonCounts[recordDate][reason] === 0) { // Clean up if count is zero
            delete reasonCounts[recordDate][reason];
            if (Object.keys(reasonCounts[recordDate]).length === 0) {
                delete reasonCounts[recordDate];
            }
        }
    }


    // 4. Decrement hourly counts (hourlyCounts)
    // Ensure getHourKey is available and robust
    if (recordToDelete.timeIn) {
        const hourKey = getHourKey(recordToDelete.timeIn); 
        if (hourlyCounts[recordDate] && hourlyCounts[recordDate][hourKey] !== undefined) {
            hourlyCounts[recordDate][hourKey] = Math.max(0, hourlyCounts[recordDate][hourKey] - 1);
            if (hourlyCounts[recordDate][hourKey] === 0) { // Clean up
                delete hourlyCounts[recordDate][hourKey];
                if (Object.keys(hourlyCounts[recordDate]).length === 0) {
                    delete hourlyCounts[recordDate];
                }
            }
        }
    }
    

    // 5. Decrement custom health issue in otherCounts (if 'otherCounts' is specific to custom health issues)
    const healthIssue = recordToDelete.healthIssue || "";
    if (recordToDelete.reason === "Other Health Issue" && healthIssue.trim() !== "") {
        if (otherCounts[recordDate] && otherCounts[recordDate][healthIssue] !== undefined) {
            otherCounts[recordDate][healthIssue] -= 1;
            if (otherCounts[recordDate][healthIssue] <= 0) {
                delete otherCounts[recordDate][healthIssue];
            }
            if (Object.keys(otherCounts[recordDate]).length === 0) {
                delete otherCounts[recordDate];
            }
        }
    }

    // Save all updated stats objects once
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("visitStats", JSON.stringify(visitStats));
    localStorage.setItem("dailyCount", JSON.stringify(dailyCount));
    localStorage.setItem("reasonCounts", JSON.stringify(reasonCounts));
    localStorage.setItem("hourlyCounts", JSON.stringify(hourlyCounts));
    localStorage.setItem("otherCounts", JSON.stringify(otherCounts));
}



