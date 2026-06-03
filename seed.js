export async function seedDatabase(databaseHandler) {
  const volunteers = await databaseHandler.getVolunteers();

  // Alleen seeden als de database leeg is
  if (volunteers.length === 0) {
    await databaseHandler.addVolunteer("gesloten");
    await databaseHandler.addVolunteer("Jan");
    await databaseHandler.addVolunteer("Els");
    await databaseHandler.addVolunteer("Harry");
    await databaseHandler.addVolunteer("Jannie");
    await databaseHandler.addVolunteer("Piet");
  }
}
