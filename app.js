import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  // TODO: Add render engine, home view and set up models for the timetable to be displayed.
  res.send('INITIAL PAGE HERE.');
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
