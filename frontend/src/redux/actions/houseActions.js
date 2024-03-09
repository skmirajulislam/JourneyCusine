import api, { API } from "../../backend"

/* eslint-disable no-undef */

export const getHouseDetails = (id) => async (dispatch) => {
    try {
        let houseId = { houseId: id }
        const res = await api.post("/house/get_house_details", houseId, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
    } catch (error) {
        console.log(error)
    }
}

export const getOneListingRoomsDetails = (id) => async (dispatch) => {
    try {
        let listingId = { id: id }
        const res = await api.post(`${API}house/room_details`, listingId)
        console.log(res, "resposnse")

        if (res.status === 200) {
            dispatch({
                type: "GET_LISTING_DETAILS",
                payload: res.data
            })
        }
    } catch (error) {
        console.log(error)
    }
}

export const createNewHouse = (structure, privacyType, location, floorPlan, amenitiesData, housePhoto, houseTitle, houseHighlights, description, gustType, priceBeforeTaxes, authorEarnedPrice, basePrice, security) => async (dispatch) => {
    let newHouseData = {
        houseType: structure,
        privacyType: privacyType,
        location: location,
        floorPlan: floorPlan,
        amenities: amenitiesData,
        photos: housePhoto,
        title: houseTitle,
        highlights: houseHighlights,
        description: description,
        guestType: gustType,
        priceBeforeTaxes: priceBeforeTaxes,
        authorEarnedPrice: authorEarnedPrice,
        basePrice: basePrice,
        security: security
    }

    dispatch({
        type: "CREATE_NEW_HOUSE",
        payload: newHouseData
    })
}

export const saveStructure = (houseStructure) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_structure", houseStructure, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const savePrivacyType = (privacyType) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_privacy_type", privacyType, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res, "line 42")
    } catch (error) {
        console.log(error)
    }
}

export const saveLocation = (locationData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_house_location", locationData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const saveFloorPlan = (floorPlanData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_floor_plan", floorPlanData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const saveAmenities = (amenitiesData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_amenities", amenitiesData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const savePhotos = (photosData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_photos", photosData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const saveTitle = (titleData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_title", titleData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const saveHighlight = (highlightData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_highlight", highlightData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const saveDescription = (descriptionData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_description", descriptionData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const saveGuestType = (guestTypeData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_guesttype", guestTypeData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const savePrices = (priceData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_prices", priceData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const saveSecurity = (securityData) => async (dispatch) => {
    try {
        const res = await api.post("/house/save_security", securityData, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

export const publishListing = (publishList) => async (dispatch) => {
    try {
        const res = await api.post("/house/publish_list", publishList, {
            headers: { "Content-Type": "application/json" }
        })
        if (res.status === 200) {
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: res.data?.houseDetails
            })
        }
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}