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
    to.style.animation = 'fade-in 500ms ease-in-out';

    from.removeEventListener('animationend', onFadeOutEnd);
  }
  
  from.addEventListener('animationend', onFadeOutEnd);
  from.style.animation = 'fade-out 500ms ease-in-out';
}
