import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { transformDataForGrid } from "./Fonctions";
import { CFormInput } from '@coreui/react';
import { formatCurrency } from "../utils/Currency";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = (props) => {
  const [rowData, setrowData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [columnDefs, setcolumnDefs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [hasDateColumn, setHasDateColumn] = useState(false);

  const localeText = {
    filterOoo: 'Filtrer...',
    applyFilter: 'Appliquer le filtre',
    clearFilter: 'Effacer le filtre',
    equals: 'Égal à',
    notEqual: 'Différent de',
    lessThan: 'Inférieur à',
    greaterThan: 'Supérieur à',
    contains: 'Contient',
    notContains: 'Ne contient pas',
    startsWith: 'Commence par',
    endsWith: 'Se termine par',
    copy: 'Copier',
    copyWithHeaders: 'Copier avec en-têtes',
    paste: 'Coller',
    pasteAll: 'Coller tout',
    page: 'Page',
    more: 'Plus',
    to: 'à',
    of: 'de',
    next: 'Suivant',
    last: 'Dernier',
    first: 'Premier',
    previous: 'Précédent',
    loadingOoo: 'Chargement...',
    noRowsToShow: 'Aucune donnée à afficher',
    loading: 'Chargement...',
    sortAscending: 'Trier par ordre croissant',
    sortDescending: 'Trier par ordre décroissant',
    blank: 'Vide',
    notBlank: 'Non vide'
  };

  useEffect(() => {
    if (props.data) {
      const datas = transformDataForGrid(props.data);
      setOriginalData(datas?.rowData || []);
      setrowData(datas?.rowData || []);
      setcolumnDefs(datas?.columnDefs || []);

      // Détection d'une colonne date (en fonction de type ou nom)
      const foundDateColumn = (datas?.columnDefs || []).some(colDef => {
        // Détection simple : nom contient 'date' ou type custom
        return (
          (colDef.field && colDef.field.toLowerCase().includes('date')) ||
          (colDef.type && colDef.type === 'dateColumn')
        );
      });
      setHasDateColumn(foundDateColumn);
    }
  }, [props.data]);

  // Filtrage texte + filtrage date (exact date)
  useEffect(() => {
    let filtered = originalData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(cell => {
          if (cell == null) return false;

          const rawStr = cell.toString().toLowerCase();

          // Format date si possible
          let formattedDateStr = '';
          if (cell instanceof Date) {
            formattedDateStr = cell.toLocaleDateString('fr-FR').toLowerCase();
          } else if (typeof cell === 'string' && /^\d{4}-\d{2}-\d{2}/.test(cell)) {
            const date = new Date(cell);
            if (!isNaN(date)) {
              formattedDateStr = date.toLocaleDateString('fr-FR').toLowerCase();
            }
          }

          // Format nombre
          let formattedNumberStr = '';
          if (typeof cell === 'number') {
            formattedNumberStr = formatCurrency(cell).toLowerCase();
          }

          return (
            rawStr.includes(term) ||
            (formattedDateStr && formattedDateStr.includes(term)) ||
            (formattedNumberStr && formattedNumberStr.includes(term))
          );
        })
      );
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toLocaleDateString('fr-FR');
      filtered = filtered.filter(row =>
        Object.values(row).some(cell => {
          let cellDateStr = '';

          if (cell instanceof Date) {
            cellDateStr = cell.toLocaleDateString('fr-FR');
          } else if (typeof cell === 'string' && /^\d{4}-\d{2}-\d{2}/.test(cell)) {
            const date = new Date(cell);
            if (!isNaN(date)) {
              cellDateStr = date.toLocaleDateString('fr-FR');
            }
          }

          return cellDateStr === filterDate;
        })
      );
    }

    setrowData(filtered);
  }, [searchTerm, dateFilter, originalData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  const containerStyle = useMemo(() => ({ width: "100%", height: "80vh" }), []);
  const gridStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  const onGridReady = useCallback((params) => {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 100);
  }, []);

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-2" >
        <CFormInput
          type="text"
          placeholder="Filtrer les résultats par n'importe quelle colonne..."
          value={searchTerm}
          onChange={handleSearch}
        />
        {hasDateColumn && (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateChange}
              style={{ paddingLeft: '24px', height: '2.2rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            
          </div>
        )}
      </div>

      <div style={containerStyle}>
        <div style={gridStyle} className="ag-theme-quartz">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            localeText={localeText}
            onRowClicked={(e) => props.onRowClicked(e)}
            onGridReady={onGridReady}
            gridOptions={{
              getRowStyle: () => ({ fontSize: '1.0rem' }),
            }}
          />
        </div>
      </div>
    </>
  );
};

export default GridExample;
