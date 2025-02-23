import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { BackendUrl } from '../constants';
import ActivityAdder from './ActivityAdder';
import ActivityItem from './ActivityItem';
import DraggableFlatList from 'react-native-draggable-flatlist';

const RoutineScreen = ({ route, navigation }) => {
    const { routineId } = route.params || {};
    const{routineName} = route.params ||{};
    const [activities, setActivities] = useState([]);
    const [activityCount, setActivityCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showActivityAdder, setShowActivityAdder] = useState(false);

    useEffect(() => {
        fetchRoutineDetails();
    }, [routineId]);
    

    
    const fetchRoutineDetails = async () => {
        if (!routineId) {
            setError('No routine ID provided');
            return;
        }
    
        setLoading(true);
        try {
            const response = await fetch(`${BackendUrl}?action=ListRoutineActivitys&routine_id=${routineId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                if (data && Array.isArray(data.data)) {
                    setActivities(data.data);
                    setActivityCount(data.data.length);
                } else {
                    setError('Invalid response format');
                }
            } else {
                const errorText = await response.text();
                setError('Error fetching routine: ' + errorText);
            }
        } catch (error) {
            setError('Error fetching routine: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    

    const updatePositions = async (newActivities) => {
        try {
            // Create an array of position updates
            const updates = newActivities.map((activity, index) => ({
                activity_id: activity.activity_id,
                new_position: index + 1  // Make it 1-based to match backend
            }));
    
            console.log('Sending position updates:', updates);
    
            // Convert the updates array to URL-encoded format
            const formData = new URLSearchParams();
            formData.append('routine_id', routineId);
            formData.append('positions', JSON.stringify(updates));
    
            const response = await fetch(`${BackendUrl}?action=UpdateActivityPositions`, {
                method: 'POST', // Changed from PUT to POST
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });
    
            const responseText = await response.text();
            console.log('Update response:', responseText);
    
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

            {showActivityAdder ? (
                <ActivityAdder 
                    onClose={() => setShowActivityAdder(false)}
                    routineId={routineId}
                    onActivityAdded={fetchRoutineDetails}
                />
            ) : (
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => {
                        console.log('Opening ActivityAdder for routine:', routineId);
                        setShowActivityAdder(true);
                    }}
                >
                    <View style={styles.addButtonContent}>
                        <Text style={styles.addButtonIcon}>+</Text>
                        <Text style={styles.addButtonText}>Add New Activity</Text>
                    </View>
                </TouchableOpacity>
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
    addButton: {
        backgroundColor: '#6200EE',
        padding: 15,
        borderRadius: 10,
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonIcon: {
        color: '#fff',
        fontSize: 24,
        marginRight: 10,
        fontWeight: 'bold',
    },
    addButtonText: {
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