import React, { useState, useRef } from 'react';
import { 
    TouchableOpacity, 
    View, 
    Text, 
    StyleSheet, 
    Alert, 
    Platform, 
    ActionSheetIOS 
} from 'react-native';
import { Entypo } from '@expo/vector-icons'; // Stellen Sie sicher, dass Sie expo/vector-icons installiert haben

const RoutineItem = ({ navigation, routine, onDelete }) => {
    const [mode, setMode] = useState('titelonly');
    const lastTap = useRef(null);
    const DOUBLE_PRESS_DELAY = 300; // 300ms between taps for double tap

    const handlePress = () => {
        const now = Date.now();
        if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
            // Double tap detected
            handleStartRoutine();
        } else {
            // Single tap
            if (mode === 'titelonly') {
                setMode('detailedMode');
            } else if (mode === 'detailedMode') {
                setMode('titelonly');
            }
            lastTap.current = now;
        }
    };

    const handleLongPress = () => {
        navigation.navigate('Routine', { 
            routineId: routine.id,
            title: routine.routine_name
        });
    };

    const handleStartRoutine = () => {
        navigation.navigate('StartedRoutineSession', { 
            routineId: routine.id,
            routineName: routine.routine_name
        });
    };

    const handleEditRoutine = () => {
        navigation.navigate('Routine', { 
            routineId: routine.id,
            title: routine.routine_name
        });
    };

    const handleDelete = () => {
        Alert.alert(
            "Routine löschen",
            "Möchtest du diese Routine wirklich löschen?",
            [
                {
                    text: "Abbrechen",
                    style: "cancel"
                },
                {
                    text: "Löschen",
                    onPress: () => onDelete(routine.id),
                    style: "destructive"
                }
            ]
        );
    };

    const handleMenuPress = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [
                        'Abbrechen',
                        'Löschen'
                    ],
                    destructiveButtonIndex: 2,
                    cancelButtonIndex: 0,
                    anchor: 0,
                },
                (buttonIndex) => {
                    switch (buttonIndex) {
                        case 1:
                            setMode('titelonly');
                            break;
                        case 2:
                            handleDelete();
                            break;
                    }
                }
            );
        } else {
            Alert.alert(
                "Routine Optionen",
                "Wähle eine Option",
                [
                    {
                        text: "Schließen",
                        onPress: () => setMode('titelonly')
                    },
                    {
                        text: "Löschen",
                        onPress: handleDelete,
                        style: "destructive"
                    }
                   
                ],
                {
                    cancelable: true,
                    presentationStyle: 'overFullScreen'
                }
            );
        }
    };

    // Wenn der Modus 'titelonly' ist
    if (mode === 'titelonly') {
        return (
            <View style={styles.itemWrapper}>
                <TouchableOpacity 
                    onPress={() => setMode('detailedMode')}
                    onLongPress={handleLongPress}
                    style={styles.itemContainer}
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>{routine.routine_name}</Text>
                        <TouchableOpacity 
                            onPress={handleMenuPress}
                            style={styles.menuButton}
                        >
                            <Entypo name="dots-three-vertical" size={20} color="#e0e0e0" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            onPress={handleStartRoutine}
                            style={[styles.button, styles.startButton]}
                        >
                            <Text style={styles.buttonText}>Start</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleEditRoutine}
                            style={[styles.button, styles.editButton]}
                        >
                            <Text style={styles.buttonText}>Bearbeiten</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    // Wenn der Modus 'detailedMode' ist
    if (mode === 'detailedMode') {
        return (
            <View style={styles.itemWrapper}>
                <TouchableOpacity 
                    onPress={handlePress} 
                    onLongPress={handleLongPress}
                    style={[styles.itemContainer, styles.detailedModeContainer]}
                >
                    <Text style={styles.detailText}>Routine Name: {routine.routine_name}</Text>
                    <Text style={styles.detailText}>Beschreibung: {routine.description}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return null; // Falls keine der Bedingungen zutrifft
};

const styles = StyleSheet.create({
    itemWrapper: {
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    itemContainer: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#2c2c2c', // Dunkler Hintergrund
        borderWidth: 1,
        borderColor: '#444', // Dunklere Farbe für den Rand
        transition: '0.3s ease',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    detailedModeContainer: {
        backgroundColor: '#333333', // Etwas helleres Grau im Detailmodus
        borderColor: '#009688',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    menuButton: {
        padding: 5,
        marginRight: -5,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e0e0e0',
    },
    detailText: {
        fontSize: 14,
        color: '#e0e0e0', // Heller Text für Details
        marginVertical: 5,
    },
    buttonContainer: {
        flexDirection: 'row', // Buttons nebeneinander
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        minWidth: 90,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#009688',
    },
    editButton: {
        backgroundColor: '#555',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default RoutineItem;
