import { NoteActionTypes, NoteOperationState, SetNoteOperationActionType } from "../constants/types";

const initialState: NoteOperationState = {
    action: ''
}

export default function SetNoteOperationReducer (state = initialState, action: SetNoteOperationActionType): NoteOperationState {   
    switch(action.type) {
        
        case NoteActionTypes.SET_NOTE_OPERATION:
            return {            
               action: action.payload
            };
        default:
            return state;
    }
}