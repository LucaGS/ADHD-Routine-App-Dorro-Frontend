import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { BackendUrl } from '../constants';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const ActivityAdder = ({ onClose, routineId, onActivityAdded }) => {
    const [activityName, setActivityName] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [position, setPosition] = useState('');
    const [duration, setDuration] = useState('');
    const [minDuration, setMinDuration] = useState('');
    const [points, setPoints] = useState('');

    // Add function to fetch current activity count
    const fetchCurrentPosition = async () => {
        try {
            const response = await fetch(`${BackendUrl}?action=ListRoutineActivitys&routine_id=${routineId}`);
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.data)) {
                    // Set position to next available number
                    setPosition((data.data.length).toString());
                }
            }
        } catch (error) {
            console.error('Error fetching position:', error);
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
            console.log('Making API request to:', `${BackendUrl}?action=addActivity`);
            const requestBody = `activity_name=${encodeURIComponent(activityName)}
            &activity_description=${encodeURIComponent(activityDescription)}
            &routine_id=${encodeURIComponent(routineId)}
            &position=${encodeURIComponent(position)}
            &duration=${encodeURIComponent(duration)}
            &min_duration=${encodeURIComponent(minDuration)}
            &points=${encodeURIComponent(points)}`;
            console.log('Request body:', requestBody);

            const response = await fetch(`${BackendUrl}?action=addActivity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: requestBody
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (response.ok) {
                console.log('Activity added successfully');
                Alert.alert('Success', 'Activity added successfully');
                // Reset all fields
                setActivityName('');
                setActivityDescription('');
                setPosition('');
                setDuration('');
                setMinDuration('');
                setPoints('');
                if (onActivityAdded) {
                    await onActivityAdded(); // This will update the count in parent
                }
                onClose();
            } else {
                console.log('Failed to add activity:', responseText);
                Alert.alert('Error', 'Failed to add activity');
            }
        } catch (error) {
            console.error('Error in handleAddActivity:', error);
            Alert.alert('Error', 'Something went wrong');
        }
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

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Minimum Duration (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        value={minDuration}
                        onChangeText={setMinDuration}
                        placeholder="Enter minimum duration"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Points</Text>
                    <TextInput
                        style={styles.input}
                        value={points}
                        onChangeText={(text)=>{
                            const numValue = parseInt(text);
                            if(text === '' || (numValue >= 0 && numValue <= 10)){
                                setPoints(text);
                            }else{
                                alert("you can only give 1-10 points for an activity");
                            }

                        }}
                        placeholder="Enter points(1-10)"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                        maxLength={2}

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
