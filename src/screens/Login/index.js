import {useNavigation} from '@react-navigation/core';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import {Voximplant} from 'react-native-voximplant';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const voximplant = Voximplant.getInstance();

  const connectVoximplant = async () => {
    let clientState = await voximplant.getClientState();

    if (clientState === Voximplant.ClientState.DISCONNECTED) {
      await voximplant.connect();
    } else if (clientState === Voximplant.ClientState.LOGGED_IN) {
      navigation.reset({index: 0, routes: [{name: 'Contacts'}]});
      return;
    }
  };

  useEffect(() => {
    connectVoximplant();
  }, []);

  const login = async () => {
    try {
      await voximplant.login(
        `${username}@test2.savinvadim.voximplant.com`,
        password,
      );
      navigation.reset({index: 0, routes: [{name: 'Contacts'}]});
    } catch (e) {
      Alert.alert(e.name, `Error code: ${e.code}`);
    }
  };

  return (
    <View style={styles.page}>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder={'username'}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={'password'}
        style={styles.input}
        secureTextEntry
      />

      <Pressable onPress={login} style={styles.btn}>
        <Text>Sign in</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  input: {
    backgroundColor: 'white',
    alignSelf: 'stretch',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  btn: {
    backgroundColor: 'dodgerblue',
    alignSelf: 'stretch',
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 5,
  },
});

export default LoginScreen;
