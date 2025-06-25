const oracledb = require('oracledb');


 oracledb.initOracleClient({ libDir: 'C:\\PhonieTB\\instantclient-basic-windows.x64-23.4.0.24.05\\instantclient_23_4' });

async function getConnection() {
  return await oracledb.getConnection({
    user: 'PHONIEM101',
    password: 'PHONIEM101',
    connectString: '192.168.1.215:1521/PHONIEBASE',
    //user: 'SEMIA',
    //password: 'SEMIA',
     //connectString:'192.168.1.214:1521/OKBASE',
    privilege: oracledb.Normal
  });
}
module.exports = {
  getConnection 
};
