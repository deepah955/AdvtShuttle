import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, User, Phone, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AuthScreen() {
  const { type } = useLocalSearchParams<{ type: 'rider' | 'driver' }>();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    phone: '',
    photo: null as string | null,
  });

  const handleInputChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange('photo', result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    console.log(`Submitting ${activeTab} for ${type}`, form);
    if (activeTab === 'signup') {
      if (type === 'rider' && !form.email.includes('@vit')) {
        Alert.alert('Error', 'Please use a VIT email');
        return;
      }
      if (form.password !== form.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (type === 'driver' && (!form.employeeId || !form.photo)) {
        Alert.alert('Error', 'Employee ID and photo are required for drivers');
        return;
      }
      // Mock signup - navigate to OTP
      router.push(`/otp?type=${type}`);
    } else {
      // Mock login
      if (type === 'rider' && form.email.includes('@vit') && form.password.length > 0) {
        router.replace('/rider-onboarding');
      } else if (type === 'driver' && form.email && form.password.length > 0) {
        router.replace('/driver-onboarding');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    }
  };

  const renderLoginForm = () => (
    <>
      <View style={styles.inputContainer}>
        <Mail size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder={`${type === 'rider' ? 'VIT ' : ''}Email`}
          value={form.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="email-input"
        />
      </View>
      <View style={styles.inputContainer}>
        <Lock size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={form.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
          testID="password-input"
        />
      </View>
    </>
  );

  const renderSignupForm = () => (
    <>
      <View style={styles.inputContainer}>
        <User size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={form.name}
          onChangeText={(value) => handleInputChange('name', value)}
          testID="name-input"
        />
      </View>
      <View style={styles.inputContainer}>
        <Mail size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder={`${type === 'rider' ? 'VIT ' : ''}Email`}
          value={form.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="email-input"
        />
      </View>
      <View style={styles.inputContainer}>
        <Lock size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={form.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
          testID="password-input"
        />
      </View>
      <View style={styles.inputContainer}>
        <Lock size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          secureTextEntry
          testID="confirm-password-input"
        />
      </View>
      {type === 'driver' && (
        <>
          <View style={styles.inputContainer}>
            <User size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Employee ID"
              value={form.employeeId}
              onChangeText={(value) => handleInputChange('employeeId', value)}
              testID="employee-id-input"
            />
          </View>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={form.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              testID="phone-input"
            />
          </View>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage} testID="photo-button">
            <Camera size={20} color="#007AFF" />
            <Text style={styles.photoButtonText}>Upload Photo</Text>
          </TouchableOpacity>
          {form.photo && (
            <Image source={{ uri: form.photo }} style={styles.photoPreview} testID="photo-preview" />
          )}
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {type === 'rider' ? 'Student / Employee' : 'Driver'} {activeTab === 'login' ? 'Login' : 'Sign Up'}
      </Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'login' && styles.activeTab]}
          onPress={() => setActiveTab('login')}
          testID="login-tab"
        >
          <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
          onPress={() => setActiveTab('signup')}
          testID="signup-tab"
        >
          <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'login' ? renderLoginForm() : renderSignupForm()}
        <TouchableOpacity style={styles.button} onPress={handleSubmit} testID="submit-button">
          <Text style={styles.buttonText}>{activeTab === 'login' ? 'Login' : 'Sign Up'}</Text>
        </TouchableOpacity>
        {activeTab === 'login' && type === 'rider' && (
          <Link href="/auth?type=rider" style={styles.link}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Link>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#007AFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  photoButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    alignSelf: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});