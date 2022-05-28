import dayjs from 'dayjs';
import {Dispatch} from 'redux';
import {Note} from '../depracted';
import {connect} from 'react-redux';
import React, {FC, useState} from 'react';
import {Settings} from '../constants/types';
import {RootState} from '../reducers/combinedReducers';
import {Alert, StyleSheet, Text, View} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type Props = {
  note: any;
  length: number;
  index: number;

  deleting: boolean;
  appSettings: Settings;
  markForDelete: (id: Note) => void;
  unMarkForDelete: (id: Note) => void;
};

const RenderListNotes: FC<Props> = (props) => {
  const [place, setPlace] = useState('');
  React.useEffect(() => {
    if (props.length === 0) {
      checkNote(false);
    }
    let text: string =
      props.note.value[0].content[props.note.value[0].content.length - 1].text;
    // if(item.text !== undefined && item.text !== "" && item.text !== " "){
    //}
    // })
    setPlace(text);
    console.log('text', text);
  }, [props.length]);

  const [checked, checkNote] = useState(false);
  const [favorited, favouriteNote] = useState(false);

  const markForDelete = (note: Note) => {
    checkNote(true);
    props.markForDelete(note);
  };

  const unMarkForDelete = (note: Note) => {
    checkNote(false);
    props.unMarkForDelete(note);
  };

  const renderNoteTime = (noteDate: any) => {
    const localizedFormat = require('dayjs/plugin/localizedFormat');

    const current = Math.abs((noteDate - new Date().getTime()) / 3600000);

    dayjs.extend(localizedFormat);

    if (Math.round(current) < 24) {
      return dayjs(noteDate).format('LT');
    } else if (Math.round(current) >= 24 && Math.round(current) < 168) {
      return dayjs(noteDate).format('dddd');
    } else if (Math.round(current) > 168 && Math.round(current) < 8760) {
      return (
        dayjs(noteDate).format('MMMM') + ' ' + dayjs(noteDate).format('DD')
      );
    } else {
      return dayjs(noteDate).format('L');
    }
  };
  console.log(props.note.value[0].content);
  return (
    <View style={styles(props.appSettings.theme).container}>
      {props.deleting ? (
        checked ? (
          <AntDesign
            name="checkcircle"
            color="tomato"
            size={25}
            style={styles(props.appSettings.theme).checkCircleContainer}
            onPress={() => unMarkForDelete(props.note)}
          />
        ) : (
          <MaterialCommunityIcons
            name="checkbox-blank-circle-outline"
            color="grey"
            onPress={() => markForDelete(props.note)}
            size={25}
            style={styles(props.appSettings.theme).checkCircleContainer}
          />
        )
      ) : null}
      <View style={{flexDirection: 'row'}}>
        <MaterialCommunityIcons
          name="circle-medium"
          style={{top: 15}}
          color="grey"
          size={30}
        />

        <View>
          <Text
            style={[
              styles(props.appSettings.theme).noteTemplateHeading,
              {
                fontSize: 18,
                marginBottom: 5,
                //fontWeight: 'bold',
              },
            ]}>
            {props.note.title}
          </Text>

          <View style={{flexDirection: 'row'}}>
            <Text
              style={[
                styles(props.appSettings.theme).noteTemplateHeading,
                {color: 'grey', fontSize: 12},
              ]}>
              {renderNoteTime(props.note.date)}
            </Text>
            <Text
              style={[
                styles(props.appSettings.theme).noteTemplateHeading,
                {color: 'white', fontSize: 12},
              ]}>
              {' '}
              {place}
            </Text>
          </View>
        </View>
      </View>
      {!favorited ? (
        <FontAwesome
          name="star-o"
          color="grey"
          size={20}
          onPress={() => favouriteNote(true)}
          style={{
            justifyContent: 'flex-end',
            bottom: 10,
            right: 20,
            alignSelf: 'flex-end',
            position: 'absolute',
          }}
        />
      ) : (
        <FontAwesome
          name="star"
          color="#FAE72B"
          size={20}
          onPress={() => favouriteNote(false)}
          style={{
            justifyContent: 'flex-end',
            bottom: 10,
            right: 20,
            alignSelf: 'flex-end',
            position: 'absolute',
          }}
        />
      )}
    </View>
  );
};

const styles = (theme: string) =>
  StyleSheet.create({
    container: {
      width: wp('90'), //props.deleting ? wp('85') : wp('90'),
      height: 80, //props.deleting ? hp('8') : hp('12'),
      elevation: 2,
      alignSelf: 'center',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 1,
      shadowRadius: 10,
      shadowColor: '#000000',
      marginTop: 30,
      marginBottom: 10,
      flex: 1,
      opacity: 1,
      backgroundColor: theme === 'DARK' ? '#2C2B2B' : 'white',
      borderRadius: 40,
    },
    contentContainerStyle: {
      width: 150,
      height: 100,
    },
    contentContainerStyleText: {
      fontSize: 15,
      marginTop: 20,
      color: 'white',
    },
    checkCircleContainer: {
      position: 'absolute',
      top: -5,
      right: -5,
    },
    noteTemplateHeading: {
      top: 15,
      left: 15,
      color: theme === 'DARK' ? 'white' : 'black',
    },
  });

const mapStateToProps = (state: RootState) => {
  return {
    appSettings: state.appSettings.settings,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(RenderListNotes);
