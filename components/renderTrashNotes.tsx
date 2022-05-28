import dayjs from 'dayjs';
import React, {FC, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  note: any;
  index: number;
  deleting?: boolean;
  markForDelete?:(id: string) => void
  unMarkForDelete?:(id: string) => void
};

export const RenderTrashNotes: FC<Props> = (props) => {

  const [checked, checkNote] = useState(false);

  const markForDelete = (id: string) => {
    checkNote(true);
    props.markForDelete(id);
  }

  const unMarkForDelete = (id: string) => {
    checkNote(false);
    props.unMarkForDelete(id);
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

  return (
    <View style={styles(props).container}>
      {props.deleting ? (
        checked ? (
          <AntDesign
            name="checkcircle"
            color="tomato"
            size={25}
            style={styles(props).checkCircleContainer}
            onPress={() => unMarkForDelete(props.note.id)}
          />
        ) : (
          <MaterialCommunityIcons
            name="checkbox-blank-circle-outline"
            color="grey"
            onPress={() => markForDelete(props.note.id)}
            size={25}
            style={styles(props).checkCircleContainer}
          />
        )
      ) : null}
      <Text style={[styles(props).noteTemplateHeading, { fontSize: 20, marginBottom: 5, fontWeight:'bold', color:'white' }]}>{props.note.title}</Text>
      <Text style={[styles(props).noteTemplateHeading,{ color:'grey', fontSize: 13}]}>{renderNoteTime(props.note.date)}</Text>
      <View style={styles(props).contentContainerStyle}>
      <Text style={[styles(props).contentContainerStyleText, styles(props).noteTemplateHeading]}>{props.note.text}</Text>
      </View>
    </View>
  );
};

const styles = (props: Props) =>
  StyleSheet.create({
    container: {
      width: props.deleting ? 180 : 400,
      height: props.deleting ? 170 : 120,
      elevation:15,
      backgroundColor: '#2C2B2B',
      borderRadius: 20,
      marginTop:20
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

    }
  });
