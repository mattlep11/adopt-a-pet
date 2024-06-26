import displayResultNotif from "./notification.js";

const DISABLER_CHECKBOXES = document.getElementsByClassName('none-chosen');
const ERROR_TOOLTIPS = document.getElementsByClassName('error-tooltip');
const ANIMAL_RADIOS = document.getElementsByName('animal');

// the different fields that must be validated and the corresponding input type
const INPUT_TYPES = {
  'animal': 'radio',
  'name': 'text',
  'photo': 'file',
  'breed': 'select',
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
  const node = e.target;
  if (node.checked || !node.checked)
    toggleCheckboxes(node, [...document.getElementsByName(node.name)]);
}));

[...ERROR_TOOLTIPS].forEach(tooltip => 
  tooltip.addEventListener('animationend', e => {
    tooltip.style.animation = 'none';
}));

// only show the values of the respective animal in the select drop down
[...ANIMAL_RADIOS].forEach(radio => radio.addEventListener('click', e => {
  const node = e.target;
  const optgroups = [...document.getElementsByTagName('optgroup')];

  for (let idx in optgroups) {
    const group = optgroups[idx];
    if (group.id !== undefined && group.id !== node.value) {
      group.style.display = 'none';
      const currentVal = group.parentNode.value;
      const options = [...group.childNodes];
      // reset the value if its not allowed
      for (let jdx in options) {
        if (currentVal === options[jdx].value)
          group.parentNode.value = '';
      }
    }
    else
      group.style.display = 'block';
  }
  
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
    if (POST_DEST === '/giveaway-form')
      postToGiveaway(formData);
    else if (POST_DEST === '/browse-filtered')
      postToFinder(formData);
    else
      console.error('Invalid post destination. Something went wrong.');

    // clear the checkoxes back to normal
    [...DISABLER_CHECKBOXES].forEach(cbox => {
    if (cbox.checked) {
      cbox.checked = false;
      toggleCheckboxes(cbox, [...document.getElementsByName(cbox.name)]);
    }
  });
  }

  // remove the error class from everything that has been since validated
  cleanErrorClasses(validationStatus.fieldNames);
});

function postToGiveaway(formData) {
  fetch('/giveaway-form', {
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
  window.location.href = '/browse-filtered?' + dataParams;
  FORM.reset();
}
