import { combineReducers } from "redux";
import handleUser from "../reducers/userReducer";
import houseReducer from "../reducers/houseReducer";
import reservationsReducer from "./reservationsReducer";

const rootReducer = combineReducers({
    user: handleUser,
    house: houseReducer,
    reservations: reservationsReducer,
})

export default rootReducer;