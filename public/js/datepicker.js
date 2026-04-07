let url = new URL(window.location.href);
// Update the date on the datepicker if provided by the URL, else use today.
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
}

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
  url.searchParams.set('date', e.target.value);
  window.location.href = url;
}
