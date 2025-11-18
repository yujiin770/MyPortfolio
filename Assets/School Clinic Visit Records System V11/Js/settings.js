// Shared security questions array (ensure this is identical in login.js)
const securityQuestionsList = [
    "What was your childhood nickname?",
    "In what city were you born?",
    "What is the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the model of your first car?"
];

document.addEventListener('DOMContentLoaded', function() {
    console.log("Settings DOMContentLoaded - Script running.");

    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        console.log("No current user in session, redirecting to login.");
        localStorage.removeItem('rememberedUser');
        window.location.href = "../Html/index.html"; // Adjust path if needed
        return;
    }
    console.log("Current user found in session:", currentUser);

    let userCredentials = JSON.parse(localStorage.getItem('storedCredentials')) || { username: "admin", password: "123" };
    if (!userCredentials.securityAnswers || !Array.isArray(userCredentials.securityAnswers)) {
        userCredentials.securityAnswers = [];
        // localStorage.setItem('storedCredentials', JSON.stringify(userCredentials)); // Save if modified
    }

    const securityQuestionDropdown = document.getElementById('security-question-dropdown');
    const securityAnswerInput = document.getElementById('security-answer-input');

    if (securityQuestionDropdown && securityQuestionsList && securityQuestionsList.length > 0) {
        securityQuestionsList.forEach((question, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = question;
            securityQuestionDropdown.appendChild(option);
        });
    }

    if (securityQuestionDropdown && securityAnswerInput) {
        securityQuestionDropdown.addEventListener('change', function() {
            const selectedIndexValue = this.value;
            if (selectedIndexValue === "") {
                securityAnswerInput.value = "";
                return;
            }
            const selectedIndex = parseInt(selectedIndexValue);
            const currentCreds = JSON.parse(localStorage.getItem('storedCredentials')) || { securityAnswers: [] };

            if (currentCreds.securityAnswers &&
                Array.isArray(currentCreds.securityAnswers) &&
                currentCreds.securityAnswers[selectedIndex] !== undefined &&
                currentCreds.securityAnswers[selectedIndex] !== null) {
                securityAnswerInput.value = currentCreds.securityAnswers[selectedIndex];
            } else {
                securityAnswerInput.value = "";
            }
        });
        if(securityQuestionDropdown.value !== "") {
            securityQuestionDropdown.dispatchEvent(new Event('change'));
        }
    }

    const accountSecurityForm = document.getElementById('account-security-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const passwordRulesDisplay = document.getElementById('password-rules-display');
    const passwordStrengthText = document.getElementById('password-strength-text');
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');

    const passwordCriteria = [
        { element: reqLength,    regex: /^.{6,16}$/, met: false, requirementText: "6 to 16 characters" },
        { element: reqUppercase, regex: /[A-Z]/, met: false, requirementText: "One uppercase letter (A-Z)" },
        { element: reqLowercase, regex: /[a-z]/, met: false, requirementText: "One lowercase letter (a-z)" },
        { element: reqNumber,    regex: /[0-9]/, met: false, requirementText: "One number (0-9)" },
        { element: reqSpecial,   regex: /[^A-Za-z0-9]/, met: false, requirementText: "One special character (e.g., !@#$)" }
    ];

    function updateRequirementStatus(element, isMet) {
        if (!element) return;
        const icon = element.querySelector('i');
        if (!icon) return;
        if (isMet) {
            element.classList.remove('invalid');
            element.classList.add('valid');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-check');
        } else {
            element.classList.remove('valid');
            element.classList.add('invalid');
            icon.classList.remove('fa-check');
            icon.classList.add('fa-times');
        }
    }

    function checkPasswordStrength(password) {
        if (!passwordStrengthText || !passwordRulesDisplay) return 0;
        let score = 0;
        passwordCriteria.forEach(criterion => {
            criterion.met = criterion.regex.test(password);
            updateRequirementStatus(criterion.element, criterion.met);
            if (criterion.met) {
                score++;
            }
        });

        if (password.length === 0) {
             passwordStrengthText.textContent = "";
             passwordStrengthText.className = '';
             // Also reset criteria list to default display when input is empty
             passwordCriteria.forEach(criterion => updateRequirementStatus(criterion.element, false));
             return 0;
        }

        if (score < 3) {
            passwordStrengthText.textContent = "Weak";
            passwordStrengthText.className = 'weak';
        } else if (score < 5) {
            passwordStrengthText.textContent = "Medium";
            passwordStrengthText.className = 'medium';
        } else {
            passwordStrengthText.textContent = "Strong";
            passwordStrengthText.className = 'strong';
        }
        return score;
    }

    if (newPasswordInput && passwordRulesDisplay) {
        newPasswordInput.addEventListener('focus', () => {
            passwordRulesDisplay.style.display = 'block';
            checkPasswordStrength(newPasswordInput.value);
        });
        newPasswordInput.addEventListener('input', () => {
            checkPasswordStrength(newPasswordInput.value);
        });
    }

    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const targetInputId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetInputId);
            if (targetInput) {
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    targetInput.type = 'password';
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            }
        });
    });

    if (accountSecurityForm) {
        accountSecurityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let currentStoredCredentials = JSON.parse(localStorage.getItem('storedCredentials')) || { username: "admin", password: "123" };
            if (!currentStoredCredentials.securityAnswers || !Array.isArray(currentStoredCredentials.securityAnswers)) {
                currentStoredCredentials.securityAnswers = [];
            }

            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const selectedQuestionIndexStr = securityQuestionDropdown.value;
            const securityAnswer = securityAnswerInput.value.trim();

            let errorMessages = [];
            let passwordChangeAttempted = currentPassword !== "" || newPassword !== "" || confirmPassword !== "";
            let qaChangeAttempted = selectedQuestionIndexStr !== "" || securityAnswerInput.value.trim() !== "";

            if (!passwordChangeAttempted && !qaChangeAttempted) {
                showMessageModal("ℹ️ No changes were specified. Please fill the relevant fields to update your settings.");
                return;
            }

            let proceedWithPasswordLogic = false;
            if (passwordChangeAttempted) {
                if (currentPassword === "") errorMessages.push("❌ Current Password is required to change your password.");
                if (newPassword === "") errorMessages.push("❌ New Password is required to change your password.");
                if (confirmPassword === "") errorMessages.push("❌ Confirm New Password is required to change your password.");
                
                if (currentPassword !== "" && newPassword !== "" && confirmPassword !== "") {
                    proceedWithPasswordLogic = true;
                }
            }

            let proceedWithQaLogic = false;
            if (qaChangeAttempted) {
                if (selectedQuestionIndexStr === "") errorMessages.push("❌ Please select a security question.");
                if (securityAnswer === "") errorMessages.push("❌ Please provide an answer for the security question.");
                
                if (selectedQuestionIndexStr !== "" && securityAnswer !== "") {
                    proceedWithQaLogic = true;
                }
            }

            if (errorMessages.length > 0) {
                showMessageModal(errorMessages.join("<br>"));
                return;
            }

            let actualPasswordChangeMade = false;
            let actualQaChangeMade = false;

            if (proceedWithPasswordLogic) {
                if (currentPassword !== currentStoredCredentials.password) {
                    errorMessages.push("❌ Current password is incorrect.");
                    if(currentPasswordInput) currentPasswordInput.value = "";
                } else {
                    let passwordStrengthIssues = [];
                    passwordCriteria.forEach(criterion => {
                        if (!criterion.regex.test(newPassword)) {
                            passwordStrengthIssues.push(criterion.requirementText);
                        }
                    });

                    if (passwordStrengthIssues.length > 0) {
                        errorMessages.push("❌ New password does not meet all requirements:<br> - " + passwordStrengthIssues.join("<br> - "));
                    } else if (newPassword !== confirmPassword) {
                        errorMessages.push("❌ New passwords do not match.");
                    } else if (newPassword === currentStoredCredentials.password) {
                        errorMessages.push("❌ New password must be different from the current password.");
                    } else {
                        actualPasswordChangeMade = true;
                    }
                }
            }

            if (proceedWithQaLogic) {
                const questionIndex = parseInt(selectedQuestionIndexStr);
                if (currentStoredCredentials.securityAnswers[questionIndex] !== securityAnswer) {
                     actualQaChangeMade = true;
                }
            }

            if (errorMessages.length > 0) {
                showMessageModal(errorMessages.join("<br>"));
                return;
            }
            
            let oldPropsCleanedUp = false;
            if (currentStoredCredentials.hasOwnProperty('securityQuestionIndex')) {
                oldPropsCleanedUp = true;
            }
            if (currentStoredCredentials.hasOwnProperty('securityAnswer')) {
                oldPropsCleanedUp = true;
            }

            if (!actualPasswordChangeMade && !actualQaChangeMade && !oldPropsCleanedUp) {
                 showMessageModal("ℹ️ The information provided does not change your current settings.");
                 return;
            }
            if(oldPropsCleanedUp && !actualPasswordChangeMade && !actualQaChangeMade){
                actualQaChangeMade = true; // Treat cleanup as a change if it's the only thing happening
            }


            let successMessages = [];
            if (actualPasswordChangeMade) {
                currentStoredCredentials.password = newPassword;
                successMessages.push("✅ Password updated successfully.");
            }
            if (actualQaChangeMade) {
                if (proceedWithQaLogic) { // Only update securityAnswers if QA was validly filled
                    const questionIndex = parseInt(selectedQuestionIndexStr);
                    currentStoredCredentials.securityAnswers[questionIndex] = securityAnswer;
                }
                // Always perform cleanup if old properties exist
                if (currentStoredCredentials.hasOwnProperty('securityQuestionIndex')) delete currentStoredCredentials.securityQuestionIndex;
                if (currentStoredCredentials.hasOwnProperty('securityAnswer')) delete currentStoredCredentials.securityAnswer;
                
                // Avoid duplicate "settings updated" if password also changed and cleanup happened
                if(!successMessages.some(msg => msg.includes("Security question"))) {
                    successMessages.push("✅ Security question and answer settings updated.");
                }
            }
            
            if (successMessages.length > 0) {
                localStorage.setItem('storedCredentials', JSON.stringify(currentStoredCredentials));
                let finalMessageToShow = successMessages.join("<br>");

                if (actualPasswordChangeMade) {
                    finalMessageToShow += "<br><br>You will be logged out. Please log in again with your new password.";
                    localStorage.removeItem('rememberedUser');
                    sessionStorage.removeItem('currentUser');
                    
                    if(currentPasswordInput) currentPasswordInput.value = '';
                    if(newPasswordInput) newPasswordInput.value = '';
                    if(confirmPasswordInput) confirmPasswordInput.value = '';
                    if(passwordRulesDisplay) passwordRulesDisplay.style.display = 'none';
                    checkPasswordStrength(''); 

                    togglePasswordIcons.forEach(icon => {
                        const targetInputId = icon.getAttribute('data-target');
                        const targetInput = document.getElementById(targetInputId);
                        if(targetInput) {
                            targetInput.type = 'password';
                            icon.classList.remove('fa-eye-slash');
                            icon.classList.add('fa-eye');
                        }
                    });
                    showMessageModal(finalMessageToShow);
                    setTimeout(() => { window.location.href = "../Html/index.html"; }, 3500);
                } else {
                    showMessageModal(finalMessageToShow);
                    // Optional: Clear Q&A fields after successful save if desired, or leave them.
                    // securityQuestionDropdown.value = ""; 
                    // securityAnswerInput.value = "";
                    // Trigger change on dropdown to reflect current state if not clearing
                    if(securityQuestionDropdown.value !== "") {
                        securityQuestionDropdown.dispatchEvent(new Event('change'));
                    }
                }
            } else {
                 // This case should ideally be caught earlier.
                 showMessageModal("ℹ️ No changes were applied to your settings.");
            }
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    if (logoutBtn && logoutModal && confirmLogout && cancelLogout) {
    logoutBtn.addEventListener("click", (e) => { e.preventDefault(); logoutModal.style.display = "flex"; });
    confirmLogout.addEventListener("click", () => {
        // ***** START: RECORD LOGOUT TIME (To be added here if not already in login.js/global handler) *****
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
                    console.log("[settings.js] Logout time recorded for session:", activeSessionId);
                } else {
                    console.warn("[settings.js] Could not find active session log (sessionId:", activeSessionId, "and logoutTime: null) to record logout. Creating orphan entry.");
                    const displayName = localStorage.getItem("displayName") || sessionStorage.getItem("currentUser") || "Unknown User (Logout Only)";
                    userLogs.push({
                        sessionId: `logout_orphan_${Date.now()}`, // Unique ID for orphan
                        name: displayName,
                        loginTime: null, // No corresponding login time
                        logoutTime: logoutTimestamp
                    });
                    localStorage.setItem("userLogs", JSON.stringify(userLogs));
                }
            } catch (error) {
                console.error("[settings.js] Error updating logout time in userLogs:", error);
            }
        } else {
            console.warn("[settings.js] No activeLoginSessionId found in sessionStorage. Cannot record specific logout time.");
        }
        // ***** END: RECORD LOGOUT TIME *****

        localStorage.removeItem("rememberedUser");
        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem('activeLoginSessionId'); // Clear the active session ID
        window.location.href = "../Html/index.html";
    });
    cancelLogout.addEventListener("click", () => { logoutModal.style.display = "none"; });
}

    const changeNameForm = document.getElementById('change-name-form');
    if(changeNameForm) {
        changeNameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const displayNameInput = document.getElementById('display-name');
            const displayName = displayNameInput.value.trim();
            if (!displayName) { showMessageModal("❌ Display name cannot be empty."); return; }
            localStorage.setItem('displayName', displayName);
            showMessageModal("✅ Display name saved successfully.");
        });
        const savedDisplayName = localStorage.getItem('displayName');
        if (savedDisplayName && document.getElementById('display-name')) {
            document.getElementById('display-name').value = savedDisplayName;
        }
    }
});

function showMessageModal(message) {
    const modal = document.getElementById('messageModal');
    const text = document.getElementById('messageText');
    const closeBtn = document.getElementById('closeMessageModal');

    if (modal && text && closeBtn) {
        text.innerHTML = message;
        modal.style.display = 'flex';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
    } else {
        alert(message.replace(/<br\s*\/?>/gi, "\n").replace(/✅ |❌ |ℹ️ |⚠️ /g, ""));
    }
}