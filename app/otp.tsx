import React, { useState, useRef } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';

export default function OTPScreen() {
  const { type } = useLocalSearchParams<{ type: 'rider' | 'driver' }>();
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;

  const handleVerify = () => {
    console.log(`Verifying OTP for ${type}`);
    if (otp === '123456') { // Mock OTP
      setVerified(true);
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          if (type === 'rider') {
            router.replace('/rider-onboarding');
          } else {
            router.replace('/driver-onboarding');
          }
        }, 1000);
      });
    } else {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  if (verified) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.successContainer, { transform: [{ scale: checkScale }] }]}>
          <Check size={80} color="#34C759" />
          <Text style={styles.successText}>Verified!</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Check your email for the 6-digit code</Text>
      <TextInput
        style={styles.input}
        placeholder="000000"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        testID="otp-input"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} testID="verify-button">
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#007AFF',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginTop: 20,
  },
});