// Fonctions.js

// Fonction pour vérifier si une valeur est une date
const isDate = (value) => {
  return typeof value === 'string' && !isNaN(Date.parse(value))
}

// Fonction pour vérifier si une valeur est un nombre
const isNumeric = (value) => {
  return typeof value === 'number' || (!isNaN(value) && !isNaN(parseFloat(value)))
}

// Formatage en devise TND
const formatCurrency = (value) => {
  const floatVal = parseFloat(value)
  if (isNaN(floatVal)) return value
  return floatVal.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
  })
}

// Fonction principale de transformation
export const transformDataForGrid = (result) => {
  if (!result?.metaData || !result?.rows) return { columnDefs: [], rowData: [] }

  // Création des colonnes avec formattage intelligent
  const columnDefs = result.metaData.map((meta, idx) => {
    const field = meta.name.toLowerCase();
  
    return {
      field,
      headerName: meta.name.replace(/_/g, ' '),
      filter: meta.dbTypeName === 'Number' ? 'agNumberColumnFilter' : 'agTextColumnFilter',
      valueFormatter: (params) => {
        const val = params.value;
        if (!val) return '-';
        if (isDate(val)&& meta.dbTypeName.toLowerCase() !== 'varchar2') return new Date(val).toLocaleDateString('fr-FR');
        if (isNumeric(val) && meta.dbTypeName.toLowerCase() !== 'varchar2') return formatCurrency(val);
        return val;
      },
      cellStyle: (params) => {
        const val = params.value;
        if (isNumeric(val)&& meta.dbTypeName.toLowerCase() !== 'varchar2') return { textAlign: 'right', fontWeight: '500' };
        return {};
      },
      flex: 1,
    };
  });
  

  // Transformation des données (lignes)
  const rowData = result.rows.map((row) =>
    row.reduce((acc, value, index) => {
      const columnName = result.metaData[index].name.toLowerCase()
      acc[columnName] = value
      return acc
    }, {})
  )

  return { columnDefs, rowData }
}
