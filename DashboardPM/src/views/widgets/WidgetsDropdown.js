import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';
import {
  CRow,
  CCol,
  CButton,
  CWidgetStatsA,
  CCard,
  CCardBody,
  CCardTitle,
  CBadge,
} from '@coreui/react';
import { fetchAllRepChiffre, fetchAllRev, fetchCA, fetchCAC } from '../../services/dashboardAPI';
import { formatCurrency } from '../../utils/Currency';

const WidgetsDropdown = (props) => {
  const [TotalRev, setTotalRev] = useState();
  const [CA, setCA] = useState();
  const [CAC, setCAC] = useState();
  const [repChiffre, setRepChiffre] = useState([]);
  const [period, setPeriod] = useState('Mois Actuel'); // Période actuelle (mois, trimestre, semestre, année)
  const navigate = useNavigate();


   // Fonction pour récupérer le CA
   const getCA = async () => {
    try {
      const data = await fetchCA();
      setCA(data[0][0]);
    } catch (error) {
      console.error('Error fetching client data', error);
    }
  };
  // Fonction pour récupérer le CAC
  const getCAC = async () => {
    try {
      const data = await fetchCAC();
      setCAC(data[0][0]);
    } catch (error) {
      console.error('Error fetching client data', error);
    }
  };

  // Fonction pour récupérer le total des revendeurs
  const getRev = async () => {
    try {
      const data = await fetchAllRev();
      setTotalRev(data[0][0]);
    } catch (error) {
      console.error('Error fetching client data', error);
    }
  };

  // Fonction pour récupérer les représentants et leur chiffre d'affaire en fonction de la période
  const getRep = async (selectedPeriod) => {
    try {
      const data = await fetchAllRepChiffre(selectedPeriod);
      setRepChiffre(data); // Met à jour les données selon la période sélectionnée
    } catch (error) {
      console.error('Error fetching client data', error);
    }
  };

  // Charge les données au démarrage et à chaque changement de période
  useEffect(() => {
    getCA();
    getCAC();
    getRev();
    getRep(period);
  }, [period]);

  // Fonction pour filtrer les données par période
  const filterDataByPeriod = (period) => {
    switch (period) {
      case 'Trimestre':
        return repChiffre.filter(rep => rep[0] === '3 Derniers Mois'); // Filtre pour les 3 derniers mois
      case 'Semestre':
        return repChiffre.filter(rep => rep[0] === 'Dernier Semestre'); // Filtre pour le dernier semestre
      case 'Année Courante':
        return repChiffre.filter(rep => rep[0] === 'Année Courante'); // Filtre pour l'année courante
      case 'Mois Actuel':
      default:
        return repChiffre.filter(rep => rep[0] === 'Mois Actuel'); // Filtre pour le mois actuel
    }
  };

  // Fonction pour définir la couleur de l'indicateur selon la période
  const getPeriodBadgeColor = (period) => {
    switch (period) {
      case 'Trimestre':
        return 'info'; // Bleu clair pour le trimestre
      case 'Semestre':
        return 'danger'; // Jaune pour le semestre
      case 'Année Courante':
        return 'success'; // Vert pour l'année
      case 'Mois Actuel':
      default:
        return 'primary'; // Bleu pour le mois actuel
    }
  };

  const handleClientClick = (ca,rep, id, period) => {
    const safeRep = rep.replaceAll('/', '-'); // remplace tous les '/' par '-'
    navigate(`/vente/representant/DetailsCA/${ca}/${safeRep}/${id}/${period}`);
  };
  

  return (
    <div className={props.className}>
      <h3>Ventes</h3>
      <CRow className="mb-3 ">
        <CCol>
          {/* Boutons pour changer la période */}
          <CButton color="primary" onClick={() => setPeriod('Mois Actuel')}>
            Mois
          </CButton>
          <CButton color="info" onClick={() => setPeriod('Trimestre')} className="mx-4">
            Trimestre
          </CButton>
          <CButton color="danger" onClick={() => setPeriod('Semestre')}>
            Semestre
          </CButton>
          <CButton color="success" onClick={() => setPeriod('Année Courante')} className="mx-4">
            Année Courante
          </CButton>
        </CCol>
      </CRow>
      
      <CRow>
       
        {/* Affichage des représentants et de leur chiffre d'affaire filtré */}
        {filterDataByPeriod(period).map((rep, index) => (
          <CCol sm={6} xl={4} key={index} className="mb-4">
            <CCard onClick={() => handleClientClick(rep[3],rep[2],rep[1],period)}>
              {/* Affichage de l'indicateur de période */}
              <CCardBody>
                <CCardTitle>{rep[2]}
                <CBadge className="rounded" style={{ position: 'absolute', top: '10px', right: '10px',width: '100px', height: '18px',fontSize: '0.7rem' }}color={getPeriodBadgeColor(period)}>
                  {period}
                </CBadge>
                </CCardTitle> {/* Nom du représentant */}
                <p>Chiffre d'affaires : {formatCurrency(rep[3])}</p> {/* Chiffre d'affaires du représentant */}
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
      <CRow>
      <CCol sm={6} xl={3}>
          <CWidgetStatsA
            color="primary"
            value={<>{formatCurrency(CA)}</>}
            title={`Chiffre d'affaire ${new Date().getFullYear()-1}`}
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <CWidgetStatsA
            color="primary"
            value={<>{formatCurrency(CAC)}</>}
            title={`Chiffre d'affaire ${new Date().getFullYear()}`}
          />
        </CCol>
      </CRow>
    </div>
    
  );
};

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
};

export default WidgetsDropdown;
