function getCurrentUser() {
    return JSON.parse(localStorage.getItem("charityUser") || "null");
}

function getDonations() {
    return JSON.parse(localStorage.getItem("charityDonations") || "[]");
}

function showAccountForm(type) {
    document.getElementById("loginSection").classList.toggle("hidden", type !== "login");
    document.getElementById("registerSection").classList.toggle("hidden", type !== "register");
    document.getElementById("loginTab").classList.toggle("active", type === "login");
    document.getElementById("registerTab").classList.toggle("active", type === "register");
}

function checkPasswordRules(password) {
    var checks = {
        ruleLength: password.length >= 8,
        ruleUpper: /[A-Z]/.test(password),
        ruleLower: /[a-z]/.test(password),
        ruleNumber: /[0-9]/.test(password),
        ruleSpecial: /[^A-Za-z0-9]/.test(password)
    };

    for (var id in checks) {
        var item = document.getElementById(id);
        if (item) item.classList.toggle("valid", checks[id]);
    }

    return Object.values(checks).every(Boolean);
}

function updatePasswordMatch() {
    var password = document.getElementById("registerPassword");
    var confirm = document.getElementById("registerConfirmPassword");
    var message = document.getElementById("passwordMatch");
    if (!password || !confirm || !message) return false;

    if (!confirm.value) {
        message.textContent = "";
        message.classList.remove("valid");
        return false;
    }

    var matches = password.value === confirm.value;
    message.textContent = matches ? "Passwords match." : "Passwords do not match.";
    message.classList.toggle("valid", matches);
    return matches;
}

function registerUser(event) {
    event.preventDefault();

    var name = document.getElementById("registerName").value.trim();
    var phone = document.getElementById("registerPhone").value.trim();
    var city = document.getElementById("registerCity").value.trim();
    var email = document.getElementById("registerEmail").value.trim().toLowerCase();
    var password = document.getElementById("registerPassword").value;
    var confirmPassword = document.getElementById("registerConfirmPassword").value;
    var users = JSON.parse(localStorage.getItem("charityUsers") || "[]");
    var message = document.getElementById("registerMessage");
    message.textContent = "";

    if (!checkPasswordRules(password)) {
        message.textContent = "Please meet all password requirements.";
        return;
    }
    if (password !== confirmPassword) {
        message.textContent = "Your passwords do not match.";
        return;
    }
    if (!document.getElementById("registerTerms").checked) {
        message.textContent = "Please accept the confirmation checkbox to continue.";
        return;
    }

    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            message.textContent = "This email is already registered. Please login.";
            return;
        }
    }

    var newUser = {
        name: name,
        phone: phone,
        city: city,
        email: email,
        password: password,
        role: "Donor"
    };
    users.push(newUser);
    localStorage.setItem("charityUsers", JSON.stringify(users));
    localStorage.setItem("charityUser", JSON.stringify(newUser));
    var pendingPage = localStorage.getItem("charityPendingPage");
    localStorage.removeItem("charityPendingPage");
    window.location.href = pendingPage || "dashboard.html";
}

function loginUser(event) {
    event.preventDefault();

    var email = document.getElementById("loginEmail").value.trim().toLowerCase();
    var password = document.getElementById("loginPassword").value;
    var users = JSON.parse(localStorage.getItem("charityUsers") || "[]");
    var message = document.getElementById("loginMessage");

    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            localStorage.setItem("charityUser", JSON.stringify(users[i]));
            var pendingPage = localStorage.getItem("charityPendingPage");
            localStorage.removeItem("charityPendingPage");
            window.location.href = pendingPage || "dashboard.html";
            return;
        }
    }

    message.textContent = "Incorrect email or password. Please try again.";
}

function submitDonation(event) {
    event.preventDefault();

    // Donations are available only to signed-in users.
    if (!getCurrentUser()) {
        localStorage.setItem("charityPendingPage", window.location.href);
        window.location.href = "auth.html";
        return;
    }

    var donation = {
        id: Date.now(),
        name: document.getElementById("donorName").value.trim(),
        phone: document.getElementById("donorPhone").value.trim(),
        email: document.getElementById("donorEmail").value.trim(),
        city: document.getElementById("donorCity").value.trim(),
        amount: Number(document.getElementById("donationAmount").value),
        cause: document.getElementById("donationCause").value,
        paymentMethod: document.getElementById("paymentMethod").value,
        message: document.getElementById("donationMessage").value.trim(),
        anonymous: document.getElementById("anonymousDonation").checked,
        status: "Details submitted"
    };

    if (!donation.name || !donation.phone || !donation.email || !donation.city || !donation.cause || !donation.paymentMethod || donation.amount < 1 || !document.getElementById("confirmDonation").checked) {
        document.getElementById("formMessage").textContent = "Please complete all required fields and confirm your details.";
        return;
    }

    var donations = getDonations();
    donations.push(donation);
    localStorage.setItem("charityDonations", JSON.stringify(donations));

    document.getElementById("receiptId").textContent = "CC" + donation.id;
    document.getElementById("receiptName").textContent = donation.anonymous ? "Anonymous donor" : donation.name;
    document.getElementById("receiptPhone").textContent = donation.phone;
    document.getElementById("receiptCity").textContent = donation.city;
    document.getElementById("receiptCause").textContent = donation.cause;
    document.getElementById("receiptAmount").textContent = "₹" + donation.amount.toLocaleString("en-IN");
    document.getElementById("receiptPayment").textContent = donation.paymentMethod;

    document.querySelector(".form-layout").hidden = true;
    document.getElementById("donationConfirmation").hidden = false;
    window.scrollTo(0, 0);
}

function startAnotherDonation() {
    document.getElementById("donationForm").reset();

    var user = getCurrentUser();
    if (user) {
        document.getElementById("donorName").value = user.name || "";
        document.getElementById("donorEmail").value = user.email || "";
        document.getElementById("donorPhone").value = user.phone || "";
        document.getElementById("donorCity").value = user.city || "";
    }

    document.getElementById("donationConfirmation").hidden = true;
    document.querySelector(".form-layout").hidden = false;
    document.getElementById("formMessage").textContent = "";
    window.scrollTo(0, 0);
}

function updateUserArea() {
    var user = getCurrentUser();
    var areas = document.querySelectorAll(".user-area");

    for (var i = 0; i < areas.length; i++) {
        if (user) {
            areas[i].innerHTML = '<span>Hi, ' + user.name + '</span> <a class="login-link" href="#" data-logout="true">Logout</a>';
        } else {
            areas[i].innerHTML = '<a class="login-link" href="auth.html">Login / Register</a>';
        }
    }

    var logoutLinks = document.querySelectorAll("[data-logout]");
    for (var j = 0; j < logoutLinks.length; j++) {
        logoutLinks[j].addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("charityUser");
            window.location.reload();
        });
    }
}

function loadPage() {
    var user = getCurrentUser();

    // Require an account before opening the donation page, while preserving
    // the selected cause so the user can continue after login or registration.
    if (document.getElementById("donationForm") && !user) {
        localStorage.setItem("charityPendingPage", window.location.href);
        window.location.replace("auth.html");
        return;
    }

    updateUserArea();
    var nameField = document.getElementById("donorName");
    var emailField = document.getElementById("donorEmail");
    var phoneField = document.getElementById("donorPhone");
    var cityField = document.getElementById("donorCity");

    if (user) {
        if (nameField) nameField.value = user.name || "";
        if (emailField) emailField.value = user.email || "";
        if (phoneField) phoneField.value = user.phone || "";
        if (cityField) cityField.value = user.city || "";
    }

    var amountButtons = document.querySelectorAll(".amount-button");
    for (var a = 0; a < amountButtons.length; a++) {
        amountButtons[a].addEventListener("click", function () {
            document.getElementById("donationAmount").value = this.getAttribute("data-amount");
            for (var b = 0; b < amountButtons.length; b++) amountButtons[b].classList.remove("selected");
            this.classList.add("selected");
        });
    }

    var amountField = document.getElementById("donationAmount");
    if (amountField) {
        amountField.addEventListener("input", function () {
            for (var c = 0; c < amountButtons.length; c++) amountButtons[c].classList.remove("selected");
        });
    }

    var causeField = document.getElementById("donationCause");
    if (causeField) {
        var selectedCause = new URLSearchParams(window.location.search).get("cause");
        if (selectedCause) {
            for (var i = 0; i < causeField.options.length; i++) {
                if (causeField.options[i].text === selectedCause) {
                    causeField.selectedIndex = i;
                    break;
                }
            }
        }
    }

    var registerPassword = document.getElementById("registerPassword");
    var registerConfirmPassword = document.getElementById("registerConfirmPassword");
    if (registerPassword) {
        registerPassword.addEventListener("input", function () {
            checkPasswordRules(this.value);
            updatePasswordMatch();
        });
    }
    if (registerConfirmPassword) {
        registerConfirmPassword.addEventListener("input", updatePasswordMatch);
    }

    var loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", loginUser);

    var registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.addEventListener("submit", registerUser);

    var donationForm = document.getElementById("donationForm");
    if (donationForm) donationForm.addEventListener("submit", submitDonation);

    var donateAgain = document.getElementById("donateAgain");
    if (donateAgain) donateAgain.addEventListener("click", startAnotherDonation);
}

document.addEventListener("DOMContentLoaded", loadPage);
