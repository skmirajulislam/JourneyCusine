const initialState = {
    userDetails: null,
    loginResponse: Number,
    responseMessage: '',

}

const userReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case "USER_SIGN_UP":
            return {
                ...state,
                userDetails: payload.user_details,
                loginResponse: payload.success,
                responseMessage: payload.info
            };
        case "USER_LOG_IN":
            return {
                ...state,
                userDetails: payload.user_details,
                loginResponse: payload.success,
                responseMessage: payload.message
            };
        case "USER_LOG_OUT": {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            return {
                userDetails: null,
                loginResponse: 0,
                responseMessage: ""
            }
        }
        case "GET_USER_DETAILS":
            return {
                userDetails: payload
            }

        case "UPDATE_USER_DETAILS":
            return {
                ...state,
                userDetails: payload
            };

        case "UPDATE_WISHLIST":
            return {
                ...state,
                userDetails: state.userDetails
                    ? { ...state.userDetails, wishlist: payload }
                    : state.userDetails
            };

        default:
            return state;
    }
}

export default userReducer;