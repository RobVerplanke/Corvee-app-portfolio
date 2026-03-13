import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use static files for CSS-styling
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to ejs and build an absolute path to the views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Login page
app.get('/', (req, res) => {
  res.render('pages/index');
});

// Below an activePage property is added to the response which is used to determine which navigation button has to be highlighted

// Timetables page
app.get('/agenda', (req, res) => {
  res.render('pages/agenda', { activePage: 'agenda'});
});

// Admin dashboard page
app.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', { activePage: 'dashboard'});
});

// Instructions page
app.get('/manual', (req, res) => {
  res.render('pages/manual', { activePage: 'manual'});
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
