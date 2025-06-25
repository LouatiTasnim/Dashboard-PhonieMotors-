const apiUrl = process.env.VITE_API_URL;

export async function fetchAllRev() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/Clients`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchAllRevDep(id) {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/Clients/RevDep/${id}`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchAllClientMov(id) {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/Client/Mov/${id}`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

//const API_ENDPOINT = process.env.APP_API


export async function fetchFacture(id) {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/Facture/${id}`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}






