const menuReducer = (state = {value: "/"}, action) => {
    switch(action.type){
        case 'SETMENU':
            return {...state, value: action.menu}   
        default:
            return {...state}
    }
}

export default menuReducer;