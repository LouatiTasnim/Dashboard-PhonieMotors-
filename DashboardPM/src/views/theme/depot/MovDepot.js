import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CCard, CCardHeader, CCardBody, CButtonGroup, CButton,
} from '@coreui/react';
import { fetchMovDep } from '../../../services/depotAPI';
import GridExample from '../../../components/AGgrid';
import {
  FileText, Truck, PackageSearch, RefreshCcw,
  ArrowUpRight, ArrowDownLeft, Hammer, Circle,
} from 'lucide-react';

const ClientDetails = () => {
  const { id, nom, startDate, endDate } = useParams();
  const navigate = useNavigate();

  const [DepotMovements, setDepotMovements] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const documentTypes = [
    { label: 'Tous', value: 'ALL', icon: Circle },
    { label: 'Facture Client', value: 'Facture Client', icon: FileText },
    { label: 'Livraison Client', value: 'Livraison Client', icon: Truck },
    { label: 'Réception Fournisseur', value: 'Réception Fournisseur', icon: PackageSearch },
    { label: 'Transfert', value: 'Transfert', icon: RefreshCcw },
    { label: 'Sortie', value: 'Sortie', icon: ArrowUpRight },
    { label: 'Entrée', value: 'Entrée', icon: ArrowDownLeft },
    { label: 'Fabrication', value: 'Fabrication', icon: Hammer },
  ];

  const getTypeColor = (label) => {
    switch (label) {
      case 'Facture Client': return '#007bff';      // bleu
      case 'Livraison Client': return '#28a745';    // vert
      case 'Réception Fournisseur': return '#17a2b8'; // cyan
      case 'Transfert': return '#ffc107';           // jaune
      case 'Sortie': return '#dc3545';              // rouge
      case 'Entrée': return '#20c997';              // turquoise
      case 'Fabrication': return '#6f42c1';         // violet
      default: return '#6c757d';                    // gris
    }
  };

  useEffect(() => {
    const getClientMovements = async () => {
      try {
        const data = await fetchMovDep(id, startDate, endDate);
        setDepotMovements(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des mouvements du client', error);
      }
    };
    getClientMovements();
  }, [id, startDate, endDate]);

  const handleRowClick = (movement) => {
    if (movement.data.label === 'Facture Client') {
      navigate(`/vente/facture/${movement.data.num}`);
    }
  };

  const filteredRows = React.useMemo(() => {
    if (!DepotMovements?.rows) return [];

    if (typeFilter === 'ALL') {
      return DepotMovements;
    }

    const labelIndex = DepotMovements.metaData.findIndex(m => m.name.toUpperCase() === 'LABEL');

    const filtered = DepotMovements.rows.filter(row => {
      return row[labelIndex] === typeFilter;
    });

    return {
      ...DepotMovements,
      rows: filtered,
    };
  }, [DepotMovements, typeFilter]);

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <p>
          Mouvements du dépôt <strong>{nom}</strong> du <strong>{new Date(startDate).toLocaleDateString()}</strong> au <strong>{new Date(endDate).toLocaleDateString()}</strong>
        </p>

        <CButtonGroup className="mt-3 flex-wrap gap-2">
          {documentTypes.map(({ value, label, icon: Icon }) => (
            <CButton
              key={value}
              className="rounded-pill d-flex align-items-center gap-2"
              onClick={() => setTypeFilter(value)}
              style={{
                backgroundColor: typeFilter === value ? `${getTypeColor(value)}20` : undefined,
                color: typeFilter === value ? getTypeColor(value) : undefined,
                borderColor: getTypeColor(value),
              }}
              variant="outline"
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: getTypeColor(value),
                  display: 'inline-block',
                }}
              />
              <Icon size={15} />
              {label}
            </CButton>
          ))}
        </CButtonGroup>
      </CCardHeader>

      <CCardBody>
        <GridExample onRowClicked={handleRowClick} data={filteredRows} />
      </CCardBody>
    </CCard>
  );
};

export default ClientDetails;
