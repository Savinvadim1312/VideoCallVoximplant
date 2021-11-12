import {useNavigation} from '@react-navigation/core';
import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Alert,
} from 'react-native';
import {Voximplant} from 'react-native-voximplant';
import {APP_NAME, ACC_NAME} from '../../Constants';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const voximplant = Voximplant.getInstance();
  const navigation = useNavigation();

  useEffect(() => {
    const connect = async () => {
      const status = await voximplant.getClientState();
      if (status === Voximplant.ClientState.DISCONNECTED) {
        await voximplant.connect();
      } else if (status === Voximplant.ClientState.LOGGED_IN) {
        redirectHome();
      }
    };

    connect();
  }, []);

  const signIn = async () => {
    try {
      const fqUsername = `${username}@${APP_NAME}.${ACC_NAME}.voximplant.com`;
      await voximplant.login(fqUsername, password);

      redirectHome();
    } catch (e) {
      console.log(e);
      Alert.alert(e.name, `Error code: ${e.code}`);
    }
  };

  const redirectHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Contacts',
        },
      ],
    });
  };

  return (
    <View style={styles.page}>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="password"
        style={styles.input}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={signIn}>
        <Text>Sign in</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 10,
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'dodgerblue',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default LoginScreen;
