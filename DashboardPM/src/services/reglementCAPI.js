const apiUrl = process.env.VITE_API_URL;

export async function fetchAllImp() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/impayeC`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchAllNonPaye() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/nonPayeC`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchFactImpC(id) {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/FactImpC/${id}`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}


