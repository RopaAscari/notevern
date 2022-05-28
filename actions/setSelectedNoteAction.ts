import { Note, NoteActionTypes, SetSelectedNoteActionType } from "../constants/types";

export function SetSelectedNoteAction(note: Note): SetSelectedNoteActionType {
    return {
        type: NoteActionTypes.SET_NOTE,
        payload: note
    }
}