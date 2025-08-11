import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { darkTheme, lightTheme, Theme } from '../theme';
import i18n from '../i18n';

const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    titleKey: 'onboarding.step1Title',
    descriptionKey: 'onboarding.step1Description',
    image: require('../../assets/images/sasuke.png'),
    icon: 'book-outline',
  },
  {
    id: 2,
    titleKey: 'onboarding.step2Title',
    descriptionKey: 'onboarding.step2Description',
    image: require('../../assets/images/uchiwa.png'),
    icon: 'heart-outline',
  },
  {
    id: 3,
    titleKey: 'onboarding.step3Title',
    descriptionKey: 'onboarding.step3Description',
    image: require('../../assets/images/sharingan.png'),
    icon: 'camera-outline',
  },
  {
    id: 4,
    titleKey: 'onboarding.step4Title',
    descriptionKey: 'onboarding.step4Description',
    image: require('../../assets/images/sasuke.png'),
    icon: 'phone-portrait-outline',
  },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { theme: themeMode } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      Animated.timing(slideAnimation, {
        toValue: -nextStep * width,
        duration: 350,
        useNativeDriver: true,
      }).start();
      setCurrentStep(nextStep);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
          <Text style={styles.skipText}>{i18n.t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{i18n.t('onboarding.welcome')}</Text>
          <Text style={styles.titleText}>Sasuke's Path</Text>
        </View>

        <View style={styles.stepsContainer}>
          <Animated.View
            style={[
              styles.stepsWrapper,
              {
                transform: [{ translateX: slideAnimation }],
              },
            ]}
          >
            {onboardingSteps.map((step, index) => (
              <View key={step.id} style={styles.step}>
                <View style={styles.imageContainer}>
                  <Image source={step.image} style={styles.stepImage} resizeMode="contain" />
                  <View style={styles.iconContainer}>
                    <Ionicons name={step.icon as any} size={28} color={theme.colors.primary} />
                  </View>
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.stepTitle}>{i18n.t(step.titleKey)}</Text>
                  <Text style={styles.stepDescription}>{i18n.t(step.descriptionKey)}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.indicatorsContainer}>
          <View style={styles.indicators}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton} activeOpacity={0.8}>
          <Text style={styles.nextText}>
            {currentStep === onboardingSteps.length - 1
              ? i18n.t('onboarding.finish')
              : i18n.t('onboarding.next')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 10,
      height: 60,
    },
    skipButton: {
      padding: 12,
      borderRadius: 8,
    },
    skipText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    welcomeSection: {
      alignItems: 'center',
      paddingTop: 20,
      marginBottom: 30,
    },
    welcomeText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    titleText: {
      fontSize: Math.min(width * 0.09, 36),
      fontWeight: 'bold',
      color: theme.colors.primary,
      fontFamily: 'Uchiha',
      textAlign: 'center',
    },
    stepsContainer: {
      flex: 1,
      maxHeight: height * 0.55,
      overflow: 'hidden',
    },
    stepsWrapper: {
      flexDirection: 'row',
      height: '100%',
    },
    step: {
      width,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    imageContainer: {
      width: Math.min(width * 0.5, 200),
      height: Math.min(width * 0.5, 200),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
      position: 'relative',
    },
    stepImage: {
      width: '75%',
      height: '75%',
      opacity: 0.3,
    },
    iconContainer: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: theme.colors.card,
      borderRadius: 25,
      padding: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    textContainer: {
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 30,
    },
    stepDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 10,
    },
    indicatorsContainer: {
      alignItems: 'center',
      paddingVertical: 30,
    },
    indicators: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },
    activeIndicator: {
      backgroundColor: theme.colors.primary,
      width: 20,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 30,
      gap: 10,
      elevation: 3,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    nextText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });