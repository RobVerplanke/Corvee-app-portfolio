import { models } from './models/index.js'

const weekday = ["Monday", "Tuesday",  "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// TODO write function that collects all schedule entries in the week of the given date.
async function getWeekSchedule(date) {
  return models.Schedule.findAll({
    // TODO get only schedule for given week?
    //where: {
    //  date: 
    //}
  });
}

function getStartOfWeek(date) {
  return new Date(date.getDate() - weekday[date.getDay()]);
}


