// LogoutButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { logout } from '../services/authService';

const LogoutButton = ({ onLogout }) => {
    const handleLogout = async () => {
        try {
            await logout();
            onLogout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.text}>Logout</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#dc3545',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LogoutButton;
