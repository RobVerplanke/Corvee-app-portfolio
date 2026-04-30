// Used to identify url-parameters
let url = new URL(window.location.href);

// And add event listeners on toolbar dropdown buttons
document.addEventListener('click', (e) => {
  if (!e.target.closest('.toolbar')) {
    document.querySelectorAll('.toolbar-dropdown').forEach(d => d.classList.remove('open'));
  }
});

// Print agenda page from dashboard page
function printPage() {
  const frame = document.getElementById('print-frame');
  frame.src = '/';
  frame.onload = function() {
    frame.contentWindow.print();
  };
}

// Return current day is specific notation
function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Handle unsaved changes when the agenda is adjusted
function onDateChanged(e) {
  // Ignore same date.
  if (url.searchParams.has('date') && url.searchParams.get('date') == e.target.value) {
    return;
  }
  // Warn if a volunteer was changed if it's the dashboard page.
  if (url.pathname.includes('dashboard') && window.volunteerChanged) {
    // If the confirm is rejected, ignore changing url and reset datepicker. Else proceed to change the page.
    if (!confirm(window.appTexts.warning)) {
      e.target.value = url.searchParams.has('date') ? url.searchParams.get('date') : getToday();
      return;
    }
  }
  // It should be safe to change the date.
  url.searchParams.set('date', e.target.value);
  window.location.href = url;
}

// Set a flag when a volunteer has been changed to a value different from its initial value.
function onVolunteerChanged(e) {
  window.volunteerChanged = true;
}
