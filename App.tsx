import {Provider} from 'react-redux';
import React, {useEffect} from 'react';
import GlobalRouter from './router/router';
import {store, persistor} from './store/store';
import {StyleSheet, Dimensions} from 'react-native';
import {MenuProvider} from 'react-native-popup-menu';
import FlashMessage from 'react-native-flash-message';
import SplashScreen from 'react-native-splash-screen';
import {PersistGate} from 'redux-persist/integration/react';

const App = () => {
  
  useEffect(() => {
    SplashScreen.hide();
  });

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MenuProvider style={{flex: 1, borderRadius: 40}}>
          <GlobalRouter />
          <FlashMessage
            duration={2000}
            position="bottom"
            style={styles.flashMesageStyles}
            textStyle={styles.flashMessageTextStyles}
          />
        </MenuProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  flashMesageStyles: {
    marginBottom: 70,
    borderRadius: 10,
    alignSelf: 'center',
    backgroundColor: 'green',
    width: Dimensions.get('window').width - 20,
  },
  flashMessageTextStyles: {
    color: 'white',
  },
});

export default App;
