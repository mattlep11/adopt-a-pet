const DISABLER_CHECKBOXES = document.getElementsByClassName("none-chosen");

// the different fields that must be validated and the corresponding input type
const INPUT_TYPES = {
  "animal-type": "radio",
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
  return elements.some((e) => e.checked);
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
    let error;         // specifies error type if invalid
  
      if (type === "radio" || type === "checkbox") {
        fieldIsValid = atLeastOneClicked(elementsToValidate);
        error = "unchecked";
      }
      else if (type === "select" || type === "text") {
        fieldIsValid = elementsToValidate.every(el => validateTextInput(el));
        error = "unfilled";
      }
      else if (type === "email") {
        fieldIsValid = elementsToValidate.every(el => validateEmail(el));
        error = "invalid";
      }

    if (!fieldIsValid) {
      status.isValid = false;
      status.errorTypes.push(error);
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

// creates the error message to display to the user
function composeErrorMessage(errors) {
  const unchecked = "Please ensure all radios and checkboxes are checked.";
  const unfilled = "Please ensure all textfields and dropdowns " 
    + "are filled with accurate information";
  const invalid = "Please ensure that your email follows the correct format";

  let errorMsg = "Invalid input has been detected. See the following:";
  if (errors.includes("unchecked"))
    errorMsg += "<br>- " + unchecked;

  if (errors.includes("unfilled"))
    errorMsg += "<br>- " + unfilled;

  if (errors.includes("invalid"))
    errorMsg += "<br>- " + invalid

  return errorMsg;
}

function displayErrorMessage(msg) {
  let node = document.getElementById("error-msg");
  node.style.display = "block";
  node.innerHTML = msg;
}

// add a listener to disable all checkboxes if a no-preference option is used
[...DISABLER_CHECKBOXES].forEach(cbox => cbox.addEventListener("change", e => {
  let node = e.target;
  if (node.checked || !node.checked)
    toggleCheckboxes(node, [...document.getElementsByName(node.name)]);
}));

const FORM = document.getElementById("pet-form");
FORM.addEventListener("submit", e => {
  const validationStatus = validateInputFields();
  if (!validationStatus.isValid) {
    // prevent the submission event if the input wasn't valid
    e.preventDefault();
    let errorMsg = composeErrorMessage(validationStatus.errorTypes);
    console.log("Invalid input field detected.\n" + errorMsg);

    displayErrors(validationStatus.fieldNames);
    displayErrorMessage(errorMsg);
  }

  // remove the error class from everything that has been since validated
  cleanErrorClasses(validationStatus.fieldNames);
});