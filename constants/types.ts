export enum NoteActionTypes {
  SET_NOTE = 'SET_NOTE',
  UPDATE_SETTINGS = 'SETTINGS',
  ADD_TO_TRASH = 'ADD_TO_TRASH',
  UPDATE_GLOBAL_NOTES = 'SET_GLOBAL_NOTES',
  SET_NOTE_OPERATION = 'SET_NOTE_OPERATION',
}

/* FUNDAMENTAL NOTE TYPES */

export interface Note {
  id?: string;
  date?: any;
  title: string;
  value?: any;
  action?: string;
  miscellaneous?: any;
}

export interface NoteType {
  notes: Array<any>;
}

export interface GlobalNoteType {
  notes: Array<Note>;
}

export interface SelectedNoteType {
  note: Note;
}

/** Settings Types */
interface Preferences {
  sortBy: string;
  viewType: string;
}

export interface Settings {
  theme: string;
  autoSave: boolean;
  preferences: Preferences;
}

export interface SettingsState {
  settings: Settings;
}

interface UpdateSettingsActionStore {
  type: NoteActionTypes.UPDATE_SETTINGS;
  payload: Settings;
}

/** Note Operation Action Types */

export interface NoteOperationState {
  action: string;
}

interface SetNoteOperationStore {
  type: typeof NoteActionTypes.SET_NOTE_OPERATION;
  payload: string;
}

/** Global Note Operation Action Types */

export interface GlobalNotesState {
  notes: Array<Note>;
}

interface UpdateGlobalNotesActionStore {
  type: typeof NoteActionTypes.UPDATE_GLOBAL_NOTES;
  payload: Array<Note>;
}

/** Selected Operation Action Types */

export interface SelectedNoteState {
  note: Note;
}

interface SelectedNoteActionStore {
  type: typeof NoteActionTypes.SET_NOTE;
  payload: Note;
}

/** Trash Note Operation Action Types */

export interface TrashNoteState {
  notes: Array<NoteType>;
}

interface AddNoteToTrashActionStore {
  type: typeof NoteActionTypes.ADD_TO_TRASH;
  payload: Array<Note>;
}


// ** TYPE EXPORTS ** //SetNoteActionType
export type SetNoteOperationActionType = SetNoteOperationStore
export type UpdateAppSettingsActionType = UpdateSettingsActionStore
export type UpdateTrashNoteActionType = AddNoteToTrashActionStore
export type SetSelectedNoteActionType= SelectedNoteActionStore
export type UpdateGlobalNotesActionType = UpdateGlobalNotesActionStore