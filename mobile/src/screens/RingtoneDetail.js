/**
 * RINGTONE DETAIL SCREEN
 * View detailed information about a ringtone
 * Rate, review, and manage the ringtone
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalStyles, colors, spacing, fontSize } from '../theme/styles';
import * as api from '../services/api';

export default function RingtoneDetailScreen({ route, navigation }) {
  const { id, isPublic } = route.params;
  const [ringtone, setRingtone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    loadRingtone();
  }, []);

  /**
   * Load ringtone details
   */
  const loadRingtone = async () => {
    try {
      const details = await api.getRingtoneDetails(id);
      setRingtone(details);
    } catch (error) {
      Alert.alert('Error', 'Failed to load ringtone');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit rating and review
   */
  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Required', 'Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.rateRingtone(id, rating, review);
      Alert.alert('Success', 'Rating submitted!');
      setShowRatingModal(false);
      setRating(0);
      setReview('');
      loadRingtone();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ringtone) {
    return (
      <View style={[globalStyles.container, styles.centerContainer]}>
        <Text style={globalStyles.body}>Ringtone not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.placeholderButton} />
      </View>

      {/* Ringtone Info */}
      <View style={[globalStyles.card, styles.infoCard]}>
        <View style={styles.titleContainer}>
          <Text style={globalStyles.heading}>{ringtone.title}</Text>
          {isPublic && ringtone.creator && (
            <Text style={globalStyles.bodySecondary}>by {ringtone.creator}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <InfoBadge icon="timer" label="Duration" value={`${ringtone.duration}s`} />
          <InfoBadge icon="storage" label="Format" value={ringtone.format.toUpperCase()} />
          <InfoBadge icon="volume-up" label="Quality" value={ringtone.quality} />
        </View>

        {/* Rating and Downloads */}
        {isPublic && (
          <View style={styles.statsRow}>
            <InfoBadge
              icon="star"
              label="Rating"
              value={`${(ringtone.rating || 0).toFixed(1)} ⭐`}
            />
            <InfoBadge
              icon="download"
              label="Downloads"
              value={ringtone.downloads || 0}
            />
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSecondary, styles.actionButton]}
          onPress={() => {}}
        >
          <MaterialIcons name="play-circle" size={20} color={colors.surface} />
          <Text style={[globalStyles.buttonText, styles.buttonTextWithIcon]}>
            Preview
          </Text>
        </TouchableOpacity>

        {isPublic ? (
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary, styles.actionButton]}
            onPress={() => setShowRatingModal(true)}
          >
            <MaterialIcons name="star-outline" size={20} color={colors.surface} />
            <Text style={[globalStyles.buttonText, styles.buttonTextWithIcon]}>
              Rate
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary, styles.actionButton]}
            onPress={() => {}}
          >
            <MaterialIcons name="share" size={20} color={colors.surface} />
            <Text style={[globalStyles.buttonText, styles.buttonTextWithIcon]}>
              Share
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {ringtone.description && (
        <View style={[globalStyles.card, styles.descriptionCard]}>
          <Text style={globalStyles.title}>Description</Text>
          <Text style={globalStyles.body}>{ringtone.description}</Text>
        </View>
      )}

      {/* Reviews Section */}
      {isPublic && (
        <View style={styles.section}>
          <Text style={globalStyles.title}>Recent Reviews</Text>
          {ringtone.reviews && ringtone.reviews.length > 0 ? (
            ringtone.reviews.slice(0, 3).map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))
          ) : (
            <Text style={globalStyles.bodySecondary}>No reviews yet</Text>
          )}
        </View>
      )}

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        rating={rating}
        onRatingChange={setRating}
        review={review}
        onReviewChange={setReview}
        onSubmit={handleSubmitRating}
        loading={submitting}
      />
    </ScrollView>
  );
}

/**
 * Info Badge Component
 */
function InfoBadge({ icon, label, value }) {
  return (
    <View style={styles.badge}>
      <MaterialIcons name={icon} size={18} color={colors.primary} />
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}</Text>
    </View>
  );
}

/**
 * Review Card Component
 */
function ReviewCard({ review }) {
  return (
    <View style={[globalStyles.card, styles.reviewCard]}>
      <View style={styles.reviewHeader}>
        <Text style={globalStyles.title}>{review.author}</Text>
        <Text style={styles.stars}>{'⭐'.repeat(review.score)}</Text>
      </View>
      <Text style={globalStyles.body}>{review.text}</Text>
    </View>
  );
}

/**
 * Rating Modal Component
 */
function RatingModal({ visible, onClose, rating, onRatingChange, review, onReviewChange, onSubmit, loading }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={globalStyles.heading}>Rate This Ringtone</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Star Rating */}
          <View style={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => onRatingChange(star)}
              >
                <Text style={styles.starButton}>
                  {star <= rating ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Review Text */}
          <TextInput
            style={styles.reviewInput}
            placeholder="Write a review (optional)"
            placeholderTextColor={colors.textSecondary}
            value={review}
            onChangeText={onReviewChange}
            multiline
            maxLength={500}
          />

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonOutline]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={globalStyles.buttonTextOutline}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={globalStyles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },

  backButton: {
    padding: spacing.sm
  },

  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text
  },

  placeholderButton: {
    width: 40
  },

  infoCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg
  },

  titleContainer: {
    marginBottom: spacing.lg
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.md
  },

  badge: {
    alignItems: 'center',
    flex: 1
  },

  badgeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },

  badgeValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs
  },

  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row'
  },

  buttonTextWithIcon: {
    marginLeft: spacing.sm
  },

  descriptionCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md
  },

  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg
  },

  reviewCard: {
    marginBottom: spacing.md
  },

  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },

  stars: {
    fontSize: fontSize.base
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '80%'
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },

  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg
  },

  starButton: {
    fontSize: 40
  },

  reviewInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg
  },

  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md
  }
});
