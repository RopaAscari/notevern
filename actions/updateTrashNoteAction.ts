import { NoteActionTypes, UpdateTrashNoteActionType } from "../constants/types";

export function UpdateTrashNoteAction(notes: any): UpdateTrashNoteActionType {
    return {
        type: NoteActionTypes.ADD_TO_TRASH,
        payload: notes
    }
}