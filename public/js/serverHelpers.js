// Print agenda page from dashboard page
function printPage() {
  const frame = document.getElementById('print-frame');
  frame.src = '/';
  frame.onload = function() {
    frame.contentWindow.print();
  };
}