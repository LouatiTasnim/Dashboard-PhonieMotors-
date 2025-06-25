import React, { useEffect, useState, createRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
import { rgbToHex } from '@coreui/utils'
import { DocsLink } from 'src/components'
import { fetchAllRev } from '../../../services/clientAPI'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import GridExample from '../../../components/AGgrid'
import { fetchAllDepot } from '../../../services/depotAPI'

const ThemeView = () => {
    const [depots, setDepot] = useState([]);
    useEffect(() => {
        const getDepots = async () => {
          try {
            const data = await fetchAllDepot();
            setDepot(data);
          } catch (error) {
            console.error('Erreur lors de la récupération des données des clients', error);
          }
        };
    
        getDepots();
      }, []);
      
      return (
        <div>
          <h3>Liste des représentants</h3>
          <br></br>
          <GridExample depots={depots} />
        </div>
      );
}

const ThemeColor = ({ className, children }) => {
  const classes = classNames(className, 'theme-color w-75 rounded mb-3')
  return (
    <CCol xs={12} sm={6} md={4} xl={2} className="mb-4">
      <div className={classes} style={{ paddingTop: '75%' }}></div>
      {children}
      <ThemeView />
    </CCol>
  )
}

ThemeColor.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

const Colors = () => {
  return (
    <>
     <ThemeView />
    </>
  )
}

export default Colors
