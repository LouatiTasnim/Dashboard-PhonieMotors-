// routes/clientRouter.js
const express = require('express');
const { fetchClientRevRepres, fetchClientRevDep, fetchClientMov, fetchFacture } = require('../controllers/clientController'); 

const router = express.Router();

router.get('/Clients', fetchClientRevRepres);
router.get('/Clients/RevDep/:id', fetchClientRevDep);
router.get('/Client/Mov/:id', fetchClientMov);
router.get('/Facture/:id', fetchFacture);

module.exports = router; 
