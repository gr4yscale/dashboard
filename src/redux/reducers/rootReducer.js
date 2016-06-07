const initialState = {
  screenIndex: 0,
  screens: [],
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SELECT_SCREEN':
      return Object.assign({}, state, {
        screenIndex: action.payload
      })
    case 'FETCH_SCREENS_SUCCESS':
      return Object.assign({}, state, {
        screens: action.payload
      })
  }
  return state
}

export default rootReducer
