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

// validates >8 characters, at least 1 number and 1 symbol
function validatePassword(pass) {
  return pass.length >= 8
    && /\d/.test(pass)
    && /[!@#$%^&*()\-_=+{}[\]\\|;:'",<.>/?`~]/.test(pass);
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

function displayErrorNotif(errors) {
  const notif = document.getElementById('notif-invalid');
  const errorSpan = document.getElementById('notif-errors');

  errorSpan.innerText = ''; // clear old errors if used
  errorSpan.innerText = errors.map((error, idx) => (idx === 0 ? ` - ${error}` : `\n - ${error}`)).join('');
  
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

function post(form, route) {
  const formData = new FormData(form);
  const urlParams = new URLSearchParams(formData);

  fetch(route, {
    method: 'POST',
    body: urlParams
  })
  .then(response => response.json())
  .then(data => {
    if (!data.ok)
      displayErrorNotif(data.errors)
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
