const DISABLER_CHECKBOXES = document.getElementsByClassName("none-chosen");
const ERROR_TOOLTIPS = document.getElementsByClassName("error-tooltip");

// the different fields that must be validated and the corresponding input type
const INPUT_TYPES = {
  "animal-type": "radio",
  "pet-name": "text",
  "breed": "checkbox",
  "age": "select",
  "gender": "radio",
  "gets-along-with": "checkbox",
  "desc": "text",
  "owner-name": "text",
  "email": "email"
};

// verifies that at least one checkbox or radio button has been clicked
function atLeastOneClicked(elements) {
  return elements.some(e => e.checked);
}

// verifies that a string-valued element is not empty or default 
function validateTextInput(element) {
  return Boolean(element.value);
}

const EMAIL_REGEX = /^[\w\-.]+@([\w\-]+\.)+(\w{2,3})$/gm;
// verifies that the given email matches the default accepted standard
function validateEmail(email) {
  return EMAIL_REGEX.test(email.value);
}

// disables all checkboxes besides the one that called for them to be disabled
function toggleCheckboxes(caller, checkboxes) {
  for (let idx in checkboxes) {
    let cb = checkboxes[idx];
    if (cb != caller) {
      cb.checked = false;
      cb.disabled = !cb.disabled;
    }
  }
}

// validates all input fields in the input_types object based on their type
function validateInputFields() {
  const status = {
    isValid: true,
    errorTypes: [],
    fieldNames: []
  }

  for (let name in INPUT_TYPES) {
    let type = INPUT_TYPES[name];
    let elementsToValidate = [...document.getElementsByName(name)];
    
    // if this form does not have that input field, skip to the next one
    if (elementsToValidate == undefined || elementsToValidate.length === 0)
    continue;

    let fieldIsValid;  // whether or not this field has valid input
  
      if (type === "radio" || type === "checkbox")
        fieldIsValid = atLeastOneClicked(elementsToValidate);

      else if (type === "select" || type === "text")
        fieldIsValid = elementsToValidate.every(el => validateTextInput(el));

      else if (type === "email")
        fieldIsValid = elementsToValidate.every(el => validateEmail(el));

    if (!fieldIsValid) {
      status.isValid = false;
      status.fieldNames.push(name);
    }
  }

  return status;
}

const INVALID_INPUT_CLASS = "error-detected";
// each field is nested in a div with an ID equal to the form name
// display a red error border around invalid fields 
function displayErrors(invalidFields) {
  for (let i = 0; i < invalidFields.length; i++) {
    let field = document.getElementById(invalidFields[i]);
    field.classList.add(INVALID_INPUT_CLASS);
  }
}

function cleanErrorClasses(invalidFields) {
  for (let name in INPUT_TYPES) {
    if (!invalidFields.includes(name)) {
      let field = document.getElementById(name);

      // ensure this page actually has this input field
      if (field != null)
        document.getElementById(name).classList.remove(INVALID_INPUT_CLASS);
    }
  }
}

const INVALID_ANIMATION = "fade-out";
function fadeErrorMessages(invalidFields) {
  for (let idx in invalidFields) {
    let parent = document.getElementById(invalidFields[idx]);
    let node = parent.getElementsByClassName('error-tooltip')[0];
    node.style.animation = INVALID_ANIMATION + " 13s ease-out 1";
  }
}

// add a listener to disable all checkboxes if a no-preference option is used
[...DISABLER_CHECKBOXES].forEach(cbox => cbox.addEventListener("change", e => {
  let node = e.target;
  if (node.checked || !node.checked)
    toggleCheckboxes(node, [...document.getElementsByName(node.name)]);
}));

[...ERROR_TOOLTIPS].forEach(tooltip => 
  tooltip.addEventListener("animationend", e => {
    tooltip.style.animation = "none";
  }));

const FORM = document.getElementById("pet-form");
FORM.addEventListener("submit", e => {
  const validationStatus = validateInputFields();
  if (!validationStatus.isValid) {
    // prevent the submission event if the input wasn't valid
    e.preventDefault();
    console.log("Invalid input field detected.");

    displayErrors(validationStatus.fieldNames);
    fadeErrorMessages(validationStatus.fieldNames);
    document.getElementById("error-detected").style.display = "block";
  }

  // remove the error class from everything that has been since validated
  cleanErrorClasses(validationStatus.fieldNames);
});