const { getConnection } = require('../config');
const fs = require('fs');
const cron = require('node-cron');

// Function to execute the query and save results
const executeAndCacheQuery = async () => {
  try {
    const connection = await getConnection();

    const query = `
      SELECT
        COUNT(code_client) AS client_count,
        client_repres,
        intitule_repres
      FROM
        FICH_CLIENTS,
        FICH_REPRESENTS
      WHERE
        FICH_CLIENTS.client_repres = FICH_REPRESENTS.NUM_REPRES
      GROUP BY
        client_repres,
        intitule_repres
    `;

    const result = await connection.execute(query);

    // Save the result to a JSON file
    fs.writeFileSync('cachedClientRevRepres.json', JSON.stringify(result.rows), 'utf-8');
    console.log('Query executed and result cached successfully.');

  } catch (err) {
    console.error('Error executing query:', err.message);
  }
};

// Schedule the task to run every Sunday at 00:00
cron.schedule('0 0 * * 0', () => {
  console.log('Running scheduled task for fetching client data...');
  executeAndCacheQuery();
});

// Initial run to cache data immediately on startup
executeAndCacheQuery();

// Function to handle client requests
const fetchClientRevRepres = (req, res) => {
  try {
    // Read the cached data
    const cachedData = fs.readFileSync('cachedClientRevRepres.json', 'utf-8');
    res.status(200).json(JSON.parse(cachedData));
  } catch (err) {
    console.error('Error fetching cached data:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};
   

const fetchClientRevDep = async (req, res) => {
  try {
    const connection = await getConnection();
    const id=req.params.id
    const query = `
      SELECT 
        compte_client,
        intitule_client as CLIENT, 
        intitule_gr as groupe,
        solde_client,encours_client,
        encours_max_c as encours_max
      FROM FICH_CLIENTS , FICH_GROUPES
      WHERE 
        client_repres='${id}' AND NUM_GROUPE=client_groupe
    `;

    const result = await connection.execute(query);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
}

const fetchClientMov = async (req, res) => {
  try {
    const connection = await getConnection();
    const id=req.params.id
    const query = `
      SELECT
    mv.*,
    ar.intit_article
FROM
    FICH_mouvements mv
JOIN
    fich_articles ar
    ON mv.mvt_article = ar.code_article
WHERE
    MVT_CPT_CL_FR = '${id}'
    AND mvt_type_doc = 'FC'
ORDER BY
    mv.mvt_date DESC

    `;

    const result = await connection.execute(query);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
}

const fetchFacture = async (req, res) => {
  try {
    const connection = await getConnection();
    const id=req.params.id
    const query = `
      SELECT 
        fc.NUM_FC,
        fc.CLIENT_FC,
        fc.DATE_FC,
        fc.DEPOT_FC,
        fc.TOT_HT_FC,
        fc.TOT_TTC_FC,
        fc.TOT_TVA_FC,
        fc.TOT_FC_REMISE,
        fc.FC_TIMBRE,
        fc.COMMENT_FC,
        fc.FC_TOTAL,
        fc.ETAT_FC,
        fc.MODE_REGL_FC,
        fc.FC_ACOMPTE,
        fc.FC_UTILIS,
        fc.FC_LIBEL,

        cli.INTITULE_CLIENT,
        cli.ADR_C_FACT_1,
        cli.TEL_CLIENT_F,

        fcl.FCL_ARTICLE,
        fcl.FC_DES_ART,
        fcl.FCLQTE_L,
        fcl.FCLPX_NET,
        fcl.FCL_TX_REM,
        fcl.FCL_REM,
        fcl.FCL_TAUX_TVA,
        fcl.FCL_MONTANT,
        fcl.FCL_MONTANT_TTC,

        rep.NUM_REPRES,
        rep.INTITULE_REPRES,

        dep.CODE_DEPOT,
        dep.INTITULE_DEPOT

      FROM FICH_FC fc
      JOIN FICH_FC_L fcl ON fc.NUM_FC = fcl.NUM_FC_L
      JOIN FICH_CLIENTS cli ON fc.CLIENT_FC = cli.COMPTE_CLIENT
      LEFT JOIN FICH_REPRESENTS rep ON fc.REPRES = rep.NUM_REPRES

      LEFT JOIN FICH_DEPOT dep ON fcl.FCL_DEPOT = dep.CODE_DEPOT
WHERE fc.NUM_FC ='${id}' `;
   
    const result = await connection.execute(query);

     // Transformation en tableau d'objets JSON
     const data = result.rows.map(row => {
      const obj = {};
      result.metaData.forEach((col, index) => {
        obj[col.name] = row[index];
      });
      return obj;
    });

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

module.exports = {
  fetchClientRevRepres: fetchClientRevRepres,
  fetchClientRevDep:fetchClientRevDep,
  fetchClientMov:fetchClientMov,
  fetchFacture:fetchFacture,
}
