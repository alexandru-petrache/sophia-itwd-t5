const volunteerRoles = [
  { id: "dog-walker", name: "Dog walker and enrichment volunteer" },
  { id: "cat-social", name: "Cat socialization volunteer" },
  { id: "event-greeter", name: "Adoption event greeter" },
  { id: "transport-driver", name: "Transport driver" }
];

const STORAGE_KEYS = {
  savedRoles: "tcarSavedRoles",
  contactInfo: "tcarContactInfo"
};

function getSavedRoleIds() {
  const stored = localStorage.getItem(STORAGE_KEYS.savedRoles);
  return stored ? JSON.parse(stored) : [];
}

function setSavedRoleIds(roleIds) {
  localStorage.setItem(STORAGE_KEYS.savedRoles, JSON.stringify(roleIds));
}

function getSavedContactInfo() {
  const stored = localStorage.getItem(STORAGE_KEYS.contactInfo);
  return stored ? JSON.parse(stored) : null;
}

function setSavedContactInfo(info) {
  localStorage.setItem(STORAGE_KEYS.contactInfo, JSON.stringify(info));
}

function getRoleNameById(id) {
  const role = volunteerRoles.find(function (r) {
    return r.id === id;
  });
  return role ? role.name : id;
}
function toggleRoleSaved(roleId) {
  const saved = getSavedRoleIds();
  const index = saved.indexOf(roleId);

  if (index === -1) {
    saved.push(roleId);
  } else {
    saved.splice(index, 1);
  }

  setSavedRoleIds(saved);
  renderRoleButtons();
  renderSavedRolesSummary();
}

function renderRoleButtons() {
  const savedIds = getSavedRoleIds();

  volunteerRoles.forEach(function (role) {
    const button = document.querySelector('button[data-role-id="' + role.id + '"]');
    if (!button) return;

    const isSaved = savedIds.indexOf(role.id) !== -1;
    button.textContent = isSaved ? "Saved" : "Save this role";
    button.classList.toggle("is-saved", isSaved);
    button.setAttribute("aria-pressed", isSaved ? "true" : "false");
  });
}

function renderSavedRolesSummary() {
  const summaryBox = document.getElementById("saved-roles-summary");
  if (!summaryBox) return;

  const savedIds = getSavedRoleIds();

  if (savedIds.length === 0) {
    summaryBox.innerHTML =
      "<h3>Your Saved Roles</h3>" +
      "<p>You haven't saved any volunteer roles yet. Click \u201cSave this role\u201d below to build your list.</p>";
    return;
  }

  const listItems = savedIds
    .map(function (id) {
      return "<li>" + getRoleNameById(id) + "</li>";
    })
    .join("");

  summaryBox.innerHTML =
    "<h3>Your Saved Roles (" + savedIds.length + ")</h3>" +
    "<p>These roles will be waiting for you on the Contact page.</p>" +
    "<ul>" + listItems + "</ul>";
}

function initVolunteerFeature() {
  const list = document.getElementById("volunteer-list");
  if (!list) return; // Not on services.html — nothing to do

  const items = list.querySelectorAll("li[data-role-id]");

  items.forEach(function (li) {
    const roleId = li.getAttribute("data-role-id");

    const label = document.createElement("span");
    label.textContent = li.textContent;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "role-btn";
    button.setAttribute("data-role-id", roleId);
    button.setAttribute("aria-pressed", "false");
    button.textContent = "Save this role";
    button.addEventListener("click", function () {
      toggleRoleSaved(roleId);
    });

    li.textContent = "";
    li.classList.add("role-item");
    li.appendChild(label);
    li.appendChild(button);
  });

  renderRoleButtons();
  renderSavedRolesSummary();
}

function renderInterestBanner() {
  const banner = document.getElementById("saved-interest-banner");
  if (!banner) return;

  const savedIds = getSavedRoleIds();

  if (savedIds.length === 0) {
    banner.hidden = true;
    banner.innerHTML = "";
    return;
  }

  const roleNames = savedIds.map(getRoleNameById).join(", ");

  banner.hidden = false;
  banner.innerHTML =
    "<h3>Welcome back!</h3>" +
    "<p>On the Services page you showed interest in: " + roleNames + ".</p>" +
    '<button type="button" id="fill-message-btn">Add these to my message</button>';

  document.getElementById("fill-message-btn").addEventListener("click", function () {
    const messageField = document.getElementById("message");
    const note = "I'm interested in the following volunteer roles: " + roleNames + ".";
    messageField.value = messageField.value ? messageField.value + "\n\n" + note : note;
    messageField.focus();
  });
}

function prefillReturningContactInfo() {
  const info = getSavedContactInfo();
  if (!info) return;

  const nameField = document.getElementById("full-name");
  const emailField = document.getElementById("email");

  if (nameField && !nameField.value) nameField.value = info.fullName || "";
  if (emailField && !emailField.value) emailField.value = info.email || "";
}

function showFieldError(fieldEl, message) {
  fieldEl.classList.add("field-invalid");
  const errorEl = document.getElementById(fieldEl.id + "-error");
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldEl) {
  fieldEl.classList.remove("field-invalid");
  const errorEl = document.getElementById(fieldEl.id + "-error");
  if (errorEl) errorEl.textContent = "";
}

function validateFullName(fieldEl) {
  const value = fieldEl.value.trim();

  if (value.length === 0) {
    showFieldError(fieldEl, "Please enter your full name.");
    return false;
  }
  if (value.length < 2) {
    showFieldError(fieldEl, "Name must be at least 2 characters long.");
    return false;
  }

  clearFieldError(fieldEl);
  return true;
}

function validateEmail(fieldEl) {
  const value = fieldEl.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value.length === 0) {
    showFieldError(fieldEl, "Please enter your email address.");
    return false;
  }
  if (!emailPattern.test(value)) {
    showFieldError(fieldEl, "Please enter a valid email address, like name@example.com.");
    return false;
  }

  clearFieldError(fieldEl);
  return true;
}

function validateInterestType(fieldEl) {
  if (fieldEl.value === "") {
    showFieldError(fieldEl, "Please select an interest type.");
    return false;
  }

  clearFieldError(fieldEl);
  return true;
}

function showFormStatus(message, isSuccess) {
  const statusEl = document.getElementById("form-status");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = isSuccess ? "success" : "error";
}

function handleContactFormSubmit(event) {
  const nameField = document.getElementById("full-name");
  const emailField = document.getElementById("email");
  const interestField = document.getElementById("interest-type");

  const isNameValid = validateFullName(nameField);
  const isEmailValid = validateEmail(emailField);
  const isInterestValid = validateInterestType(interestField);

  event.preventDefault();

  if (!isNameValid || !isEmailValid || !isInterestValid) {
    showFormStatus("Please fix the highlighted fields before submitting.", false);
    return;
  }

  setSavedContactInfo({
    fullName: nameField.value.trim(),
    email: emailField.value.trim()
  });

  showFormStatus("Thanks! Your information has been saved. We'll be in touch soon.", true);
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  renderInterestBanner();
  prefillReturningContactInfo();

  const nameField = document.getElementById("full-name");
  const emailField = document.getElementById("email");
  const interestField = document.getElementById("interest-type");

  nameField.addEventListener("input", function () {
    validateFullName(nameField);
  });
  emailField.addEventListener("input", function () {
    validateEmail(emailField);
  });
  interestField.addEventListener("change", function () {
    validateInterestType(interestField);
  });

  form.addEventListener("submit", handleContactFormSubmit);
}

document.addEventListener("DOMContentLoaded", function () {
  initVolunteerFeature();
  initContactForm();
});
