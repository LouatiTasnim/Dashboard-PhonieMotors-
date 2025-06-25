import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CCard, CCardHeader, CCardBody, CFormInput, CModal, CModalHeader, CModalBody, CModalFooter, CButton } from '@coreui/react'; 
import { fetchAllDepot } from '../../../services/depotAPI';
import ResponsiveDateRangePickers from '../../../components/DatePicker';

const DepotDetails = () => {
  const { id, nom } = useParams();
  const [depots, setDepot] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDepots, setFilteredDepots] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [modalVisible, setModalVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const getDepots = async () => {
      try {
        const data = await fetchAllDepot();
        setDepot(data.rows);
        setFilteredDepots(data.rows);
      } catch (error) {
        console.error('Erreur lors de la récupération des données des clients', error);
      }
    };

    getDepots();
  }, [id]);

  useEffect(() => {
    const results = depots.filter(depot =>
      depot[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
      depot[1].toLowerCase().includes(searchTerm.toLowerCase()) 
    );
    setFilteredDepots(results);
  }, [searchTerm, depots]);

  const handleDepotClick = (depot) => {
    setSelectedDepot(depot);
    setModalVisible(true);
  };

  const handleDateChange = (dateRange) => {
    setDateRange(dateRange);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    if (selectedDepot && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      navigate(`/vente/depot/depotMov/${selectedDepot[0]}/${selectedDepot[1]}/${startDate}/${endDate}`);
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <p>Liste des dépôts</p>
        <CFormInput
          type="text"
          placeholder="Rechercher par code ou intitulé"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
      </CCardHeader>
      <CCardBody>
        <table className="table">
          <thead>
            <tr>
              <th>Code dépôt</th>
              <th>Intitulé dépôt</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepots.map((depot, index) => (
              <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleDepotClick(depot)}>
                <td>{depot[0]}</td>
                <td>{depot[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CCardBody>
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <p>Sélectionner une plage de dates</p>
        </CModalHeader>
        <CModalBody>
          <ResponsiveDateRangePickers onChange={handleDateChange} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Annuler</CButton>
          <CButton color="primary" onClick={handleConfirm}>Confirmer</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default DepotDetails;
