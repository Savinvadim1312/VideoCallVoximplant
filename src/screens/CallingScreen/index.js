import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import CallActionBox from '../../components/CallActionBox';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/core';
import {Voximplant} from 'react-native-voximplant';

const permissions = [
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  PermissionsAndroid.PERMISSIONS.CAMERA,
];

const CallingScreen = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [callState, setCallState] = useState('Initializing call');

  const [localVideoStreamId, setLocalVideoStreamId] = useState('');
  const [remoteVideoStreamId, setRemoteVideoStreamId] = useState('');

  const navigation = useNavigation();
  const route = useRoute();

  const {user, isIncomingCall, call: incomingCall} = route?.params;

  const call = useRef(incomingCall);
  const endpoint = useRef();

  const voximplant = Voximplant.getInstance();

  const requestPermissions = async () => {
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    const recordAudioGranted =
      granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted';
    const cameraGranted =
      granted[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted';
    if (!cameraGranted || !recordAudioGranted) {
      Alert.alert('Permissions not granted');
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    } else {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted || !voximplant) {
      return;
    }

    const callSettings = {
      video: {
        sendVideo: true,
        receiveVideo: true,
      },
    };

    const makeCall = async () => {
      call.current = await voximplant.call(user.user_name, callSettings);
      subscribeToCallEvents();
    };

    const answerCall = async () => {
      subscribeToCallEvents();
      endpoint.current = call.current.getEndpoints()[0];
      subscribeToEndpointEvents();
      await call.current.answer(callSettings);
    };

    const subscribeToCallEvents = async () => {
      call.current.on(Voximplant.CallEvents.Failed, callEvent => {
        showCallError(callEvent.reason);
      });
      call.current.on(Voximplant.CallEvents.ProgressToneStart, callEvent => {
        setCallState('Ringing...');
      });

      call.current.on(Voximplant.CallEvents.Connected, callEvent => {
        setCallState('Call connected');
      });
      call.current.on(Voximplant.CallEvents.Disconnected, callEvent => {
        // calls.delete(callEvent.call.callId);
        navigation.navigate('Contacts');
      });

      call.current.on(
        Voximplant.CallEvents.LocalVideoStreamAdded,
        callEvent => {
          console.log('videostream added');
          setLocalVideoStreamId(callEvent.videoStream.id);
        },
      );
      call.current.on(Voximplant.CallEvents.EndpointAdded, callEvent => {
        endpoint.current = callEvent.endpoint;
        subscribeToEndpointEvents();
      });
    };
    if (isIncomingCall) {
      answerCall();
    } else {
      makeCall();
    }

    return () => {
      call.current.off(Voximplant.CallEvents.Connected);
      call.current.off(Voximplant.CallEvents.Disconnected);
      call.current.off(Voximplant.CallEvents.Failed);
      call.current.off(Voximplant.CallEvents.ProgressToneStart);
      call.current.off(Voximplant.CallEvents.LocalVideoStreamAdded);
      call.current.off(Voximplant.CallEvents.EndpointAdded);
    };
  }, [permissionGranted, user, isIncomingCall, voximplant]);

  function subscribeToEndpointEvents() {
    endpoint.current.on(
      Voximplant.EndpointEvents.RemoteVideoStreamAdded,
      endpointEvent => {
        console.log('remote video stream added');
        setRemoteVideoStreamId(endpointEvent.videoStream.id);
      },
    );
  }

  const showCallError = reason => {
    Alert.alert('Call failed', `Reason: ${reason}`, [
      {
        text: 'ok',
        onPress: () => {
          navigation.navigate('Contacts');
        },
      },
    ]);
  };

  const goBack = () => {
    navigation.pop();
  };

  console.log(remoteVideoStreamId);

  return (
    <View style={styles.page}>
      <Pressable onPress={goBack} style={styles.backButton}>
        <Ionicons name="chevron-back" color="white" size={25} />
      </Pressable>

      <View style={{flex: 1}}>
        <Voximplant.VideoView
          videoStreamId={remoteVideoStreamId}
          style={styles.cameraPreview}
        />
        <Voximplant.VideoView
          style={styles.selfView}
          videoStreamId={localVideoStreamId}
        />

        <Text style={styles.name}>{user?.user_display_name}</Text>
        <Text style={styles.phoneNumber}>{callState}</Text>
      </View>

      <CallActionBox onHangup={() => call.current.hangup()} />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    height: '100%',
  },
  cameraPreview: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 10,

    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    bottom: 100,
    backgroundColor: 'red',
  },
  selfView: {
    width: 100,
    height: 150,
    backgroundColor: '#ffff6e',

    borderRadius: 10,

    position: 'absolute',
    right: 10,
    top: 100,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 50,
    marginBottom: 15,
  },
  phoneNumber: {
    fontSize: 20,
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 10,
  },

  video: {
    position: 'absolute',
    right: 0,
    top: 0,
    left: 0,
    bottom: 0,
  },
});

export default CallingScreen;
