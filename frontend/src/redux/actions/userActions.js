import api from "../../backend";

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


export const getUser = (force = false) => async (dispatch, getState) => {
    const { userDetails } = getState().user;

    if (userDetails && !force) {
        return;
    }

    const rawToken = localStorage.getItem("accessToken");
    if (!rawToken) {
        dispatch({ type: "USER_LOG_OUT" });
        return;
    }

    try {
        const response = await api.post("/auth/get_user_details");
        if (response.data && response.data.status === 200) {
            // saving user details from db
            dispatch({
                type: "GET_USER_DETAILS",
                payload: response.data.user_details,
            });
            // saving houses data from db
            dispatch({
                type: "SAVE_HOUSE_DATA",
                payload: response.data.house_data || []
            });
        } else {
            dispatch({ type: "USER_LOG_OUT" });
        }
    } catch {
        dispatch({ type: "USER_LOG_OUT" });
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


export const updateUserDetails = (updatedUser) => (dispatch) => {
    dispatch({
        type: "UPDATE_USER_DETAILS",
        payload: updatedUser
    });
};

export const updateWishlist = (wishlist) => (dispatch) => {
    dispatch({
        type: "UPDATE_WISHLIST",
        payload: wishlist
    });
};

export const userLogOut = () => async (dispatch) => {
    try {
        await api.post("/auth/logout");
    } catch {
        // Continue logout even if network fails
    }
    dispatch({ type: "USER_LOG_OUT" });
};
