import { NoteActionTypes, SettingsState, UpdateAppSettingsActionType } from "../constants/types";

const initialState: SettingsState = {
    settings:{
      theme: 'DARK',
      autoSave: false,
      preferences: {
        viewType:'List', 
        sortBy:'Asc'
      }  
    }
  }

export default function UpdateAppSettingsReducer (state = initialState, action: UpdateAppSettingsActionType): SettingsState {   
    switch(action.type) {
        
        case NoteActionTypes.UPDATE_SETTINGS:
            return {            
              settings: action.payload
            };
        default:
            return state;
    }
}