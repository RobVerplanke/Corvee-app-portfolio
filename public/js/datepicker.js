// Update the date on the datepicker if provided by the URL, else use today.
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
