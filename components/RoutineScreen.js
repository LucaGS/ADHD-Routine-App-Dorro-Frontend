import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { BackendUrl } from '../constants';
import ActivityAdder from './ActivityAdder';
import ActivityItem from './ActivityItem';
import DraggableFlatList from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RoutineScreen = ({ route, navigation }) => {
    const { routineId } = route.params || {};
    const{routineName} = route.params ||{};
    const [activities, setActivities] = useState([]);
    const [activityCount, setActivityCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showActivityAdder, setShowActivityAdder] = useState(false);

    useEffect(() => {
        console.log('RoutineScreen mounted with routineId:', routineId);
        fetchRoutineDetails();
    }, [routineId]);
    
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('RoutineScreen focused, refreshing data');
            fetchRoutineDetails();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchRoutineDetails = async () => {
        if (!routineId) {
            setError('No routine ID provided');
            return;
        }
    
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Ensure token is properly formatted
            const cleanToken = token.trim();
            console.log('Token length:', cleanToken.length);
            console.log('Token format check:', cleanToken.startsWith('eyJ') ? 'Valid JWT format' : 'Invalid JWT format');

            const url = `${BackendUrl}/api/v1/Activity/routine/${routineId}`;
            console.log('Fetching from URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Fetch response status:', response.status);
            console.log('Response headers:', JSON.stringify(response.headers));
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (response.status === 403) {
                // Token might be expired or invalid
                console.log('Token might be expired or invalid, attempting to refresh...');
                // Try to get a new token from AsyncStorage
                const newToken = await AsyncStorage.getItem('token');
                if (newToken && newToken !== token) {
                    console.log('New token found, retrying request...');
                    // Retry the request with the new token
                    const retryResponse = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${newToken.trim()}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        handleSuccessfulResponse(retryData);
                        return;
                    }
                }
                setError('Authentication failed. Please try logging in again.');
                return;
            }

            if (response.ok) {
                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('Parsed activities data:', data);
                    handleSuccessfulResponse(data);
                } catch (e) {
                    console.error('Error parsing response:', e);
                    setError('Invalid response format');
                }
            } else {
                console.error('Error response:', responseText);
                setError('Error fetching routine: ' + responseText);
            }
        } catch (error) {
            console.error('Error in fetchRoutineDetails:', error);
            setError('Error fetching routine: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessfulResponse = (data) => {
        if (Array.isArray(data)) {
            // Map the response to match the expected format
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
            // Create an array of position updates
            const updates = newActivities.map((activity, index) => ({
                id: activity.activity_id,
                position: index + 1  // Make it 1-based to match backend
            }));
    
            console.log('Sending position updates:', updates);
    
            const response = await fetch(`${BackendUrl}/api/v1/Activity/positions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    routineId: parseInt(routineId),
                    positions: updates
                })
            });
    
            if (!response.ok) {
                console.error('Failed to update positions:', response.status, response.statusText);
                Alert.alert('Error', `Failed to update positions: ${response.statusText}`);
                // Revert to original positions
                fetchRoutineDetails();
            } else {
                // Refresh the activities list to ensure we have the correct order
                fetchRoutineDetails();
            }
        } catch (error) {
            console.error('Error updating positions:', error);
            Alert.alert('Error', 'Failed to update positions');
            // Revert to original positions on error
            fetchRoutineDetails();
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

            <View style={styles.buttonContainer}>
                {showActivityAdder ? (
                    <ActivityAdder 
                        onClose={() => setShowActivityAdder(false)}
                        routineId={routineId}
                        onActivityAdded={fetchRoutineDetails}
                    />
                ) : (
                    <>
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
                    </>
                )}
            </View>
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
});

export default RoutineScreen;