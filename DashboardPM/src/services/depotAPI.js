const apiUrl = process.env.VITE_API_URL;

export async function fetchAllDepot() {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/Depot`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}

export async function fetchMovDep(id,startDate,EndDate) {
    try {
        // Making a GET request to the API endpoint
        const response = await fetch(`${apiUrl}/MovDepot/${id}/${startDate}/${EndDate}`);
        const data = await response.json();
        return data

    } catch (error) {
        // Throw an error with a specific message if there is an issue with the API call or data processing
        throw new Error('Error fetching data: ' + error.message);
    }
}



