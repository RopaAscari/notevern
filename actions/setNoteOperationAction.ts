
import { NoteActionTypes, SetNoteOperationActionType } from "../constants/types";

export function SetNoteOperationAction(operation: string): SetNoteOperationActionType {
    return { 
        type: NoteActionTypes.SET_NOTE_OPERATION,
        payload: operation
    }
}