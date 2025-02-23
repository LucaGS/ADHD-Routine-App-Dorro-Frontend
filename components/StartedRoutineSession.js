import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { BackendUrl } from '../constants';
import { Audio } from 'expo-av';
//implement https://www.npmjs.com/package/react-native-sound
const StartedRoutineSession = ({ route, navigation }) => {
    const [sound, setSound] = useState();
    const { routineId, routineName } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activities, setActivities] = useState([]);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0); // Track remaining time
    const [isPaused, setIsPaused] = useState(false); // Add pause state
    const [hasPlayedWarningSound, setHasPlayedWarningSound] = useState(false); // Add this new state
    const [activeSound,setActiveSound]=useState(false);
    const playSound = async () => {
        try {
            console.log('Loading Sound...');
            setActiveSound(true);
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/dark-future-logo-196217.mp3')
            );
            setSound(sound);
            
            console.log('Playing Sound...');
            await sound.playAsync();
            setActiveSound(false)
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const fetchActivities = async () => {
        if (!routineId) {
            setError('No routine ID provided');
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`${BackendUrl}?action=ListRoutineActivitys&routine_id=${routineId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched Activities:', data); // Log the fetched data
                if (data && Array.isArray(data.data)) {
                    setActivities(data.data);
                } else {
                    setError('Invalid response format');
                }
            } else {
                const errorText = await response.text();
                setError('Error fetching activities: ' + errorText);
            }
        } catch (error) {
            setError('Error fetching activities: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [routineId]);

    useEffect(() => {
        if (activities.length > 0 && !loading) {
            const currentActivity = activities[currentActivityIndex];
            // Reset warning sound flag when changing activities
            setHasPlayedWarningSound(false);
            
            if (!isPaused && remainingTime === 0) {
                const duration = currentActivity.duration * 60;
                setRemainingTime(duration);
            }
            
            let timer;
            if (!isPaused) {
                timer = setInterval(() => {
                    setRemainingTime(prevTime => {
                        const duration = currentActivity.duration * 60;
                        // Check if we've hit 75% and haven't played the warning sound yet
                        if (!activeSound &&!hasPlayedWarningSound && prevTime <= (duration * 0.5)) {
                            playSound();
                            setHasPlayedWarningSound(true);
                        }
                        
                        if (prevTime <= 1) {
                            clearInterval(timer);
                            playSound();
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);  
            }

            return () => clearInterval(timer);
        }
    }, [currentActivityIndex, activities, isPaused, loading, hasPlayedWarningSound]);

    const handleNextActivity = () => {
        if (currentActivityIndex < activities.length - 1) {
            setCurrentActivityIndex(currentActivityIndex + 1);
        } else {
            alert('No more activities available.');
        }
    };

    const handlePauseToggle = () => {
        setIsPaused(!isPaused);
    };

    const handleFinishRoutine = () => {
        // You might want to add confirmation dialog here
        navigation.navigate('Main'); // Or wherever you want to navigate after finishing
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    const currentActivity = activities[currentActivityIndex];
    const duration = currentActivity.duration * 60; // Convert minutes to seconds
    const progress = (remainingTime / duration) * 100; // Calculate progress percentage

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Session for: {routineName}</Text>
            {activities.length === 0 ? (
                <Text style={styles.sessionInfo}>No activities available for this routine.</Text>
            ) : (
                <View style={styles.activityItem}>
                    <Text style={styles.activityName}>{currentActivity.activity_name}</Text>
                    <Text style={styles.activityDescription}>{currentActivity.activity_description}</Text>
                    <Text style={styles.activityDetail}>Points: {currentActivity.points}</Text>
                    <Text style={styles.timerText}>Time Remaining: {remainingTime} seconds</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button 
                            title={isPaused ? "Continue" : "Pause"} 
                            onPress={handlePauseToggle} 
                        />
                        <Button title="Next Activity" onPress={handleNextActivity} />
                        <Button 
                            title="Finish Routine" 
                            onPress={handleFinishRoutine}
                            color="#FF6B6B" // Adding a different color to distinguish it
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#121212',
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
        marginBottom: 20,
    },
    sessionInfo: {
        fontSize: 16,
        color: '#e0e0e0',
        marginBottom: 10,
    },
    activityItem: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    activityName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    activityDescription: {
        fontSize: 14,
        color: '#e0e0e0',
        marginBottom: 5,
    },
    activityDetail: {
        fontSize: 14,
        color: '#888',
    },
    timerText: {
        fontSize: 16,
        color: '#fff',
        marginTop: 10,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6200EE',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
});

export default StartedRoutineSession;