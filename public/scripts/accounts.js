import displayResultNotif from "./notification.js";

[...document.getElementsByClassName('pass-viewer')].forEach(icon => {
  icon.addEventListener('click', function() {
    const passbox = document.getElementById(this.parentNode.htmlFor);
    // untoggled state
    if (this.classList.contains('fa-eye-slash')) {
      this.classList.remove('fa-eye-slash');
      this.classList.add('fa-eye');
      passbox.type = 'text';
    }
    else {
      // toggled state 
      this.classList.remove('fa-eye');
      this.classList.add('fa-eye-slash');
      passbox.type = 'password';
    }
  });
});

const CREATE = document.getElementById('create-account');
const SIGN_IN = document.getElementById('sign-in');
document.getElementById('switch-to-create').addEventListener('click', () => {
  swapForms(SIGN_IN, CREATE);
});
document.getElementById('switch-to-sign').addEventListener('click', () => {
  swapForms(CREATE, SIGN_IN);
});

function swapForms(from, to) {
  function onFadeInEnd() {
    to.style.animation = 'none';
    to.style.opacity = 1;
    to.removeEventListener('animationend', onFadeInEnd);
  }

  function onFadeOutEnd() {
    from.style.display = 'none';
    from.style.animation = 'none'
    from.style.opacity = 0;

    to.style.display = 'flex';
    to.addEventListener('animationend', onFadeInEnd);
    to.style.animation = 'short-fade-in 500ms ease-in-out';

    from.removeEventListener('animationend', onFadeOutEnd);
  }
  
  from.addEventListener('animationend', onFadeOutEnd);
  from.style.animation = 'short-fade-out 500ms ease-in-out';
}

// checks if a string has a symbol
function hasSymbol(str) {
  return /[!@#$%^&*()\-_=+{}[\]\\|;'",<.>/?`~]/.test(str);
}

// validates >8 characters, at least 1 number and 1 symbol
function validatePassword(pass) {
  return pass.length >= 8
    && !/:/.test(pass) // no colon
    && /\d/.test(pass) // one number
    && hasSymbol(pass); // one symbols
}


// verifies all base requirements are met for new account details
function validateAccountCreation(form) {
  let valid = [true, true, true];
  const inputs = form.getElementsByTagName('input');
  if (inputs[0].value.length < 5) {
    inputs[0].nextElementSibling.style.color = 'var(--error-red)';
    valid[0] = false;
  }
  if (!validatePassword(inputs[1].value)) {
    inputs[1].nextElementSibling.style.color = 'var(--error-red)';
    valid[1] = false;
  }
  if (inputs[1].value !== inputs[2].value) {
    inputs[2].nextElementSibling.style.color = 'var(--error-red)';
    valid[2] = false;
  }

  return valid;
}

const maxLength = 64;
function validateSignIn(form) {
  const inputs = form.getElementsByTagName('input');
  let valid = inputs[0].value && inputs[1].value
    && inputs[0].value.length < maxLength
    && inputs[1].value.length < maxLength;

  if (!valid) {
    const span = form.getElementsByClassName('requirements')[0];
    span.style.color = 'var(--error-red)';
  }

  return valid;
}

// clears the error colours on valid fields
function clearErrorColours(parent, validArr) {
  const spans = parent.getElementsByClassName('requirements');
  for (let i = 0; i < spans.length; i++)
    if (validArr[i])
      spans[i].style.color = 'var(--subtext)';
}

function post(form, route) {
  const formData = new FormData(form);
  const urlParams = new URLSearchParams(formData);

  fetch(route, {
    method: 'POST',
    body: urlParams,
    redirect: 'manual'
  })
  .then(response => response.json())
  .then(data => {
    if (!data.ok)
      displayResultNotif(false, data.errors)
    else {
      if (data.redirect)
        window.location.href = data.redirect;

      form.reset();
      displayResultNotif(true);
    }
  })
  .catch(err => console.error(`Something went wrong: ${err.message}`));
}

const SIGN_IN_FORM = document.getElementById('sign-in-form');
SIGN_IN_FORM.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const valid = [validateSignIn(SIGN_IN_FORM)];
  clearErrorColours(SIGN_IN_FORM, valid);

  if (!valid[0]) return;

  post(SIGN_IN_FORM, '/sign-in');
});

const CREATE_ACC_FORM = document.getElementById('create-form');
CREATE_ACC_FORM.addEventListener('submit', (e) => {
  e.preventDefault();

  const validArr = validateAccountCreation(CREATE_ACC_FORM);
  clearErrorColours(CREATE_ACC_FORM, validArr);

  if (validArr.some(v => !v)) return;

  post(CREATE_ACC_FORM, '/create-acc');
});
CREATE_ACC_FORM.addEventListener('reset', () => {
  document.getElementById('switch-to-sign').click();
});
