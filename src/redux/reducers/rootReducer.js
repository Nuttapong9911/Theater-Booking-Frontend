import tokenReducer from "./tokenReducer";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
    token: tokenReducer
})

export default rootReducer