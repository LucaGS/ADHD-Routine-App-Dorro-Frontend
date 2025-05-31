import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

const ActivityItem = ({ item, drag, isActive, index }) => (
    <ScaleDecorator>
        <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={[
                styles.activityItem,
                { backgroundColor: isActive ? '#333' : '#1E1E1E' }
            ]}
        >
            <View style={styles.activityHeader}>
                <Text style={styles.activityName}>{item.activity_name}</Text>
                <TouchableOpacity onLongPress={drag}>
                    <Text style={styles.dragHandle}>⋮⋮</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.activityDescription}>{item.activity_description}</Text>
            <View style={styles.activityDetails}>
                <Text style={styles.activityDetail}>Duration: {item.duration}min</Text>
                <Text style={styles.activityDetail}>Position: {item.position}</Text>
            </View>
        </TouchableOpacity>
    </ScaleDecorator>
);

const styles = StyleSheet.create({
    activityItem: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    activityPosition: {
        color: '#888',
        fontSize: 14,
        width: 30,
    },
    dragHandle: {
        color: '#666',
        fontSize: 20,
        paddingHorizontal: 10,
    },
    activityName: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginRight: 10,
    },
    activityDescription: {
        fontSize: 14,
        color: '#e0e0e0',
        marginBottom: 10,
    },
    activityDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    activityDetail: {
        fontSize: 14,
        color: '#888',
    },
});

export default ActivityItem; 