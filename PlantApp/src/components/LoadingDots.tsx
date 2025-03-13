import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadingDots: React.FC = () => {
    const [dots, setDots] = useState('.');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => {
                if (prevDots === '...') {
                    return '.';
                } else {
                    return prevDots + '.';
                }
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Identifying plant{dots}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        padding: 10
    },
    text: {
        fontSize: 16,
    },
});

export default LoadingDots;