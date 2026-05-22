/**
 * Used to identify url-parameters
 *
 * @type {string} Current location
 */
let url = new URL(window.location.href);

// Create event listeners - Close toolbar dropdowns when clicking outside the toolbar
document.addEventListener("click", (e) => {
  if (!e.target.closest(".toolbar")) {
    document
      .querySelectorAll(".toolbar-dropdown")
      .forEach((d) => d.classList.remove("open"));
  }
});

// Asign correct class to toolbar buttons, depending if the button has a dropdown or not
window.onload = function () {
  document.querySelectorAll(".toolbar-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = document.getElementById(btn.dataset.target);
      const isOpen = target.classList.contains("open");

      document
        .querySelectorAll(".toolbar-dropdown")
        .forEach((d) => d.classList.remove("open"));

      if (!isOpen) target.classList.add("open");
    });
  });
};

/**
 * Prints the agenda page from within the dashboard by loading it in a hidden iframe
 * and triggering the browser print dialog on its content.
 *
 */
function printPage() {
  const frame = document.getElementById("print-frame");
  frame.src = "/";
  frame.onload = function () {
    frame.contentWindow.print();
  };
}

/**
 * Determine the current date
 *
 * @returns {string} The current day in specific notation
 */
function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Handles date changes in the datepicker. Warns the user if there are unsaved
 * changes in the agenda before navigating to the new date.
 *
 * @param {e} e - The change event fired by the date input element
 */
function onDateChanged(e) {
  // Ignore same date.
  if (
    url.searchParams.has("date") &&
    url.searchParams.get("date") == e.target.value
  ) {
    return;
  }
  // Warn if a volunteer was changed if it's the dashboard page.
  if (url.pathname.includes("dashboard") && window.volunteerChanged) {
    // If the confirm is rejected, ignore changing url and reset datepicker. Else proceed to change the page.
    if (!confirm(window.appTexts.warning)) {
      e.target.value = url.searchParams.has("date")
        ? url.searchParams.get("date")
        : getToday();
      return;
    }
  }
  // It should be safe to change the date.
  url.searchParams.set("date", e.target.value);
  window.location.href = url;
}

/**
 * Set a flag when a volunteer has been changed to a value different from its initial value
 *
 */
function onVolunteerChanged() {
  window.volunteerChanged = true;
}
