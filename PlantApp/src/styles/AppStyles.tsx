import { StyleSheet } from 'react-native'

export const stylesApp = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
    },
    header: {
        backgroundColor: '#4CAF50',
        paddingTop: 50,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    favoritesButtonHeader: { 
        padding: 5,
        paddingTop: 45,
        position: 'absolute',
        left: 10,
    },
    settingsButton: {
        padding: 5,
        paddingTop: 45,
        position: 'absolute',
        right: 10,
    },
    backButton: {
        padding: 5,
        paddingTop: 45,
        position: 'absolute',
        left: 10,
    },
    inputSearch: {
        alignSelf: 'center',
        height: 40,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        backgroundColor: '#eee',
        marginVertical: 15,
        paddingHorizontal: 10,
        width: '75%',
        borderRadius: 5,
        textAlign: 'center',
        fontSize: 18,
    },
    buttonContainer: {
        margin: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
    },
    tinyButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 10,
        elevation: 20,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 20,
        marginTop: 10,
        width: '25%',
    },
    buttonSave: {
        backgroundColor: "#4CAF50",
    },
    buttonCancel: {
        backgroundColor: "#FD1A01",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
    },
    imageContainer: {
        overflow: 'hidden',
        alignSelf: 'center',
        borderWidth: 3,
        borderColor: '#4CAF50',
        borderRadius: 5,
        marginBottom: 5,
    },
    listItem: {
        flexDirection: 'row',
        padding: 10,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
        position: 'relative', // Add relative positioning to the parent
    },
    listItemImage: {
        flex: 1,
        width: undefined,
        height: undefined,
    },
    textContainer: {
        marginLeft: 10,
        flex: 1,
    },
    scientificName: {
        position: 'absolute',
        bottom: 5,
        fontSize: 20,
        fontWeight: 'bold',
    },
    commonName: {
        position: 'absolute',
        fontSize: 14,
        maxWidth: '80%',
    },
    emptyListText:{
        textAlign: 'center',
        marginTop: 20,
            fontSize:16
    },
    deleteButton: { // Style for the delete button
        padding: 10,
        position: 'absolute', // Position absolutely
        right: 5,          //  from the right edge
        top: '50%',      //  vertically
        transform: [{ translateY: -15 }], //  vertically
    },
    favoriteButton: {  // NEW: Style for favorite button
        padding: 10,
        position: 'absolute', // Position absolutely
        right: 35,          //  from the right edge
        top: '50%',      //  vertically
        transform: [{ translateY: -15 }], //  vertically
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%', // Set a width for the modal
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalItem: {
        marginBottom: 10,
        width: '100%',
        alignItems: 'center', // Center items horizontally
    },
    modalTextContainer: {
        width: "100%",
        alignItems: "center"
    },
    modalScientificName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalCommonName: {
        fontSize: 14,
    },
    resultImageContainer: {
        marginTop: 5,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#4CAF50',
        borderRadius: 5,
    },
    resultImage: {
        flex: 1,
        width: undefined,
        height: undefined,
    },
    fullScreenContainer: { // NEW: Container for full-screen image
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {  // NEW: Style for the full-screen image
        width: '80%',
        height: '80%',
    },
});