import * as React from 'react';
import HomeScreen from '../screens/homeScreen';
import TrashScreen from '../screens/trashScreen';
import EditorScreen from '../screens/editorScreen';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { connect } from 'react-redux';
import { Settings } from '../constants/types';
import SettingsScreen from '../screens/settingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState } from '../reducers/combinedReducers';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {Image, SafeAreaView, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dispatch } from 'redux';

type Props = {
  appSettings: Settings;
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function StackRouter(props: Props) {
  return (
    <Stack.Navigator headerMode={'none'}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="AddNoteScreen" component={EditorScreen} />
      <Stack.Screen name="EditNoteScreen" component={EditorScreen} />
    </Stack.Navigator>
  );
}

function CustomNavbar(props: any) {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          height: 200,
          width: '100%',
          backgroundColor: '#bc822d',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            height: 120,
            width: 120,
            borderRadius: 200,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image source={require('../assets/images/cheetah.png')} style={{height: 80, width: 80}}/>
        </View>
        <Text style={{color: 'white', marginTop: 10, fontSize: 15}}>Cheetah Notes</Text>
      </View>  

      <DrawerContentScrollView {...props} style={{backgroundColor:  props.theme === 'DARK'? 'black':'white'}}>
        <DrawerItemList
          {...props}
          activeBackgroundColor={props.theme === 'DARK'? '#2C2B2B':'#f2f2f2'}
          labelStyle={{color: props.theme === 'DARK'? 'white':'black'}}
          itemStyle={{color: props.theme === 'DARK'? 'white':'black'}}
        />
      </DrawerContentScrollView>
      <View style={{backgroundColor: 'black'}}>
     {
     // <Ionicons name="settings" size={30} color="white" onPress={()=> props.navigation.navigate('HomeScreen')} style={{alignSelf:'flex-end', right: 25, bottom:10}}/>
    }
        <Text style={{fontSize: 14, textAlign: 'center', color:  props.theme === 'DARK'? 'white':'black'}}>
         
        </Text>
      </View>
    </SafeAreaView>
  );
}

function DrawerRouter(propS: Props) {
  return (
    <Drawer.Navigator
      initialRouteName="HomeScreen"
      drawerContent={(props) => <CustomNavbar theme={propS.appSettings.theme} {...props} />}>
      <Drawer.Screen
        name="Home"
        component={StackRouter}
        options={{
          
          drawerIcon: (config) => (
            <MaterialCommunityIcons
              size={25}
              color={ propS.appSettings.theme === 'DARK'? 'white':'black'}
              name={'home'}>               
            </MaterialCommunityIcons>
          ),
        }}
      />
    <Drawer.Screen
        name="Trash"
        component={TrashScreen}
        options={{
          drawerIcon: (config) => (
            <Fontisto size={23} color={ propS.appSettings.theme === 'DARK'? 'white':'black'} name={'trash'}></Fontisto>
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: (config) => (
            <Ionicons name="settings" size={30} color={ propS.appSettings.theme === 'DARK'? 'white':'black'} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function GlobalRouter(props: Props) {
  return <NavigationContainer>{DrawerRouter(props)}</NavigationContainer>;
}


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
)(GlobalRouter);
