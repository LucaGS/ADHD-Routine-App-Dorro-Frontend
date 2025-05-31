import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Keyboard,
    Platform,
    Dimensions,
    Modal
} from 'react-native';
import { BackendUrl } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const RoutineAdder = ({ onClose, onRoutineAdded }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Fehler', 'Bitte gib einen Namen für die Routine ein');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Authentifizierungstoken gefunden');
            }

            const response = await fetch(`${BackendUrl}/api/v1/Routine`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                Alert.alert('Erfolg', 'Routine erfolgreich hinzugefügt');
                setName('');
                setDescription('');
                if (onRoutineAdded) {
                    await onRoutineAdded();
                }
                onClose();
            } else {
                const errorText = await response.text();
                Alert.alert('Fehler', 'Routine konnte nicht hinzugefügt werden: ' + errorText);
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            Alert.alert('Fehler', 'Etwas ist schiefgelaufen');
        }
    };

    return (
        <Modal
            transparent
            animationType="slide"
            visible={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Neue Routine</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="z.B. Morgenroutine"
                                placeholderTextColor="#999"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Beschreibung (optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Beschreibe deine Routine..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>Abbrechen</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.submitButton]} 
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>Hinzufügen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: height * 0.6,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    closeButton: {
        padding: 5,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(245, 245, 245, 0.8)',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: 'rgba(221, 221, 221, 0.8)',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(238, 238, 238, 0.8)',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(245, 245, 245, 0.8)',
    },
    submitButton: {
        backgroundColor: '#007AFF',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RoutineAdder;