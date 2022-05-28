import {GlobalNoteType, NoteType, SelectedNoteType} from '../types/noteTypes';
import React, {FC, ReactNode, useReducer, createContext} from 'react';

enum NoteActionTypes {
  SET_NOTE = 'SET_NOTE',
  ADD_NOTE = 'ADD_NOTE',
  EDIT_NOTE = 'EDIT_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  SET_GLOBAL_NOTE = 'GLOBAL_NOTE'
}

interface NoteState {
  note: NoteType['note']
  notes: NoteType['notes']
}

interface NoteStateProps {
  children: ReactNode;
}

interface SetNoteAction {
  type: typeof NoteActionTypes.SET_NOTE;
  payload: {note: NoteType['note']};
}


interface updateGlobalNoteAction {
  type: typeof NoteActionTypes.SET_GLOBAL_NOTE,
  payload: { notes: NoteType['notes'] }
}

interface ContextProps {
  state: NoteState;
  dispatch: {
    setNoteAction(note: NoteType): void,
    updateGlobalNoteAction(notes: Array<NoteType>): void
  };
}

const combineReducers = (reducers: any) => (state: any, action: any) => {
  let hasChanged : any;
  const nextState = Object.keys(reducers).reduce((result: any, key: any) => {
    result[key] = reducers[key](state[key], action);
    hasChanged = hasChanged || result[key] !== state[key];
    return result;
  }, {});
  return hasChanged ? nextState : state;
};

const SetNoteReducer = (state: NoteState['note'], action: SetNoteAction): NoteState['note'] => {
  switch (action.type) {
    case NoteActionTypes.SET_NOTE:
      return {
        note: action.payload.note.note,   
      };
    default:
      return state;
  }
};

const UpdateGlobalNoteReducer = (state: NoteState['notes'], action: updateGlobalNoteAction): NoteState['notes'] => {
   switch (action.type) {
    case NoteActionTypes.SET_GLOBAL_NOTE:
      return {
        notes: action.payload.notes.notes,
      };
    default:
      return state;
  }
}

export const NoteContext = createContext({} as ContextProps);

const noteInit: SelectedNoteType = {
  note: { title: ' ' }
}

const notesInit: GlobalNoteType = {
  notes:[]
}

const initialState: NoteType = {
  note: noteInit,
  notes: notesInit
};

const rootReducer = combineReducers({
  note: SetNoteReducer,
  notes: UpdateGlobalNoteReducer
});

const NoteContextProvider: FC<NoteStateProps> = ({children}) => {
  //const [state, dispatch] = useReducer(combineReducers({ note: SetNoteReducer , notes: UpdateGlobalNoteReducer }), initialState);
  const [state, dispatch] = useReducer(rootReducer, initialState);

  const setNoteAction = (note: any) => {
    dispatch({
      type: NoteActionTypes.SET_NOTE,
      payload: note,
    });
  };

  const updateGlobalNoteAction = (notes: Array<any>) => {
    dispatch({
      type: NoteActionTypes.SET_GLOBAL_NOTE,
      payload: notes,
    });
  }

  return (
    <NoteContext.Provider value={{state, dispatch: {setNoteAction, updateGlobalNoteAction}}}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContextProvider;


export interface NoteType{
    note: SelectedNoteType
    notes: GlobalNoteType
 }
 export interface GlobalNoteType {
     notes: Array<any>
 }
 
 export interface SelectedNoteType {
     note: Note
 }
 
 export interface Note {
     id?: string
     title: string
 }