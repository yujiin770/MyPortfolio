// ../Js/login.js

const securityQuestionsList = [
    "What was your childhood nickname?",
    "In what city were you born?",
    "What is the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the model of your first car?"
];

// --- DOM Elements for New Password Modal ---
const newPasswordInput = document.getElementById('newPasswordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const newPasswordConfirmButton = document.getElementById('newPasswordConfirm');
const passwordCriteria = {
    length: document.getElementById('lengthCriterion'),
    uppercase: document.getElementById('uppercaseCriterion'),
    lowercase: document.getElementById('lowercaseCriterion'),
    number: document.getElementById('numberCriterion'),
    special: document.getElementById('specialCriterion')
};
const criteriaElements = Object.values(passwordCriteria).filter(el => el !== null);

// --- Login Cooldown Variables ---
let loginAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
let cooldownTime = parseInt(localStorage.getItem('cooldownTime')) || 60;
let cooldownStart = parseInt(localStorage.getItem('cooldownStart')) || 0;
let cooldownInterval;

// --- Forgot Password Cooldown Variables ---
let forgotPasswordAttempts = parseInt(localStorage.getItem('forgotPasswordAttempts')) || 0;
const MAX_FORGOT_PASSWORD_ATTEMPTS = 3;
let forgotPasswordCooldownTime = 60; // 60 seconds = 1 minute
let forgotPasswordCooldownStart = parseInt(localStorage.getItem('forgotPasswordCooldownStart')) || 0;
let forgotPasswordCooldownInterval;


// --- Cooldown State Checkers ---
function isLoginCooldownActive() {
    if (loginAttempts >= 3 && cooldownStart > 0) {
        const timeElapsed = Math.floor((Date.now() - cooldownStart) / 1000);
        const initialLoginCooldownDuration = parseInt(localStorage.getItem('cooldownTime')) || 60;
        return (initialLoginCooldownDuration - timeElapsed) > 0;
    }
    return false;
}

function isForgotPasswordCooldownActive() {
    const localFPCAttempts = parseInt(localStorage.getItem('forgotPasswordAttempts')) || 0;
    const localFPCooldownStart = parseInt(localStorage.getItem('forgotPasswordCooldownStart')) || 0;
    if (localFPCAttempts >= MAX_FORGOT_PASSWORD_ATTEMPTS && localFPCooldownStart > 0) {
        const timeElapsedFp = Math.floor((Date.now() - localFPCooldownStart) / 1000);
        return (forgotPasswordCooldownTime - timeElapsedFp) > 0;
    }
    return false;
}

// --- Global UI State Management ---
function updateGlobalUIStateBasedOnCooldowns() {
    const loginCool = isLoginCooldownActive();
    const fpCool = isForgotPasswordCooldownActive();
    const anyCooldownActive = loginCool || fpCool;

    const usernameInputElement = document.getElementById('username');
    const passwordInputEl = document.getElementById('password');
    const loginButton = document.querySelector('#loginForm .btn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const securityQuestionSelect = document.getElementById('forgot-security-question-select');
    const securityAnswerInputElement = document.getElementById('forgot-security-answer-input');
    const securityVerifyButton = document.getElementById('securityQuestionConfirm');

    if (usernameInputElement) usernameInputElement.disabled = anyCooldownActive;
    if (passwordInputEl) passwordInputEl.disabled = anyCooldownActive;
    if (loginButton) loginButton.disabled = anyCooldownActive;

    if (forgotPasswordLink) {
        if (anyCooldownActive) {
            forgotPasswordLink.style.pointerEvents = 'none';
            forgotPasswordLink.style.opacity = '0.5';
            forgotPasswordLink.setAttribute('title', 'Forgot Password is temporarily disabled due to cooldown.');
        } else {
            forgotPasswordLink.style.pointerEvents = 'auto';
            forgotPasswordLink.style.opacity = '1';
            forgotPasswordLink.removeAttribute('title');
        }
    }

    if (securityQuestionSelect) securityQuestionSelect.disabled = anyCooldownActive;
    if (securityAnswerInputElement) securityAnswerInputElement.disabled = anyCooldownActive;
    if (securityVerifyButton) securityVerifyButton.disabled = anyCooldownActive;
}


// --- Login Cooldown Functions ---
function manageCooldownState() {
    if (isLoginCooldownActive()) {
        const timeElapsed = Math.floor((Date.now() - cooldownStart) / 1000);
        const initialCooldownDuration = parseInt(localStorage.getItem('cooldownTime')) || 60;
        startCooldown(initialCooldownDuration, cooldownStart, true);
        return true;
    } else if (loginAttempts >= 3 && cooldownStart > 0) {
        resetCooldown();
    } else {
        updateGlobalUIStateBasedOnCooldowns();
    }
    return false;
}

function startCooldown(duration, startTime, isResumed = false) {
    if (!isResumed) {
        cooldownStart = startTime;
        localStorage.setItem('cooldownStart', cooldownStart.toString());
        localStorage.setItem('cooldownTime', duration.toString());
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        if (usernameField) usernameField.value = "";
        if (passwordField) passwordField.value = "";
        showModal(`⏳ Too many login attempts. Please wait ${duration} seconds.`, false);
    }
    updateGlobalUIStateBasedOnCooldowns();

    const cooldownMsgElement = document.getElementById('cooldownMessage');
    const generalModalMessageElement = document.getElementById('modalMessage');
    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
        const timeElapsed = Math.floor((Date.now() - cooldownStart) / 1000);
        const actualInitialDuration = parseInt(localStorage.getItem('cooldownTime')) || duration;
        let remaining = actualInitialDuration - timeElapsed;
        if (remaining <= 0) {
            clearInterval(cooldownInterval);
            resetCooldown();
        } else {
            if (cooldownMsgElement) cooldownMsgElement.textContent = `⏳ Cooldown: ${remaining} seconds remaining`;
            const feedbackModal = document.getElementById('modal');
            if (feedbackModal && generalModalMessageElement &&
                feedbackModal.style.display === 'flex' &&
                generalModalMessageElement.innerHTML.includes("Too many login attempts")) { // Check innerHTML
                generalModalMessageElement.innerHTML = `⏳ Too many login attempts. Please wait ${remaining} seconds.`; // Use innerHTML
            }
        }
    }, 1000);
}

function resetCooldown() {
    loginAttempts = 0;
    localStorage.setItem('loginAttempts', '0');
    localStorage.removeItem('cooldownTime');
    localStorage.removeItem('cooldownStart');
    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = null;
    cooldownStart = 0;
    const cooldownMsgElement = document.getElementById('cooldownMessage');
    if (cooldownMsgElement) cooldownMsgElement.textContent = "";
    updateGlobalUIStateBasedOnCooldowns();
}

// --- Forgot Password Cooldown Functions ---
function manageForgotPasswordCooldownState() {
    const forgotPasswordModalElement = document.getElementById('forgotPasswordSecurityModal');

    if (isForgotPasswordCooldownActive()) {
        const timeElapsed = Math.floor((Date.now() - forgotPasswordCooldownStart) / 1000);
        const remainingTime = forgotPasswordCooldownTime - timeElapsed;

        if (forgotPasswordModalElement && forgotPasswordModalElement.style.display !== 'none') {
            forgotPasswordModalElement.style.display = 'none';
        }
        showModal(`⏳ Too many attempts for password recovery. Please wait ${remainingTime} seconds.`, false);
        updateGlobalUIStateBasedOnCooldowns();

        if (forgotPasswordCooldownInterval) clearInterval(forgotPasswordCooldownInterval);
        forgotPasswordCooldownInterval = setInterval(() => {
            const currentRemaining = forgotPasswordCooldownTime - Math.floor((Date.now() - forgotPasswordCooldownStart) / 1000);
            const modalMessageEl = document.getElementById('modalMessage');
            if (document.getElementById('modal').style.display === 'flex' && modalMessageEl && modalMessageEl.innerHTML.includes("password recovery")) {
                modalMessageEl.innerHTML = `⏳ Too many attempts for password recovery. Please wait ${currentRemaining} seconds.`;
            }
            if (currentRemaining <= 0) {
                clearInterval(forgotPasswordCooldownInterval);
                resetForgotPasswordCooldown();
                closeModal();
            }
        }, 1000);
        return true;
    } else if (forgotPasswordAttempts >= MAX_FORGOT_PASSWORD_ATTEMPTS && forgotPasswordCooldownStart > 0) {
        resetForgotPasswordCooldown();
    } else {
        updateGlobalUIStateBasedOnCooldowns();
    }
    return false;
}

function startForgotPasswordCooldown() {
    const startTime = Date.now();
    forgotPasswordCooldownStart = startTime;
    localStorage.setItem('forgotPasswordCooldownStart', forgotPasswordCooldownStart.toString());

    const forgotPasswordModalElement = document.getElementById('forgotPasswordSecurityModal');
    if (forgotPasswordModalElement) forgotPasswordModalElement.style.display = 'none';

    showModal(`⏳ Too many attempts for password recovery. Please wait ${forgotPasswordCooldownTime} seconds.`, false);
    updateGlobalUIStateBasedOnCooldowns();

    let remaining = forgotPasswordCooldownTime;
    if (forgotPasswordCooldownInterval) clearInterval(forgotPasswordCooldownInterval);
    forgotPasswordCooldownInterval = setInterval(() => {
        remaining--;
        const modalMessageEl = document.getElementById('modalMessage');
        if (document.getElementById('modal').style.display === 'flex' && modalMessageEl && modalMessageEl.innerHTML.includes("password recovery")) {
            modalMessageEl.innerHTML = `⏳ Too many attempts for password recovery. Please wait ${remaining} seconds.`;
        }
        if (remaining <= 0) {
            clearInterval(forgotPasswordCooldownInterval);
            resetForgotPasswordCooldown();
            closeModal();
        }
    }, 1000);
}

function resetForgotPasswordCooldown() {
    forgotPasswordAttempts = 0;
    localStorage.setItem('forgotPasswordAttempts', '0');
    forgotPasswordCooldownStart = 0;
    localStorage.removeItem('forgotPasswordCooldownStart');
    if (forgotPasswordCooldownInterval) clearInterval(forgotPasswordCooldownInterval);
    updateGlobalUIStateBasedOnCooldowns();
}

// --- Password Strength Checker ---
function checkPasswordStrength() {
    if (!newPasswordInput) {
        // Return structure consistent with successful execution
        return { allMet: false, failedTexts: ["Password input field not found."] };
    }
    const password = newPasswordInput.value;
    let allCriteriaMet = true;
    let failedTexts = [];

    const criteriaToCheck = [
        { el: passwordCriteria.length,    test: (p) => p.length >= 6 && p.length <= 16,              text: "6 to 16 characters" },
        { el: passwordCriteria.uppercase, test: (p) => /[A-Z]/.test(p),                               text: "One uppercase letter (A-Z)" },
        { el: passwordCriteria.lowercase, test: (p) => /[a-z]/.test(p),                               text: "One lowercase letter (a-z)" },
        { el: passwordCriteria.number,    test: (p) => /[0-9]/.test(p),                               text: "One number (0-9)" },
        { el: passwordCriteria.special,   test: (p) => /[^A-Za-z0-9]/.test(p),                         text: "One special character (e.g., !@#$)" }
    ];

    criteriaToCheck.forEach(criterion => {
        const isValid = criterion.test(password);
        if (criterion.el) {
            updateCriterionUI(criterion.el, isValid);
        } else {
            // Log error but don't add to user-facing failedTexts unless it's a general failure
            console.error("Password criterion UI element missing for:", criterion.text);
        }
        if (!isValid) {
            allCriteriaMet = false;
            failedTexts.push(criterion.text);
        }
    });

    return { allMet: allCriteriaMet, failedTexts: failedTexts };
}


function updateCriterionUI(criterionElement, isValid) {
    if (!criterionElement) return;
    const icon = criterionElement.querySelector('i');
    if (!icon) return;

    if (isValid) {
        criterionElement.classList.remove('invalid');
        criterionElement.classList.add('valid');
        icon.classList.remove('bx-x');
        icon.classList.add('bx-check');
    } else {
        criterionElement.classList.remove('valid');
        criterionElement.classList.add('invalid');
        icon.classList.remove('bx-check');
        icon.classList.add('bx-x');
    }
}

function resetPasswordCriteriaUI() {
    criteriaElements.forEach(el => {
        if (el) updateCriterionUI(el, false);
    });
    if (newPasswordConfirmButton) {
        newPasswordConfirmButton.disabled = true;
    }
}

function updateNewPasswordSaveButtonState() {
    if (!newPasswordInput || !newPasswordConfirmButton) {
        return;
    }
    const strengthResult = checkPasswordStrength(); // This updates UI
    newPasswordConfirmButton.disabled = !strengthResult.allMet;
}


if (newPasswordInput) {
    newPasswordInput.addEventListener('input', updateNewPasswordSaveButtonState);
    newPasswordInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            if (newPasswordConfirmButton && !newPasswordConfirmButton.disabled) {
                 performPasswordChange();
            }
        }
    });
}

if (newPasswordConfirmButton) {
    newPasswordConfirmButton.addEventListener('click', function() {
        performPasswordChange();
    });
}


// --- Password Change Logic ---
function performPasswordChange() {
    const newPass = newPasswordInput ? newPasswordInput.value.trim() : "";
    const confirmPass = confirmPasswordInput ? confirmPasswordInput.value.trim() : "";
    const newPasswordModalEl = document.getElementById('newPasswordModal');

    const clearAndResetPasswordFields = () => {
        if (newPasswordInput) newPasswordInput.value = "";
        if (confirmPasswordInput) confirmPasswordInput.value = "";
        resetPasswordCriteriaUI();
    };

    const reShowAndClearNewPasswordModalOnError = () => {
        clearAndResetPasswordFields();
        if (newPasswordModalEl) {
            newPasswordModalEl.style.display = 'flex';
            if (newPasswordInput) {
                newPasswordInput.focus();
            }
        }
        // Ensure save button state is re-evaluated after clearing
        updateNewPasswordSaveButtonState();
    };

    if (!newPass) {
        if (newPasswordModalEl) newPasswordModalEl.style.display = 'none';
        showModal('❌ New Password cannot be empty.', false, reShowAndClearNewPasswordModalOnError);
        return;
    }

    if (!confirmPass) {
        if (newPasswordModalEl) newPasswordModalEl.style.display = 'none';
        showModal('❌ Confirm New Password cannot be empty.', false, reShowAndClearNewPasswordModalOnError);
        return;
    }

    const strengthResult = checkPasswordStrength(); // Updates UI bullets and gets result

    if (!strengthResult.allMet) {
        if (newPasswordModalEl) newPasswordModalEl.style.display = 'none';
        let detailedErrorMessage = "❌ New password does not meet all requirements:";
        if (strengthResult.failedTexts.length > 0) {
            detailedErrorMessage += "<br> - " + strengthResult.failedTexts.join("<br> - ");
        } else {
            detailedErrorMessage += "<br>Please ensure all criteria are met."; // Fallback
        }
        showModal(detailedErrorMessage, false, reShowAndClearNewPasswordModalOnError);
        return;
    }

    if (newPass !== confirmPass) {
        if (newPasswordModalEl) newPasswordModalEl.style.display = 'none';
        showModal('❌ Passwords do not match.', false, reShowAndClearNewPasswordModalOnError);
        return;
    }

    const storedCredentials = JSON.parse(localStorage.getItem('storedCredentials')) || { username: "admin", password: "123" };
    storedCredentials.password = newPass;
    localStorage.setItem('storedCredentials', JSON.stringify(storedCredentials));
    localStorage.removeItem('rememberedUser'); // User needs to log in again with new password
    clearAndResetPasswordFields();
    if (newPasswordModalEl) newPasswordModalEl.style.display = 'none';
    showModal('✅ Password updated successfully! You can now log in.', true);
    updateNewPasswordSaveButtonState(); // Reset save button state after successful change
}


// --- Event Listeners ---
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            if (newPasswordConfirmButton && !newPasswordConfirmButton.disabled) {
                event.preventDefault();
                performPasswordChange();
            }
        }
    });
}

const securityAnswerInputForEnterKey = document.getElementById('forgot-security-answer-input');
if (securityAnswerInputForEnterKey) {
    securityAnswerInputForEnterKey.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            const securityConfirmBtn = document.getElementById('securityQuestionConfirm');
            if (securityConfirmBtn && !securityConfirmBtn.disabled) {
                securityConfirmBtn.click();
            }
        }
    });
}

const loginFormElement = document.getElementById('loginForm');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', function(event) {
        event.preventDefault();

        // --- Check Cooldowns ---
        if (isLoginCooldownActive()) {
            // Re-trigger modal display if needed, or just prevent login
            const timeElapsed = Math.floor((Date.now() - cooldownStart) / 1000);
            const initialCooldownDuration = parseInt(localStorage.getItem('cooldownTime')) || 60;
            const remaining = initialCooldownDuration - timeElapsed;
            showModal(`⏳ Too many login attempts. Please wait ${remaining} seconds.`, false);
            return; // Stop login attempt
        }
        // No need to check forgot password cooldown here for login action

        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        const username = usernameField ? usernameField.value.trim() : "";
        const password = passwordField ? passwordField.value.trim() : "";
        const stored = JSON.parse(localStorage.getItem('storedCredentials')) || { username: "admin", password: "123", securityAnswers: [] };

        if (username === stored.username && password === stored.password) {
            // --- SUCCESS LOGIC ---
            sessionStorage.setItem('currentUser', username);
            // Consider storing displayName in sessionStorage as well if it's frequently accessed,
            // or ensure it's set in localStorage if that's the primary source.
            const userDisplayName = localStorage.getItem("displayName") || username; // Get displayName or fallback to username
            // If you want to PERSIST the username as displayName if "displayName" is not set:
            // if (!localStorage.getItem("displayName")) {
            //    localStorage.setItem("displayName", username);
            // }


            localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
            loginAttempts = 0; // Reset attempts on success
            localStorage.setItem('loginAttempts', '0');
            resetCooldown(); // Clear any active cooldown state

            // ***** START: MODIFIED LOGIN HISTORY RECORDING *****
            try {
                const now = new Date();
                const loginTimestamp = now.toLocaleString(); // e.g., "10/26/2023, 10:30:00 AM"
                const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Unique session ID

                // Store active session ID for logout tracking
                sessionStorage.setItem('activeLoginSessionId', sessionId);

                // Get existing logs or initialize an empty array
                let userLogs = JSON.parse(localStorage.getItem("userLogs")) || [];

                // Add the new log entry
                userLogs.push({
                    sessionId: sessionId,
                    name: userDisplayName, // Use the retrieved displayName
                    loginTime: loginTimestamp,
                    logoutTime: null // Will be updated on logout
                });

                 // Optional: Limit history size (e.g., keep last 50 logs)
                 const MAX_LOG_ENTRIES = 50;
                 if (userLogs.length > MAX_LOG_ENTRIES) {
                     userLogs = userLogs.slice(userLogs.length - MAX_LOG_ENTRIES);
                 }

                // Save the updated logs back to localStorage
                localStorage.setItem("userLogs", JSON.stringify(userLogs));
                console.log("[login.js] Login successful, log entry added:", { sessionId, name: userDisplayName, loginTime: loginTimestamp, logoutTime: null });

            } catch (error) {
                console.error("[login.js] Error updating login history:", error);
            }
            // ***** END: MODIFIED LOGIN HISTORY RECORDING *****

            showModal("✅ Login successful! Please Wait...", true);
            // Redirect happens inside showModal's success logic

        } else {
            // --- INCORRECT CREDENTIALS LOGIC ---
            loginAttempts++;
            localStorage.setItem('loginAttempts', loginAttempts.toString());

            const passwordField = document.getElementById('password'); // Re-get reference just in case
            const usernameField = document.getElementById('username'); // Ensure you have this reference

            if (loginAttempts >= 3) {
                let currentCooldownDuration = parseInt(localStorage.getItem('cooldownTime')) || 60;
                startCooldown(currentCooldownDuration, Date.now());
            } else {
                const attemptsLeft = 3 - loginAttempts;
                showModal(`❌ Incorrect username or password. ${attemptsLeft} attempt(s) remaining.`, false);

                if (usernameField) {
                    usernameField.value = "";
                }
                if (passwordField) {
                    passwordField.value = "";
                    passwordField.focus();
                }
            }
            updateGlobalUIStateBasedOnCooldowns();
        }
    });
}
const forgotPasswordLinkElement = document.getElementById('forgotPasswordLink');
if (forgotPasswordLinkElement) {
    forgotPasswordLinkElement.addEventListener('click', function(event) {
        event.preventDefault();
        manageCooldownState();
        manageForgotPasswordCooldownState();

        const link = this;
        if (link.style.pointerEvents === 'none' || getComputedStyle(link).pointerEvents === 'none') {
            return;
        }

        const forgotPasswordModal = document.getElementById('forgotPasswordSecurityModal');
        const forgotSecurityQuestionSelect = document.getElementById('forgot-security-question-select');
        const forgotSecurityAnswerInput = document.getElementById('forgot-security-answer-input');

        if (forgotSecurityAnswerInput) forgotSecurityAnswerInput.value = "";
        if (forgotSecurityQuestionSelect) {
            forgotSecurityQuestionSelect.innerHTML = '<option value="" disabled selected>-- Select a Question --</option>';
            securityQuestionsList.forEach((question, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = question;
                forgotSecurityQuestionSelect.appendChild(option);
            });
        }
        if (forgotPasswordModal) {
            forgotPasswordModal.style.display = 'flex';
        } else {
            console.error("forgotPasswordSecurityModal element NOT FOUND when trying to display!");
        }
    });
} else {
    console.error("Forgot Password link element NOT FOUND. Event listener not attached.");
}

const securityQuestionConfirmButton = document.getElementById('securityQuestionConfirm');
if (securityQuestionConfirmButton) {
    securityQuestionConfirmButton.addEventListener('click', function () {
        if (isLoginCooldownActive() || isForgotPasswordCooldownActive()) {
            return;
        }
        const fgtSecQuestionSelect = document.getElementById('forgot-security-question-select');
        const selectedQuestionIndex = fgtSecQuestionSelect ? parseInt(fgtSecQuestionSelect.value) : NaN;
        const enteredAnswerFromInput = document.getElementById('forgot-security-answer-input');
        const enteredAnswer = enteredAnswerFromInput ? enteredAnswerFromInput.value.trim() : "";
        const storedCredentialsJSON = localStorage.getItem('storedCredentials');
        const storedCredentials = JSON.parse(storedCredentialsJSON) || { username: "admin", password: "123", securityAnswers: [] };
        const forgotPasswordSecurityModal = document.getElementById('forgotPasswordSecurityModal');
        const newPasswordModalElement = document.getElementById('newPasswordModal');
        const errorFeedbackModal = document.getElementById('modal');

        function setupObserverToReShowForgotModal() {
            if (errorFeedbackModal && forgotPasswordSecurityModal) {
                const observer = new MutationObserver(function(mutationsList, observerInstance) {
                    for(let mutation of mutationsList) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            if (errorFeedbackModal.style.display === 'none') {
                                if (!manageForgotPasswordCooldownState()) {
                                    if (forgotPasswordSecurityModal) forgotPasswordSecurityModal.style.display = 'flex';
                                }
                                observerInstance.disconnect();
                                return;
                            }
                        }
                    }
                });
                observer.observe(errorFeedbackModal, { attributes: true });
            }
        }

        if (isNaN(selectedQuestionIndex) || selectedQuestionIndex < 0 || !enteredAnswer) {
            if (enteredAnswerFromInput) enteredAnswerFromInput.value = "";
            if (forgotPasswordSecurityModal) forgotPasswordSecurityModal.style.display = 'none';
            showModal('❌ Please select a question and provide an answer.', false);
            setupObserverToReShowForgotModal();
            return;
        }
        if (!storedCredentials.securityAnswers || !Array.isArray(storedCredentials.securityAnswers) ||
            selectedQuestionIndex >= storedCredentials.securityAnswers.length ||
            storedCredentials.securityAnswers[selectedQuestionIndex] === null ||
            storedCredentials.securityAnswers[selectedQuestionIndex] === undefined ) {
            if (enteredAnswerFromInput) enteredAnswerFromInput.value = "";
            if (forgotPasswordSecurityModal) forgotPasswordSecurityModal.style.display = 'none';
            showModal('❌ An answer for this security question has not been set up.', false);
            setupObserverToReShowForgotModal();
            return;
        }
        const storedAnswerForSelectedQuestion = storedCredentials.securityAnswers[selectedQuestionIndex];
        const isAnswerMatch = storedAnswerForSelectedQuestion.toLowerCase() === enteredAnswer.toLowerCase();

        if (isAnswerMatch) {
            resetForgotPasswordCooldown();
            if (forgotPasswordSecurityModal) forgotPasswordSecurityModal.style.display = 'none';
            if (enteredAnswerFromInput) enteredAnswerFromInput.value = "";

            if (newPasswordInput) newPasswordInput.value = "";
            if (confirmPasswordInput) confirmPasswordInput.value = "";
            resetPasswordCriteriaUI();
            updateNewPasswordSaveButtonState(); // Ensure save button is correctly disabled initially

            if (newPasswordModalElement) {
                newPasswordModalElement.style.display = 'flex';
                if (newPasswordInput) newPasswordInput.focus();
            }
        } else {
            forgotPasswordAttempts = parseInt(localStorage.getItem('forgotPasswordAttempts')) || 0;
            forgotPasswordAttempts++;
            localStorage.setItem('forgotPasswordAttempts', forgotPasswordAttempts.toString());
            if (forgotPasswordSecurityModal) forgotPasswordSecurityModal.style.display = 'none';
            if (forgotPasswordAttempts >= MAX_FORGOT_PASSWORD_ATTEMPTS) {
                startForgotPasswordCooldown();
            } else {
                const attemptsLeft = MAX_FORGOT_PASSWORD_ATTEMPTS - forgotPasswordAttempts;
                showModal(`❌ Incorrect answer. ${attemptsLeft} attempt(s) remaining.`, false);
                setupObserverToReShowForgotModal();
            }
            if (enteredAnswerFromInput) enteredAnswerFromInput.value = "";
        }
    });
}

// --- Modal Close Buttons ---
const modalCloseSecurityButton = document.getElementById('modalCloseSecurity');
if (modalCloseSecurityButton) {
    modalCloseSecurityButton.onclick = () => {
        const modal = document.getElementById('forgotPasswordSecurityModal');
        if (modal) modal.style.display = 'none';
    };
}

const modalCloseNewButton = document.getElementById('modalCloseNew');
if (modalCloseNewButton) {
    modalCloseNewButton.onclick = () => {
        const modal = document.getElementById('newPasswordModal');
        if (modal) modal.style.display = 'none';
        if (newPasswordInput) newPasswordInput.value = "";
        if (confirmPasswordInput) confirmPasswordInput.value = "";
        resetPasswordCriteriaUI();
        updateNewPasswordSaveButtonState();
    };
}

// --- Password Visibility Toggles ---
function togglePasswordVisibility(inputElement, iconElement) {
    if (!inputElement || !iconElement) {
        return;
    }
    if (inputElement.type === "password") {
        inputElement.type = "text";
        iconElement.classList.remove('bxs-hide');
        iconElement.classList.add('bxs-show');
        iconElement.setAttribute('title', 'Hide Password');

    } else {
        inputElement.type = "password";
        iconElement.classList.remove('bxs-show');
        iconElement.classList.add('bxs-hide');
        iconElement.setAttribute('title', 'Show Password');
    }
}

const togglePasswordIcon = document.getElementById('togglePassword');
if (togglePasswordIcon) {
    togglePasswordIcon.addEventListener('click', function () {
        togglePasswordVisibility(document.getElementById('password'), this);
    });
}

const toggleNewPasswordIcon = document.getElementById('toggleNewPassword');
if (toggleNewPasswordIcon) {
    toggleNewPasswordIcon.addEventListener('click', function () {
        togglePasswordVisibility(newPasswordInput, this);
    });
}

const toggleConfirmPasswordIcon = document.getElementById('toggleConfirmPassword');
if (toggleConfirmPasswordIcon) {
    toggleConfirmPasswordIcon.addEventListener('click', function () {
        togglePasswordVisibility(confirmPasswordInput, this);
    });
}


// --- showModal and closeModal Functions ---
function showModal(message, isSuccess, onCloseCallback = null) {
    const targetModal = document.getElementById('modal');
    const targetModalMessage = document.getElementById('modalMessage');
    let targetModalClose = document.getElementById('modalClose');

    if (!targetModal || !targetModalMessage || !targetModalClose) {
        // Basic alert fallback if modal elements are missing
        const cleanMessage = message.replace(/<br\s*\/?>/gi, "\n").replace(/✅ |❌ |ℹ️ |⚠️ /g, "");
        alert(cleanMessage);
        if (onCloseCallback) onCloseCallback();
        return;
    }

    targetModalMessage.innerHTML = message; // Use innerHTML for <br> support
    targetModal.style.display = 'flex';
    const modalContent = targetModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.borderColor = isSuccess ? 'green' : 'red';
        targetModalMessage.style.color = '#333';
    }

    // This function will be called when the modal is closed
    const closeLogic = () => {
        targetModal.style.display = 'none';
        if (modalContent) modalContent.style.borderColor = ''; // Reset border color
        // Remove the outside click listener to prevent it from acting on subsequent modals
        window.removeEventListener('click', specificOutsideClickHandler);
        if (onCloseCallback) {
            onCloseCallback();
        }
    };

    // Re-bind close button by cloning to ensure only one event listener
    const newCloseButton = targetModalClose.cloneNode(true);
    targetModalClose.parentNode.replaceChild(newCloseButton, targetModalClose);
    targetModalClose = newCloseButton; // Update our reference
    targetModalClose.onclick = closeLogic;

    // Handler for clicks outside the modal content
    const specificOutsideClickHandler = (event) => {
        if (event.target === targetModal) { // If click is on the overlay itself
            closeLogic();
        }
    };
    window.addEventListener('click', specificOutsideClickHandler);


    if (isSuccess && message.includes("Login successful")) {
        setTimeout(() => {
            if (targetModal.style.display === 'flex') {
                closeLogic();
                window.location.replace("dashboard.html");
            }
        }, 1500);
    } else if (message.includes("Too many") || message.includes("Cooldown:") || message.includes("Please wait")) {
        // Cooldown messages do not auto-close
    } else {
         // Auto-close for other messages (error or success that isn't login)
         setTimeout(() => {
            if (targetModal.style.display === 'flex') {
                 closeLogic();
            }
        }, (isSuccess ? 2000 : 4000) ); // Longer for error messages with details
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal && modal.style.display === 'flex') { // Check if modal is actually open
        modal.style.display = 'none';
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.style.borderColor = '';
        // Attempt to remove any stray click listeners if they weren't handled by showModal's closeLogic
        // This part is tricky without knowing the exact listener reference.
        // The robust way is to ensure closeLogic in showModal always removes its specific listener.
    }
}

// --- window.onload ---
window.onload = function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = "dashboard.html";
        return;
    }

    if (!localStorage.getItem('storedCredentials')) {
        localStorage.setItem('storedCredentials', JSON.stringify({
            username: "admin",
            password: "123",
            securityAnswers: [ // Default answers for the 5 questions
                "boss",      // What was your childhood nickname?
                "Manila",    // In what city were you born?
                "doggy",     // What is the name of your first pet?
                "Smith",     // What is your mother's maiden name?
                "Toyota"     // What was the model of your first car?
            ]
        }));
    }
     // Initialize displayName if it's not already set, for demonstration.
    // In a real app, this might be set during user registration or profile setup.
    if (!localStorage.getItem('displayName') && localStorage.getItem('storedCredentials')) {
        try {
            const creds = JSON.parse(localStorage.getItem('storedCredentials'));
            if (creds && creds.username) {
                localStorage.setItem('displayName', creds.username); // Default displayName to username
                console.log(`[login.js] Default 'displayName' set to: ${creds.username}`);
            }
        } catch (e) {
            console.error("[login.js] Error setting default displayName:", e);
        }
    }


    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        try {
            const userData = JSON.parse(rememberedUser);
            const usernameEl = document.getElementById('username');
            const passwordEl = document.getElementById('password');
            if (usernameEl && userData.username) usernameEl.value = userData.username;
            if (passwordEl && userData.password) passwordEl.value = userData.password;
        } catch (e) {
            console.error("Error parsing rememberedUser from localStorage:", e);
            localStorage.removeItem('rememberedUser');
        }
    }

    manageCooldownState();
    manageForgotPasswordCooldownState();
    updateGlobalUIStateBasedOnCooldowns();
    if (typeof resetPasswordCriteriaUI === 'function') {
        resetPasswordCriteriaUI();
        updateNewPasswordSaveButtonState(); // Also update save button state on load
    }
};