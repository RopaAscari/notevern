import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
import SetSelectedNoteReducer from './setSelectedNoteReducer';
import UpdateTrashNoteReducer from './updateTrashNotesReducer';
import SetNoteOperationReducer from './setNoteOperationReducer';
import UpdateAppSettingsReducer from './updateAppSettingsReducer';
import UpdateGlobalNotesReducer from './updateGlobalNotesReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistanceConfiguartion = {
  key: 'persist',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
    trashNotes: UpdateTrashNoteReducer,
    noteAction: SetNoteOperationReducer,
    selectedNote: SetSelectedNoteReducer,
    appSettings: UpdateAppSettingsReducer,
    globalNotes: UpdateGlobalNotesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export const persistedReducer = persistReducer<any, any>(
  persistanceConfiguartion,
  rootReducer,
);
