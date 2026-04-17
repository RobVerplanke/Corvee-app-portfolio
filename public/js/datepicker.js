let url = new URL(window.location.href);

// Update the date on the datepicker if provided by the URL, else use today.
// And add event listeners on toolbar dropdown buttons
window.onload = function() {
  if (url.searchParams.has('date')) {
    let date = url.searchParams.get('date');
    // Check if date is valid.
    if (/^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]\b/.test(date)) {
      document.getElementById("datepicker").value = date;          
    }
  } else {
    document.getElementById("datepicker").value = getToday();
  }
  
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = document.getElementById(btn.dataset.target);
    const isOpen = target.classList.contains('open');
    
    document.querySelectorAll('.toolbar-dropdown').forEach(d => d.classList.remove('open'));
    
    if (!isOpen) target.classList.add('open');
  });
});
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.toolbar')) {
    document.querySelectorAll('.toolbar-dropdown').forEach(d => d.classList.remove('open'));
  }
});

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function onDateChanged(e) {
  // Ignore same date.
  if (url.searchParams.has('date') && url.searchParams.get('date') == e.target.value) {
    return;
  }
  // Warn if a volunteer was changed if it's the dashboard page.
  if (url.pathname.includes('dashboard') && window.volunteerChanged) {
    // If the confirm is rejected, ignore changing url and reset datepicker. Else proceed to change the page.
    if (!confirm("Er zijn onopgeslagen wijzigingen, weet u zeker dat u wilt doorgaan?")) {
      e.target.value = url.searchParams.has('date') ? url.searchParams.get('date') : getToday();
      return;
    }
  }
  // It should be safe to change the date.
  url.searchParams.set('date', e.target.value);
  window.location.href = url;
}

function onVolunteerChanged(e) {
  console.log('on change called!');
  // Set a flag when a volunteer has been changed to a value different from its initial value.
  window.volunteerChanged = true;

  // Disable save buttons to prevent losing changes in the agenda
  document.getElementById('add-volunteer-btn').disabled = true; // Disable "Add volunteer"-button
  document.getElementById('delete-volunteer-btn').disabled = true; // Disable "Remove volunteer"-button
}
