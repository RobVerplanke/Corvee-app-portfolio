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

export {
  getWeekNumber
}
