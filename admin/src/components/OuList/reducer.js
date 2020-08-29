/* eslint-disable consistent-return */
import { cloneDeep } from 'lodash'

export const initialState = {
    ous: [],
    isLoading: true,
};

const reducer = (state, action) => {
    var draftState = cloneDeep(state);
    switch (action.type) {
        case 'GET_DATA': {
            draftState.isLoading = true;
            draftState.ous = [];
            break;
        }
        case 'GET_DATA_SUCCEEDED': {
            draftState.ous = action.data;
            draftState.isLoading = false;
            break;
        }
        case 'GET_DATA_ERROR': {
            draftState.isLoading = false;
            break;
        }
        default:
            return draftState;
    }
    return draftState;
}
export default reducer;
