const { fetchRev, fetchRepChiffre, fetchCA, fetchFacturesByRepAndPeriod, fetchCAC } = require('../controllers/dashboardController');


const express = require('express');

const router = express.Router();

router.get('/DashRev', fetchRev);
router.get('/DashRepChiffre', fetchRepChiffre);
router.get('/DashCA', fetchCA);
router.get('/DashCAC', fetchCAC);
router.get('/DashDetails/:id/:period',fetchFacturesByRepAndPeriod);

module.exports = router; 
