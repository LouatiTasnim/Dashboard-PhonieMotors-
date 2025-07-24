import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CCollapse,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { fetchAllNonPaye, fetchFactImpC } from '../../../services/reglementCAPI';

const NonPC = () => {
  const [data, setData] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null);
  const [factures, setFactures] = useState({});
  const navigate = useNavigate();

  // Pour stocker les lignes hoverées (objet { clientNum_factNum: true/false })
  const [hoveredRows, setHoveredRows] = useState({});

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchAllNonPaye();

        const grouped = {};

        result.rows.forEach(row => {
          const [repres, intitule_client, num, montant] = row;
          if (!grouped[repres]) {
            grouped[repres] = { clients: [], totalRestant: 0 };
          }
          grouped[repres].clients.push({
            num,
            nom: intitule_client,
            restant: parseFloat(montant).toFixed(3),
          });
          grouped[repres].totalRestant += parseFloat(montant);
        });

        const formatted = Object.entries(grouped).map(([repres, { clients, totalRestant }]) => ({
          repres,
          clients,
          totalRestant: totalRestant.toFixed(3),
        }));

        // Tri décroissant par total restant
        formatted.sort((a, b) => parseFloat(b.totalRestant) - parseFloat(a.totalRestant));

        setData(formatted);
      } catch (error) {
        console.error('Erreur lors de la récupération des impayés', error);
      }
    };

    getData();
  }, []);

  const toggleDetails = async (clientCode) => {
    if (expandedClient === clientCode) {
      setExpandedClient(null);
    } else {
      if (!factures[clientCode]) {
        try {
          const res = await fetchFactImpC(clientCode);
          const rows = res.rows.map(r => ({
            num: r[0],
            date: r[1],
            total: r[2],
            regle: r[3],
            restant: r[4],
            depot: r[5],
            echeance: r[6],
          }));
          setFactures(prev => ({ ...prev, [clientCode]: rows }));
        } catch (e) {
          console.error('Erreur lors de la récupération des factures', e);
        }
      }
      setExpandedClient(clientCode);
    }
  };

  // Handlers pour hover sur les lignes facture
  const handleMouseEnter = (clientNum, factNum) => {
    setHoveredRows(prev => ({
      ...prev,
      [`${clientNum}_${factNum}`]: true,
    }));
  };

  const handleMouseLeave = (clientNum, factNum) => {
    setHoveredRows(prev => ({
      ...prev,
      [`${clientNum}_${factNum}`]: false,
    }));
  };

  return (
    <CCard>
      <CCardHeader>
        <h4>Impayés par Représentant</h4>
      </CCardHeader>
      <CCardBody>
        <CAccordion alwaysOpen>
          {data.map((group, index) => (
            <CAccordionItem key={index} itemKey={index}>
              <CAccordionHeader>
             <strong>{group.repres}</strong> — Total impayé : <strong style={{ marginLeft: '8px' }}>{group.totalRestant} TND</strong>
              </CAccordionHeader>
              <CAccordionBody>
                <CTable striped responsive hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Nom Client</CTableHeaderCell>
                      <CTableHeaderCell>Montant Restant (TND)</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {group.clients.map((client, idx) => (
                      <React.Fragment key={idx}>
                        <CTableRow>
                          <CTableDataCell>{client.nom}</CTableDataCell>
                          <CTableDataCell>{client.restant}</CTableDataCell>
                          <CTableDataCell>
                           <CButton
                                size="sm"
                                style={{
                                    backgroundColor: '#e8ddf8ff',        // lilas clair
                                    borderColor: '#c8a2c8',
                                    borderRadius: '20px',
                                    padding: '6px 16px',
                                    fontWeight: '600',
                                    boxShadow: '0 2px 6px rgba(200, 162, 200, 0.4)',
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                                    color: '#4b2c65',                  // violet foncé pour le texte
                                }}
                                onClick={() => toggleDetails(client.num)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#f2e0fdff'; // violet plus foncé au hover
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 89, 182, 0.6)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#e8ddf8ff';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(200, 162, 200, 0.4)';
                                }}
                                >
                                {expandedClient === client.num ? 'Fermer' : 'Détails'}
                                </CButton>

                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableDataCell colSpan={3} style={{ padding: 0 }}>
                            <CCollapse visible={expandedClient === client.num}>
                              <CTable small bordered responsive>
                                <CTableHead>
                                  <CTableRow>
                                    <CTableHeaderCell>#Facture</CTableHeaderCell>
                                    <CTableHeaderCell>Date</CTableHeaderCell>
                                    <CTableHeaderCell>Total</CTableHeaderCell>
                                    <CTableHeaderCell>Réglé</CTableHeaderCell>
                                    <CTableHeaderCell>Restant</CTableHeaderCell>
                                    <CTableHeaderCell>Dépôt</CTableHeaderCell>
                                    <CTableHeaderCell>Échéance</CTableHeaderCell>
                                  </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                  {(factures[client.num] || []).map((fact, i) => {
                                    const key = `${client.num}_${fact.num}`;
                                    const isHovered = hoveredRows[key];
                                    return (
                                      <CTableRow
                                        key={i}
                                        onClick={() => navigate(`/vente/facture/${fact.num}`)}
                                        onMouseEnter={() => handleMouseEnter(client.num, fact.num)}
                                        onMouseLeave={() => handleMouseLeave(client.num, fact.num)}
                                        style={{
                                          cursor: 'pointer',
                                          backgroundColor: isHovered ? '#e6f7ff' : 'transparent',
                                          transition: 'background-color 0.3s ease',
                                        }}
                                      >
                                        <CTableDataCell>{fact.num}</CTableDataCell>
                                        <CTableDataCell>{new Date(fact.date).toLocaleDateString()}</CTableDataCell>
                                        <CTableDataCell>{fact.total}</CTableDataCell>
                                        <CTableDataCell>{fact.regle}</CTableDataCell>
                                        <CTableDataCell>{fact.restant}</CTableDataCell>
                                        <CTableDataCell>{fact.depot}</CTableDataCell>
                                        <CTableDataCell>{new Date(fact.echeance).toLocaleDateString()}</CTableDataCell>
                                      </CTableRow>
                                    );
                                  })}
                                </CTableBody>
                              </CTable>
                            </CCollapse>
                          </CTableDataCell>
                        </CTableRow>
                      </React.Fragment>
                    ))}
                  </CTableBody>
                </CTable>
              </CAccordionBody>
            </CAccordionItem>
          ))}
        </CAccordion>
      </CCardBody>
    </CCard>
  );
};

export default NonPC;
