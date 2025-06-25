const fs = require('fs');
const cron = require('node-cron');
const { getConnection } = require('../config');


// Function to execute the query and save results
const executeAndCacheQuery = async () => {
  try {
    const connection = await getConnection();

    const query = `
      SELECT code_depot, intitule_depot 
        FROM FICH_Depot
    `;

    const result = await connection.execute(query);

    // Save the result to a JSON file
    fs.writeFileSync('cachedDepot.json', JSON.stringify(result), 'utf-8');
    console.log('Query executed and result cached successfully.');

  } catch (err) {
    console.error('Error executing query:', err.message);
  }
};

// Schedule the task to run every Sunday at 00:00
cron.schedule('0 0 * * 0', () => {
  console.log('Running scheduled task for fetching depot data...');
  executeAndCacheQuery();
});

// Initial run to cache data immediately on startup
executeAndCacheQuery();

// Function to handle client requests
const fetchDepot = (req, res) => {
  try {
    // Read the cached data
    const cachedData = fs.readFileSync('cachedDepot.json', 'utf-8');
    res.status(200).json(JSON.parse(cachedData));
  } catch (err) {
    console.error('Error fetching cached data:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};


const fetchMovDep = async (req, res) => {
    try {
      const connection = await getConnection();
      const id=req.params.id
      const startDate=req.params.startDate
      const endDate=req.params.endDate
      const query = `
    SELECT
  mv.MVT_NUM_DOC AS NUM,
  mv.MVT_DATE AS DATE_mvt,
  CASE
    WHEN MIN(mv.MVT_TYPE_DOC) = 'FC' THEN 'Facture Client'
    WHEN MIN(mv.MVT_TYPE_DOC) = 'FF' THEN 'Facture Fournisseur'
    WHEN MIN(mv.MVT_TYPE_DOC) = 'LC' THEN 'Livraison Client'
    WHEN MIN(mv.MVT_TYPE_DOC) = 'RF' THEN 'Réception Fournisseur'
    WHEN MIN(mv.MVT_TYPE_DOC) = 'TR' THEN 'Transfert'
    WHEN MIN(mv.MVT_TYPE_DOC) = 'S' THEN 'Sortie'
    WHEN MIN(mv.MVT_TYPE_DOC) = 'E' THEN 'Entrée'
    WHEN MIN(mv.MVT_TYPE_DOC) = 'F' THEN 'Fabrication'
    ELSE MIN(mv.MVT_TYPE_DOC)
  END AS label,
  MIN(cl.INTITULE_CLIENT) AS Client,
  MIN(dep_or.INTITULE_DEPOT) AS Depot_or,
  MIN(dep_des.INTITULE_DEPOT) AS Depot_des,
  MIN(mv.MVT_DESIGNATION) AS Designation,
  SUM(mv.MVT_MONTANT_TTC) AS montant_ttc
FROM
  FICH_MOUVEMENTS mv
LEFT JOIN
  FICH_CLIENTS cl ON TRIM(cl.COMPTE_CLIENT) = TRIM(mv.MVT_CPT_CL_FR)
LEFT JOIN
  FICH_DEPOT dep_or ON dep_or.CODE_DEPOT = mv.MVT_DEPOT_OR
LEFT JOIN
  FICH_DEPOT dep_des ON dep_des.CODE_DEPOT = mv.MVT_DEPOT_DES
WHERE
  mv.MVT_DEPOT_OR = '${id}'
  AND mv.MVT_DATE BETWEEN TO_DATE('${startDate}', 'YYYY-MM-DD') AND TO_DATE('${endDate}', 'YYYY-MM-DD')
GROUP BY
  mv.MVT_NUM_DOC,
  mv.MVT_DATE


      `;
      const result = await connection.execute(query);
  
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server Error', details: err.message });
    }
  }




module.exports = {
    fetchDepot: fetchDepot,
    fetchMovDep:fetchMovDep

}
