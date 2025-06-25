import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CCard, CCardHeader, CCardBody, CBadge } from '@coreui/react';
import GridExample from '../../../components/AGgrid';
import { fetchAllRepChiffreFC } from '../../../services/dashboardAPI';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { formatCurrency } from '../../../utils/Currency';
dayjs.locale('fr');

const getMonthsRange = (period) => {
  const now = dayjs();
  let start;

  switch (period) {
    case 'Mois Actuel':
      return [now.format('MMMM YYYY')];
    case 'Trimestre':
      start = now.subtract(2, 'month');
      break;
    case 'Semestre':
      start = now.subtract(5, 'month');
      break;
    case 'Année Courante':
      start = dayjs().startOf('year');
      break;
    default:
      return [];
  }

  const months = [];
  let current = start.startOf('month');
  while (current.isBefore(now.endOf('month')) || current.isSame(now, 'month')) {
    months.push(current.format('MMMM YYYY'));
    current = current.add(1, 'month');
  }

  return months;
};

const ClientDetails = () => {
  const { ca,rep, id, period } = useParams();
  const [FC, setFC] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getFC = async () => {
      try {
        const data = await fetchAllRepChiffreFC(id, period);
        setFC(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de chiffre d’affaires du représentant', error);
      }
    };

    getFC();
  }, [id, period]);

  const handleRowClick = (movement) => {
    navigate(`/vente/facture/${movement.data.num_fc}`);
  };

  const months = getMonthsRange(period);

  return (
    <CCard className="mb-4" style={{ fontSize: '1.1rem' }}>
      <CCardHeader>
        <strong>Détails du chiffre d’affaires : {formatCurrency(ca)}</strong><br />
        Représentant : {rep} <br />
        Période : {period} <br />
        Mois concernés :{' '}
        {months.map((mois, index) => (
          <CBadge key={index} color="info" className="me-1">
            {mois}
          </CBadge>
        ))}
      </CCardHeader>
      <CCardBody>
        <GridExample onRowClicked={handleRowClick} data={FC} />
      </CCardBody>
    </CCard>
  );
};

export default ClientDetails;
