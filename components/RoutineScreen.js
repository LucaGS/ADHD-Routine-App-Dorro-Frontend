import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import ActivityAdder from './ActivityAdder';
import ActivityItem from './ActivityItem';
import DraggableFlatList from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRoutineDetails, updateActivityPositions } from '../services/routineService';

const RoutineScreen = ({ route, navigation }) => {
    const { routineId } = route.params || {};
    const { routineName } = route.params || {};
    const [activities, setActivities] = useState([]);
    const [activityCount, setActivityCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showActivityAdder, setShowActivityAdder] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        console.log('RoutineScreen mounted with routineId:', routineId);
        loadRoutineDetails();
    }, [routineId]);
    
    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);
        };
        getToken();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('RoutineScreen focused, refreshing data');
            loadRoutineDetails();
        });

        return unsubscribe;
    }, [navigation]);

    const loadRoutineDetails = async () => {
        if (!routineId) {
            setError('No routine ID provided');
            return;
        }
    
        setLoading(true);
        try {
            const data = await fetchRoutineDetails(routineId);
            handleSuccessfulResponse(data);
        } catch (error) {
            console.error('Error in loadRoutineDetails:', error);
            setError('Error fetching routine: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessfulResponse = (data) => {
        if (Array.isArray(data)) {
            const mappedActivities = data.map(activity => ({
                activity_id: activity.id,
                activity_name: activity.name,
                activity_description: activity.description,
                duration: activity.duration,
                position: activity.position
            }));
            console.log('Mapped activities:', mappedActivities);
            setActivities(mappedActivities);
            setActivityCount(mappedActivities.length);
        } else {
            console.error('Response is not an array:', data);
            setError('Invalid response format');
        }
    };

    const updatePositions = async (newActivities) => {
        try {
            const updates = newActivities.map((activity, index) => ({
                id: activity.activity_id,
                position: index + 1  
            }));
    
            console.log('Sending position updates:', updates);
            await updateActivityPositions(routineId, updates, token);
            loadRoutineDetails();
        } catch (error) {
            console.error('Error updating positions:', error);
            Alert.alert('Error', 'Failed to update positions');
            loadRoutineDetails();
        }
    };

    const renderActivity = ({ item, drag, isActive, index }) => (
        <ActivityItem 
            item={item} 
            drag={drag} 
            isActive={isActive} 
            index={index} 
        />
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!routineId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No routine found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{routineName}</Text>
                <Text style={styles.activityCount}>Activities: {activityCount}</Text>
            </View>

            <DraggableFlatList
                data={activities}
                onDragEnd={({ data }) => {
                    setActivities(data);
                    updatePositions(data);
                }}
                keyExtractor={item => item.activity_id.toString()}
                renderItem={renderActivity}
                contentContainerStyle={styles.activityListContent}
            />

            {showActivityAdder ? (
                <View style={styles.modalOverlay}>
                    <ActivityAdder 
                        onClose={() => setShowActivityAdder(false)}
                        routineId={routineId}
                        onActivityAdded={loadRoutineDetails}
                    />
                </View>
            ) : (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.addButton]}
                        onPress={() => {
                            console.log('Opening ActivityAdder for routine:', routineId);
                            setShowActivityAdder(true);
                        }}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonIcon}>+</Text>
                            <Text style={styles.buttonText}>Add New Activity</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.startButton]}
                        onPress={() => {
                            console.log('Starting routine:', routineId);
                            navigation.navigate('StartedRoutineSession', { 
                                routineId: routineId,
                                routineName: routineName
                            });
                        }}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonIcon}>▶</Text>
                            <Text style={styles.buttonText}>Start Routine</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    activityListContent: {
        padding: 20,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        gap: 10,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButton: {
        backgroundColor: '#6200EE',
    },
    startButton: {
        backgroundColor: '#4CAF50',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        color: '#fff',
        fontSize: 24,
        marginRight: 10,
        fontWeight: 'bold',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activityCount: {
        fontSize: 16,
        color: '#888',
        marginTop: 5,
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
});

export default RoutineScreen;