const tokenReducer = (state = {value: {user_id: '', firstname: '', lastname: '', role: ''}}, action) => {
  switch(action.type){
      case 'SETTOKEN':
          return {...state, value: action.token}   
      default:
          return {...state}
  }
}

export default tokenReducer;