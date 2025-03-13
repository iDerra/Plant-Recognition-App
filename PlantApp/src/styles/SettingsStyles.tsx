import { StyleSheet } from 'react-native'

export const stylesSettings = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 5,
        paddingTop: 45,
        position: 'absolute',
        left: 10,
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
});