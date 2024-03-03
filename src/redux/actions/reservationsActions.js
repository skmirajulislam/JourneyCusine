import api from "../../backend"

export const newReservation = (data) => async (dispatch) => {
    console.log(data)
    const reservationsData = {
        listingId: data?.listingData?._id,
        authorId: data?.listingData?.author,
        checkIn: data?.formattedStartDate,
        checkOut: data?.formattedEndDate,
        nightStaying: data?.nightsStaying,
        guestNumber: data?.totalGuest,
        basePrice: data?.reservationBasePrice,
        taxes: data?.tax,
        authorEarnedPrice: data?.authorEarned,
    }
    dispatch({
        type: "NEW_RESERVATIONS_DATA",
        payload: reservationsData
    })
}

export const getAuthorReservations = () => async (dispatch) => {
    try {
        const response = await api.get("/reservations/get_author_reservations")

        if (response.status === 200) {
            dispatch({
                type: "AUTHORS_RESERVATIONS",
                payload: response.data,
            })
        }
    } catch (error) {
        console.log(error)
    }
}