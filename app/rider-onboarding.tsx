import React, { useState, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Shield, Bell } from 'lucide-react-native';
const slides = [
  {
    icon: MapPin,
    title: 'Live Tracking',
    description: 'See real-time shuttle locations and get accurate ETAs for your routes.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your location data is used only for shuttle tracking and is kept secure.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Get alerts when your shuttle is approaching or when routes change.',
  },
];

export default function RiderOnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide(currentSlide + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      router.replace('/route-selection');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide(currentSlide - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentSlide && styles.activeDot]}
            />
          ))}
        </View>
      </View>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <IconComponent size={80} color="#007AFF" />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={prevSlide}
          disabled={currentSlide === 0}
          testID="prev-button"
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={nextSlide} testID="next-button">
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  dots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007AFF',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});