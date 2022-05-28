import {Note, NoteType} from '../types/noteTypes';
import combineReducers from 'react-combine-reducers';
import React, {FC, ReactNode, useReducer, createContext} from 'react';

enum NoteActionTypes {
  SET_NOTE = 'SET_NOTE',
  SET_NOTE_ACTION='SET_NOTE_ACTION',
  ADD_NOTE = 'ADD_NOTE',
  EDIT_NOTE = 'EDIT_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  SET_GLOBAL_NOTES = 'SET_GLOBAL_NOTES',
  ADD_TO_TRASH="ADD_TO_TRASH",
  TOGGLE_AUTOSAVE='AUTOSAVE',
  SET_THEME='THEME',
  SET_SETTINGS='SETTINGS'
}

interface Preferences {
  sortBy: string
  viewType: string
}

interface Settings {
  theme: string
  autoSave: boolean
  preferences: Preferences
}

interface SettingsState {
  settings: Settings
}

interface SetSettingsAction {
  type: NoteActionTypes.SET_SETTINGS,
  payload: Settings 
}

interface ThemeState {
  theme: string
}

interface SetThemeAction {
  type: NoteActionTypes.SET_THEME,
  payload: string
}

interface AutoSaveOptionState {
  autoSave: boolean
}

interface ToggleAutoSaveAction {
  type: typeof NoteActionTypes.TOGGLE_AUTOSAVE
  payload: boolean
}

interface NoteActionState {
  action: string
}

interface SetNoteAction{
  type: typeof NoteActionTypes.SET_NOTE_ACTION;
  payload: string
}

interface GlobalNotesState {
  notes: Array<NoteType>;
}

interface UpdateGlobalNoteAction {
  type: typeof NoteActionTypes.SET_GLOBAL_NOTES;
  payload:  Array<NoteType>
}

interface SelectedNoteState {
  note: Note;
}

interface SelectedNoteAction {
  type: typeof NoteActionTypes.SET_NOTE;
  payload: Note
}

interface TrashNoteState {
  notes: Array<NoteType>;
}
interface AddNoteToTrashAction{
  type: typeof NoteActionTypes.ADD_TO_TRASH;
  payload:  Array<NoteType>
}

interface NoteStateProps {
  children: ReactNode;
}

const SetAppSettings = (state: SettingsState, action: SetSettingsAction): SettingsState => {
  switch (action.type) {
    case NoteActionTypes.SET_SETTINGS:
      return {
       settings: action.payload
      };
    default:
      return state;
  }
}

const SetAppThemeReducer = (state: ThemeState, action: SetThemeAction): ThemeState => {
  switch (action.type) {
    case NoteActionTypes.SET_THEME:
      return {
       theme: action.payload
      };
    default:
      return state;
  }
};

const SetAutoSaveNoteReducer = (state: AutoSaveOptionState, action: ToggleAutoSaveAction): AutoSaveOptionState => {
  switch (action.type) {
    case NoteActionTypes.TOGGLE_AUTOSAVE:
      return {
        autoSave: action.payload
      };
    default:
      return state;
  }
};

const SetGlobalNotesReducer = (state: SelectedNoteState, action: SelectedNoteAction): SelectedNoteState => {
  switch (action.type) {
    case NoteActionTypes.SET_NOTE:
      return {
        note: action.payload,
      };
    default:
      return state;
  }
};

const UpdateGlobalNotesReducer = (state: GlobalNotesState , action: UpdateGlobalNoteAction): GlobalNotesState => {
  switch (action.type) {
    case NoteActionTypes.SET_GLOBAL_NOTES:
      return {
       notes: action.payload
      };
    default:
      return state;
  }
};

const AddToTrashReducer = (state: TrashNoteState , action: AddNoteToTrashAction): TrashNoteState => {
  switch (action.type) {
    case NoteActionTypes.ADD_TO_TRASH:
      return {
       notes: action.payload
      };
    default:
      return state;
  }
}

const SetNoteActionReducer = (state: NoteActionState , action: SetNoteAction): NoteActionState => {
  switch (action.type) {
    case NoteActionTypes.SET_NOTE_ACTION:
      return {
       action: action.payload
      };
    default:
      return state;
  }
}

export const initialSettingsState: SettingsState = {
  settings:{
    theme: 'DARK',
    autoSave: false,
    preferences: {
      viewType:'List', 
      sortBy:'Asc'
    }  
  }
}

const initialSelectedNoteState: SelectedNoteState = {
  note:{ title: '', action: 'editing' }
};

const intitialThemeState: ThemeState = {
  theme: 'LIGHT'
}

const intitialAutoSaveState: AutoSaveOptionState = {
  autoSave: false
}

const initialGlobalNotesState: GlobalNotesState = {
  notes:[]
};
const initialTrashNotesState: TrashNoteState = {
  notes:[]
};
const initialNoteActionState: NoteActionState = {
  action:''
};

const [noteReducer, initialNoteState] = combineReducers({
  theme: [SetAppThemeReducer,intitialThemeState],
  settings: [SetAppSettings,initialSettingsState],
  trashNotes: [AddToTrashReducer, initialTrashNotesState],
  autoSave: [SetAutoSaveNoteReducer, intitialAutoSaveState],
  noteAction: [SetNoteActionReducer,initialNoteActionState],
  selectedNote: [SetGlobalNotesReducer, initialGlobalNotesState],
  globalNotes: [UpdateGlobalNotesReducer, initialSelectedNoteState],
});

interface ContextProps {
  state: typeof initialNoteState;
  dispatch: {
    setAppSettings(settings: Settings): void
    selectNoteAction(note: any ): void
    setThemeAction(theme: string): void
    setNoteAction(action: string): void
    addNoteToTrashAction(notes: any): void
    updateGlobalNoteAction(notes: any ): void
    setAutoSaveAction(autosave: boolean): void
  };
}

export const NoteContext = createContext({} as ContextProps);

const NoteContextProvider: FC<NoteStateProps> = ({children}) => {
  const [state, dispatch] = useReducer(noteReducer, initialNoteState);

  const selectNoteAction = (note: any) => {
    dispatch({
      type: NoteActionTypes.SET_NOTE,
      payload: note,
    });
  };

  const updateGlobalNoteAction = (notes: any) => {
    dispatch({
      type: NoteActionTypes.SET_GLOBAL_NOTES,
      payload: notes,
    });
  };

  const addNoteToTrashAction = (notes: any) => {
    dispatch({
      type: NoteActionTypes.ADD_TO_TRASH,
      payload: notes,
    });
  };

  const setNoteAction = (action: string) => {
    dispatch({
      type: NoteActionTypes.SET_NOTE_ACTION,
      payload: action,
    });
  }
  
  const setAutoSaveAction = (autosave: boolean) => {
      dispatch({
        type: NoteActionTypes.TOGGLE_AUTOSAVE,
        payload: autosave,
      });
    }

    const setThemeAction = (theme: string) => {
      dispatch({
        type: NoteActionTypes.SET_THEME,
        payload: theme,
      });
    }

    const setAppSettings = (settings: Settings) => {
      dispatch({
        type: NoteActionTypes.SET_SETTINGS,
        payload: settings,
      });
    }

  return (
    <NoteContext.Provider value={{state, dispatch: {selectNoteAction, updateGlobalNoteAction, addNoteToTrashAction, setNoteAction, setAutoSaveAction, setThemeAction, setAppSettings}}}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContextProvider;
