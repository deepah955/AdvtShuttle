import React, { useState, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Truck, Shield, MapPin } from 'lucide-react-native';
const slides = [
  {
    icon: Truck,
    title: 'Driver Mode',
    description: 'Enable location sharing to provide real-time updates to riders.',
  },
  {
    icon: Shield,
    title: 'Privacy & Safety',
    description: 'Your location is shared only during active shifts. Emergency features available.',
  },
  {
    icon: MapPin,
    title: 'Route Management',
    description: 'Select routes, mark pickups, and manage your shuttle operations.',
  },
];

export default function DriverOnboardingScreen() {
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
      router.replace('/driver-home');
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
        <IconComponent size={80} color="#34C759" />
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
            {currentSlide === slides.length - 1 ? 'Start Driving' : 'Next'}
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
    backgroundColor: '#34C759',
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
    color: '#34C759',
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
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#34C759',
  },
});