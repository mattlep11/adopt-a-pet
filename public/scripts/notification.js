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