// ClientDetails.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CCard, CCardHeader, CCardBody, CButtonGroup, CButton,
} from '@coreui/react';
import { Circle } from 'lucide-react';
import { fetchAllRevDep } from '../../../services/clientAPI';
import GridExample from '../../../components/AGgrid';

const ClientDetails = () => {
  const { id, nom } = useParams();
  const [clients, setClients] = useState({ metaData: [], rows: [] });
  const [filteredClients, setFilteredClients] = useState({ metaData: [], rows: [] });
  const [groupFilter, setGroupFilter] = useState(null);
  const [groupValues, setGroupValues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getClients = async () => {
      try {
        const data = await fetchAllRevDep(id);
        setClients(data);
        setFilteredClients(data);

        const groups = Array.from(new Set(data.rows.map(row => row[2]))).filter(Boolean);
        setGroupValues(groups);
      } catch (error) {
        console.error('Erreur lors de la récupération des données des clients', error);
      }
    };

    getClients();
  }, [id]);

  useEffect(() => {
    if (!groupFilter) {
      setFilteredClients(clients);
    } else {
      const filteredRows = clients.rows.filter(row => row[2] === groupFilter);
      setFilteredClients({
        ...clients,
        rows: filteredRows,
      });
    }
  }, [groupFilter, clients]);

  const handleGroupClick = (group) => {
    setGroupFilter(prev => (prev === group ? null : group));
  };

  const getGroupColor = (group) => {
    const colorMap = {
      'Particuliers': '#007bff',           // Bleu
      'CONSTRUCREUR MAR': '#6f42c1',       // Violet
      'Autres': '#6c757d',                 // Gris
      'Passagers': '#17a2b8',              // Cyan
      'Organismes Publiques': '#20c997',   // Turquoise
      'Groupe Z99': '#ffc107',             // Jaune
      'Revendeurs': '#28a745',             // Vert
      'Entrepreneurs': '#dc3545',          // Rouge
    };
  
    return colorMap[group] || '#adb5bd'; // Gris clair par défaut si inconnu
  };
  

  const handleClientClick = (client) => {
    navigate(`/vente/clients/clientMov/${client.data.compte_client}/${client.data.client}`);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <p>Détails des clients de <strong>{nom}</strong></p>

        <CButtonGroup className="mt-3 flex-wrap gap-2">
  <CButton
    onClick={() => setGroupFilter(null)}
    className="rounded-pill d-flex align-items-center gap-2"
    style={{
      fontWeight: !groupFilter ? 'bold' : 'normal',
      borderColor: '#6c757d',
    }}
    variant="outline"
  >
    Tous
  </CButton>

  {groupValues.map((group) => (
    <CButton
      key={group}
      onClick={() => handleGroupClick(group)}
      className="rounded-pill d-flex align-items-center gap-2"
      style={{
        backgroundColor: groupFilter === group ? `${getGroupColor(group)}20` : undefined,
        color: groupFilter === group ? getGroupColor(group) : undefined,
        borderColor: getGroupColor(group),
      }}
      variant="outline"
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: getGroupColor(group),
          display: 'inline-block',
        }}
      />
      {group}
    </CButton>
  ))}
</CButtonGroup>
      </CCardHeader>

      <CCardBody>
        <GridExample onRowClicked={handleClientClick} data={filteredClients} />
      </CCardBody>
    </CCard>
  );
};

export default ClientDetails;
