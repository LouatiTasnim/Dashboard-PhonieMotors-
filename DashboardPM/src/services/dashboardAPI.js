const apiUrl = process.env.VITE_API_URL;

export async function fetchAllRev() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/DashRev`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchCA() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/DashCA`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}
export async function fetchCAC() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/DashCAC`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchAllRepChiffre() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/DashRepChiffre`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchAllRepChiffreFC(id,periode) {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/DashDetails/${id}/${periode}`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}