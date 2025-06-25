import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CRow,
  CCol,
  CButton
} from '@coreui/react';
import { fetchAllClientMov } from '../../../services/clientAPI';
import { formatCurrency } from '../../../utils/Currency';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSortAmountDownAlt,
  faSortAmountUpAlt
} from '@fortawesome/free-solid-svg-icons';

const ClientDetails = () => {
  const navigate = useNavigate();
  const { id, nom } = useParams();
  const [data, setData] = useState({ metaData: [], rows: [] });
  const [groupedData, setGroupedData] = useState({});
  const [commandeMap, setCommandeMap] = useState({});

  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [minMontant, setMinMontant] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const resetFilters = () => {
    setDateDebut('');
    setDateFin('');
    setMinMontant('');
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchAllClientMov(id);
      setData(res);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!data.rows.length) return;

    const numIndex = data.metaData.findIndex(m => m.name === 'MVT_NUMERO');
    const typeDocIndex = data.metaData.findIndex(m => m.name === 'MVT_TYPE_DOC');
    const numDocIndex = data.metaData.findIndex(m => m.name === 'MVT_NUM_DOC');
    const dateIndex = data.metaData.findIndex(m => m.name === 'MVT_DATE');
    const articleIndex = data.metaData.findIndex(m => m.name === 'INTIT_ARTICLE');
    const qteIndex = data.metaData.findIndex(m => m.name === 'MVT_QTE');
    const prixNetIndex = data.metaData.findIndex(m => m.name === 'MVT_PX_NET');
    const montantTTCIndex = data.metaData.findIndex(m => m.name === 'MVT_MONTANT_TTC');

    const filtered = data.rows.filter(row => {
      const rowDate = new Date(row[dateIndex]);
      rowDate.setHours(0, 0, 0, 0);
      const startDate = dateDebut ? new Date(dateDebut) : null;
      const endDate = dateFin ? new Date(dateFin) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(0, 0, 0, 0);

      const rowMontant = parseFloat(row[montantTTCIndex]);
      const isAfterStart = startDate ? rowDate >= startDate : true;
      const isBeforeEnd = endDate ? rowDate <= endDate : true;
      const isMontantMinMatch = minMontant ? rowMontant >= parseFloat(minMontant) : true;

      return isAfterStart && isBeforeEnd && isMontantMinMatch;
    });

    const group = {};
    const commandes = {};

    for (const row of filtered) {
      const mvtNumero = row[numIndex];
      const commandeMatch = mvtNumero.match(/[A-Z]\.(C\d{2}-\d{5}A\d{4})/);
      const commandeNum = commandeMatch ? commandeMatch[1] : null;
      const numDoc = row[numDocIndex];

      if (!group[numDoc]) {
        group[numDoc] = {
          typeDoc: row[typeDocIndex],
          numDoc: numDoc,
          date: new Date(row[dateIndex]).toLocaleDateString(),
          lignes: [],
          total: 0,
          commande: commandeNum
        };
      }

      const ligne = {
        article: row[articleIndex],
        qte: row[qteIndex],
        prix: row[prixNetIndex],
        montant: row[montantTTCIndex]
      };

      group[numDoc].lignes.push(ligne);
      group[numDoc].total += parseFloat(ligne.montant);

      if (commandeNum) {
        if (!commandes[commandeNum]) commandes[commandeNum] = {};
        commandes[commandeNum][row[typeDocIndex]] = numDoc;
      }
    }

    const sortedKeys = Object.keys(group).sort((a, b) => {
      const valA = group[a];
      const valB = group[b];
      if (sortBy === 'date') {
        const dateA = new Date(valA.date.split('/').reverse().join('-'));
        const dateB = new Date(valB.date.split('/').reverse().join('-'));
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === 'montant') {
        return sortOrder === 'asc' ? valA.total - valB.total : valB.total - valA.total;
      }
      return 0;
    });

    const sortedGroup = {};
    sortedKeys.forEach(key => {
      sortedGroup[key] = group[key];
    });
    setGroupedData(sortedGroup);
    setCommandeMap(commandes);
  }, [dateDebut, dateFin, minMontant, sortBy, sortOrder, data]);

  const handleClick = (type, docNum) => {
    if (type === 'FC') {
      navigate(`/vente/facture/${docNum}`);
    }
  };

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary">Mouvements du client {nom}</h5>
          <div className="d-flex gap-3 align-items-center">
            <FontAwesomeIcon
              icon={faSortAmountDownAlt}
              title="Trier par montant"
              onClick={() => {
                setSortBy('montant');
                setSortOrder(prev => (sortBy === 'montant' && prev === 'asc' ? 'desc' : 'asc'));
              }}
              style={{ cursor: 'pointer', color: sortBy === 'montant' ? '#0d6efd' : '#6c757d' }}
            />
            <FontAwesomeIcon
              icon={faSortAmountUpAlt}
              title="Trier par date"
              onClick={() => {
                setSortBy('date');
                setSortOrder(prev => (sortBy === 'date' && prev === 'asc' ? 'desc' : 'asc'));
              }}
              style={{ cursor: 'pointer', color: sortBy === 'date' ? '#198754' : '#6c757d' }}
            />
          </div>
        </div>
        <CRow className="mt-3 g-3 align-items-end">
          <CCol md={3}>
            <label className="form-label">Date début :</label>
            <input
              type="date"
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="form-control border-primary"
            />
          </CCol>
          <CCol md={3}>
            <label className="form-label">Date fin :</label>
            <input
              type="date"
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="form-control border-primary"
            />
          </CCol>
          <CCol md={3}>
            <label className="form-label">Montant TTC min :</label>
            <CFormInput
              type="number"
              value={minMontant}
              onChange={e => setMinMontant(e.target.value)}
              placeholder="Ex: 100"
              className="border-success"
            />
          </CCol>
          <CCol md={3}>
            <CButton color="primary" variant="outline" onClick={resetFilters}>
              Réinitialiser les filtres
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>

      <CCardBody>
        {Object.entries(groupedData).map(([num, info]) => (
          <CCard
            key={num}
            className="mb-3 shadow-sm rounded-3"
            
            onClick={() => handleClick(info.typeDoc, info.numDoc)}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f1f5ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <strong>N° {info.numDoc}</strong>
              </div>
              <div style={{fontSize:'1.0rem', color: '#6c757d' }}>{info.date}</div>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol>
                  <strong>Total TTC :</strong> {formatCurrency(info.total)} DT
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        ))}
        {Object.keys(groupedData).length === 0 && (
          <p
            className="text-center text-muted mt-4"
            style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}
          >
            Aucun document trouvé pour les filtres sélectionnés.
          </p>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ClientDetails;
