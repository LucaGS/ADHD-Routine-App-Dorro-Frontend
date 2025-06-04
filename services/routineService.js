import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchRoutineDetails = async (routineId) => {
    if (!routineId) {
        throw new Error('No routine ID provided');
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const cleanToken = token.trim();
    const url = `${BackendUrl}/api/v1/Activity/routine/${routineId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (response.status === 403) {
        const newToken = await AsyncStorage.getItem('token');
        if (newToken && newToken !== token) {
            const retryResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${newToken.trim()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (retryResponse.ok) {
                return await retryResponse.json();
            }
        }
        throw new Error('Authentication failed. Please try logging in again.');
    }

    if (!response.ok) {
        throw new Error(`Error fetching routine: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

export const updateActivityPositions = async (routineId, updates, token) => {
    const response = await fetch(`${BackendUrl}/api/v1/Activity/Update`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            routineId: parseInt(routineId),
            positions: updates
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to update positions: ${response.statusText}`);
    }

    return response.json();
}; 