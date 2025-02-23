import { View, Text, Alert, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import LogoutButton from './LogoutButton';
import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoutineItem from './RoutineItem'; // Importiere den neuen RoutineItem-Komponenten
import RoutineAdder from './RoutineAdder';

const MainScreen = ({ route, navigation }) => {
    const { userId: routeUserId } = route.params || {};
    const [userId, setUserId] = useState(routeUserId || null);
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newRoutineName, setNewRoutineName] = useState('');
    const [newRoutineDescription, setNewRoutineDescription] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false); // Zustand für das Formular
    const [showRoutineAdder, setShowRoutineAdder] = useState(false);

    // Lädt die UserId, falls sie nicht aus den Routenparametern kommt
    useEffect(() => {
        const fetchUserId = async () => {
            if (!routeUserId) {
                try {
                    const storedUserId = await AsyncStorage.getItem('userId');
                    if (storedUserId) {
                        setUserId(storedUserId);
                    } else {
                        Alert.alert('Error', 'User ID not found.');
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to retrieve user ID: ' + error.message);
                }
            }
        };

        fetchUserId();
    }, [routeUserId]);

    // Lädt die Routinen, sobald die UserId verfügbar ist
    useEffect(() => {
        if (userId) {
            fetchRoutines();
        }
    }, [userId]);

    // Funktion, um Routinen von der API zu holen
    const fetchRoutines = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BackendUrl}?action=ListUserRoutines&user_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.data) {
                    setRoutines(data.data);
                } else {
                    setError('Invalid response format');
                }
            } else {
                const errorText = await response.text();
                setError('Error fetching routines: ' + errorText);
            }
        } catch (error) {
            setError('Error fetching routines: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Make fetchRoutines available to child components
    const refreshRoutines = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BackendUrl}?action=ListUserRoutines&user_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.data) {
                    setRoutines(data.data);
                } else {
                    setError('Invalid response format');
                }
            } else {
                const errorText = await response.text();
                setError('Error fetching routines: ' + errorText);
            }
        } catch (error) {
            setError('Error fetching routines: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoutine = async (routineId) => {
        try {
            // Optimistically update the UI by removing the routine from local state
            setRoutines(currentRoutines => 
                currentRoutines.filter(routine => routine.id !== routineId)
            );

            const response = await fetch(`${BackendUrl}?action=DeleteRoutine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `routine_id=${routineId}`
            });

            if (!response.ok) {
                // If the deletion fails, revert the local change by refreshing the list
                const errorText = await response.text();
                Alert.alert('Error', 'Failed to delete routine: ' + errorText);
                refreshRoutines();
            }
        } catch (error) {
            // If there's an error, revert the local change by refreshing the list
            Alert.alert('Error', 'Failed to delete routine: ' + error.message);
            refreshRoutines();
        }
    };

    if (loading) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }

   

    return (
        <View style={styles.container}>
            
            

            <FlatList
                data={routines}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <RoutineItem 
                        routine={item} 
                        navigation={navigation} 
                        onDelete={handleDeleteRoutine}
                    />
                )}
                contentContainerStyle={styles.flatListContainer}
            />
            
            {showRoutineAdder ? (
                <RoutineAdder 
                    onClose={() => {
                        console.log('Closing RoutineAdder');
                        setShowRoutineAdder(false);
                    }}
                    userId={userId}
                    onRoutineAdded={refreshRoutines}
                />
            ) : (
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => {
                        console.log('Opening RoutineAdder');
                        setShowRoutineAdder(true);
                    }}
                >
                    <Text style={styles.addButtonText}>Add New Routine</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// Styles für MainScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#121212', // Dark mode Hintergrundfarbe
    },
    loadingText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    formContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    formLabel: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    flatListContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    addButton: {
        backgroundColor: '#6200EE',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MainScreen;
