import { View, Text, Alert, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { BackendUrl } from '../constants';

const RoutineAdder = ({ onClose, userId, onRoutineAdded }) => {
    const [newRoutineName, setNewRoutineName] = useState('');
    const [newRoutineDescription, setNewRoutineDescription] = useState('');

    const handleAddRoutine = async () => {
        console.log('handleAddRoutine called');
        console.log('Routine Name:', newRoutineName);
        console.log('Description:', newRoutineDescription);
        console.log('User ID:', userId);

        if (!newRoutineName.trim()) {
            console.log('Error: Empty routine name');
            Alert.alert('Error', 'Please enter a routine name');
            return;
        }

        if (!userId) {
            console.log('Error: No user ID provided');
            Alert.alert('Error', 'User ID is missing');
            return;
        }

        try {
            console.log('Making API request to:', `${BackendUrl}?action=addRoutine`);
            const requestBody = `routine_name=${encodeURIComponent(newRoutineName)}
            &description=${encodeURIComponent(newRoutineDescription)
            }&user_id=${encodeURIComponent(userId)}
            &routine_type=${encodeURIComponent("default")}`;
            console.log('Request body:', requestBody);

            const response = await fetch(`${BackendUrl}?action=addRoutine`, {
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
                console.log('Routine added successfully');
                Alert.alert('Success', 'Routine added successfully');
                setNewRoutineName('');
                setNewRoutineDescription('');
                if (onRoutineAdded) {
                    await onRoutineAdded(); // Refresh the routines list
                }
                onClose(); // Close the form after successful addition
            } else {
                console.log('Failed to add routine:', responseText);
                Alert.alert('Error', 'Failed to add routine');
            }
        } catch (error) {
            console.error('Error in handleAddRoutine:', error);
            Alert.alert('Error', 'Something went wrong');
        }
    };

    console.log('Rendering RoutineAdder');
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
            
            <Text style={styles.title}>Add New Routine</Text>
            
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Routine Name</Text>
                <TextInput
                    style={styles.input}
                    value={newRoutineName}
                    onChangeText={(text) => {
                        console.log('Routine name changed:', text);
                        setNewRoutineName(text);
                    }}
                    placeholder="Enter routine name"
                    placeholderTextColor="#888"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={newRoutineDescription}
                    onChangeText={(text) => {
                        console.log('Description changed:', text);
                        setNewRoutineDescription(text);
                    }}
                    placeholder="Enter routine description"
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={4}
                />
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    console.log('Add button pressed');
                    handleAddRoutine();
                }}
            >
                <Text style={styles.buttonText}>Add Routine</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(18, 18, 18, 0.75)',
        margin: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(51, 51, 51, 0.6)',
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        bottom: 80,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backdropFilter: 'blur(5px)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(51, 51, 51, 0.6)',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'rgba(51, 51, 51, 0.6)',
        color: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: '#6200EE',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 10,
        zIndex: 1,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
    },
});

export default RoutineAdder;