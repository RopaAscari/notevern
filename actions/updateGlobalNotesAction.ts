import { Note, NoteActionTypes, NoteType, UpdateGlobalNotesActionType } from "../constants/types";

export function UpdateGlobalNotesAction(notes: Array<Note>): UpdateGlobalNotesActionType {
    return {
        type: NoteActionTypes.UPDATE_GLOBAL_NOTES,
        payload: notes
    }
}