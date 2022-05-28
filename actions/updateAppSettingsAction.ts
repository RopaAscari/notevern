import { NoteActionTypes, Settings, UpdateAppSettingsActionType } from "../constants/types";

export function UpdateAppSettingsAction(settings: Settings): UpdateAppSettingsActionType {
    return { 
        type: NoteActionTypes.UPDATE_SETTINGS,
        payload: settings
    }
}