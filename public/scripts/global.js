const dateSpan = document.getElementById('date');
const timeSpan = document.getElementById('time');
const dateDisplay = {day: '2-digit', month: '2-digit', year: '2-digit'};
const timeDisplay = {hour: '2-digit', hourCycle: 'h23', minute: '2-digit', second: '2-digit'}; 
let currentDay = (new Date()).getDate();  

// sets the value of the date and time labels under the logo
function setDate() {
  let now = new Date();
  timeSpan.innerText = now.toLocaleTimeString('en-US', timeDisplay);
  
  // only update the date if the day has actually changed
  if (currentDay !== now.getDate()) {
    dateSpan.innerText = now.toLocaleDateString('en-US', dateDisplay);
    currentDay = now.getDate();
  }
}

// initial set-up
setDate();
dateSpan.innerText = (new Date()).toLocaleDateString('en-US', dateDisplay);

const switcher = document.getElementById('theme-switcher');
const isDarkModeDefault = window.matchMedia('(prefers-color-scheme: dark)');
// regex used to extract the theme portion from the cookie
let theme = document.cookie.replace(/(?:(?:^|.*;\s*)theme\s*\=\s*([^;]*).*$)|^.*$/, "$1");

switcher.addEventListener('click', function() {
  if (this.classList.contains('fa-sun')) {
    this.classList.remove('fa-sun');
    this.classList.add('fa-moon');
    document.cookie = 'theme=light; max-age=86400; samesite=lax'; ;
  } else {
    this.classList.remove('fa-moon');
    this.classList.add('fa-sun');
    document.cookie = 'theme=dark; max-age=86400; samesite=lax';
  }
  document.getElementsByTagName('body')[0].classList.toggle('dark-mode');
});

// set-up the theme
if (theme === 'dark' || (!theme && isDarkModeDefault.matches)) 
  switcher.click();

// update the timer every second
setInterval(() => {
  setDate();
}, 1000);
