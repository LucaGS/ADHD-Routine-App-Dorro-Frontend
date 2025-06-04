import { BackendUrl } from '../constants';
import { getToken } from './authService';

export const createRoutine = async (routineData) => {
    const token = await getToken();
    const response = await fetch(`${BackendUrl}/api/v1/Routine`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(routineData)
    });

    if (!response.ok) {
        throw new Error('Failed to create routine');
    }

    return response.json();
};

export const fetchRoutines = async () => {
    const token = await getToken();
    const response = await fetch(`${BackendUrl}/api/v1/Routine`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch routines');
    }

    return response.json();
};

export const deleteRoutine = async (routineId) => {
    const token = await getToken();
    const response = await fetch(`${BackendUrl}/api/v1/Routine/${routineId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete routine');
    }

    return response.json();
}; 