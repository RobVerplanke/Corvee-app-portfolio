export default (mongoose) => {
  const ScheduleSchema = mongoose.Schema({
    date: Date,
    part_of_day: String,
    volunteer_name: String,
  });
  return ScheduleSchema;
};
