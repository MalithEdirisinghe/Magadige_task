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
} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({navigation}: Props) {
  const {loginWithEmail, loginWithGoogle} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    if (!email || !password) {return Alert.alert('Error', 'Please fill in all fields');}
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      Alert.alert('Login Failed', err instanceof Error ? err.message : 'Unknown error');
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
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>
          <Text style={styles.brandName}>Magadige</Text>
          <Text style={styles.brandSub}>Smart Task Manager</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>

          <TextInput
            testID="login-email"
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            testID="login-password"
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            testID="login-submit"
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleEmail}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            testID="login-google"
            style={styles.btnGoogle}
            onPress={handleGoogle}
            disabled={loading}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.btnGoogleText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="go-register"
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchText}>
              Don't have an account?{' '}
              <Text style={styles.switchLink}>Sign up</Text>
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
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  logoIcon: {fontSize: 24, color: '#fff'},
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
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 8,
  },
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
  googleG: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4285F4',
  },
  btnGoogleText: {color: '#fff', fontWeight: '500', fontSize: 15},
  switchText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
    marginTop: 20,
  },
  switchLink: {color: '#818cf8', fontWeight: '600'},
});
