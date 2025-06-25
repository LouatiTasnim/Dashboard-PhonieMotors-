const {fetchDepot, fetchMovDep} = require('../controllers/depotController'); 

const express = require('express');

const router = express.Router();

router.get('/Depot', fetchDepot);
router.get('/MovDepot/:id/:startDate/:endDate', fetchMovDep);

module.exports = router; 
