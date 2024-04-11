let animationCount = 0; 

function removeListener() {
  if (animationCount == 1)  {
    this.style.display = 'none';
    this.style.animation = 'none';
    this.removeEventListener('animationend', onAnimationEnd);
    animationCount = 0;
  }
  animationCount++;
}

export default function displayResultNotif(success, errors) {
  let notif;
  if (success)
    notif = document.getElementById('notif-valid');
  else {
    notif = document.getElementById('notif-invalid');
    const errorSpan = document.getElementById('notif-errors');

    errorSpan.innerText = ''; // clear old errors if used
    console.log(errors);
    errorSpan.innerText = errors.map((error, idx) => (idx === 0 ? ` - ${error}` : `\n - ${error}`)).join('');
  }

  // cancel any ongoing animations
  notif.style.animation = 'none'; 
  void notif.offsetWidth;
  notif.removeEventListener('animationend', removeListener);
  
  notif.style.display = 'block';
  notif.style.animation = 'slide-up 400ms ease-out forwards, fade-out 10s ease-out 400ms forwards';

  notif.addEventListener('animationend', onAnimationEnd());
}