import { createAction } from 'redux-actions'
import axios from 'axios'

export const selectScreen = createAction('SELECT_SCREEN')
export const nextScreen = createAction('NEXT_SCREEN')
export const previousScreen = createAction('PREVIOUS_SCREEN')
export const togglePause = createAction('TOGGLE_PAUSE')

const fetchScreensRequest = createAction('FETCH_SCREENS_REQUEST')
const fetchScreensSuccess = createAction('FETCH_SCREENS_SUCCESS')
const fetchScreensFailure = createAction('FETCH_SCREENS_FAILURE')

export function fetchScreens() {
  return (dispatch, getState) => {
    dispatch(fetchScreensRequest())
    return axios.get('/screens')
              .then((response) => {
                return dispatch(fetchScreensSuccess(response.data))
              })
              .catch((error) => {
                console.log('there was an error')
                console.log(error)
                return dispatch(fetchScreensFailure(error))
              })
  }
}
