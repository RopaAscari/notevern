import { GlobalNotesState, NoteActionTypes, UpdateGlobalNotesActionType } from "../constants/types";

const initialState: GlobalNotesState = {
    notes:[]
  };

export default function UpdateGlobalNotesReducer (state = initialState, action: UpdateGlobalNotesActionType): GlobalNotesState {   
    switch(action.type) {
        case NoteActionTypes.UPDATE_GLOBAL_NOTES:
            return {            
             notes: action.payload
            };
        default:
            return state;
    }
}