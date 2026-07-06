import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import LogoImage from '../assets/logo.png';
import GoogleLogo from '../assets/google_logo.png';
import EyeIcon from '../assets/eye.png';
import EyeOffIcon from '../assets/eye_off.png';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({navigation}: Props) {
  const {registerWithEmail, loginWithGoogle} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    if (password !== confirm) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
    } catch (err: unknown) {
      Alert.alert('Registration Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      Alert.alert('Google Sign-In Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#0f0e2a'}} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image source={LogoImage} style={styles.logoImage} />
          <Text style={styles.brandName}>Magadige</Text>
          <Text style={styles.brandSub}>Smart Task Manager</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Create your account</Text>

          <TextInput
            testID="register-email"
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.inputContainer}>
            <TextInput
              testID="register-password"
              style={styles.input}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Image source={showPassword ? EyeOffIcon : EyeIcon} style={styles.eyeIconImage} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              testID="register-confirm"
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#64748b"
              secureTextEntry={!showConfirmPassword}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
              <Image source={showConfirmPassword ? EyeOffIcon : EyeIcon} style={styles.eyeIconImage} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            testID="register-submit"
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.btnGoogle} onPress={handleGoogle} disabled={loading}>
            <Image source={GoogleLogo} style={styles.googleIcon} />
            <Text style={styles.btnGoogleText}>Sign up with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0e2a'},
  scroll: {flexGrow: 1, justifyContent: 'center', padding: 24},
  brand: {alignItems: 'center', marginBottom: 32},
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginBottom: 12,
  },
  brandName: {fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5},
  brandSub: {fontSize: 13, color: '#64748b', marginTop: 2},
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heading: {fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 20},
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 60,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  eyeIconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    opacity: 0.6,
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {opacity: 0.5},
  btnPrimaryText: {color: '#fff', fontWeight: '600', fontSize: 16},
  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 8},
  dividerLine: {flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)'},
  dividerText: {color: '#475569', fontSize: 12},
  btnGoogle: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  btnGoogleText: {color: '#fff', fontWeight: '500', fontSize: 15},
  switchText: {textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 20},
  switchLink: {color: '#818cf8', fontWeight: '600'},
});
