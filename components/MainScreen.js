import { View, Text, Alert, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import LogoutButton from './LogoutButton';
import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoutineItem from './RoutineItem';
import RoutineAdder from './RoutineAdder';
import { fetchRoutines } from '../services/routineManagementService';

const MainScreen = ({ navigation }) => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showRoutineAdder, setShowRoutineAdder] = useState(false);

    const loadRoutines = async () => {
        setLoading(true);
        try {
            const data = await fetchRoutines();
            setRoutines(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoutines();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadRoutines();
        });

        return unsubscribe;
    }, [navigation]);

    const renderAddButton = () => (
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowRoutineAdder(true)}
        >
            <Text style={styles.addButtonText}>+ Neue Routine</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meine Routinen</Text>
                <LogoutButton />
            </View>

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

            {showRoutineAdder && (
                <View style={styles.modalOverlay}>
                    <RoutineAdder
                        onClose={() => setShowRoutineAdder(false)}
                        onRoutineAdded={loadRoutines}
                    />
                </View>
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default MainScreen;
