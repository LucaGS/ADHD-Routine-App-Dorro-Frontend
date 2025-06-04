import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const startRoutineSession = async (routineId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BackendUrl}/api/v1/Session/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routineId: parseInt(routineId) })
    });

    if (!response.ok) {
        throw new Error('Failed to start routine session');
    }

    return response.json();
};

export const completeActivity = async (sessionId, activityId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BackendUrl}/api/v1/Session/complete-activity`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionId: parseInt(sessionId),
            activityId: parseInt(activityId)
        })
    });

    if (!response.ok) {
        throw new Error('Failed to complete activity');
    }

    return response.json();
};

export const endSession = async (sessionId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BackendUrl}/api/v1/Session/end`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: parseInt(sessionId) })
    });

    if (!response.ok) {
        throw new Error('Failed to end session');
    }

    return response.json();
}; 