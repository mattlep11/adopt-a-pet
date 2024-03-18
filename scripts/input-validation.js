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
  let valid = true;
  for (let name in INPUT_TYPES) {
    let elementsToValidate = [...document.getElementsByName(name)];
    let type = INPUT_TYPES[name];

      // if this form does not contain that input field, skip to the next one
      if (elementsToValidate == undefined || elementsToValidate.length === 0)
        continue;
    
      if (type === "radio" || type === "checkbox")
        valid = atLeastOneClicked(elementsToValidate);
      else if (type === "select" || type === "text")
        valid = elementsToValidate.every(el => validateTextInput(el));
      else if (type === "email")
        valid = elementsToValidate.every(el => validateEmail(el));

    if (!valid) return false;
  }

  return valid;
}

// add a listener to disable all checkboxes if a no-preference option is used
[...DISABLER_CHECKBOXES].forEach(cbox => cbox.addEventListener("change", e => {
  let node = e.target;
  if (node.checked || !node.checked)
    toggleCheckboxes(node, [...document.getElementsByName(node.name)]);
}));

const FORM = document.getElementById("pet-form");
FORM.addEventListener("submit", e => {
  if (!validateInputFields()) {
    // prevent the submission event if the input wasn't valid
    e.preventDefault();
    console.log("Invalid input field detected.");
  }
});