// Testdata
const maandData = {
  maand: "April",
  weken: [
  {
    titel: "Week 1",
      diensten: [
        { dag: "Maandag", datum: "1 april", ochtend: "Harrie", middag: "Corrie" },
        { dag: "Dinsdag", datum: "2 april", ochtend: "Jan", middag: "Annie" },
        { dag: "Woensdag", datum: "3 april", ochtend: "Henk", middag: "Truus" },
        { dag: "Donderdag", datum: "4 april", ochtend: "Els", middag: "Els" },
        { dag: "Vrijdag", datum: "5 april", ochtend: "Jan", middag: "Truus" },
      ]},
    {
    titel: "Week 2",
      diensten: [
        { dag: "Maandag", datum: "8 april", ochtend: "Jaap", middag: "Miep" },
        { dag: "Dinsdag", datum: "9 april", ochtend: "Niels", middag: "Jannie" },
        { dag: "Woensdag", datum: "10 april", ochtend: "Ed", middag: "Ed" },
        { dag: "Donderdag", datum: "11 april", ochtend: "Harrie", middag: "Harry" },
        { dag: "Vrijdag", datum: "12 april", ochtend: "Corrie", middag: "Jan" },
      ]
    },
    {
    titel: "Week 3",
      diensten: [
        { dag: "Maandag", datum: "15 april", ochtend: "Jaap", middag: "Miep" },
        { dag: "Dinsdag", datum: "16 april", ochtend: "Niels", middag: "Jannie" },
        { dag: "Woensdag", datum: "17 april", ochtend: "Corrie", middag: "Jannie" },
        { dag: "Donderdag", datum: "18 april", ochtend: "Harrie", middag: "Ed" },
        { dag: "Vrijdag", datum: "19 april", ochtend: "Jaap", middag: "Koen" },
      ]
    },
    {
      titel: "Week 4",
      diensten: [
        { dag: "Maandag", datum: "22 april", ochtend: "Els", middag: "Els" },
        { dag: "Dinsdag", datum: "21 april", ochtend: "Henk", middag: "Miep" },
        { dag: "Woensdag", datum: "22 april", ochtend: "Koen", middag: "Koen" },
        { dag: "Donderdag", datum: "23 april", ochtend: "Harrie", middag: "Harry" },
        { dag: "Vrijdag", datum: "24 april", ochtend: "Els", middag: "Jan" },
      ]
    }
  ]
};

// Select and fill the container at the top of the page in which the name of the month is displayed
const header = document.querySelector('.page-title');
header.innerHTML += `Rooster ${maandData.maand}`;

// Select container in which the timetables are displayed
const grid = document.querySelector('.weeks-grid');

// Itterate through the weeks, create new timetables and populate them with the corresponding data
maandData.weken.forEach(week => {
  const rijen = week.diensten.map(dienst => `
    <tr>
      <td class="td-dag" rowspan="2">${dienst.dag}<span class="datum">${dienst.datum}</span></td>
      <td><span class="badge badge-ochtend">Ochtend</span></td>
      <td class="td-naam">${dienst.ochtend}</td>
    </tr>
    <tr>
      <td><span class="badge badge-middag">Middag</span></td>
      <td class="td-naam">${dienst.middag}</td>
    </tr>
  `).join('');

  // Add new rows to the table, display name of the month above the tables
  grid.innerHTML += `
    <div class="week-block">
      <h2 class="week-title">${week.titel}</h2>
      <div class="table-wrapper">
        <table class="table-agenda">
          <colgroup>
            <col class="col-datum">
            <col class="col-dagdeel">
            <col class="col-naam">
          </colgroup>
          <thead>
            <tr><th>Datum</th><th>Dagdeel</th><th>Naam</th></tr>
          </thead>
          <tbody>${rijen}</tbody>
        </table>
      </div>
    </div>
  `;
});