// app.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // ajoute path pour gérer les chemins
const clientRouter = require('./routes/clientRouter');
const depotRouter = require('./routes/depotRouter');
const dashboardRouter = require('./routes/dashboardRouter');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// tes routes API
app.use('/', clientRouter);
app.use('/', depotRouter);
app.use('/', dashboardRouter);

// servir les fichiers statiques du frontend (dossier dist généré par Vite)
//app.use(express.static(path.join(__dirname, '../frontend/dist')));

// pour toutes les autres routes, renvoyer le fichier index.html du frontend
/*app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});*/

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
