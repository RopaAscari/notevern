import thunk from 'redux-thunk';
import {createStore, applyMiddleware, Store} from 'redux';
import {persistedReducer} from '../reducers/combinedReducers';
import {
  GlobalNotesState,
  NoteOperationState,
  SelectedNoteState,
  SetNoteOperationActionType,
  SetSelectedNoteActionType,
  SettingsState,
  TrashNoteState,
  UpdateAppSettingsActionType,
  UpdateGlobalNotesActionType,
  UpdateTrashNoteActionType,
} from '../constants/types';
import { persistStore } from 'redux-persist';

const middleware = applyMiddleware(thunk);

const store: Store<
  | SettingsState
  | NoteOperationState
  | GlobalNotesState
  | SelectedNoteState
  | TrashNoteState,
  | SetNoteOperationActionType
  | UpdateAppSettingsActionType
  | UpdateTrashNoteActionType
  | SetSelectedNoteActionType
  | UpdateGlobalNotesActionType
> & {
  dispatch: any;
} = createStore(persistedReducer, middleware);
const persistor = persistStore(store);

export { store, persistor };
