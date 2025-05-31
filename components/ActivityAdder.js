import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const ActivityAdder = ({ onClose, routineId, onActivityAdded }) => {
    const [activityName, setActivityName] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [position, setPosition] = useState('');
    const [duration, setDuration] = useState('');

    // Add function to fetch current activity count
    const fetchCurrentPosition = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            console.log('ActivityAdder - Retrieved token:', token ? 'Token exists' : 'No token found');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Ensure token is properly formatted
            const cleanToken = token.trim();
            console.log('ActivityAdder - Token length:', cleanToken.length);
            console.log('ActivityAdder - Token format check:', cleanToken.startsWith('eyJ') ? 'Valid JWT format' : 'Invalid JWT format');

            const url = `${BackendUrl}/api/v1/Activity/routine/${routineId}`;
            console.log('ActivityAdder - Fetching from URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('ActivityAdder - Fetch response status:', response.status);
            const responseText = await response.text();
            console.log('ActivityAdder - Raw response:', responseText);

            if (response.status === 403) {
                console.log('ActivityAdder - Token might be expired or invalid');
                Alert.alert('Error', 'Authentication failed. Please try logging in again.');
                return;
            }

            if (response.ok) {
                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('ActivityAdder - Parsed data:', data);
                } catch (e) {
                    console.error('ActivityAdder - Error parsing response:', e);
                    return;
                }

                if (Array.isArray(data)) {
                    // Set position to next available number
                    setPosition((data.length + 1).toString());
                }
            }
        } catch (error) {
            console.error('ActivityAdder - Error fetching position:', error);
        }
    };

    // Call this when component mounts
    useEffect(() => {
        fetchCurrentPosition();
    }, []);

    const handleAddActivity = async () => {
        console.log('handleAddActivity called');
        console.log('Activity Name:', activityName);
        console.log('Routine ID:', routineId);

        if (!activityName.trim()) {
            console.log('Error: Empty activity name');
            Alert.alert('Error', 'Please enter an activity name');
            return;
        }

        if (!routineId) {
            console.log('Error: No routine ID provided');
            Alert.alert('Error', 'Routine ID is missing');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            console.log('ActivityAdder - Retrieved token for POST:', token ? 'Token exists' : 'No token found');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Ensure token is properly formatted
            const cleanToken = token.trim();
            console.log('ActivityAdder - Token length:', cleanToken.length);
            console.log('ActivityAdder - Token format check:', cleanToken.startsWith('eyJ') ? 'Valid JWT format' : 'Invalid JWT format');

            const url = `${BackendUrl}/api/v1/Activity`;
            console.log('ActivityAdder - Making API request to:', url);

            const requestBody = {
                routineId: parseInt(routineId),
                name: activityName,
                description: activityDescription,
                duration: duration ? parseInt(duration) : 0,
                position: position ? parseInt(position) : 1
            };
            console.log('ActivityAdder - Request body:', requestBody);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('ActivityAdder - Response status:', response.status);
            const responseText = await response.text();
            console.log('ActivityAdder - Raw response:', responseText);

            if (response.status === 403) {
                // Token might be expired or invalid
                console.log('ActivityAdder - Token might be expired or invalid, attempting to refresh...');
                // Try to get a new token from AsyncStorage
                const newToken = await AsyncStorage.getItem('token');
                if (newToken && newToken !== token) {
                    console.log('ActivityAdder - New token found, retrying request...');
                    // Retry the request with the new token
                    const retryResponse = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${newToken.trim()}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    });
                    
                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        handleSuccessfulAdd(retryData);
                        return;
                    }
                }
                Alert.alert('Error', 'Authentication failed. Please try logging in again.');
                return;
            }

            if (response.ok) {
                let responseData;
                try {
                    responseData = JSON.parse(responseText);
                    console.log('ActivityAdder - Response data:', responseData);
                    handleSuccessfulAdd(responseData);
                } catch (e) {
                    console.error('ActivityAdder - Error parsing response:', e);
                    Alert.alert('Error', 'Failed to parse server response');
                }
            } else {
                console.log('Failed to add activity:', responseText);
                Alert.alert('Error', 'Failed to add activity: ' + responseText);
            }
        } catch (error) {
            console.error('Error in handleAddActivity:', error);
            Alert.alert('Error', 'Something went wrong: ' + error.message);
        }
    };

    const handleSuccessfulAdd = (responseData) => {
        console.log('Activity added successfully');
        Alert.alert('Success', 'Activity added successfully');
        // Reset all fields
        setActivityName('');
        setActivityDescription('');
        setPosition('');
        setDuration('');
        if (onActivityAdded) {
            onActivityAdded(); // This will update the count in parent
        }
        onClose();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                    console.log('Close button pressed');
                    onClose();
                }}
            >
                <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <ScrollView 
                style={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContentContainer}
            >
                <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>Add New Activity</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Activity Name</Text>
                    <TextInput
                        style={styles.input}
                        value={activityName}
                        onChangeText={setActivityName}
                        placeholder="Enter activity name"
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={activityDescription}
                        onChangeText={setActivityDescription}
                        placeholder="Enter activity description"
                        placeholderTextColor="#888"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Duration (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        value={duration}
                        onChangeText={setDuration}
                        placeholder="Enter duration"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                    />
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddActivity}
                >
                    <Text style={styles.buttonText}>Add Activity</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(18, 18, 18, 0.75)',
        borderColor: 'rgba(51, 51, 51, 0.6)',
        padding: width * 0.04, // Relative padding
    },
    contentContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingTop: height * 0.06,
        paddingBottom: height * 0.04,
        flexGrow: 1,
    },
    title: {
        fontSize: Math.min(width * 0.06, 24), // Responsive font size with max limit
        fontWeight: 'bold',
        marginBottom: height * 0.02,
        color: '#fff',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: height * 0.02,
        minHeight: height * 0.08, // Minimum height for input containers
    },
    label: {
        fontSize: Math.min(width * 0.04, 16), // Responsive font size with max limit
        marginBottom: height * 0.01,
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(51, 51, 51, 0.6)',
        borderRadius: 8,
        padding: width * 0.03,
        fontSize: Math.min(width * 0.04, 16), // Responsive font size with max limit
        backgroundColor: 'rgba(51, 51, 51, 0.6)',
        color: '#fff',
        minHeight: height * 0.06, // Minimum height for inputs
    },
    textArea: {
        height: height * 0.15, // Relative height for text area
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: '#6200EE',
        padding: height * 0.02,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: height * 0.02,
        minHeight: height * 0.06, // Minimum height for button
    },
    buttonText: {
        color: '#fff',
        fontSize: Math.min(width * 0.04, 16), // Responsive font size with max limit
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: width * 0.02,
        top: height * 0.02,
        padding: width * 0.02,
        zIndex: 1,
        minHeight: width * 0.1, // Square touch target
        minWidth: width * 0.1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: Math.min(width * 0.05, 20), // Responsive font size with max limit
    },
});

export default ActivityAdder;
