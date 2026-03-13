// Open or close one of the content cards on the dashboard page after clicking on it
export function toggleCard(id) {
 const card = document.getElementById(id);
 card.classList.toggle('open');
}

// Add a new row with input elements to be able to add new time tables
export function addRow() {
  const container = document.getElementById('rooster-rijen');
  const rij = document.createElement('div');
  rij.className = 'rooster-rij';
  rij.innerHTML = `
    <input type="date">
    <select>
      <option>Ochtend</option>
      <option>Middag</option>
    </select>
    <select>
      <option>Harrie de Vries</option>
      <option>Corrie Bakker</option>
      <option>Jan Smit</option>
      <option>Truus Visser</option>
    </select>
    <button class="btn-remove-row" title="Verwijder rij" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  container.appendChild(rij);
}

// Remove row buttons on existing rows
document.querySelectorAll('.btn-remove-row').forEach(btn => {
  btn.addEventListener('click', () => btn.parentElement.remove());
});