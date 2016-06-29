const initialState = {
  screenIndex: 0,
  screens: [],
  paused: false,
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SELECT_SCREEN':
      return Object.assign({}, state, {
        screenIndex: action.payload
      })
    case 'NEXT_SCREEN':
      let nextIndex = state.screenIndex + 1;
      return Object.assign({}, state, {
        screenIndex: nextIndex < state.screens.length ? nextIndex : 0
      })
    case 'PREV_SCREEN':
      let prevIndex = state.screenIndex - 1;
      return Object.assign({}, state, {
        screenIndex: prevIndex > 0 ? prevIndex : state.screens.length - 1
      })
    case 'TOGGLE_PAUSE':
      return Object.assign({}, state, {
        paused: !state.paused
      })
    case 'FETCH_SCREENS_SUCCESS':
      return Object.assign({}, state, {
        screens: action.payload
      })
  }
  return state
}

export default rootReducer
