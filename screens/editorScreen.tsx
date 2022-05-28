import RNFS from 'react-native-fs';
import React, {
  FC,
  createRef,
  useEffect,
  useContext,
  useState,
  useRef,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Dimensions,
  Image,
  TouchableOpacity,
  BackHandler,
  Alert,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  ActivityIndicator,
  LogBox,
  KeyboardStatic,
  KeyboardAvoidingView,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
//import {Note, NoteType} from '../types/noteTypes';
import ActionSheet, {ActionSheetProps} from 'react-native-actions-sheet';
import {MessageOptions, showMessage} from 'react-native-flash-message';
import DocumentPicker, {PlatformTypes} from 'react-native-document-picker';
import {Modal, Portal, Provider} from 'react-native-paper';
//import {ADD_NOTES} from '../constants/ASYNC_STORAGE_CONSTANTS';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ViewShot, {captureRef} from 'react-native-view-shot';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
//import {TextEditor} from '../components/textEditor';
import {ADD} from '../constants/constants';
import CNRichTextEditor, {
  CNToolbar,
  getDefaultStyles,
  convertToObject,
  convertToHtmlString,
} from '../components/react-native-cn-richtext-editor-master';

import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuContext,
  MenuProvider,
  renderers,
} from 'react-native-popup-menu';
import {NoteContext} from '../depracted/context/note-context';
import Feather from 'react-native-vector-icons/Feather';
//import Sketch from '../components/react-native-sketch';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import {useStateWithPromise} from '../components/useStatePromise';
import RNSketchCanvas from '../components/react-native-sketch-canvas';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {connect} from 'react-redux';
import {RootState} from '../reducers/combinedReducers';
import {
  Note,
  Settings,
  UpdateAppSettingsActionType,
  UpdateGlobalNotesActionType,
} from '../constants/types';
import {Dispatch} from 'redux';
import {UpdateGlobalNotesAction} from '../actions/updateGlobalNotesAction';
import {Rationale} from 'react-native';
import {generateNoteId} from '../services/services';
import {ScrollView} from 'react-native-gesture-handler';
import {findNodeHandle} from 'react-native';
import {EmitterSubscription} from 'react-native';
import getPath from '@flyerhq/react-native-android-uri-path';

type Props = {
  navigation: any;
  noteAction: string;
  selectedNote: Note;
  appSettings: Settings;
  globalNotes: Array<Note>;
  reduxUpdateGlobalNotes: (notes: Array<Note>) => void;
};

interface Picker {
  type: 'audio' | 'pdf';
}

let isComponentMounted = false;
const {SlideInMenu} = renderers;
const IS_IOS = Platform.OS === 'ios';
const defaultStyles = getDefaultStyles();
const {width, height} = Dimensions.get('window');

const EditorScreen: React.FC<Props> = (props) => {
  const actionSheetRef = createRef<any>();

  useEffect(() => {
  
    initializeAudioRecorder();
    //LogBox.ignoreAllLogs();
    keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      keyboardDidShow,
    );
    keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHide,
    );

    scrollToElement(currentNoteState.miscellaneous.fontSize);

    BackHandler.addEventListener('hardwareBackPress', navigateBack);
    return () => {
      initializeAudioRecorder(), keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
      BackHandler.removeEventListener('hardwareBackPress', navigateBack);
    };
  }, []);

  let nodeObj = new Map();
  let editor = React.createRef<any>().current;
  let keyboardDidShowListener = useRef<EmitterSubscription>().current;
  let keyboardDidHideListener = useRef<EmitterSubscription>().current;

  const myScroll = useRef<any>();
  const [text, captureText] = React.useState(
    props.selectedNote.title === 'Untitled' ? '' : props.selectedNote.title,
  );

  const [saved, savingNote] = React.useState(false);
  const [visible, setVisible] = React.useState(
    props.noteAction === ADD ? true : false,
  );

  const [audioUrl, setAudioUrl] = useState('');
  const [exporting, isExporting] = useState(false);
  const [timer, setAudioTimer] = useState('' as any);
  const [audioAdded, addVoiceAudio] = useState(false);
  const [openSketch, openSketchModal] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isRecording, setAudioRecording] = useState(false);
  const [isSelectingFontSize, selectFontSize] = useState(false);

  const [isReading, toggleReadMode] = useState(
    props.noteAction === 'EDIT' ? true : false,
  );

  const pos = useRef();
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const fileIcon = require('../assets/images/file-icon.png');
  const imageIcon = require('../assets/images/image-icon.png');

  const [selectedTag, setSelectedTag] = useState('body');
  const [selectedColor, setSelectedColor] = useState('default');
  const [selectedHighlight, setSelectedHighlight] = useState('default');
  const [colors, setColors] = useState<Array<string>>(['red', 'green', 'blue']);
  const [highlights, setHighlights] = useState<Array<string>>([
    'yellow_hl',
    'pink_hl',
    'orange_hl',
    'green_hl',
    'purple_hl',
    'blue_hl',
  ]);

  const [currentNoteState, manageCurrentNoteState] = useState({
    id: props.selectedNote.id,
    title: props.selectedNote.title,
    date: props.selectedNote.date,
    value: props.selectedNote.value,
    miscellaneous: props.selectedNote.miscellaneous,
  } as Note);

  const [hasUpdated, setUpdated] = useState(false);
  const [noteAdded, addNoteToContext] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [isExportSelected, selectExportMethod] = useState(false);

  const [customStyles, updateCustomStyles] = useState({
    ...defaultStyles,
    body: {fontSize: currentNoteState.miscellaneous.fontSize},
    heading: {fontSize: currentNoteState.miscellaneous.fontSize},
    title: {
      fontSize: currentNoteState.miscellaneous.fontSize,
      color: props.appSettings.theme === 'DARK' ? 'white' : 'black',
    },
    ol: {fontSize: currentNoteState.miscellaneous.fontSize},
    ul: {fontSize: currentNoteState.miscellaneous.fontSize},
    bold: {
      fontSize: currentNoteState.miscellaneous.fontSize,
      fontWeight: 'bold',
      color: props.appSettings.theme === 'DARK' ? 'white' : 'black',
    },
  });

  const activateReadMode = () => {
    toggleReadMode(true);
  };

  const activateEditMode = () => {
    toggleReadMode(false);
  };

  const navigateBack = () => {
    props.navigation.goBack();
    autoSaveNotes();
    return true;
  };

  const getAudioTimeString = () => {
    //const h = parseInt(timer / (60 * 60));
    const m = parseInt(((timer % (60 * 60)) / 60) as unknown as string);
    const s = parseInt((timer % 60) as unknown as string);
    if (m >= 59) {
      stopRecord();
      Alert.alert('Maximum audio recording limit reached');
    }
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  };

  const openAttachmentMenu = () => {
    actionSheetRef.current?.setModalVisible();
  };

  const exportToCheetahNotesFile = async () => {
    selectExportMethod(false);
    isExporting(true);

    if (await isPermitted()) {
      const path =
        RNFS.ExternalStorageDirectoryPath +
        '/Documents/' +
        currentNoteState.title +
        '-' +
        generateNoteId() +
        '.json';
      RNFS.writeFile(path, JSON.stringify(currentNoteState), 'utf8')
        .then(() => {
          isExporting(false);
          showMessage({
            message: 'Note Exported',
            type: 'success',
            icon: 'success',
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const exportToPdf = async () => {
    isExporting(true);

    if (await isPermitted()) {
      const html = convertToHtmlString(currentNoteState.value);

      let options = {
        html: html,
        fileName: currentNoteState.title + '-' + new Date().getTime(),
        directory: 'Documents',
      };

      try {
        await RNHTMLtoPDF.convert(options);
        isExporting(false);
        // return file.base64
        showMessage({
          message: 'Note Exported',
          type: 'success',
          icon: 'success',
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  const shareNote = async () => {
    const html = convertToHtmlString(currentNoteState.value);

    let optionsS = {
      html: html,
      fileName: currentNoteState.title + '-' + new Date().getTime(),
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(optionsS);
    const path = file.filePath !== undefined ? file.filePath : '';
    const response = await RNFS.readFile(path, 'base64');
    await RNFS.unlink(path);

    const options = {
      title: 'Share via',
      url: 'data:application/pdf;base64,' + response,
    };

    try {
      const response = await Share.open(options);
      console.log('res', response);
    } catch (e) {
      console.log('Error =>', e);
    }
  };

  const openGallery = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, (response) => {
      if (!response.errorCode && !response.errorMessage) {
      } else {
        console.log(response.errorMessage);
      }
    });
  };

  const initializeAudioRecorder = () => {
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      if (!isAuthorised) return;

      const audioPath = AudioUtils.DocumentDirectoryPath + '/test.mp3';

      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: 'Low',
        AudioEncoding: 'aac',
        AudioEncodingBitRate: 32000,
      });

      AudioRecorder.onProgress = (data) => {
        setAudioTimer(data.currentTime);
      };
    });
  };

  const startRecord = async () => {
    const audioPath =
      AudioUtils.DocumentDirectoryPath + `audio-${new Date().getTime()}.mp3`;

    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
    });
    await AudioRecorder.startRecording();
    setAudioRecording(true);
  };

  const stopRecord = async () => {
    setAudioTimer(0);
    await AudioRecorder.stopRecording()
      .then((filePath) => {
        setAudioUrl(filePath);
        addVoiceAudio(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Camera Permission',
          message: 'App needs access to your camera ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission given');
        useCameraHandler();
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openFileManager = async (type: Picker['type']) => {
    const RNGRP = require('react-native-get-real-path');

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types[type]],
      });
      if (type === 'audio') {
        RNGRP.getRealPathFromURI(res.uri).then((filePath: string) => {
          editor.insertVoiceRecording(filePath, 'audio');
        });
      } else {
        editor.insertFileContent(res.uri);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.error(err); // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const autoSaveNotes = () => {
    if (hasUpdated && props.appSettings.autoSave && !saved) {
      saveNote(true);
    }
  };

  const renderAudioRecorder = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
          backgroundColor: '#E2E2E2',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          height: 35,
          width: 90,
        }}>
        {!audioAdded ? (
          <Text
            style={{
              fontSize: 18,
              color: 'black',
              right: 5,
            }}>
            {getAudioTimeString()}
          </Text>
        ) : null}
        {audioAdded ? (
          <TouchableOpacity
            onPress={addVoiceRecording}
            style={{flexDirection: 'row'}}>
            <MaterialIcons
              name="keyboard-arrow-left"
              size={30}
              style={{}}
              color={'black'}
            />
            <Entypo name="mic" size={26} color={'black'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stopRecord}>
            <View
              style={{
                height: 23,
                width: 23,
                backgroundColor: '#E54219',
                borderRadius: 5,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const saveNote = async (autosaving?: any) => {
    savingNote((prevState: boolean) => true);

    const message: MessageOptions = {
      message: autosaving ? 'Note Auto Saved' : 'Note Saved',
      type: 'success',
      icon: 'success',
    };

    manageCurrentNoteState((prevState: any) => ({
      ...prevState,
      title: text,
    }));

    determineNoteAction().then(() => {
      hideModal();
      showMessage(message);
    });
  };

  const determineNoteAction = async () => {
    let notes = props.globalNotes;
    if (!noteAdded && props.noteAction === ADD) {
      const currNote = {
        id: currentNoteState.id,
        title: text,
        date: currentNoteState.date,
        value: currentNoteState.value,
        miscellaneous: currentNoteState.miscellaneous,
      };
      notes.push(currNote);
      addNoteToContext(true);
      props.reduxUpdateGlobalNotes(notes);
    } else {
      const index = notes.findIndex(
        (Inote: Note) => Inote.id === currentNoteState.id,
      );
      notes[index].title = text;
      notes[index].value = currentNoteState.value;
      notes[index].miscellaneous = currentNoteState.miscellaneous;
      props.reduxUpdateGlobalNotes(notes);
    }
  };

  const onStyleKeyPress = (toolType: any) => {
    if (toolType == 'image') {
      return;
    } else {
      editor.applyToolbar(toolType);
    }
  };

  const onSelectedTagChanged = (tag: any) => {
    setSelectedTag(tag);
  };

  const onSelectedStyleChanged = (styles: any) => {
    const colorS = colors;
    const highlightS = highlights;
    let sel = styles.filter((x: any) => colors.indexOf(x) >= 0);
    let hl = styles.filter((x: any) => highlights.indexOf(x) >= 0);

    setSelectedStyles(styles);
    setSelectedColor(sel.length > 0 ? sel[sel.length - 1] : 'default');
    setSelectedHighlight(hl.length > 0 ? hl[hl.length - 1] : 'default');
  };

  const onValueChanged = useRef((value: any) => {
    setTimeout(() => {
      manageCurrentNoteState((prevState: any) => ({
        ...prevState,
        value: value,
      }));
    }, 0);
  }).current;

  const insertImage = (url: any, id: any) => {
    editor.insertImage(url, id);
  };

  const useLibraryHandler = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, (response) => {
      if (!response.errorCode && !response.errorMessage) {
        console.log(response.uri);
        insertImage(response.uri, 'url');
      } else {
        console.log(response.errorMessage);
      }
    });
  };

  const useCameraHandler = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchCamera(options, (response) => {
      if (!response.errorCode && !response.errorMessage) {
        insertImage(response.uri, 'url');
      } else {
        console.log(response.errorMessage);
      }
    });
  };

  const optionSelectorClicked = async (value: any) => {
    if (value == 1) {
      await requestCameraPermission();
    } else if (value == 2) {
      useLibraryHandler();
    } else if (value == 3) {
      openFileManager('audio');
    } else if (value == 4) {
      await openFileManager('pdf');
    } else if (value == 5) {
      Keyboard.dismiss();
      openSketchModal(true);
    } else if (value == 6) {
      await startRecord();
    }
  };

  const addVoiceRecording = async () => {
    addVoiceAudio(false);
    setAudioRecording(false);
    editor.insertVoiceRecording(audioUrl, 'voice');
  };

  const onColorSelectorClicked = (value: any) => {
    if (value === 'default') {
      editor.applyToolbar(selectedColor);
    } else {
      editor.applyToolbar(value);
    }

    setSelectedColor(value);
  };

  const onHighlightSelectorClicked = (value: any) => {
    if (value === 'default') {
      editor.applyToolbar(selectedHighlight);
    } else {
      editor.applyToolbar(value);
    }

    setSelectedHighlight(value);
  };

  const onRemoveImage = ({url, id}: any) => {
    // do what you have to do after removing an image
    console.log(`image removed (url : ${url})`);
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

  const keyboardDidShow = (event: any) => {
    setKeyboardOffset(event.endCoordinates.height);
  };

  const isEditing = useRef(() => {
    setTimeout(() => {
      if (!hasUpdated) {
        setUpdated(true);
      }
    }, 0);
  }).current;

  const keyboardDidHide = () => {
    setKeyboardOffset(0);
  };

  const updateFontSize = (size: number) => {
    manageCurrentNoteState((prevState) => ({
      ...prevState,
      miscellaneous: {
        fontSize: size,
      },
    }));
    selectFontSize(false);
    updateCustomStyles((prevState) => ({
      ...prevState,
      body: {fontSize: size},
      heading: {fontSize: size},
      title: {
        fontSize: size,
        color: props.appSettings.theme === 'DARK' ? 'white' : 'black',
      },
      ol: {fontSize: size},
      ul: {fontSize: size},
      bold: {
        fontSize: size,
        fontWeight: 'bold',
        color: props.appSettings.theme === 'DARK' ? 'white' : 'black',
      },
    }));
  };

  const renderFontSize = () => {
    const fontSizes = [
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
    ];

    return fontSizes.map((item, index) => {
      return (
        <View
           key={index}
          style={{
            padding: 5,
            borderRadius: 5,
            width: 40,
            justifyContent: 'center',
            alignSelf: 'center',
            backgroundColor:
              currentNoteState.miscellaneous.fontSize === item
                ? 'tomato'
                : 'white',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color:
                currentNoteState.miscellaneous.fontSize === item
                  ? 'white'
                  : 'black',
            }}
            onPress={() => updateFontSize(item)}>
            {item}
          </Text>
        </View>
      );
    });
  };

  const renderImageSelector = () => {
    return (
      <Menu renderer={SlideInMenu} onSelect={optionSelectorClicked}>
        <MenuTrigger>
          <Feather
            name="paperclip"
            color="grey"
            size={25}
            // onPress={openAttachmentMenu}
          />
        </MenuTrigger>
        <MenuOptions
          optionsContainerStyle={{
            elevation: 20,
            borderTopWidth: 0.5,
            borderTopColor: '#F9F9F9',
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor:
              props.appSettings.theme === 'DARK' ? '#111111' : '#F9F9F9',
          }}>
          <MenuOption value={1}>
            <Text style={styles(props.appSettings.theme).menuOptionText}>
              Camera
            </Text>
          </MenuOption>
          <View style={styles(props.appSettings.theme).divider} />
          <MenuOption value={2}>
            <Text style={styles(props.appSettings.theme).menuOptionText}>
              Photo{' '}
            </Text>
          </MenuOption>
          <View style={styles(props.appSettings.theme).divider} />
          <MenuOption value={3}>
            <Text style={styles(props.appSettings.theme).menuOptionText}>
              Audio File
            </Text>
          </MenuOption>
          <View style={styles(props.appSettings.theme).divider} />
          <MenuOption value={4}>
            <Text style={styles(props.appSettings.theme).menuOptionText}>
              PDF File
            </Text>
          </MenuOption>
          <View style={styles(props.appSettings.theme).divider} />
          <MenuOption value={5}>
            <Text style={styles(props.appSettings.theme).menuOptionText}>
              Sketch
            </Text>
          </MenuOption>
          <View style={styles(props.appSettings.theme).divider} />
          <MenuOption value={6}>
            <Text style={styles(props.appSettings.theme).menuOptionText}>
              Voice Recording
            </Text>
          </MenuOption>
          <View style={styles(props.appSettings.theme).divider} />
        </MenuOptions>
      </Menu>
    );
  };

  const renderColorMenuOptions = () => {
    let lst = [];

    if (defaultStyles[selectedColor]) {
      lst = colors.filter((x) => x !== selectedColor);
      lst.push('default');
      lst.push(selectedColor);
    } else {
      lst = colors.filter((x) => true);
      lst.push('default');
    }

    return lst.map((item) => {
      let color = defaultStyles[item] ? defaultStyles[item].color : 'black';
      return (
        <MenuOption value={item} key={item}>
          <MaterialCommunityIcons
            name="format-color-text"
            color={color}
            size={28}
          />
        </MenuOption>
      );
    });
  };

  const renderHighlightMenuOptions = () => {
    let lst = [];

    if (defaultStyles[selectedHighlight]) {
      lst = highlights.filter((x) => x !== selectedHighlight);
      lst.push('default');
      lst.push(selectedHighlight);
    } else {
      lst = highlights.filter((x) => true);
      lst.push('default');
    }

    return lst.map((item) => {
      let bgColor = defaultStyles[item]
        ? defaultStyles[item].backgroundColor
        : 'black';
      return (
        <MenuOption value={item} key={item}>
          <MaterialCommunityIcons name="marker" color={bgColor} size={26} />
        </MenuOption>
      );
    });
  };

  const renderColorSelector = () => {
    let selectedColor = '#737373';
    if (defaultStyles[selectedColor]) {
      selectedColor = defaultStyles[selectedColor].color;
    }

    return (
      <Menu renderer={SlideInMenu} onSelect={onColorSelectorClicked}>
        <MenuTrigger>
          <MaterialCommunityIcons
            name="format-color-text"
            color={selectedColor}
            size={28}
            style={{
              top: 2,
            }}
          />
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyles}>
          {renderColorMenuOptions()}
        </MenuOptions>
      </Menu>
    );
  };

  const renderHighlight = () => {
    let selectedColor = '#737373';

    if (defaultStyles[selectedHighlight]) {
      selectedColor = defaultStyles[selectedHighlight].backgroundColor;
    }
    return (
      <Menu renderer={SlideInMenu} onSelect={onHighlightSelectorClicked}>
        <MenuTrigger>
          <MaterialCommunityIcons
            name="marker"
            color={selectedColor}
            size={24}
            style={{}}
          />
        </MenuTrigger>
        <MenuOptions customStyles={highlightOptionsStyles}>
          {renderHighlightMenuOptions()}
        </MenuOptions>
      </Menu>
    );
  };

  const scrollToElement = (indexOf: number) => {
    console.log('CAL', calculateScrollDistance(indexOf));
    myScroll.current?.scrollTo({
      x: calculateScrollDistance(indexOf),
      y: 0,
      animated: true,
    });
  };

  const calculateScrollDistance = (indexOf: number) => {
    if (indexOf >= 0 && indexOf <= 10) {
      return 0;
    } else if (indexOf >= 11 && indexOf <= 20) {
      return 400;
    }
    if (indexOf >= 21 && indexOf <= 30) {
      return 800;
    } else {
      return 1200;
    }
  };

  const changeFontSize = () => {
    selectFontSize(true);
   
  }

  /**
 * {
    toolTypeText: 'heading',
    buttonTypes: 'tag',
    iconComponent: (
      <MaterialCommunityIcons name="format-header-3" />
    ),
  },
   */

  return (
    <Provider>
      <React.Fragment>
        <View style={styles(props.appSettings.theme).container}>
          <View style={styles(props.appSettings.theme).headerBar}>
            <View
              style={[
                styles(props.appSettings.theme).row,
                {justifyContent: 'center', alignItems: 'center'},
              ]}>
              <MaterialIcons
                name="arrow-back-ios"
                color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                style={styles(props.appSettings.theme).iconPadding}
                size={heightPercentageToDP('2.5')}
                onPress={navigateBack}
              />
              <TextInput
                editable={!isReading}
                style={{color: 'white',width: 300,}}

                onKeyPress={() => setUpdated(true)}
                onChangeText={(text) => {
                  captureText(text);
                }}>
                <Text
                numberOfLines={1}
                  style={{
                    padding: 20,
                    fontSize: 16,
                
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                  }}>
                  {currentNoteState.title}
                </Text>
              </TextInput>
            </View>
            <View style={styles(props.appSettings.theme).row}>
              {isReading ? (
                <MaterialCommunityIcons
                  name="file-document-edit"
                  color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                  style={styles(props.appSettings.theme).iconPadding}
                  size={heightPercentageToDP('3')}
                  onPress={activateEditMode}
                />
              ) : (
                <Ionicons
                  name="ios-book"
                  color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                  style={styles(props.appSettings.theme).iconPadding}
                  size={heightPercentageToDP('3')}
                  onPress={activateReadMode}
                />
              )}

              <Menu
                style={{padding: 0, borderRadius: 30}}
                onClose={() => selectExportMethod(false)}>
                <MenuTrigger customStyles={{}}>
                  <MaterialCommunityIcons
                    style={styles(props.appSettings.theme).iconPadding}
                    name="dots-vertical"
                    size={heightPercentageToDP('3')}
                    color={
                      props.appSettings.theme === 'DARK' ? 'white' : 'black'
                    }
                    // onPress={()=> Alert.alert('menu not implemented')}
                  />
                </MenuTrigger>
                <MenuOptions
                  optionsContainerStyle={{
                    borderRadius: 20,
                    backgroundColor:
                      props.appSettings.theme === 'DARK' ? 'black' : 'white',
                  }}>
                  {!isExportSelected ? (
                    <React.Fragment>
                      <MenuOption onSelect={saveNote}>
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
                          Save
                        </Text>
                      </MenuOption>
                      <MenuOption>
                        <Text
                          onPress={() => selectExportMethod(true)}
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
                          Export
                        </Text>
                      </MenuOption>
                      <MenuOption onSelect={shareNote}>
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
                          Share
                        </Text>
                      </MenuOption>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <MenuOption onSelect={exportToCheetahNotesFile}>
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
                          Cheetah Notes File
                        </Text>
                      </MenuOption>
                      <MenuOption onSelect={exportToPdf}>
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
                          PDF
                        </Text>
                      </MenuOption>
                    </React.Fragment>
                  )}
                </MenuOptions>
              </Menu>
            </View>
          </View>

          <View style={styles(props.appSettings.theme).root}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles(props.appSettings.theme).main}>
                {isRecording ? renderAudioRecorder() : null}
                <CNRichTextEditor
                  ref={(input) => (editor = input)}
                  isReadMode={isReading}
                  onSelectedTagChanged={onSelectedTagChanged}
                  onSelectedStyleChanged={onSelectedStyleChanged}
                  value={currentNoteState.value}
                  miscellaneous={currentNoteState.miscellaneous}
                  style={styles(props.appSettings.theme).editor}
                  theme={props.appSettings.theme}
                  styleList={customStyles}
                  editing={isEditing}
                  foreColor={
                    props.appSettings.theme === 'DARK' ? 'white' : 'black'
                  } // optional (will override default fore-color)
                  onValueChanged={onValueChanged}
                  onRemoveImage={onRemoveImage}
                />
              </View>
            </TouchableWithoutFeedback>

            {isSelectingFontSize ? (
          
                <View
                  style={{
                    width: 300,                
                    height: 30,
                    elevation: 16,
                    borderRadius: 5,
                    //  flexDirection:'row',
                    backgroundColor: 'white',
                    bottom: 50,
                    alignSelf: 'center',
                    position: 'absolute',
                  }}>
                  <ScrollView
                    ref={myScroll}
                    onScroll={
                      (e) => null 
                    }
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}>
                    {renderFontSize()}
                  </ScrollView>
                </View>
            ) : null}

            {isReading ? null : (
           
      
                  <KeyboardAvoidingView  behavior={'padding'}  style={styles(props.appSettings.theme).toolbarContainer} keyboardVerticalOffset={120}>
                <CNToolbar
                  style={{
                    position: 'absolute',
                    //  marginBottom: 500,
                    height: 35,
                    width: '100%',
                    // bottom: 400,
                  }}
                  iconSetContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}
                  size={28}
                  iconSet={[
                    {
                      type: 'tool',
                      iconArray: [
                        {
                          toolTypeText: 'bold',
                          buttonTypes: 'style',
                          iconComponent: (
                            <MaterialCommunityIcons
                              name="format-bold"
                              color="red"
                            />
                          ),
                        },
                        {
                          toolTypeText: 'italic',
                          buttonTypes: 'style',
                          iconComponent: (
                            <MaterialCommunityIcons name="format-italic" />
                          ),
                        },
                        {
                          toolTypeText: 'underline',
                          buttonTypes: 'style',
                          iconComponent: (
                            <MaterialCommunityIcons name="format-underline" />
                          ),
                        },
                        {
                          toolTypeText: 'lineThrough',
                          buttonTypes: 'style',
                          iconComponent: (
                            <MaterialCommunityIcons name="format-strikethrough-variant" />
                          ),
                        },
                      ],
                    },
                    {
                      type: 'seperator',
                    },
                    {
                      type: 'tool',
                      iconArray: [
                        {
                          toolTypeText: 'body',
                          buttonTypes: 'tag',
                          iconComponent: (
                            <MaterialCommunityIcons
                              name="format-text"
                              color="red"
                            />
                          ),
                        },
                        {
                          toolTypeText: 'title',
                          buttonTypes: 'tag',
                          iconComponent: (
                            <MaterialCommunityIcons
                              name="format-font-size-increase"
                              onPress={changeFontSize}
                            />
                          ),
                        },

                        {
                          toolTypeText: 'ul',
                          buttonTypes: 'tag',
                          iconComponent: (
                            <MaterialCommunityIcons name="format-list-bulleted" />
                          ),
                        },
                        {
                          toolTypeText: 'ol',
                          buttonTypes: 'tag',
                          iconComponent: (
                            <MaterialCommunityIcons name="format-list-numbered" />
                          ),
                        },
                      ],
                    },
                    {
                      type: 'seperator',
                    },
                    {
                      type: 'tool',
                      iconArray: [
                        {
                          toolTypeText: 'image',
                          iconComponent: renderImageSelector(),
                        },
                        {
                          toolTypeText: 'color',
                          iconComponent: renderColorSelector(),
                        },
                        {
                          toolTypeText: 'highlight',
                          iconComponent: renderHighlight(),
                        },
                      ],
                    },
                  ]}
                  selectedTag={selectedTag}
                  selectedStyles={selectedStyles}
                  onStyleKeyPress={onStyleKeyPress}
                  backgroundColor="aliceblue" // optional (will override default backgroundColor)
                  color="gray" // optional (will override default color)
                  selectedColor="white" // optional (will override default selectedColor)
                  selectedBackgroundColor="deepskyblue" // optional (will override default selectedBackgroundColor)
                />
                      </KeyboardAvoidingView>
             
        
            )}
          </View>
        </View>

        <ActionSheet ref={actionSheetRef}>
          <View
            style={[
              styles(props.appSettings.theme).row,
              styles(props.appSettings.theme).attachmentMenuContainer,
            ]}>
            <TouchableOpacity
              style={styles(props.appSettings.theme).attachmentPosition}
              onPress={openGallery}>
              <Image
                source={imageIcon}
                style={styles(props.appSettings.theme).attachmentImageIcon}
              />
              <Text style={styles(props.appSettings.theme).attachmentImageText}>
                Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles(props.appSettings.theme).attachmentPosition}
              onPress={() => openFileManager('pdf')}>
              <Image
                source={fileIcon}
                style={styles(props.appSettings.theme).attachmentImageIcon}
              />
              <Text style={styles(props.appSettings.theme).attachmentImageText}>
                File
              </Text>
            </TouchableOpacity>
          </View>
        </ActionSheet>

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={
              styles(props.appSettings.theme).modalContainer
            }>
            <Text
              style={{
                color: props.appSettings.theme === 'DARK' ? 'white' : 'black',
                textAlign: 'center',
                fontSize: 16,
              }}>
              {' '}
              Title
            </Text>
            <TextInput
              placeholder="Untitled"
              style={styles(props.appSettings.theme).addNoteTextInput}
              onChangeText={(text) => captureText(text)}>
              <Text
                style={{
                  color: props.appSettings.theme === 'DARK' ? 'white' : 'black',
                }}>
                Untitled
              </Text>
            </TextInput>
            <View
              style={[
                styles(props.appSettings.theme).row,
                {justifyContent: 'space-around', marginTop: 20},
              ]}>
              <TouchableOpacity onPress={saveNote}>
                <Text
                  style={{
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                  }}>
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={hideModal}>
                <Text
                  style={{
                    color:
                      props.appSettings.theme === 'DARK' ? 'white' : 'black',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        <Portal>
          <Modal
            theme={{
              colors: {
                backdrop: 'transparent',
              },
            }}
            visible={exporting}
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
                  color: props.appSettings.theme === 'DARK' ? 'white' : 'black',
                  fontSize: heightPercentageToDP(2),
                }}>
                Exporting{' '}
              </Text>
              <ActivityIndicator size="large" color="red" />
            </View>
          </Modal>
        </Portal>

        <Portal>
          <Modal
            visible={openSketch}
            onDismiss={hideModal}
            contentContainerStyle={
              styles(props.appSettings.theme).modalSketchContainer
            }>
            <RNSketchCanvas
              containerStyle={{backgroundColor: 'transparent', flex: 1}}
              canvasStyle={{backgroundColor: 'transparent', flex: 1}}
              onStrokeEnd={(data) => {}}
              closeComponent={
                <View style={styles(props.appSettings.theme).functionButton}>
                  <Text
                    style={{color: 'white'}}
                    onPress={() => openSketchModal(false)}>
                    Close
                  </Text>
                </View>
              }
              onClosePressed={() => {
                // this.setState({ example: 0 })
              }}
              undoComponent={
                <View style={styles(props.appSettings.theme).functionButton}>
                  <Text style={{color: 'white'}}>Undo</Text>
                </View>
              }
              onUndoPressed={(id) => {
                // Alert.alert('do something')
              }}
              clearComponent={
                <View style={styles(props.appSettings.theme).functionButton}>
                  <Text style={{color: 'white'}}>Clear</Text>
                </View>
              }
              onClearPressed={() => {
                // Alert.alert('do something')
              }}
              eraseComponent={
                <View style={styles(props.appSettings.theme).functionButton}>
                  <Text style={{color: 'white'}}>Eraser</Text>
                </View>
              }
              strokeComponent={(color) => (
                <View
                  style={[
                    {backgroundColor: color},
                    styles(props.appSettings.theme).strokeColorButton,
                  ]}
                />
              )}
              strokeSelectedComponent={(color, index, changed) => {
                return (
                  <View
                    style={[
                      {backgroundColor: color, borderWidth: 2},
                      styles(props.appSettings.theme).strokeColorButton,
                    ]}
                  />
                );
              }}
              strokeWidthComponent={(w) => {
                return (
                  <View
                    style={styles(props.appSettings.theme).strokeWidthButton}>
                    <View
                      style={{
                        backgroundColor: 'white',
                        marginHorizontal: 2.5,
                        width: Math.sqrt(w / 3) * 10,
                        height: Math.sqrt(w / 3) * 10,
                        borderRadius: (Math.sqrt(w / 3) * 10) / 2,
                      }}
                    />
                  </View>
                );
              }}
              defaultStrokeIndex={0}
              defaultStrokeWidth={5}
              saveComponent={
                <View style={styles(props.appSettings.theme).functionButton}>
                  <Text style={{color: 'white'}}>Save</Text>
                </View>
              }
              onSketchSaved={async (success, path) => {
                try {
                  if (success) {
                    const base64 = await RNFS.readFile(path, 'base64');
                    const uri = 'data:image/png;base64,' + base64;
                    insertImage(uri, 'base');

                    showMessage({
                      message: 'Sketch Saved',
                      type: 'success',
                      icon: 'success',
                    });
                    openSketchModal(false);
                  }
                } catch (err) {
                  console.log(err);
                }
              }}
              onPathsChange={(pathsCount) => {
                console.log('pathsCount', pathsCount);
              }}
            />
          </Modal>
        </Portal>
      </React.Fragment>
    </Provider>
  );
};

const styles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      backgroundColor: theme === 'DARK' ? '#2C2B2B' : 'white',
    },
    row: {
      flexDirection: 'row',
    },
    iconPadding: {
      padding: 15,
    },
    body: {
      backgroundColor: theme === 'DARK' ? '#2C2B2B' : '#f2f2f2',
      // justifyContent: 'center',
      //  alignItems: 'center',
    },
    strokeColorButton: {
      marginHorizontal: 2.5,
      marginVertical: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    strokeWidthButton: {
      marginHorizontal: 2.5,
      marginVertical: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#39579A',
    },
    functionButton: {
      marginHorizontal: 2.5,
      marginVertical: 8,
      height: 30,
      width: 60,
      backgroundColor: '#39579A',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
    },
    cameraContainer: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black',
      alignSelf: 'stretch',
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20,
    },
    page: {
      flex: 1,
      height: 300,
      elevation: 2,
      marginVertical: 8,
      backgroundColor: 'white',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.75,
      shadowRadius: 2,
    },
    headerBar: {
      top: 0,
      width: '100%',
      height: 60,
      elevation: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // borderBottomColor: 'grey',
      // borderBottomWidth: 0.5,
    },
    textInput: {
      height: height,
      width: width,
      color: 'white',
      textAlignVertical: 'top',
    },
    addNoteTextInput: {
      width: 230,
      height: 50,
      borderBottomColor: theme === 'DARK' ? 'white' : 'grey',
      borderBottomWidth: 0.2,
      alignSelf: 'center',
    },
    attachmentMenuContainer: {
      height: 120,
      justifyContent: 'space-around',
      backgroundColor: 'black',
    },
    attachmentImageIcon: {
      height: 60,
      width: 60,
      marginTop: 10,
    },
    attachmentImageText: {
      fontSize: 18,
      color: 'white',
      marginTop: 5,
    },
    attachmentPosition: {
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme === 'DARK' ? 'black' : 'white',
      padding: 20,
      height: 150,
      width: 280,
      elevation: 15,
      alignSelf: 'center',
      borderRadius: 15,
    },
    modalSketchContainer: {
      backgroundColor: 'white',
      padding: 20,
      height: height,
      width: width,
      alignSelf: 'center',
      borderRadius: 5,
    },
    root: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: theme === 'DARK' ? '#2C2B2B' : 'white',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
    main: {
      flex: 1,
      marginTop: 10,
      paddingLeft: 30,
      paddingRight: 30,
      paddingBottom: 1,
      alignItems: 'stretch',
    },
    editor: {
      backgroundColor: theme === 'DARK' ? '#2C2B2B' : 'white',
    },
    toolbarContainer: {
      minHeight: 35,
      color: 'black',

    },
    menuOptionText: {
      textAlign: 'center',
      paddingTop: 5,
      paddingBottom: 5,
      fontSize: 17,
      color: theme === 'DARK' ? 'white' : 'black',
    },
    divider: {
      marginVertical: 0,
      marginHorizontal: 0,
      borderBottomWidth: 1,
      borderColor: 'grey',
      opacity: 0.2,
    },
  });

const optionsStyles = {
  optionsContainer: {
    backgroundColor: 'yellow',
    padding: 0,
    width: 40,
    marginLeft: width - 40 - 30,
    alignItems: 'flex-end',
  },
  optionsWrapper: {
    //width: 40,
    backgroundColor: 'white',
  },
  optionWrapper: {
    //backgroundColor: 'yellow',
    margin: 2,
  },
  optionTouchable: {
    underlayColor: 'gold',
    activeOpacity: 70,
  },
  // optionText: {
  //   color: 'brown',
  // },
};

const highlightOptionsStyles = {
  optionsContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    width: 40,
    marginLeft: width - 40,

    alignItems: 'flex-end',
  },
  optionsWrapper: {
    //width: 40,
    backgroundColor: 'white',
  },
  optionWrapper: {
    //backgroundColor: 'yellow',
    margin: 2,
  },
  optionTouchable: {
    underlayColor: 'gold',
    activeOpacity: 70,
  },
  // optionText: {
  //   color: 'brown',
  // },
};

const mapStateToProps = (state: RootState) => {
  return {
    noteAction: state.noteAction.action,
    selectedNote: state.selectedNote.note,
    trashNotes: state.trashNotes.notes,
    globalNotes: state.globalNotes.notes,
    appSettings: state.appSettings.settings,
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch<UpdateGlobalNotesActionType>,
) => {
  return {
    reduxUpdateGlobalNotes: (notes: Array<Note>) =>
      dispatch(UpdateGlobalNotesAction(notes)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditorScreen);
