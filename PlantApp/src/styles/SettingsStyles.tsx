import { Image, StyleSheet } from 'react-native'

export const stylesSettings = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        marginTop: 25,
        alignItems: 'center',
        padding: 20,
    },
    input: {
        height: 40,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        backgroundColor: '#eee',
        marginBottom: 20,
        paddingHorizontal: 10,
        width: '90%',
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    info: {
        fontSize: 9,
        width: '80%',
        position: 'absolute',
        top: 600,
    },
    image: {
        marginTop: 300,
        width: '80%',
    },
});