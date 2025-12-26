import { Image } from 'expo-image';
import { Alert, Button, Platform, StyleSheet, Text } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initWhisper, WhisperContext } from 'whisper.rn/index.js'
import { useEffect, useState } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

export default function HomeScreen() {
  const [whisperContext, setWhisperContext] = useState<WhisperContext | null>(
    null
  );
  const [permissionsGranted, setPermissionsGranted] = useState(false)

  const initializeModel = async () => {
    try {
      const context = await initWhisper({
        filePath: require('@/assets/whisper-models/ggml-tiny-q8_0.bin')
      })
      setWhisperContext(context)
    } catch (error) {
      console.error('failed model init:', error)
    }
  }

  useEffect(() => {
    initializeModel()
  }, [])

  useEffect(() => {
    (async () => {
      const status = await AudioModule.getRecordingPermissionsAsync()
      setPermissionsGranted(status.granted)
    })()
  }, [])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hi Anna!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView>
        <Button title="Permissions" onPress={async () => {
          const status = await AudioModule.requestRecordingPermissionsAsync()
          if (!status.granted) {
            Alert.alert('Permission to access microphone was denied')
          }
          setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: true,
          })
        }} />
        <Text className='text-red-500'>Permissions {permissionsGranted ? 'granted' : 'denied'}</Text>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
