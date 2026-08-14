import { legacy_createStore as createStore, applyMiddleware } from "redux"
import { thunk } from "redux-thunk"
import rootReducer from "./reducers/rootReducer"

// redux-logger's CommonJS export is an object under modern Vite/ESM builds,
// which caused Redux to receive a non-function middleware and crash the app.
const store = createStore(rootReducer, applyMiddleware(thunk))

export default store;
