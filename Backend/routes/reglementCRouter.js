// routes/reglementCRouter.js
const express = require('express');
const { fetchClientImpaye, fetchClientNoNpaye, fetchFactImpC } = require('../controllers/reglementCController');

const router = express.Router();

router.get('/impayeC', fetchClientImpaye);
router.get('/nonPayeC', fetchClientNoNpaye);
router.get('/FactImpC/:id', fetchFactImpC);


module.exports = router; 
