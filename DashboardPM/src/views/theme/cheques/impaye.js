import React, { useEffect, useState } from 'react';
import { CCard, CCardHeader, CCardBody, CButtonGroup, CButton } from '@coreui/react';
import { fetchAllImp } from '../../../services/reglementCAPI';
import GridExample from '../../../components/AGgrid';

const ImpayeC = () => {
  const [data, setData] = useState({ metaData: [], rows: [] });
  const [filteredData, setFilteredData] = useState({ metaData: [], rows: [] });
  const [typeFilter, setTypeFilter] = useState(null);

  useEffect(() => {
    const getImp = async () => {
      try {
        const result = await fetchAllImp();
        setData(result);
        setFilteredData(result);
      } catch (error) {
        console.error('Erreur lors de la récupération des impayés', error);
      }
    };
    getImp();
  }, []);

  useEffect(() => {
    if (!typeFilter) {
      setFilteredData(data);
    } else {
      const filteredRows = data.rows.filter(row => {
        const detail = row[2]?.toUpperCase() || ''; // ← Change l’index si besoin
        if (typeFilter === 'TRAITE') return detail.includes('TR');
        if (typeFilter === 'CHEQUE') return detail.includes('CH');
        if (typeFilter === 'AUTRE') return !detail.includes('TR') && !detail.includes('CH');
        return true;
      });
      setFilteredData({ ...data, rows: filteredRows });
    }
  }, [typeFilter, data]);

  const getColor = (type) => {
    const colorMap = {
      'TRAITE': '#17a2b8',
      'CHEQUE': '#ffc107',
      'AUTRE': '#6c757d',
    };
    return colorMap[type] || '#adb5bd';
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CButtonGroup className="mt-1 flex-wrap gap-2">
          <CButton
            onClick={() => setTypeFilter(null)}
            className="rounded-pill"
            style={{
              fontWeight: !typeFilter ? 'bold' : 'normal',
              borderColor: '#6c757d',
            }}
            variant="outline"
          >
            Tous
          </CButton>

          {['TRAITE', 'CHEQUE', 'AUTRE'].map((type) => (
            <CButton
              key={type}
              onClick={() => setTypeFilter(prev => prev === type ? null : type)}
              className="rounded-pill d-flex align-items-center gap-2"
              style={{
                backgroundColor: typeFilter === type ? `${getColor(type)}20` : undefined,
                color: typeFilter === type ? getColor(type) : undefined,
                borderColor: getColor(type),
              }}
              variant="outline"
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: getColor(type),
                  display: 'inline-block',
                }}
              />
              {type}
            </CButton>
          ))}
        </CButtonGroup>
      </CCardHeader>

      <CCardBody>
        <GridExample data={filteredData} />
      </CCardBody>
    </CCard>
  );
};

export default ImpayeC;
