import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackendUrl } from '../constants';
import 'react-native-gesture-handler';

const SignupScreen = ({ navigation }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userExists, setUserExists] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      console.log('Passwörter stimmen nicht überein');
      return;
    }

    try {
      const response = await fetch(`${BackendUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          password
        })
      });

      if (response.status === 409) {
        setUserExists(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      if (data.token) {
        // Store the JWT token
        await AsyncStorage.setItem('token', data.token);
        console.log('Token saved successfully: ', data.token);
        
        // Navigate to Main screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        setUserExists(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setUserExists(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrieren</Text>
      {userExists && (
        <Text style={styles.errorText}>Benutzer existiert bereits</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Vorname"
        value={firstname}
        onChangeText={setFirstname}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Nachname"
        value={lastname}
        onChangeText={setLastname}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Passwort bestätigen"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Registrieren</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.link}>Bereits ein Konto? Anmelden</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#343a40',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
  },
  link: {
    color: '#007bff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignupScreen;
