const { getConnection } = require('../config');
const fs = require('fs');
const cron = require('node-cron');


const fetchClientImpaye = async (req, res) => {
  try {
    const connection = await getConnection();
    const query = `
  SELECT 
    E.E_DATE AS DATE_E,
    
    -- Extraction de chaque composant
    REGEXP_SUBSTR(E.E_LIBEL, '^[^/]+') AS BANQUE,
    -- Type nettoyé (standardisé)
  CASE 
    WHEN REGEXP_SUBSTR(E.E_LIBEL, '[^/]+', 1, 2) LIKE 'RET TR IMP%' THEN 'RETOUR TRAITE IMPAYÉE'
    WHEN REGEXP_SUBSTR(E.E_LIBEL, '[^/]+', 1, 2) LIKE 'RET CHQ IMP%' THEN 'RETOUR CHÈQUE IMPAYÉE'
    WHEN REGEXP_SUBSTR(E.E_LIBEL, '[^/]+', 1, 2) LIKE 'RET IMP%' THEN 'RETOUR IMPAYÉ'
    WHEN REGEXP_SUBSTR(E.E_LIBEL, '[^/]+', 1, 2) LIKE 'RET%' THEN 'RETOUR'
    WHEN REGEXP_SUBSTR(E.E_LIBEL, '[^/]+', 1, 2) LIKE 'CHQ%' THEN 'CHÈQUE IMPAYÉ'
    WHEN REGEXP_SUBSTR(E.E_LIBEL, '[^/]+', 1, 2) LIKE 'TR%' THEN 'TRAITE IMPAYÉE'
    ELSE REGEXP_SUBSTR(E.E_LIBEL, '[^/]+', 1, 2)
  END AS TYPE,
  REGEXP_SUBSTR(E.E_LIBEL, '[^/]+$', 1, 1) AS CLIENT,
  SUBSTR(
    E.E_LIBEL,
    INSTR(E.E_LIBEL, '/', 1, 1) + 1,
    INSTR(E.E_LIBEL, '/', 1, LENGTH(E.E_LIBEL) - LENGTH(REPLACE(E.E_LIBEL, '/', ''))) 
        - INSTR(E.E_LIBEL, '/', 1, 1) - 1
    ) AS DETAIL,

  E.E_ECHEANCE AS ECHEANCE,
  E.E_DEBIT AS DEBIT

  FROM FICH_ECRITURES E
  WHERE E.E_COMPTE LIKE '414%'
  AND (E.E_LETTRE IS NULL OR TRIM(E.E_LETTRE) = '')
  AND E.E_DEBIT > 0

  UNION ALL

    -- Ligne TOTAL
    SELECT 
    NULL AS DATE_E,
    NULL AS BANQUE,
    NULL AS DETAIL,
    'TOTAL' AS CLIENT,
    NULL AS TYPE_NETTOYE,
    NULL AS ECHEANCE,
    SUM(E.E_DEBIT) AS DEBIT
    FROM FICH_ECRITURES E
    WHERE E.E_COMPTE LIKE '414%'
    AND (E.E_LETTRE IS NULL OR TRIM(E.E_LETTRE) = '')
    `;

    const result = await connection.execute(query);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
}

const fetchClientNoNpaye = async (req, res) => {
  try {
    const connection = await getConnection();
    const query = `      
        SELECT
            intitule_repres,
            intitule_client,
            client_fc,
            SUM(fc_total - regl_fc) AS montant_restant_total
        FROM fich_fc, fich_clients,fich_represents
        WHERE
            regl_fc != fc_total
            AND compte_client = client_fc
            AND num_repres=client_repres
        GROUP BY intitule_repres, client_fc, intitule_client
        ORDER BY intitule_repres, intitule_client
    `;

    const result = await connection.execute(query);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
}

const fetchFactImpC = async (req, res) => {
  try {
    const connection = await getConnection();
    const id=req.params.id
    const query = `
SELECT
  f.num_fc,
  f.date_fc,
  f.fc_total,
  f.regl_fc,
  (f.fc_total - f.regl_fc) AS montant_restant_facture,
  d.intitule_depot,
  f.echeance_fc,
  totals.montant_restant_total
FROM fich_fc f
JOIN (
    SELECT
      client_fc AS client_fc_inner,
      SUM(fc_total - regl_fc) AS montant_restant_total
    FROM fich_fc
    WHERE regl_fc != fc_total
    GROUP BY client_fc
) totals ON f.client_fc = totals.client_fc_inner
LEFT JOIN FICH_Depot d ON f.depot_fc = d.code_depot
WHERE f.regl_fc != f.fc_total
  AND f.client_fc = '${id}'

    `;

    const result = await connection.execute(query);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
}





module.exports = {
  fetchClientImpaye: fetchClientImpaye,
  fetchClientNoNpaye:fetchClientNoNpaye,
  fetchFactImpC:fetchFactImpC
}
