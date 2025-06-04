import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
    const response = await fetch(`${BackendUrl}/api/v1/Auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    return data;
};

export const signup = async (email, password, username) => {
    const response = await fetch(`${BackendUrl}/api/v1/Auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            username
        })
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    return data;
};

export const logout = async () => {
    await AsyncStorage.removeItem('token');
};

export const getToken = async () => {
    return await AsyncStorage.getItem('token');
}; 