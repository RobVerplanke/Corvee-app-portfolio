export default (mongoose) => {
  const VolunteerSchema = mongoose.Schema({
    name: String,
  });
  return VolunteerSchema;
};
