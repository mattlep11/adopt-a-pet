const DISABLER_CHECKBOXES = document.getElementsByClassName('none-chosen');
const ERROR_TOOLTIPS = document.getElementsByClassName('error-tooltip');

// the different fields that must be validated and the corresponding input type
const INPUT_TYPES = {
  'animal-type': 'radio',
  'name': 'text',
  'photo': 'file',
  'breed': 'checkbox',
  'age': 'select',
  'gender': 'radio',
  'behaviour': 'checkbox',
  'desc': 'text',
  'owner-name': 'text',
  'email': 'email'
};

// verifies that at least one checkbox or radio button has been clicked
function atLeastOneClicked(elements) {
  return elements.some(e => e.checked);
}

// verifies that a string-valued element is not empty or default 
function validateTextInput(element) {
  return Boolean(element.value);
}

function validatePhotoInput(element) {
  return element.files.length !== 0;
}

const EMAIL_REGEX = /^[\w\-.]+@([\w\-]+\.)+(\w{2,3})$/m;
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
  
      if (type === 'radio' || type === 'checkbox')
        fieldIsValid = atLeastOneClicked(elementsToValidate);

      else if (type === 'select' || type === 'text')
        fieldIsValid = elementsToValidate.every(el => validateTextInput(el));

      else if (type === 'email')
        fieldIsValid = elementsToValidate.every(el => validateEmail(el));

      else if (type === 'file')
        fieldIsValid = elementsToValidate.every(el => validatePhotoInput(el));

    if (!fieldIsValid) {
      status.isValid = false;
      status.fieldNames.push(name);
    }
  }

  return status;
}

const INVALID_INPUT_CLASS = 'error-detected';
// each field is nested in a div with an ID equal to the form name
// display a red error border around invalid fields 
function displayErrors(invalidFields) {
  for (let i = 0; i < invalidFields.length; i++) {
    let field = document.getElementById(invalidFields[i]);
    field.classList.add(INVALID_INPUT_CLASS);
  }
}

function cleanErrorClasses(invalidFields) {
  if (invalidFields.length === 0)
    document.getElementById('error-detected').style.display = 'none';

  for (let name in INPUT_TYPES) {
    if (!invalidFields.includes(name)) {
      let field = document.getElementById(name);

      // ensure this page actually has this input field
      if (field != null)
        document.getElementById(name).classList.remove(INVALID_INPUT_CLASS);
    }
  }
}

function fadeErrorMessages(invalidFields) {
  for (let idx in invalidFields) {
    let parent = document.getElementById(invalidFields[idx]);
    let node = parent.getElementsByClassName('error-tooltip')[0];
    node.style.animation = 'fade-out 13s ease-out 1';
  }
}

// add a listener to disable all checkboxes if a no-preference option is used
[...DISABLER_CHECKBOXES].forEach(cbox => cbox.addEventListener('change', e => {
  let node = e.target;
  if (node.checked || !node.checked)
    toggleCheckboxes(node, [...document.getElementsByName(node.name)]);
}));

[...ERROR_TOOLTIPS].forEach(tooltip => 
  tooltip.addEventListener('animationend', e => {
    tooltip.style.animation = 'none';
  }));

const FORM = document.getElementById('pet-form');
const POST_DEST = FORM.action.match(/\/([^\/])+$/)[0];
FORM.addEventListener('submit', e => {
  e.preventDefault();
  const validationStatus = validateInputFields();
  
  if (!validationStatus.isValid) {
    console.error('Invalid input field detected.');
    displayErrors(validationStatus.fieldNames);
    fadeErrorMessages(validationStatus.fieldNames);
    document.getElementById('error-detected').style.display = 'block';
  }
  else {
    const formData = new FormData(FORM);
    if (POST_DEST === "/giveaway-form")
      postToGiveaway(formData);
    else if (POST_DEST === "/pet-finder")
      postToFinder(formData);
    else
      console.error("Invalid post destination. Something went wrong.");
  }

  // remove the error class from everything that has been since validated
  cleanErrorClasses(validationStatus.fieldNames);
});

function postToGiveaway(formData) {
  fetch("/giveaway-form", {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.ok)
      FORM.reset();

    displayResultNotif(data.ok, data.errors);
  })
  .catch(err => console.error(`Failed to post: ${err}`));
}

function postToFinder(formData) {
  const dataParams = new URLSearchParams(formData);
}

function displayResultNotif(success, errors) {
  let notif;
  if (success)
    notif = document.getElementById("notif-valid");
  else {
    notif = document.getElementById("notif-invalid");
    const errorSpan = document.getElementById("notif-errors");

    errorSpan.innerText = ''; // clear old errors if used
    console.log(errors);
    errorSpan.innerText = errors.map((error, idx) => (idx === 0 ? ` - ${error}` : `\n - ${error}`)).join('');
  }
  
  notif.style.display = 'block';
  notif.style.animation = 'slide-up 400ms ease-out forwards, fade-out 13s ease-out 400ms forwards';

  function onAnimationEnd() {
    let animationCount = 0;
    // remove the event listener after the two fire so they can be reused
    function removeListener() {
      if (animationCount == 1)  {
        notif.style.display = 'none';
        notif.style.animation = 'none';
        notif.removeEventListener('animationend', onAnimationEnd);
      }
      animationCount++;
    }

    return removeListener;
  }

  notif.addEventListener('animationend', onAnimationEnd());
}