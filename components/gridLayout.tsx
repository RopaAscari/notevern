import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Settings} from '../constants/types';
import {RootState} from '../reducers/combinedReducers';

type Props = {
  appSettings: Settings;
};

const GridLayout: FC<Props> = (props) => {
  const grid = [1, 2, 3, 4];

  const gridLayout = () => {
    return <View style={styles(props.appSettings.theme).grid} />;
  };

  return (
    <View style={styles(props.appSettings.theme).container}>
      <FlatList
        data={grid}
        columnWrapperStyle={{padding: 15}}
        numColumns={2}
        renderItem={gridLayout}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = (theme: string) =>
  StyleSheet.create({
    container: {
      width: 140,
      height: 160,
      borderRadius: 15,
      backgroundColor: theme === 'DARK' ? 'white' : 'grey',
    },
    grid: {
      height: 50,
      width: 50,
      borderRadius: 15,
      backgroundColor: '#2C2B2B',
      marginRight: 10,
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

export default connect(mapStateToProps, mapDispatchToProps)(GridLayout);
