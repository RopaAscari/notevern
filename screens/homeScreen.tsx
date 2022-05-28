import {
  Text,
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  TextInput,
  Platform,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';

import {
  convertToObject,
  getDefaultStyles,
} from 'react-native-cn-richtext-editor';

import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {Dispatch} from 'redux';
import RNFS from 'react-native-fs';
import {connect} from 'react-redux';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {ADD, EDIT} from '../constants/constants';
import GridLayout from '../components/gridLayout';
import ListLayout from '../components/listLayout';
import {generateNoteId} from '../services/services';
import ActionSheet from 'react-native-actions-sheet';
import {DrawerActions} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import {RootState} from '../reducers/combinedReducers';
import DocumentPicker from 'react-native-document-picker';
import Fontisto from 'react-native-vector-icons/Fontisto';
import RenderListNotes from '../components/renderListNotes';
import RenderGridNotes from '../components/renderGridNotes';
import React, {createRef, FC, useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {showMessage, MessageOptions} from 'react-native-flash-message';
import {SetSelectedNoteAction} from '../actions/setSelectedNoteAction';
import {UpdateTrashNoteAction} from '../actions/updateTrashNoteAction';
import {SetNoteOperationAction} from '../actions/setNoteOperationAction';
import {UpdateAppSettingsAction} from '../actions/updateAppSettingsAction';
import {UpdateGlobalNotesAction} from '../actions/updateGlobalNotesAction';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Note,
  SetNoteOperationActionType,
  SetSelectedNoteActionType,
  Settings,
  UpdateAppSettingsActionType,
  UpdateGlobalNotesActionType,
  UpdateTrashNoteActionType,
} from '../constants/types';
import {convertToHtmlString} from '../components/react-native-cn-richtext-editor-master/src/Convertors';
import {PermissionsAndroid} from 'react-native';
import {Rationale} from 'react-native';
import {Modal, Portal, Provider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: any;
  appSettings: Settings;
  globalNotes: Array<Note>;
  trashNotes: Array<Note>;
  reduxSetSelectedNote: (note: Note) => void;
  reduxUpdateTrashNotes: (notes: any) => void;
  reduxSetNoteOperation: (operation: string) => void;
  reduxUpdateAppSettings: (settings: Settings) => void;
  reduxUpdateGlobalNotes: (notes: Array<Note>) => void;
};

const actionSheetRef = createRef();
const actionSheetRef2 = createRef();
const {height} = Dimensions.get('window');

const HomeScreen: FC<Props> = (props) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      reRenderComponent((prevState) => prevState + 1);
    }
  }, [isFocused]);

  const [check, selCheck] = useState(false);
  const [sharing, isSharing] = useState(false);
  const [editing, isEditing] = useState(false);
  const [searching, isSearching] = useState(false);
  const [reRender, reRenderComponent] = useState(0);
  const [searchParam, setSearchParam] = useState('');
  const [tempSelectedNotes, setTempSelectedNotes] = useState([] as Array<any>);
  const [colNum, setColNum] = useState(
    props.appSettings.preferences.viewType === 'Grid' ? 2 : 1,
  );
  const [isListView, setListView] = useState(
    props.appSettings.preferences.viewType === 'List' ? true : false,
  );
  const [isGridView, setGridView] = useState(
    props.appSettings.preferences.viewType === 'Grid' ? true : false,
  );
  const [isSortTitle, sortByTitle] = useState(
    props.appSettings.preferences.sortBy === 'Title' ? true : false,
  );
  const [isSortAscending, sortByAscending] = useState(
    props.appSettings.preferences.sortBy === 'Asc' ? true : false,
  );
  const [isSortDescending, sortByDescending] = useState(
    props.appSettings.preferences.sortBy === 'Desc' ? true : false,
  );

  const openMenu = () => {
    props.navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const navigateToAddNoteScreen = () => {
    cancelAllOperations();

    const defaultStyles = getDefaultStyles();

    const customStyles = {
      ...defaultStyles,
      body: {fontSize: 12},
      heading: {fontSize: 16},
      title: {fontSize: 20},
      ol: {fontSize: 12},
      ul: {fontSize: 12},
      bold: {fontSize: 12, fontWeight: 'bold', color: ''},
    };

    const note = {
      id: generateNoteId(),
      title: 'Untitled',
      date: new Date().getTime(),
      value: convertToObject(
        '<div><p><span></span><span style="font-weight: bold;"></span><span> </span><span style="font-style: italic;"> </span><span></span></p></div>',
        customStyles,
      ),
      miscellaneous: { 
        fontSize: 16
      }
    };
    props.reduxSetNoteOperation(ADD);
    props.reduxSetSelectedNote(note);
    props.navigation.navigate('AddNoteScreen');
  };

  const markForDelete = (note: Note) => {
    setTempSelectedNotes((prevArray: Array<Note>) => [...prevArray, note]);
  };

  const sortNoteByTitle = () => {
    sortByTitle(true);
    sortByAscending(false);
    sortByDescending(false);
    updatePreferenceSettings('sortBy', 'Title');
  };
  const sortNoteByAsc = () => {
    sortByAscending(true);
    sortByTitle(false);
    sortByDescending(false);
    updatePreferenceSettings('sortBy', 'Asc');
  };
  const sortNoteByDesc = () => {
    sortByAscending(false);
    sortByTitle(false);
    sortByDescending(true);
    updatePreferenceSettings('sortBy', 'Desc');
  };

  const unMarkForDelete = (note: Note) => {
    setTempSelectedNotes(
      tempSelectedNotes.filter((filId: string) => filId !== note.id),
    );
  };

  const openSortMenu = () => {
    actionSheetRef.current?.setModalVisible();
  };

  const openViewMenu = () => {
    actionSheetRef2.current?.setModalVisible();
  };

  const cancelAllOperations = () => {
    isEditing(false);
    setSearchParam('');
    cancelSearchNotes();
    setTempSelectedNotes([]);
  };

  const isPermitted = async () => {
    const rationale: Rationale = {
      title: 'External Storage Write Permission',
      message: 'App needs access to Storage data',
      buttonPositive: 'OK',
    };

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          rationale,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.log('Write permission err', err);
        return false;
      }
    } else {
      return true;
    }
  };

  const shareNotes = async () => {
    isSharing(true);
    let shared: Array<any> = [];

    for await (const note of tempSelectedNotes) {
      const html = await convertToHtmlString(note.value);
      let optionsS = {
        html: html,
        fileName: note.title + '-' + new Date().getTime(),
        directory: 'Documents',
      };
      const file = await RNHTMLtoPDF.convert(optionsS);
      const path = file.filePath !== undefined ? file.filePath : '';
      const response = await RNFS.readFile(path, 'base64');
      await RNFS.unlink(path);
      const url = 'data:application/pdf;base64,' + response;
      shared.push(url);
    }
    shareNoteToSocial(shared);
  };

  const shareNoteToSocial = async (shared: any) => {
    
    const options = {
      title: 'Share via',
      urls: shared,
    };
      isSharing(false);
      cancelAllOperations();
      await Share.open(options).then((res) => {
      }).catch((err) => {
        console.error(err)
      });
  };

  const navigateToEditNoteScreen = (note: Note) => {
    cancelAllOperations();
    props.reduxSetNoteOperation(EDIT);
    props.reduxSetSelectedNote(note);
    props.navigation.navigate('EditNoteScreen');
  };

  const renderListNotes = ({item, index}: any) => {
    return (
      <TouchableOpacity
        onLongPress={() => isEditing(true)}
        onPress={() => navigateToEditNoteScreen(item)}>
        <RenderListNotes
          note={item}
          key={index}
          index={index}
          deleting={editing}
          markAll={true}
          length={tempSelectedNotes.length}
          markForDelete={markForDelete}
          unMarkForDelete={unMarkForDelete}
        />
      </TouchableOpacity>
    );
  };
  const editNotes = () => {
    isEditing(true)
  }

  const renderGridNotes = ({item, index}: any) => {

    return (
        <View
          style={{
            justifyContent: 'space-between',
            padding: 30,
            backgroundColor: 'transparent',
          }}>
          <RenderGridNotes
            note={item}
            key={index}
            index={index}
            markAll={true}  
            deleting={editing}
            //navigation={props.navigation}
            intiateEditing={editNotes}
            markForDelete={markForDelete}
            unMarkForDelete={unMarkForDelete}
            length={tempSelectedNotes.length}
            navigateToEditNoteScreen={navigateToEditNoteScreen}
          />
        </View>
      
    );
  };

  const cancelDelete = () => {
    Keyboard.dismiss();
    if (editing) {
      isEditing(false);
    }
    return true;
  };

  const deleteNotes = async () => {
    const updatedNotes = props.globalNotes.filter((stateNotes) => {
      return !tempSelectedNotes.find((tempNotes: Note) => {
        return stateNotes.id === tempNotes.id;
      });
    });
    props.reduxUpdateGlobalNotes(updatedNotes);
    isEditing(false);
    setTempSelectedNotes([]);
    const deleted = [...props.trashNotes, ...tempSelectedNotes];
    props.reduxUpdateTrashNotes(deleted);
    const message: MessageOptions = {
      message: 'Deleted ' + tempSelectedNotes.length + ' Notes',
      type: 'warning',
      icon: 'warning',
    };
    showMessage(message);
  };

  const openFileManager = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const noteJSON = await RNFS.readFile(res.uri);
      const noteJSONParsed = noteJSON !== undefined ? JSON.parse(noteJSON) : {};
      importNote(noteJSONParsed);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const importNote = async (note: any) => {

    let message: MessageOptions = {
      message: 'Note Imported',
      type: 'success',
      icon: 'success',
    };

    let notes = props.globalNotes;

    const length = notes.push(note);

    if(length < props.globalNotes.length){
      message = {
        message: 'Import failed',
        type: 'success',
        icon: 'success',
      }
    }

    props.reduxUpdateGlobalNotes(notes);
    reRenderComponent((prevState) => prevState + 1);
    showMessage(message);
  };

  const editingNote = () => {
    if (props.globalNotes.length > 0) {
      isEditing(true);
    }
  };

  const selectGridView = () => {
    setColNum(2);
    setGridView(true);
    setListView(false);
    updatePreferenceSettings('viewType', 'Grid');
    actionSheetRef2.current?.hide();
  };

  const selectListView = () => {
    setColNum(1);
    setListView(true);
    setGridView(false);
    updatePreferenceSettings('viewType', 'List');
    actionSheetRef2.current?.hide();
  };

  const cancelSearchNotes = async () => {
    isSearching(false);
  };

  const updatePreferenceSettings = async (setting: string, value: string) => {
    let tempSettings: any = props.appSettings;
    const index = setting !== undefined ? setting : '';
    tempSettings.preferences[index] = value;
    props.reduxUpdateAppSettings(tempSettings);
    if (setting === 'sortBy') {
      manageSorting(value);
    }
  };

  const manageSorting = (sortType: string) => {
    let temp = [];

    if (sortType === 'Title') {
      temp = props.globalNotes.sort((a: Note, b: Note) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
        return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : 0;
      });
      props.reduxUpdateGlobalNotes(temp);
    } else if (sortType === 'Desc') {
      temp = props.globalNotes.reverse();
      props.reduxUpdateGlobalNotes(temp);
    } else {
      temp = props.globalNotes;
      props.reduxUpdateGlobalNotes(temp);
    }
  };

  return (
    <Provider>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <View
          style={styles(props.appSettings.theme).container}
          onStartShouldSetResponder={cancelDelete}>
          <View style={styles(props.appSettings.theme).headerContainer}>
            <View style={styles(props.appSettings.theme).headerTextPosition}>
              <Text style={styles(props.appSettings.theme).allNotesText}>
                All notes
              </Text>
              <Text style={styles(props.appSettings.theme).notesText}>
                {props.globalNotes !== undefined
                  ? props.globalNotes.length
                  : ''}{' '}
                {props.globalNotes !== undefined &&
                props.globalNotes.length === 1
                  ? 'Note'
                  : 'Notes'}
              </Text>
            </View>

            <View
              style={[
                styles(props.appSettings.theme).headerPosition,
                {
                  alignItems: 'center',
                  justifyContent: searching ? 'center' : 'space-between',
                },
              ]}>
              {!searching ? (
                <React.Fragment>
                  <MaterialCommunityIcons
                    style={styles(props.appSettings.theme).iconPadding}
                    name="menu"
                    color="white"
                    size={heightPercentageToDP('3')}
                    onPress={openMenu}
                  />
                  <View style={[styles(props.appSettings.theme).row]}>
                    <MaterialCommunityIcons
                      style={styles(props.appSettings.theme).iconPadding}
                      name="magnify"
                      size={heightPercentageToDP('3')}
                      color="white"
                      onPress={() => {isSearching(true)}}
                    />
                    <Menu style={{padding: 0, borderRadius: 30}}>
                      <MenuTrigger customStyles={{}}>
                        <MaterialCommunityIcons
                          style={styles(props.appSettings.theme).iconPadding}
                          name="dots-vertical"
                          size={heightPercentageToDP('3')}
                          color="white"
                          // onPress={()=> Alert.alert('menu not implemented')}
                        />
                      </MenuTrigger>
                      <MenuOptions
                        optionsContainerStyle={{
                          borderRadius: 20,
                          backgroundColor:
                            props.appSettings.theme === 'DARK'
                              ? '#111111'
                              : 'white',
                        }}>
                        <MenuOption onSelect={editingNote}>
                          <Text
                            style={{
                              color:
                                props.appSettings.theme === 'DARK'
                                  ? 'white'
                                  : 'black',
                              fontSize: 18,
                              marginLeft: 20,
                              marginTop: 7,
                              marginBottom: 7,
                            }}>
                            Edit
                          </Text>
                        </MenuOption>
                        <MenuOption onSelect={openSortMenu}>
                          <Text
                            style={{
                              color:
                                props.appSettings.theme === 'DARK'
                                  ? 'white'
                                  : 'black',
                              fontSize: 18,
                              marginLeft: 20,
                              marginTop: 7,
                              marginBottom: 7,
                            }}>
                            Sort
                          </Text>
                        </MenuOption>
                        <MenuOption onSelect={openViewMenu}>
                          <Text
                            style={{
                              color:
                                props.appSettings.theme === 'DARK'
                                  ? 'white'
                                  : 'black',
                              fontSize: 18,
                              marginLeft: 20,
                              marginTop: 7,
                              marginBottom: 7,
                            }}>
                            View
                          </Text>
                        </MenuOption>
                        <MenuOption onSelect={openFileManager}>
                          <Text
                            style={{
                              color:
                                props.appSettings.theme === 'DARK'
                                  ? 'white'
                                  : 'black',
                              fontSize: 18,
                              marginLeft: 20,
                              marginTop: 7,
                              marginBottom: 7,
                            }}>
                            Import
                          </Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                </React.Fragment>
              ) : (
                <View
                  style={[
                    styles(props.appSettings.theme).row,
                    {alignItems: 'center', justifyContent: 'center'},
                  ]}>
                  <MaterialIcons
                    name="arrow-back"
                    size={30}
                    style={{bottom: 20, right: 20}}
                    color="white"
                    onPress={cancelSearchNotes}
                  />
                  <TextInput
                    onChangeText={(text) => setSearchParam(text)}
                    autoFocus={true}
                    placeholder="Search Notes"
                    //onBlur={() => isSearching(false)}
                    style={{
                      alignSelf: 'center',
                      justifyContent: 'center',
                      padding: 15,
                      width: '80%',
                      height: 45,
                      bottom: 20,
                      borderRadius: 20,
                      backgroundColor: 'white',
                    }}
                  />
                </View>
              )}
            </View>
          </View>

          {props.globalNotes !== undefined ? (
            props.globalNotes.length > 0 ? null : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  marginTop: 100,
                }}>
                <Image
                  source={require('../assets/images/notes.png')}
                  style={{height: 110, width: 110}}
                />
                <Text
                  style={{
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                    fontSize: heightPercentageToDP('1.7'),
                    marginTop: 10,
                  }}>
                  {' '}
                  Add a note to your list
                </Text>
              </View>
            )
          ) : null}

          <FlatList
            ListEmptyComponent={() =>
              searching ? (
                <View style={{ height: Dimensions.get('window').height, width: '100%', flex:1, alignSelf:'center', }}>
                <Text
                  style={{
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black', //'white',
                    fontSize: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    left: Dimensions.get('window').width / 2.5,
                    top: 300,
                    // bottom:10,
                    zIndex: 10,
                    //   elevation: 10,
                  }}>
                  No notes found
                </Text>
                </View>
              ) : null
            }
            data={
              searching
                ? props.globalNotes.filter((note: Note) => {
                    return note.title
                      .toLowerCase()
                      .includes(searchParam.toLowerCase());
                  })
                : props.globalNotes
            }
            numColumns={colNum}
            key={colNum}
            renderItem={isGridView ? renderGridNotes : renderListNotes}
            keyExtractor={(item, index) => index.toString()}
          />

          <TouchableOpacity
            style={styles(props.appSettings.theme).plusButton}
            onPress={navigateToAddNoteScreen}>
            <MaterialCommunityIcons name="plus" size={25} color="white" />
          </TouchableOpacity>

          {editing ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              <TouchableOpacity
                style={{alignItems: 'center', right: 20}}
                onPress={shareNotes}>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={22}
                  color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                  }}>
                  Share{' '}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{alignItems: 'center', marginLeft: 20}}
                onPress={deleteNotes}>
                <Fontisto
                  name="trash"
                  size={22}
                  color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{alignItems: 'center', left: 25}}
                onPress={cancelAllOperations}>
                <MaterialCommunityIcons
                  name="cancel"
                  size={22}
                  color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ActionSheet ref={actionSheetRef}>
            <View
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                height: 250,
                backgroundColor:
                  props.appSettings.theme === 'DARK' ? '#2C2B2B' : 'white',
              }}>
              <Text
                style={{
                  padding: 20,
                  fontSize: 24,
                  color: props.appSettings.theme == 'DARK' ? 'white' : 'black',
                }}>
                Sort By
              </Text>

              <View style={{padding: 20}}>
                <View style={[styles(props.appSettings.theme).row, {}]}>
                  {isSortTitle ? (
                    <MaterialCommunityIcons
                      name="circle"
                      color={'tomato'}
                      size={30}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="circle-outline"
                      color={
                        props.appSettings.theme === 'DARK' ? 'white' : 'black'
                      }
                      size={30}
                      onPress={sortNoteByTitle}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 18,
                      color:
                        props.appSettings.theme == 'DARK' ? 'white' : 'black',
                    }}>
                    {' '}
                    Title
                  </Text>
                </View>

                <View
                  style={[
                    styles(props.appSettings.theme).row,
                    {marginTop: 20},
                  ]}>
                  {isSortAscending ? (
                    <MaterialCommunityIcons
                      name="circle"
                      color={'tomato'}
                      size={30}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="circle-outline"
                      color={
                        props.appSettings.theme === 'DARK' ? 'white' : 'black'
                      }
                      size={30}
                      onPress={sortNoteByAsc}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 18,
                      color:
                        props.appSettings.theme == 'DARK' ? 'white' : 'black',
                    }}>
                    {' '}
                    Ascending
                  </Text>
                </View>

                <View
                  style={[
                    styles(props.appSettings.theme).row,
                    {marginTop: 20},
                  ]}>
                  {isSortDescending ? (
                    <MaterialCommunityIcons
                      name="circle"
                      color={'tomato'}
                      size={30}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="circle-outline"
                      color={
                        props.appSettings.theme === 'DARK' ? 'white' : 'black'
                      }
                      size={30}
                      onPress={sortNoteByDesc}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 18,
                      color:
                        props.appSettings.theme == 'DARK' ? 'white' : 'black',
                    }}>
                    {' '}
                    Descending
                  </Text>
                </View>
              </View>
            </View>
          </ActionSheet>

          <ActionSheet ref={actionSheetRef2}>
            <View
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor:
                  props.appSettings.theme === 'DARK' ? '#2C2B2B' : 'white',
              }}>
              <View>
                <View
                  style={[
                    styles(props.appSettings.theme).row,
                    {marginTop: 10, marginBottom: 10},
                  ]}>
                  {isGridView ? (
                    <MaterialCommunityIcons
                      name="circle"
                      color={'tomato'}
                      size={30}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="circle-outline"
                      color={
                        props.appSettings.theme === 'DARK' ? 'white' : 'black'
                      }
                      size={30}
                      onPress={selectGridView}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 18,
                      color:
                        props.appSettings.theme == 'DARK' ? 'white' : 'black',
                    }}>
                    {' '}
                    GridView
                  </Text>
                </View>
                <GridLayout />
              </View>

              <View>
                <View
                  style={[
                    styles(props.appSettings.theme).row,
                    {marginTop: 10, marginBottom: 10},
                  ]}>
                  {isListView ? (
                    <MaterialCommunityIcons
                      name="circle"
                      color={'tomato'}
                      size={30}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="circle-outline"
                      color={
                        props.appSettings.theme === 'DARK' ? 'white' : 'black'
                      }
                      size={30}
                      onPress={selectListView}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 18,
                      color:
                        props.appSettings.theme == 'DARK' ? 'white' : 'black',
                    }}>
                    {' '}
                    ListView
                  </Text>
                </View>
                <ListLayout />
              </View>
            </View>
          </ActionSheet>

          <Portal>
            <Modal
              theme={{
                colors: {
                  backdrop: 'transparent',
                },
              }}
              visible={sharing}
              //onDismiss={hideModal}
              contentContainerStyle={
                styles(props.appSettings.theme).modalContainer
              }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                    fontSize: heightPercentageToDP(2),
                  }}>
                  Sharing Notes{' '}
                </Text>
                <ActivityIndicator size="large" color="red" />
              </View>
            </Modal>
          </Portal>
        </View>
      </KeyboardAvoidingView>
    </Provider>
  );
};

const styles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      backgroundColor: theme === 'DARK' ? 'black' : '#f2f2f2',
      justifyContent: 'center',
    },
    iconPadding: {
      padding: 15,
    },
    modalContainer: {
      backgroundColor: theme === 'DARK' ? '#111111' : 'white',
      padding: 20,
      height: 150,
      width: 280,
      alignSelf: 'center',
      borderRadius: 15,
      elevation: 15,
    },
    notesText: {
      textAlign: 'center',
      fontSize: heightPercentageToDP('1.7'),
      color: 'white',
    },
    allNotesText: {
      textAlign: 'center',
      fontSize: heightPercentageToDP('3.8'),
      color: 'white',
      // top:10
    },
    row: {
      flexDirection: 'row',
    },
    scrollBody: {
      height: height,
      flex: 1,
      // justifyContent: 'center',
      // alignItems: 'center',
    },
    headerContainer: {
      height: heightPercentageToDP('25'),
      backgroundColor: '#bc822d',
      elevation: 5,
    },
    headerTextPosition: {
      marginTop: '10%',
    },
    headerPosition: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    plusButton: {
      height: 45,
      width: 45,
      backgroundColor: 'tomato',
      borderRadius: 50,
      //alignItems: 'center',
      //justifyContent: 'center',
      //position: 'absolute',
      //right: 40,
      //top: height - 180,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
      position: 'absolute', //Here is the trick
      bottom: 50,
      right: 50, //Here is the trick
      // padding: 15
    },
  });

const mapStateToProps = (state: RootState) => {
  return {
    trashNotes: state.trashNotes.notes,
    globalNotes: state.globalNotes.notes,
    appSettings: state.appSettings.settings,
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch<
    | SetNoteOperationActionType
    | UpdateAppSettingsActionType
    | UpdateTrashNoteActionType
    | SetSelectedNoteActionType
    | UpdateGlobalNotesActionType
  >,
) => {
  return {
    reduxSetSelectedNote: (note: Note) => dispatch(SetSelectedNoteAction(note)),
    reduxUpdateTrashNotes: (notes: any) =>
      dispatch(UpdateTrashNoteAction(notes)),
    reduxSetNoteOperation: (operation: string) =>
      dispatch(SetNoteOperationAction(operation)),
    reduxUpdateAppSettings: (settings: Settings) =>
      dispatch(UpdateAppSettingsAction(settings)),
    reduxUpdateGlobalNotes: (notes: Array<Note>) =>
      dispatch(UpdateGlobalNotesAction(notes)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
