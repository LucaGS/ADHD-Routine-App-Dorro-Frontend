import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackendUrl } from '../constants';
import 'react-native-gesture-handler'; 

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false); 

  const handleLogin = () => {
    console.log('Email:', email);
    console.log('Password:', password);
    fetch(`${BackendUrl}?action=LoginUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
      .then((response) => {
        console.log('Raw Response:', response);
        return response.text(); // Antwort als Text verarbeiten
      })
      .then((text) => {
        console.log('Raw Text:', text);
        const jsonData = text ? JSON.parse(text) : {}; // JSON parsen, falls vorhanden
        console.log('Parsed JSON:', jsonData);
        return jsonData;
      })
      .then((data) => {
        // Extrahiere userId aus data-Objekt
        if (data.status === 'success' && data.data?.UserId) {
          console.log('Success:', data);
          AsyncStorage.setItem('userid', data.data.UserId.toString())
            .then(() => {
              console.log('User ID saved to AsyncStorage:', data.data.UserId);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { userId: data.data.UserId } }],
              });
              
            })
            .catch((error) => {
              console.error('Error saving user ID to AsyncStorage:', error);
            });
        } else {
          setLoginError(true);  
          console.log('No user ID returned from login.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoginError(true);
      });
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anmelden</Text>
      <TextInput
        style={styles.input}
        placeholder="email-adress"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Anmelden</Text>
      </TouchableOpacity>

      {loginError && ( 
        <Text style={styles.errorText}>
          Ungültiger Benutzername oder Passwort.
        </Text>
      )}

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.link}>Noch kein Konto? Registrieren</Text>
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
    backgroundColor: '#007bff',
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
    marginTop: 10,
  },
});

export default LoginScreen;