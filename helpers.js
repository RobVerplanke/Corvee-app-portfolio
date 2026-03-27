/**
 * Returns the ISO 8601 week number associated with the given date.
 * 
 * @param {Date} date - The date for which to find the week number.
 */
function getWeekNumber(date) {
  // Copy the date to adjust it for finding the nearest Thursday.
  let nearestThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Find the nearest thursday by adding the day for Thursday and subtracting the days elapsed this week.
  nearestThursday.setDate(nearestThursday.getDate() + 4 - (nearestThursday.getDay() || 7));

  // Get the first Thursday of the year.
  const firstThursday = new Date(date.getFullYear(), 0);
  // First get the nearest thursday for the start of the year, then if needed add a week.
  firstThursday.setDate(firstThursday.getDate() + 4 - (firstThursday.getDay() || 7));
  if (firstThursday.getFullYear() < date.getFullYear()) {
    firstThursday.setDate(firstThursday.getDate() + 7);
  }

  // Calculate the week number from the difference in dates and dividing it by days per week to find total weeks.
  const MILLISECONDS_PER_DAY = 86400000;
  const DAYS_PER_WEEK = 7;
  return Math.ceil((((nearestThursday.valueOf() - firstThursday.valueOf()) / MILLISECONDS_PER_DAY) + 1) / DAYS_PER_WEEK);
}

/**
  * Returns the first Monday as Date for the given ISO 8601 format week number. 
  *
  * @param {int} weekNr - The week number to find the associated Monday for.
  */
function getMondayFromWeekNumber(weekNr) {
  let firstDay = new Date(new Date(Date.now()).getFullYear(), 0 , 1);
  if (firstDay.getDay() == 1) {
    // If 1st of Jan is Monday, the monday of given weekNr is a multiple of 7.
    firstDay.setDate(1 + (weekNr - 1) * 7);
  } else if (firstDay.getDay() == 0) {
    // It's Sunday so add 1 day and then calculate the requested Monday.
    firstDay.setDate(2 + (weekNr - 1) * 7);
  } else if (firstDay.getDay() > 1) {
    // If it's any other day, add a week and subtract the extra days back to the next monday.
    firstDay.setDate(1 + (8 - firstDay.getDay()) + ((weekNr - 2) * 7))
  }
  return firstDay;
}

// Returns the name of the day based on the given date
function getNameOfDay(date) {
  const DAY_NAMES = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  return DAY_NAMES[date.getDay()];
}

// Adjust the long date notation to a more readable format
function formatDate(date) {
  const formattedDate = new Date(date).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  })
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1); // Return first letter with capital
};

export {
  getWeekNumber, getMondayFromWeekNumber, getNameOfDay, formatDate
}
