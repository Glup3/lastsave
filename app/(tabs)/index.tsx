import { Image } from 'expo-image';
import { Alert, Button, StyleSheet, Text } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initWhisper, WhisperContext } from 'whisper.rn/index.js'
import { useEffect, useState } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  IOSOutputFormat,
  AudioQuality,
} from 'expo-audio';

export default function HomeScreen() {
  const [whisperContext, setWhisperContext] = useState<WhisperContext | null>(
    null
  );
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [transcription, setTranscription] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const audioRecorder = useAudioRecorder({
    extension: '.wav',
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    android: {
      outputFormat: 'default',
      audioEncoder: 'default',
    },
    ios: {
      extension: '.wav',
      outputFormat: IOSOutputFormat.LINEARPCM,
      audioQuality: AudioQuality.MAX,
      sampleRate: 16000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  })
  // const audioRecorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, extension: '.wav' })
  const recorderState = useAudioRecorderState(audioRecorder)
  const audioPlayer = useAudioPlayer(audioRecorder.uri || '')
  const playerStatus = useAudioPlayerStatus(audioPlayer)

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
    handleGrantPermissions()
  }, [])

  useEffect(() => {
    (async () => {
      const status = await AudioModule.getRecordingPermissionsAsync()
      setPermissionsGranted(status.granted)
    })()
  }, [])

  const handleGrantPermissions = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync()
    if (!status.granted) {
      Alert.alert('Permission to access microphone was denied')
    }
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    })
  }

  const handleRecordingToggle = async () => {
    if (recorderState.isRecording) {
      await audioRecorder.stop();
      await transcribeAudio();
    } else {
      try {
        await audioRecorder.prepareToRecordAsync()
        audioRecorder.record()
      } catch (e) {
        console.error(e)
        Alert.alert('Recording failed', 'Unable to start the recording')
      }
    }
  }

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const transcribeAudio = async () => {
    if (!whisperContext || !audioRecorder.uri) {
      return
    }

    setIsTranscribing(true)

    try {
      const { promise } = whisperContext.transcribe(audioRecorder.uri, { language: 'en' })
      const { result } = await promise
      console.log(result)
      setTranscription(result)
    } catch (error) {
      console.error('Transcription error:', error)
      Alert.alert('Transcription failed', 'Could not transcribe audio')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handlePlayback = () => {
    console.log('play!', audioRecorder.uri)
    audioPlayer.replace(audioRecorder.uri)
    if (playerStatus.playing) {
      audioPlayer.pause()
    } else {
      audioPlayer.play()
    }
  }

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
        <Button title="Permissions" onPress={handleGrantPermissions} />
        <Text className='text-red-500'>Permissions {permissionsGranted ? 'granted' : 'denied'}</Text>
      </ThemedView>

      <ThemedView style={styles.recordingContainer}>
        <Button
          title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
          onPress={handleRecordingToggle}
          disabled={!permissionsGranted}
        />
        <ThemedText style={styles.durationText}>
          Duration: {formatDuration(recorderState.durationMillis)}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.recordingContainer}>
        <Button
          title={playerStatus.playing ? 'Pause' : 'Play Recording'}
          onPress={handlePlayback}
          disabled={!audioRecorder.uri}
        />
        <Button
          title="Transcribe"
          onPress={transcribeAudio}
          disabled={!audioRecorder.uri}
        />
      </ThemedView>

      {(isTranscribing || transcription) && (
        <ThemedView className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Transcription
          </ThemedText>
          {isTranscribing ? (
            <ThemedText className="text-gray-600 dark:text-gray-400 italic">
              Transcribing audio...
            </ThemedText>
          ) : (
            <ThemedText className="text-base text-gray-900 dark:text-gray-100">
              {transcription}
            </ThemedText>
          )}
        </ThemedView>
      )}
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
  recordingContainer: {
    gap: 12,
    marginTop: 16,
  },
  durationText: {
    fontSize: 16,
  },
});
