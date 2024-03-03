import api from "../../backend";

/* eslint-disable no-undef */
export const userSignUp = (userData) => async (dispatch) => {
    dispatch({
        type: "USER_SIGN_UP",
        payload: userData
    })
}

export const userLogIn = (userData) => async (dispatch) => {
    console.log(userData.user_details)
    dispatch({
        type: "USER_LOG_IN",
        payload: userData
    })
}


export const getUser = () => async (dispatch, getState) => {
    const { userDetails } = getState().user;

    if (userDetails) {
        return;
    }

    try {
        const response = await api.post("/auth/get_user_details");
        console.log(response.data, "GET USER DETAILS");
        if (response.data.status === 200) {
            // saving user details from db
            dispatch({
                type: "GET_USER_DETAILS",
                payload: response.data.user_details,
            });
            // saving houses data from db
            dispatch({
                type: "SAVE_HOUSE_DATA",
                payload: response.data.house_data
            })
        } else {
            dispatch({ type: "USER_LOG_OUT" });
        }
    } catch (error) {
        // Handle error
        console.log(error)
    }
};

export const userRole = () => async (dispatch, getState) => {
    const { userDetails } = getState().user;

    if (userDetails?.role === "host") {
        console.log("already a hoast")
    }


    try {
        const response = await api.post("/auth/become_a_host", { role: "host" });
        console.log(response)
        const currentHouseId = response.data?.house?._id;

        /* The code `if (currentHouseId) {
                    JSON.stringify(localStorage.setItem("currentHouseId", currentHouseId))
                }` is checking if the `currentHouseId` variable has a value. If it does, it is
        converting the value to a JSON string using `JSON.stringify()` and then storing it in the
        `localStorage` with the key "currentHouseId". */
        if (currentHouseId) {
            JSON.stringify(localStorage.setItem("currentHouseId", currentHouseId))
        }
        if (response.data.succeed === 1) {
            dispatch({
                type: "CHANGE_USER_ROLE",
                payload: response.data
            })
            dispatch({
                type: "CURRENT_NEW_HOUSE",
                payload: response.data.house
            })
        }
    } catch (error) {
        console.log(error)
    }
}


export const userLogOut = () => async (dispatch) => {
    const response = await api.post("/auth/logout");
    console.log(response)
    dispatch({ type: "USER_LOG_OUT" })
}