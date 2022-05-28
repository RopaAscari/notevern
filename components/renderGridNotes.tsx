import dayjs from 'dayjs';
import { Dispatch } from 'redux';
import { Note } from '../depracted';
import { connect } from 'react-redux';
import React, {FC, useState} from 'react';
import { Settings } from '../constants/types';
import { RootState } from '../reducers/combinedReducers';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = {
  note: any;
  index: number;
  length: number
  deleting: boolean;
  markAll: boolean;
  appSettings: Settings;
  intiateEditing: () => void;
  markForDelete:(id: Note) => void
  unMarkForDelete:(id: Note) => void
  navigateToEditNoteScreen: (note: Note) => void;
};

const RenderGridNotes: FC<Props> = (props) => {

  React.useEffect(() => {
    if(props.length === 0){
    // unMarkForDelete(props.note)
    }
    if(props.markAll){
    // markForDelete(props.note)
    }
  },[props.length, props.markAll])

  const [checked, checkNote] = useState(false);
  const [favorited, favouriteNote] = useState(false);

  const markForDelete = (note: Note) => {
    checkNote(true);
    props.markForDelete(note);
  }

  const unMarkForDelete = (note: Note) => {
    checkNote(false);
    props.unMarkForDelete(note);
  }

  const renderNoteTime = (noteDate: any) => {
    
    const localizedFormat = require('dayjs/plugin/localizedFormat');

    const current = Math.abs(
      (noteDate - new Date().getTime()) / 3600000,
    );
    
    dayjs.extend(localizedFormat)

    if (Math.round(current) < 24) {
      return dayjs(noteDate).format('LT');
    } else if (Math.round(current) >= 24 && Math.round(current) < 168) {
      return dayjs(noteDate).format('dddd');
    } else if (Math.round(current) > 168 && Math.round(current) < 8760) {
      return (
        dayjs(noteDate).format('MMMM') +
        ' ' +
        dayjs(noteDate).format('DD')
      );
    } else {
      return dayjs(noteDate).format('L');
    }
  };

  const validate = () => {
    if(checked){
      unMarkForDelete(props.note)
    } else{
      markForDelete(props.note)
    }
  }

  return (
    <TouchableOpacity
    onLongPress={props.intiateEditing}
    onPress={() =>props.deleting ? validate(): props.navigateToEditNoteScreen(props.note)}>
    <View style={styles(props.appSettings.theme).container}>
      {props.deleting ? (
        checked ? (
          <AntDesign
            name="checkcircle"
            color="tomato"
            size={30}
            style={styles(props.appSettings.theme).checkCircleContainer}
            onPress={() => unMarkForDelete(props.note)}
          />
        ) : (
          <MaterialCommunityIcons
            name="checkbox-blank-circle-outline"
            color="grey"
            onPress={() => markForDelete(props.note)}
            size={30}
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
          <View style={{right: 10, width:130, height: 20}}>
            <Text style={[styles(props.appSettings.theme).noteTemplateHeading, { fontSize: 18, marginBottom: 5,}]}>{props.note.title}</Text>
            <Text style={[styles(props.appSettings.theme).noteTemplateHeading,{ color:'grey', fontSize: 13}]}>{renderNoteTime(props.note.date)}</Text>
          </View>
      </View>
     
      
      { !favorited?
       <FontAwesome name="star-o" color="grey" size={20} onPress={()=> favouriteNote(true)} style={{ bottom:10, right:15, alignSelf:'flex-end', position:'absolute'}}/>
      :<FontAwesome name="star" color="#FAE72B" size={20} onPress={()=> favouriteNote(false)} style={{ bottom:10, right:15, alignSelf:'flex-end', position:'absolute'}}/>
    }
    </View>
    </TouchableOpacity>
  );
};

const styles = (theme: string) =>
  StyleSheet.create({
    container: {
      width: 180,
      height: 160,
      elevation: 2,
     shadowOffset: { width: 0, height: 0 },
     shadowOpacity: 1,
     shadowRadius: 10,
     shadowColor: '#000000',
      backgroundColor:  theme === 'DARK'? '#2C2B2B':'white',
      borderRadius: 20,
    },
    contentContainerStyle: {
      width: 150,
      height: 100
    },
    contentContainerStyleText: {
      fontSize: 15, 
      marginTop: 20,
      color:'white'
    },
    checkCircleContainer: {
      position: 'absolute',
      top: -10,
      right: -10,
    },
    noteTemplateHeading:{
      top: 15,
      left: 15,
      color: theme === 'DARK'? 'white':'black'
    }
  });

  const mapStateToProps = (state: RootState) => {
    return {
      appSettings: state.appSettings.settings
    };
  };

  const mapDispatchToProps = (
    dispatch: Dispatch<
    any
    >,
  ) => {
    return {
    };
  };

  export default connect(
    mapStateToProps,
    mapDispatchToProps,
  )(RenderGridNotes);
