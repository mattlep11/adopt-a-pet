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

// update the timer every second
setInterval(() => {
  setDate();
}, 1000);
