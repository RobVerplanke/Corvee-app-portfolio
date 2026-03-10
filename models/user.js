export default (mongoose) => {
  const userSchema = mongoose.Schema({
    username: String,
    password_hash: String,
    password_salt: String,
  });
  return userSchema;
};;
