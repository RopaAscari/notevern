import { NoteActionTypes, TrashNoteState, UpdateTrashNoteActionType } from "../constants/types";

const initialState: TrashNoteState = {
    notes:[]
  };

export default function UpdateTrashNoteReducer (state = initialState, action: UpdateTrashNoteActionType): TrashNoteState {   
    switch(action.type) {
        case NoteActionTypes.ADD_TO_TRASH:
            return {            
              notes: action.payload
            };
        default:
            return state;
    }
}