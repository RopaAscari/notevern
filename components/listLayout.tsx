import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Settings} from '../constants/types';
import {RootState} from '../reducers/combinedReducers';

type Props = {
  appSettings: Settings;
};

const ListLayout: FC<Props> = (props) => {
  const mapLayout = () => {
    const list = [1, 2, 3, 4];

    return list.map((item, index) => {
      return (
        <View
          key={index}
          style={styles(props.appSettings.theme).list}
        />
      );
    });
  };

  return (
    <View style={styles(props.appSettings.theme).container}>{mapLayout()}</View>
  );
};

const styles = (theme: string) =>
  StyleSheet.create({
    container: {
      width: 140,
      height: 160,
      marginBottom: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15, 
      backgroundColor: theme === 'DARK'? 'white':'grey',
    },
    list:{
      width: 100,
      height: 20,
      borderRadius: 15,
      backgroundColor: '#2C2B2B',
      marginTop: 10,
    }
  });

const mapStateToProps = (state: RootState) => {
  return {
    appSettings: state.appSettings.settings,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ListLayout);
