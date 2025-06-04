import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createActivity = async (routineId, activityData) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BackendUrl}/api/v1/Activity`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            routineId: parseInt(routineId),
            ...activityData
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create activity');
    }

    return response.json();
};

export const updateActivity = async (activityId, activityData) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BackendUrl}/api/v1/Activity/${activityId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData)
    });

    if (!response.ok) {
        throw new Error('Failed to update activity');
    }

    return response.json();
};

export const deleteActivity = async (activityId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BackendUrl}/api/v1/Activity/${activityId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete activity');
    }

    return true;
}; 