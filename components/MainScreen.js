import { View, Text, Alert, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import LogoutButton from './LogoutButton';
import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoutineItem from './RoutineItem';
import RoutineAdder from './RoutineAdder';

const MainScreen = ({ navigation }) => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showRoutineAdder, setShowRoutineAdder] = useState(false);

    const fetchRoutines = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${BackendUrl}/api/v1/Routine/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRoutines(data);
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

    useEffect(() => {
        fetchRoutines();
    }, []);

    const refreshRoutines = () => {
        fetchRoutines();
    };

    const renderAddButton = () => (
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowRoutineAdder(true)}
        >
            <Text style={styles.addButtonText}>+ Neue Routine</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meine Routinen</Text>
                <LogoutButton />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {loading ? (
                <Text>Loading routines...</Text>
            ) : (
                <View style={styles.content}>
                    <FlatList
                        data={routines}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <RoutineItem
                                routine={item}
                                onPress={() => navigation.navigate('Routine', { routineId: item.id, routineName: item.name })}
                            />
                        )}
                        ListFooterComponent={renderAddButton}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            )}

            {showRoutineAdder && (
                <RoutineAdder
                    onClose={() => setShowRoutineAdder(false)}
                    onRoutineAdded={refreshRoutines}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#343a40',
    },
    errorText: {
        color: 'red',
        margin: 20,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    addButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        marginTop: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default MainScreen;
