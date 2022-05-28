import { NoteActionTypes, SelectedNoteState, SetSelectedNoteActionType } from "../constants/types";

const initialState: SelectedNoteState = {
   note: { 
       id: '',
       title: '',
       value: [],
       date: new Date,
    }
  };

export default function SetSelectedNoteReducer (state = initialState, action: SetSelectedNoteActionType): SelectedNoteState {   
    switch(action.type) {
        case NoteActionTypes.SET_NOTE:
            return {            
             note: action.payload
            };
        default:
            return state;
    }
}