import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {RootState} from '../reducers/combinedReducers';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {showMessage} from 'react-native-flash-message';
import {Modal, Portal, Provider} from 'react-native-paper';
import RenderListNotes from '../components/renderListNotes';
import React, {FC, useContext, useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {UpdateTrashNoteAction} from '../actions/updateTrashNoteAction';
import {UpdateAppSettingsAction} from '../actions/updateAppSettingsAction';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Note,
  Settings,
  UpdateAppSettingsActionType,
  UpdateGlobalNotesActionType,
  UpdateTrashNoteActionType,
} from '../constants/types';
import {UpdateGlobalNotesAction} from '../actions/updateGlobalNotesAction';

type Props = {
  navigation: any;
  appSettings: Settings;
  trashNotes: Array<Note>;
  globalNotes: Array<Note>;
  reduxUpdateTrashNotes: (notes: any) => void;
  reduxUpdateGlobalNotes: (notes: Array<Note>) => void;
};

const TrashScreen: FC<Props> = (props) => {
  const navigateBack = () => {
    props.navigation.goBack();
  };

  const [type, setModalType] = useState('');
  const [visible, setVisible] = useState(false);

  const showDeleteModal = () => {
    setModalType('Delete');
    setVisible(true);
  };

  const showRecoverModal = () => {
    setModalType('Recover');
    setVisible(true);
  };

  const deleteModal = () => (
    <React.Fragment>
      <Text style={{alignSelf: 'center'}}>
        Do you want to permanetly delete all your notes
      </Text>
      <View
        style={[
          styles(props.appSettings.theme).row,
          {justifyContent: 'space-around', marginTop: 20},
        ]}>
        <TouchableOpacity onPress={permanentlyDeleteNotes}>
          <Text>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={hideModal}>
          <Text>No</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );

  const recoverModal = () => (
    <React.Fragment>
      <Text style={{alignSelf: 'center'}}>
        Do you want to recover all your deleted notes
      </Text>
      <View
        style={[
          styles(props.appSettings.theme).row,
          {justifyContent: 'space-around', marginTop: 20},
        ]}>
        <TouchableOpacity onPress={restoreDeletedNotes}>
          <Text>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={hideModal}>
          <Text>No</Text>
        </TouchableOpacity>
      </View>
    </React.Fragment>
  );

  const hideModal = () => setVisible(false);

  useEffect(() => {}, []);

  const restoreDeletedNotes = () => {
    const recoveredNotes = [...props.globalNotes, ...props.trashNotes];
    props.reduxUpdateTrashNotes([]);
    props.reduxUpdateGlobalNotes(recoveredNotes);
    hideModal();
    showMessage({
      message: 'Recovered ' + recoveredNotes.length + ' notes',
      type: 'success',
      icon: 'success',
    });
  };

  const permanentlyDeleteNotes = () => {
    const length = props.trashNotes.length;
    props.reduxUpdateTrashNotes([]);
    hideModal();
    showMessage({
      message: 'Permanently deleted ' + length + ' notes',
      type: 'success',
      icon: 'success',
    });
  };

  const renderTrashNotes = ({item, index}: any) => (
    <RenderListNotes
      deleting={false}
      unMarkForDelete={() => null}
      markForDelete={() => null}
      note={item}
      index={index}
      key={index}
    />
  );

  return (
    <Provider>
      <View style={styles(props.appSettings.theme).container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row'}}>
            <MaterialIcons
              name="arrow-back-ios"
              color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
              style={styles(props.appSettings.theme).iconPadding}
              size={25}
              onPress={navigateBack}
            />
            <Text style={styles(props.appSettings.theme).trashHeading}>
              Trash Notes
            </Text>
          </View>
          <View style={{flexDirection: 'row', padding: 20}}>
            <MaterialCommunityIcons
              name="backup-restore"
              style={{padding: 10}}
              size={25}
              color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
              onPress={showRecoverModal}
            />
            <Fontisto
              style={{padding: 10, left: 10}}
              name="trash"
              size={22}
              color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
              onPress={showDeleteModal}
            />
          </View>
        </View>

        <View style={styles(props.appSettings.theme).body}>
          {props.trashNotes !== undefined ? (
            props.trashNotes.length > 0 ? null : (
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  alignItems: 'center',
                }}>
                <Image
                  source={require('../assets/images/trash.png')}
                  style={{
                    height: heightPercentageToDP('12'),
                    width: heightPercentageToDP('12'),
                  }}
                />
                <Text style={[styles(props.appSettings.theme).noTrashNotes]}>
                  No Trash Notes
                </Text>
              </View>
            )
          ) : null}
          <FlatList
            data={props.trashNotes}
            renderItem={renderTrashNotes}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={
              styles(props.appSettings.theme).modalContainer
            }>
            {type === 'Delete' ? deleteModal() : recoverModal()}
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = (theme: string) =>
  StyleSheet.create({
    body: {
      flex: 1,
      alignSelf: 'center',
      height: '100%',
      backgroundColor: theme === 'DARK' ? 'black' : '#f2f2f2',
      justifyContent: 'center',
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 20,
      height: heightPercentageToDP('10'),
      width: heightPercentageToDP('40'),
      alignSelf: 'center',
      borderRadius: 5,
      //alignItems:'center',// justifyContent:'center'
    },
    row: {
      flexDirection: 'row',
    },
    container: {
      height: '100%',
      width: '100%',
      backgroundColor: theme === 'DARK' ? 'black' : '#f2f2f2',
    },
    iconPadding: {
      padding: 20,
    },
    trashHeading: {
      fontSize: 22,
      padding: 20,
      color: theme === 'DARK' ? 'white' : 'black',
    },
    noTrashNotes: {
      fontSize: heightPercentageToDP('1.9'),
      //padding:20,
      color: theme === 'DARK' ? 'white' : 'black',
    },
    headerText: {
      color: theme === 'DARK' ? 'white' : 'black',
      fontSize: 17,
      fontWeight: 'bold',
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
    | UpdateAppSettingsActionType
    | UpdateTrashNoteActionType
    | UpdateGlobalNotesActionType
  >,
) => {
  return {
    reduxUpdateTrashNotes: (notes: any) =>
      dispatch(UpdateTrashNoteAction(notes)),
    reduxUpdateAppSettings: (settings: Settings) =>
      dispatch(UpdateAppSettingsAction(settings)),
    reduxUpdateGlobalNotes: (notes: Array<Note>) =>
      dispatch(UpdateGlobalNotesAction(notes)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrashScreen);
