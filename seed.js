export async function seedDatabase(databaseHandler) {
  const volunteers = await databaseHandler.getVolunteers();

  if (volunteers.length === 0) {
    await databaseHandler.addVolunteer("gesloten");
    await databaseHandler.addVolunteer("Jan");
    await databaseHandler.addVolunteer("Els");
    await databaseHandler.addVolunteer("Harry");
    await databaseHandler.addVolunteer("Jannie");
    await databaseHandler.addVolunteer("Piet");
  }

  const schedules = await databaseHandler.getScheduleForDateRange(
    new Date(),
    new Date(),
  );

  if (schedules.length === 0) {
    const allVolunteers = await databaseHandler.getVolunteers();

    // Haal de IDs op
    const jan = allVolunteers.find((v) => v.name === "jan");
    const els = allVolunteers.find((v) => v.name === "els");
    const harry = allVolunteers.find((v) => v.name === "harry");
    const jannie = allVolunteers.find((v) => v.name === "jannie");
    const piet = allVolunteers.find((v) => v.name === "piet");

    // Startdatum = aanstaande maandag
    const monday = getNextMonday();

    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 5; day++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + week * 7 + day);

        await databaseHandler.addScheduleEntry(date, {
          morning: jan.id,
          afternoon: els.id,
        });
      }
    }
  }
}

function getNextMonday() {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
