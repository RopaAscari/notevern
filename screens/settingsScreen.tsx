import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import React, {FC, useState} from 'react';
import {RootState} from '../reducers/combinedReducers';
import {Settings, UpdateAppSettingsActionType} from '../constants/types';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {UpdateAppSettingsAction} from '../actions/updateAppSettingsAction';
import {Dimensions, StyleSheet, Text, View, Switch} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Collapse, CollapseHeader, CollapseBody} from '../components/collaspe';

type Props = {
  navigation: any;
  appSettings: Settings;
  reduxUpdateAppSettings: (settings: Settings) => void;
};

const SettingsScreen: FC<Props> = (props) => {
  const [isEnabled, setIsEnabled] = useState(
    props.appSettings.autoSave ? true : false,
  );
  const [isLight, enableLightMode] = useState(
    props.appSettings.theme === 'LIGHT' ? true : false,
  );
  const [isDark, enableDarkMode] = useState(
    props.appSettings.theme === 'DARK' ? true : false,
  );
  const [themeList, toggleThemeList] = useState(false);
  const [applicationList, toggleApplicationList] = useState(false);

  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    const settings = {
      theme: props.appSettings.theme,
      autoSave: !isEnabled,
      preferences: {
        sortBy: props.appSettings.preferences.sortBy,
        viewType: props.appSettings.preferences.viewType,
      },
    };
    props.reduxUpdateAppSettings(settings);
  };

  const goBack = () => {
    props.navigation.goBack();
  };

  const toggleLightMode = () => {
    if (isDark) {
      enableDarkMode(false);
    }
    enableLightMode(true);
    const settings = {
      theme: 'LIGHT',
      autoSave: props.appSettings.autoSave,
      preferences: {
        sortBy: props.appSettings.preferences.sortBy,
        viewType: props.appSettings.preferences.viewType,
      },
    };
    props.reduxUpdateAppSettings(settings);
  };

  const toggleDarkMode = () => {
    if (isLight) {
      enableLightMode(false);
    }
    enableDarkMode(true);
    const settings = {
      theme: 'DARK',
      autoSave: props.appSettings.autoSave,
      preferences: {
        sortBy: props.appSettings.preferences.sortBy,
        viewType: props.appSettings.preferences.viewType,
      },
    };
    props.reduxUpdateAppSettings(settings);
  };

  return (
    <View style={styles(props.appSettings.theme).container}>
      <View style={styles(props.appSettings.theme).headerContainer}>
        <MaterialIcons
          name="arrow-back-ios"
          color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
          size={heightPercentageToDP(3)}
          style={styles(props.appSettings.theme).backArrow}
          onPress={goBack}
        />
        <Text style={styles(props.appSettings.theme).header}>Settings</Text>
      </View>

      <Collapse onToggle={(collasped: boolean) => toggleThemeList(collasped)}>
        <CollapseHeader>
          <View
            style={[
              styles(props.appSettings.theme).row,
              {padding: 30, justifyContent: 'space-between'},
            ]}>
            <View style={[styles(props.appSettings.theme).row]}>
              <MaterialCommunityIcons
                name="theme-light-dark"
                color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                size={30}
              />
              <Text style={styles(props.appSettings.theme).themeText}>
                {' '}
                Theme
              </Text>
            </View>
            {themeList ? (
              <MaterialIcons
                name="keyboard-arrow-down"
                color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                size={heightPercentageToDP(3.5)}
              />
            ) : (
              <MaterialIcons
                name="keyboard-arrow-right"
                color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                //  size={23}
                size={heightPercentageToDP(3.5)}
              />
            )}
          </View>
        </CollapseHeader>
        <CollapseBody>
          <View style={{padding: 30, marginLeft: 20}}>
            <View style={[styles(props.appSettings.theme).row, {}]}>
              {!isDark ? (
                <MaterialCommunityIcons
                  name="circle-outline"
                  color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                  size={30}
                  onPress={toggleDarkMode}
                />
              ) : (
                <MaterialCommunityIcons
                  name="circle"
                  color={'tomato'}
                  size={30}
                  //   onPress={}
                />
              )}
              <Text style={styles(props.appSettings.theme).darkText}>
                {' '}
                Dark
              </Text>
            </View>

            <View
              style={[styles(props.appSettings.theme).row, {marginTop: 15}]}>
              {!isLight ? (
                <MaterialCommunityIcons
                  name="circle-outline"
                  color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                  size={30}
                  onPress={toggleLightMode}
                />
              ) : (
                <MaterialCommunityIcons
                  name="circle"
                  color={'tomato'}
                  size={30}
                  // onPress={}
                />
              )}
              <Text style={styles(props.appSettings.theme).lightText}>
                {' '}
                Light
              </Text>
            </View>
          </View>
        </CollapseBody>
      </Collapse>

      <Collapse
        onToggle={(collasped: boolean) => toggleApplicationList(collasped)}>
        <CollapseHeader>
          <View
            style={[
              styles(props.appSettings.theme).row,
              {padding: 30, justifyContent: 'space-between'},
            ]}>
            <View style={styles(props.appSettings.theme).row}>
              <MaterialCommunityIcons
                name="application-export"
                color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                size={30}
              />
              <Text style={styles(props.appSettings.theme).appText}> App</Text>
            </View>

            {applicationList ? (
              <MaterialIcons
                name="keyboard-arrow-down"
                color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                size={heightPercentageToDP(3.5)}
              />
            ) : (
              <MaterialIcons
                name="keyboard-arrow-right"
                color={props.appSettings.theme === 'DARK' ? 'white' : 'black'}
                size={23}
                //size={heightPercentageToDP(3.5)}
              />
            )}
          </View>
        </CollapseHeader>
        <CollapseBody>
          <View
            style={[
              styles(props.appSettings.theme).row,
              {justifyContent: 'space-around'},
            ]}>
            <Text style={styles(props.appSettings.theme).autosaveDescr}>
              Enable autosave on notes
            </Text>
            <Switch
              style={{transform: [{scaleX: 1.1}, {scaleY: 1.1}]}}
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={props.appSettings.autoSave ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </CollapseBody>
      </Collapse>
    </View>
  );
};
const styles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      backgroundColor: theme === 'DARK' ? 'black' : 'white',
      //justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
    },
    themeText: {
      color: theme === 'DARK' ? 'white' : 'black',
      fontSize: heightPercentageToDP(2),
    },
    appText: {
      color: theme === 'DARK' ? 'white' : 'black',
      fontSize: heightPercentageToDP(2),
    },
    darkText: {
      color: theme === 'DARK' ? 'white' : 'black',
      fontSize: heightPercentageToDP(2),
    },
    lightText: {
      color: theme === 'DARK' ? 'white' : 'black',
      fontSize: heightPercentageToDP(2),
    },
    autosaveDescr: {
      color: theme === 'DARK' ? 'white' : 'black',
      fontSize: heightPercentageToDP(2),
    },
    backArrow: {
      padding: 10,
      position: 'absolute',
      alignSelf: 'flex-start',
    },
    headerContainer: {
      height: heightPercentageToDP(7),
      borderBottomWidth: 0.4,
      borderBottomColor: 'grey',
      flexDirection: 'row',
      alignItems: 'center',
    },
    header: {
      // position:'absolute',
      left: Dimensions.get('window').width / 2.4,
      fontSize: heightPercentageToDP(2.2),
      color: theme === 'DARK' ? 'white' : 'black',
      alignSelf: 'center',
    },
  });

const mapStateToProps = (state: RootState) => {
  return {
    appSettings: state.appSettings.settings,
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch<UpdateAppSettingsActionType>,
) => {
  return {
    reduxUpdateAppSettings: (settings: Settings) =>
      dispatch(UpdateAppSettingsAction(settings)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
