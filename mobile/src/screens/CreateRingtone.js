/**
 * CREATE RINGTONE SCREEN
 * This is where users create their ringtones
 * 
 * STEP-BY-STEP FLOW:
 * 1. User pastes YouTube URL
 * 2. App fetches video info (title, duration, thumbnail)
 * 3. User sees video preview with timeline scrubber
 * 4. User drags to select clip (start/end time)
 * 5. User selects format (MP3, WAV, etc) and quality
 * 6. User clicks "Create" and waits for processing
 * 7. Ringtone saved and ready to use
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalStyles, colors, spacing, fontSize } from '../theme/styles';
import { useRingtoneStore, useUIStore } from '../store/auth';
import * as api from '../services/api';

export default function CreateRingtoneScreen() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [format, setFormat] = useState('mp3');
  const [quality, setQuality] = useState('medium');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('url'); // url, preview, format, processing

  const addRingtone = useRingtoneStore(state => state.addRingtone);
  const setProcessingStatus = useUIStore(state => state.setProcessingStatus);

  /**
   * STEP 1: Fetch video info from YouTube
   */
  const handleFetchVideo = async () => {
    if (!youtubeUrl.trim()) {
      Alert.alert('Required', 'Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    try {
      // In real app, backend would fetch this
      // For now, we'll simulate it
      const info = {
        title: 'Sample Video Title',
        duration: 120,
        thumbnail: 'https://via.placeholder.com/300x200'
      };
      setVideoInfo(info);
      setEndTime(Math.min(10, info.duration));
      setTitle(info.title);
      setStep('preview');
    } catch (error) {
      Alert.alert('Error', 'Could not fetch video information');
    } finally {
      setLoading(false);
    }
  };

  /**
   * STEP 2: Move to format selection
   */
  const handleNextToFormat = () => {
    if (endTime - startTime <= 0) {
      Alert.alert('Invalid', 'End time must be after start time');
      return;
    }
    if (endTime - startTime > 40) {
      Alert.alert('Too Long', 'Maximum ringtone duration is 40 seconds');
      return;
    }
    setStep('format');
  };

  /**
   * STEP 3: Create the ringtone
   */
  const handleCreateRingtone = async () => {
    setLoading(true);
    setStep('processing');

    try {
      const job = await api.createRingtone({
        youtubeUrl,
        startTime,
        endTime,
        title: title || videoInfo.title,
        format,
        quality
      });

      setProcessingStatus({
        jobId: job.id,
        status: 'queued',
        progress: 0
      });

      // Simulate progress polling
      let currentStatus = 'queued';
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5 second interval

      while (currentStatus !== 'completed' && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
        const status = await api.getRingtoneStatus(job.id);
        currentStatus = status.status;
        setProcessingStatus(status);
        attempts++;
      }

      if (currentStatus === 'completed') {
        addRingtone({
          id: job.id,
          title: title || videoInfo.title,
          format,
          quality,
          status: 'completed',
          createdAt: new Date()
        });

        Alert.alert('Success!', 'Your ringtone is ready', [
          { text: 'OK', onPress: () => resetForm() }
        ]);
      } else {
        Alert.alert('Error', 'Processing took too long');
        setStep('format');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create ringtone');
      setStep('format');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setYoutubeUrl('');
    setVideoInfo(null);
    setStartTime(0);
    setEndTime(10);
    setFormat('mp3');
    setQuality('medium');
    setTitle('');
    setStep('url');
  };

  // ========== STEP 1: URL INPUT ==========
  if (step === 'url') {
    return (
      <View style={[globalStyles.screenContainer, styles.container]}>
        <Text style={globalStyles.heading}>Create Ringtone</Text>
        <Text style={globalStyles.body}>
          Paste a YouTube URL to get started
        </Text>

        <TextInput
          style={[globalStyles.input, styles.urlInput]}
          placeholder="https://youtube.com/watch?v=..."
          value={youtubeUrl}
          onChangeText={setYoutubeUrl}
          editable={!loading}
        />

        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary, styles.button]}
          onPress={handleFetchVideo}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <MaterialIcons name="search" size={20} color={colors.surface} />
              <Text style={[globalStyles.buttonText, styles.buttonText]}>
                Fetch Video
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ========== STEP 2: PREVIEW & CLIP SELECTION ==========
  if (step === 'preview' && videoInfo) {
    const duration = endTime - startTime;

    return (
      <ScrollView style={globalStyles.screenContainer}>
        <TouchableOpacity onPress={() => setStep('url')}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>

        <Text style={globalStyles.heading}>Select Clip</Text>

        {/* Video preview */}
        <Image
          source={{ uri: videoInfo.thumbnail }}
          style={styles.thumbnail}
        />

        <Text style={globalStyles.title}>{videoInfo.title}</Text>

        {/* Duration info */}
        <View style={styles.durationInfo}>
          <Text style={globalStyles.body}>
            Duration: {duration.toFixed(1)}s / 40s max
          </Text>
          <Text style={[globalStyles.body, {
            color: duration > 40 ? colors.error : colors.success
          }]}>
            {duration > 40 ? '⚠️ Too long' : '✓ OK'}
          </Text>
        </View>

        {/* Start time slider */}
        <Text style={styles.label}>Start Time: {startTime.toFixed(1)}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={videoInfo.duration - 1}
          step={0.1}
          value={startTime}
          onValueChange={setStartTime}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
        />

        {/* End time slider */}
        <Text style={styles.label}>End Time: {endTime.toFixed(1)}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={startTime + 0.1}
          maximumValue={Math.min(startTime + 40, videoInfo.duration)}
          step={0.1}
          value={endTime}
          onValueChange={setEndTime}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
        />

        {/* Custom title */}
        <Text style={styles.label}>Ringtone Title (optional)</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="My Custom Ringtone"
          value={title}
          onChangeText={setTitle}
        />

        {/* Next button */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary, styles.button]}
          onPress={handleNextToFormat}
        >
          <Text style={globalStyles.buttonText}>Next: Choose Format</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ========== STEP 3: FORMAT & QUALITY SELECTION ==========
  if (step === 'format') {
    return (
      <ScrollView style={globalStyles.screenContainer}>
        <TouchableOpacity onPress={() => setStep('preview')}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>

        <Text style={globalStyles.heading}>Format & Quality</Text>

        {/* Format selection */}
        <Text style={styles.label}>Audio Format</Text>
        {['mp3', 'wav', 'm4a', 'ogg'].map((fmt) => (
          <TouchableOpacity
            key={fmt}
            style={[
              styles.optionButton,
              format === fmt && styles.optionButtonSelected
            ]}
            onPress={() => setFormat(fmt)}
          >
            <Text style={[
              globalStyles.body,
              format === fmt && { color: colors.primary, fontWeight: 'bold' }
            ]}>
              {fmt.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Quality selection */}
        <Text style={[styles.label, { marginTop: spacing.lg }]}>Quality</Text>
        {[
          { value: 'low', label: 'Low (128 kbps)', size: '2MB' },
          { value: 'medium', label: 'Medium (192 kbps)', size: '3MB' },
          { value: 'high', label: 'High (320 kbps)', size: '5MB' }
        ].map(({ value, label, size }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.optionButton,
              quality === value && styles.optionButtonSelected
            ]}
            onPress={() => setQuality(value)}
          >
            <View>
              <Text style={[
                globalStyles.body,
                quality === value && { color: colors.primary, fontWeight: 'bold' }
              ]}>
                {label}
              </Text>
              <Text style={globalStyles.bodySecondary}>{size}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Create button */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary, styles.button]}
          onPress={handleCreateRingtone}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <MaterialIcons name="check" size={20} color={colors.surface} />
              <Text style={[globalStyles.buttonText, styles.buttonText]}>
                Create Ringtone
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ========== STEP 4: PROCESSING ==========
  if (step === 'processing') {
    return (
      <View style={[globalStyles.container, styles.processingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[globalStyles.heading, styles.processingText]}>
          Creating Your Ringtone...
        </Text>
        <Text style={globalStyles.body}>
          This usually takes 5-30 seconds depending on the video length and quality
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start'
  },

  urlInput: {
    marginVertical: spacing.lg
  },

  button: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md
  },

  buttonText: {
    marginLeft: spacing.md
  },

  backLink: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.lg
  },

  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.lg
  },

  durationInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  label: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg
  },

  slider: {
    height: 40,
    marginBottom: spacing.md
  },

  optionButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border
  },

  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#fff9f9'
  },

  processingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  processingText: {
    marginTop: spacing.lg,
    textAlign: 'center'
  }
});
