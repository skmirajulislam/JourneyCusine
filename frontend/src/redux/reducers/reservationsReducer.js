const initialState = {
    newReservationsData: null,
    authorReservations: []
}

const reservationsReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case "NEW_RESERVATIONS_DATA": {
            return {
                ...state,
                newReservationsData: payload
            }
        }
        case "AUTHORS_RESERVATIONS": {
            return {
                ...state,
                authorReservations: payload
            }
        }
        default: return state;
    }
}

export default reservationsReducer;