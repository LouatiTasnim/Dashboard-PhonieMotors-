import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableBody, CTableRow,
  CTableHeaderCell, CTableDataCell, CBadge, CButton
} from '@coreui/react'
import { fetchFacture } from '../../../services/clientAPI'
import { formatCurrency } from '../../../utils/Currency'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const FactureDetails = () => {
  const { numero } = useParams()
  const [invoiceDetails, setInvoiceDetails] = useState(null)
  const pdfRef = useRef()

  useEffect(() => {
    const getInvoiceDetails = async () => {
      try {
        const data = await fetchFacture(numero)
        setInvoiceDetails(data)
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la facture', error)
      }
    }
    getInvoiceDetails()
  }, [numero])

  const downloadPDF = async () => {
    const input = pdfRef.current
    const canvas = await html2canvas(input, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Facture_${numero}.pdf`)
  }

  if (!invoiceDetails) return <p>Chargement...</p>

  const entete = invoiceDetails[0]
  const articles = invoiceDetails

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: '12px 0',
    borderBottom: '2px solid #ccc',
  }

  const columnStyle = {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  }

  const labelStyle = {
    fontWeight: '600',
    color: '#444',
    marginRight: 8,
    minWidth: 140,
    display: 'inline-block',
  }

  const valueStyle = { color: '#222' }

  const currencyStyle = {
    ...valueStyle,
    color: '#0d6efd',
    fontWeight: '500',
  }

  const getEtatColor = (etat) => {
    if (etat === 'Validé') return 'success'
    if (etat === 'Annulé') return 'danger'
    return 'secondary'
  }

  return (
    <CCard className="mb-4 border border-primary shadow-sm">
      <CCardHeader className="bg-light fw-bold d-flex justify-content-between align-items-center">
        <span>Détails de la Facture n° {numero}</span>
        <CButton color="primary" size="sm" onClick={downloadPDF}>
          Télécharger PDF
        </CButton>
      </CCardHeader>

      <CCardBody ref={pdfRef}>
        {/* En-tête facture */}
        <div style={containerStyle}>
          <div style={columnStyle}>
            <p><span style={labelStyle}>Client :</span> <span style={valueStyle}>{entete.INTITULE_CLIENT}</span></p>
            <p><span style={labelStyle}>Adresse :</span> <span style={valueStyle}>{entete.ADR_C_FACT_1}</span></p>
            <p><span style={labelStyle}>Date :</span> <span style={valueStyle}>{entete.DATE_FC ? new Date(entete.DATE_FC).toLocaleDateString() : '-'}</span></p>
            <p><span style={labelStyle}>Représentant :</span> <span style={valueStyle}>{entete.INTITULE_REPRES || '-'}</span></p>
            <p><span style={labelStyle}>Agent :</span> <span style={valueStyle}>{entete.FC_UTILIS || '-'}</span></p>
            <p><span style={labelStyle}>Échéance :</span> <span style={valueStyle}>{entete.ECHEANCE_FC ? new Date(entete.ECHEANCE_FC).toLocaleDateString() : '-'}</span></p>
            <p><span style={labelStyle}>Mode de règlement :</span> <span style={valueStyle}>{entete.MODE_REGL_FC || '-'}</span></p>
            <p><span style={labelStyle}>État :</span>
              <CBadge color={getEtatColor(entete.ETAT_FC)} className="ms-2">
                {entete.ETAT_FC || '-'}
              </CBadge>
            </p>
          </div>
          <div style={columnStyle}>
            <p><span style={labelStyle}>Acompte :</span> <span style={currencyStyle}>{entete.FC_ACOMPTE != null ? formatCurrency(entete.FC_ACOMPTE) : '-'}</span></p>
            <p><span style={labelStyle}>Total HT :</span> <span style={currencyStyle}>{entete.TOT_HT_FC != null ? formatCurrency(entete.TOT_HT_FC) : '-'}</span></p>
            <p><span style={labelStyle}>Total TVA :</span> <span style={currencyStyle}>{entete.TOT_TVA_FC != null ? formatCurrency(entete.TOT_TVA_FC) : '-'}</span></p>
            <p><span style={labelStyle}>Remise totale :</span> <span style={currencyStyle}>{entete.TOT_FC_REMISE != null ? formatCurrency(entete.TOT_FC_REMISE) : '-'}</span></p>
            <p><span style={labelStyle}>Total TTC :</span> <span style={currencyStyle}>{entete.TOT_TTC_FC != null ? formatCurrency(entete.TOT_TTC_FC) : '-'}</span></p>
            <p><span style={labelStyle}>Timbre :</span> <span style={currencyStyle}>{entete.FC_TIMBRE != null ? formatCurrency(entete.FC_TIMBRE) : '-'}</span></p>
            <p><span style={labelStyle}>Total :</span> <span style={currencyStyle}>{entete.FC_TOTAL != null ? formatCurrency(entete.FC_TOTAL) : '-'}</span></p>
          </div>
        </div>

        {/* Tableau des articles */}
        <CTable striped hover responsive bordered>
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>Article</CTableHeaderCell>
              <CTableHeaderCell>Description</CTableHeaderCell>
              <CTableHeaderCell>Quantité</CTableHeaderCell>
              <CTableHeaderCell>Prix Net</CTableHeaderCell>
              <CTableHeaderCell>Remise %</CTableHeaderCell>
              <CTableHeaderCell>Montant HT</CTableHeaderCell>
              <CTableHeaderCell>Montant TTC</CTableHeaderCell>
              <CTableHeaderCell>Dépôt</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {articles.map((item, idx) => (
              <CTableRow key={idx}>
                <CTableDataCell>{item.FCL_ARTICLE || '-'}</CTableDataCell>
                <CTableDataCell>{item.FC_DES_ART || '-'}</CTableDataCell>
                <CTableDataCell>{item.FCLQTE_L != null ? item.FCLQTE_L : '-'}</CTableDataCell>
                <CTableDataCell>{typeof item.FCLPX_NET === 'number' ? formatCurrency(item.FCLPX_NET) : '0.000'}</CTableDataCell>
                <CTableDataCell>{typeof item.FCL_TX_REM === 'number' ? item.FCL_TX_REM.toFixed(2) : '0.00'}</CTableDataCell>
                <CTableDataCell>{typeof item.FCL_MONTANT === 'number' ? formatCurrency(item.FCL_MONTANT) : '0.000'}</CTableDataCell>
                <CTableDataCell>{typeof item.FCL_MONTANT_TTC === 'number' ? formatCurrency(item.FCL_MONTANT_TTC) : '0.000'}</CTableDataCell>
                <CTableDataCell>{item.INTITULE_DEPOT || '-'}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default FactureDetails
