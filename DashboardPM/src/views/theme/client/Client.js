import React, { useEffect, useState, createRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
import { rgbToHex } from '@coreui/utils'
import { DocsLink } from 'src/components'
import { fetchAllRev } from '../../../services/clientAPI'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';


const ThemeView = () => {
 
      const [clients, setClients] = useState([]);
    
      const navigate = useNavigate();

      useEffect(() => {
        const getClients = async () => {
          try {
            const data = await fetchAllRev();
            setClients(data);
          } catch (error) {
            console.error('Error fetching client data', error);
          }
        };
    
        getClients();
      }, []);

      const handleClientClick = (client) => {
        const sanitizedClient2 = client[2].replace(/\//g, '-');
        navigate(`/vente/clients/revDep/${client[1]}/${sanitizedClient2}`);
      };

      return (
        <div>
          <h3>Clients par représentant</h3>
          <br></br>
          <ul className="list-group">
            {clients.map((client, index) => (
              <li key={index} onClick={() => handleClientClick(client)} className="list-group-item list-group-item-action">{client[2] } ({client[0]}) </li>
            ))}
          </ul>
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
