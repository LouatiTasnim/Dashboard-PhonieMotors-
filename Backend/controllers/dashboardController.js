const { getConnection } = require('../config');
const fs = require('fs');
const cron = require('node-cron');

const fetchRev = async (req, res) => {
    try {
      const connection = await getConnection();
      const id=req.params.id
      const query = `
        select count(*) from FICH_CLIENTS WHERE client_groupe='001'
      `;
      const result = await connection.execute(query);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error', details: err.message });
    }
  }

  const fetchCA = async (req, res) => {
    try {
      const connection = await getConnection();
      const query = ` 
        SELECT
            SUM(fc.TOT_HT_FC) AS total_fc
        FROM
            FICH_FC fc
        WHERE
            TO_CHAR(fc.date_fc, 'YYYY') = TO_CHAR(SYSDATE - INTERVAL '1' YEAR, 'YYYY')
      `;
      const result = await connection.execute(query);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error', details: err.message });
    }
  }
  const fetchCAC = async (req, res) => {
    try {
      const connection = await getConnection();
      const query = ` 
      SELECT
        SUM(fc.TOT_HT_FC) AS total_fc
      FROM
        FICH_FC fc
      WHERE
        fc.DATE_FC >= TRUNC(SYSDATE, 'YYYY')
    `;    
      const result = await connection.execute(query);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error', details: err.message });
    }
  }

  const fetchRepChiffre = async (req, res) => {
    try {
      const connection = await getConnection();
      const id=req.params.id
      const query = `
       -- Requête principale pour les périodes spécifiques
SELECT
    CASE
        WHEN fc.DATE_FC >= TRUNC(SYSDATE, 'MM') THEN 'Mois Actuel'
        WHEN fc.DATE_FC >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -3) THEN '3 Derniers Mois'
        WHEN fc.DATE_FC >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -6) THEN 'Dernier Semestre'
        ELSE 'Année Courante'
    END AS periode,
    fc.REPRES,
    fr.INTITULE_REPRES,
    SUM(fc.TOT_HT_FC) AS total_fc
FROM
    FICH_FC fc
JOIN
    FICH_REPRESENTS fr
ON
    fc.REPRES = fr.NUM_REPRES
WHERE
    fc.DATE_FC >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -6) -- Inclut les données des périodes nécessaires
GROUP BY
    CASE
        WHEN fc.DATE_FC >= TRUNC(SYSDATE, 'MM') THEN 'Mois Actuel'
        WHEN fc.DATE_FC >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -3) THEN '3 Derniers Mois'
        WHEN fc.DATE_FC >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -6) THEN 'Dernier Semestre'
        ELSE 'Année Courante'
    END,
    fc.REPRES,
    fr.INTITULE_REPRES

UNION ALL

-- Chiffre d'affaires de chaque représentant pour l'année courante
SELECT
    'Année Courante' AS periode,
    fc.REPRES,
    fr.INTITULE_REPRES,
    SUM(fc.TOT_HT_FC) AS total_fc
FROM
    FICH_FC fc
JOIN
    FICH_REPRESENTS fr
ON
    fc.REPRES = fr.NUM_REPRES
WHERE
    fc.DATE_FC >= TRUNC(SYSDATE, 'YYYY') -- Inclut uniquement l'année courante
GROUP BY
    fc.REPRES,
    fr.INTITULE_REPRES

ORDER BY
    periode

   
      `;
      const result = await connection.execute(query);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error', details: err.message });
    }
  }

  const fetchFacturesByRepAndPeriod = async (req, res) => {
    try {
      const connection = await getConnection();
      const { id, period } = req.params;
  
      // Génération de la condition de période
      let dateCondition = '';
      if (period === 'Mois Actuel') {
        dateCondition = "fc.DATE_FC >= TRUNC(SYSDATE, 'MM')";
      } else if (period === 'Trimestre') {
        dateCondition = "fc.DATE_FC >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -3)";
      } else if (period === 'Semestre') {
        dateCondition = "fc.DATE_FC >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -6)";
      } else if (period === 'Année Courante') {
        dateCondition = "fc.DATE_FC >= TRUNC(SYSDATE, 'YYYY')";
      } else {
        return res.status(400).json({ error: 'Période invalide' });
      }
  
      const query = `
        SELECT
          fc.NUM_FC ,
          TO_CHAR(fc.DATE_FC, 'YYYY-MM-DD') AS DATE_FC ,
           c.INTITULE_CLIENT AS CLIENT_FC,
          fc.FC_TOTAL AS TOTAL_FC  
        FROM
          FICH_FC fc , FICH_CLIENTS c
        WHERE
          fc.CLIENT_FC=c.COMPTE_CLIENT
          AND fc.REPRES = '${id}'
          AND ${dateCondition}
        ORDER BY fc.DATE_FC DESC
      `;
      const result = await connection.execute(query);
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
  };
  
  
  module.exports = {
    fetchRev: fetchRev,
    fetchRepChiffre:fetchRepChiffre,
    fetchCA:fetchCA,
    fetchFacturesByRepAndPeriod:fetchFacturesByRepAndPeriod,
    fetchCAC:fetchCAC
  }