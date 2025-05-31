import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RoutineItem = ({ routine, onPress }) => {
    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{routine.name}</Text>
                    <Ionicons name="chevron-forward" size={24} color="#6c757d" />
                </View>
                
                {routine.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {routine.description}
                    </Text>
                )}

                <View style={styles.footer}>
                    <View style={styles.badge}>
                        <Ionicons name="time-outline" size={16} color="#007bff" />
                        <Text style={styles.badgeText}>Routine</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#343a40',
        flex: 1,
        marginRight: 8,
    },
    description: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7f1ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: '#007bff',
        marginLeft: 4,
        fontWeight: '500',
    },
});

export default RoutineItem;
