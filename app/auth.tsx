import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, User, Phone, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { signUp, signIn } from '@/services/auth';
import { uploadProfilePhoto } from '@/utils/imageUtils';

export default function AuthScreen() {
  const { type } = useLocalSearchParams<{ type: 'rider' | 'driver' }>();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    phone: '',
    vehicleNo: '',
    registrationNumber: '',
    photo: null as string | null,
  });

  const handleInputChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Camera roll permissions are required to select a photo. Please enable permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker with optimized settings
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Reduced quality for smaller file size
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Validate file size (approximate)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select an image smaller than 5MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        console.log('Image selected:', asset.uri);
        handleInputChange('photo', asset.uri);
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        'Failed to select image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (activeTab === 'signup') {
        // Validation
        if (!form.name || !form.email || !form.password) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }

        if (type === 'rider' && !form.email.includes('@vit')) {
          Alert.alert('Error', 'Please use a VIT email address');
          return;
        }

        if (form.password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters');
          return;
        }

        if (form.password !== form.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }

        if (type === 'driver') {
          if (!form.employeeId || !form.phone) {
            Alert.alert('Error', 'Employee ID and phone number are required for drivers');
            return;
          }
        }

        if (type === 'rider' && !form.registrationNumber) {
          Alert.alert('Error', 'Registration number is required for students/employees');
          return;
        }

        // Upload photo if provided
        let photoURL: string | undefined = undefined;
        if (form.photo) {
          try {
            console.log('Uploading photo...');
            // Use a temporary ID for upload, will be updated after user creation
            const tempId = `temp_${Date.now()}`;
            photoURL = await uploadProfilePhoto(form.photo, tempId);
            console.log('Photo uploaded successfully:', photoURL);
          } catch (error: any) {
            console.error('Photo upload error:', error);
            
            // Show specific error message but continue with account creation
            const errorMsg = error.message || 'Photo upload failed';
            Alert.alert(
              '⚠️ Photo Upload Failed', 
              `${errorMsg}\n\nYour account will still be created. You can add a photo later from your profile.`,
              [{ text: 'Continue', style: 'default' }]
            );
          }
        }

        // Sign up with Firebase
        const userData: any = {
          name: form.name,
          email: form.email,
          role: type === 'driver' ? 'driver' : (form.email.includes('@vit.ac.in') ? 'student' : 'employee'),
          photoURL: photoURL || undefined,
        };

        if (type === 'driver') {
          userData.employeeId = form.employeeId;
          userData.phone = form.phone;
          // Vehicle number will be set in driver dashboard
        } else {
          userData.registrationNumber = form.registrationNumber;
        }

        console.log('Creating account with data:', userData);
        const user = await signUp(form.email, form.password, userData);
        console.log('Account created successfully for user:', user.uid);

        // Navigate immediately after successful signup
        console.log('Navigating to home screen...');
        if (type === 'driver') {
          router.replace('/driver-home');
        } else {
          router.replace('/(tabs)/map');
        }
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('✅ Success!', `Welcome ${form.name}! Your account has been created successfully.`);
        }, 500);

      } else {
        // Login
        if (!form.email || !form.password) {
          Alert.alert('❌ Error', 'Please enter email and password');
          return;
        }

        console.log('Attempting login for:', form.email);
        const user = await signIn(form.email, form.password);
        console.log('Login successful for user:', user.uid);

        // Navigate immediately after successful login
        console.log('Navigating to home screen...');
        if (type === 'driver') {
          router.replace('/driver-home');
        } else {
          router.replace('/(tabs)/map');
        }
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('✅ Login Successful!', 'Welcome back!');
        }, 500);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorTitle = '❌ Authentication Failed';
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.message.includes('email-already-in-use')) {
        errorMessage = 'This email is already registered. Please use the Login tab instead.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.message.includes('wrong-password') || error.message.includes('invalid-credential')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
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
      {type === 'rider' && (
        <View style={styles.inputContainer}>
          <User size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Registration Number"
            value={form.registrationNumber}
            onChangeText={(value) => handleInputChange('registrationNumber', value)}
            testID="registration-input"
          />
        </View>
      )}
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
            <Text style={styles.photoButtonText}>
              {form.photo ? 'Change Photo' : 'Upload Photo (Optional)'}
            </Text>
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
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit} 
          disabled={loading}
          testID="submit-button"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{activeTab === 'login' ? 'Login' : 'Sign Up'}</Text>
          )}
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
  buttonDisabled: {
    backgroundColor: '#999',
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