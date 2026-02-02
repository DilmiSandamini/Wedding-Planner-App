import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import { useAuth } from '@/hooks/useAuth'
import { Ionicons } from '@expo/vector-icons'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/services/firebaseConfig'

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const { isLoading } = useLoader()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(50)).current
  const heartScale = useRef(new Animated.Value(1)).current
  const inputFocus = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start()

    // Heartbeat animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start()
  }, [])

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return showToast(
        'error',
        'Validation Error',
        'Please enter email and password'
      )
    }

    try {
      await login(email, password)
      
      const currentUser = auth.currentUser;

      if (currentUser) {
        const docRef = doc(db, "wedding_plans", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          router.replace('/(dashboard)/home')
        } else {
          router.replace('/(auth)/weddingdetails')
        }
      }
      
    } catch (err: any) {
      showToast('error', 'Login Error', err.message)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        
        {/* Gradient Background */}
        <LinearGradient
          colors={['#FFF5F5', '#FFE8E8', '#FFF0F0']}
          locations={[0, 0.5, 1]}
          className="flex-1 absolute inset-0"
        />

        {/* Decorative Background Elements */}
        <View className="absolute inset-0">
          <View 
            className="absolute rounded-full"
            style={{
              top: -100,
              right: -80,
              width: 280,
              height: 280,
              backgroundColor: '#FFB6C1',
              opacity: 0.2
            }}
          />
          <View 
            className="absolute rounded-full"
            style={{
              bottom: -120,
              left: -60,
              width: 320,
              height: 320,
              backgroundColor: '#E8C4C4',
              opacity: 0.15
            }}
          />
        </View>

        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideUp }]
            }}
          >
            {/* Header with Heart Icon */}
            <View className="items-center mb-8">
              <Animated.View
                style={{
                  transform: [{ scale: heartScale }],
                  marginBottom: 16
                }}
              >
                <View 
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255, 182, 193, 0.3)',
                    shadowColor: '#FF69B4',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16
                  }}
                >
                  <Ionicons name="heart" size={40} color="#FF1493" />
                </View>
              </Animated.View>

              <Text
                style={{
                  fontFamily: 'System',
                  fontSize: 36,
                  fontWeight: '200',
                  color: '#8B4555',
                  letterSpacing: 3,
                  marginBottom: 8
                }}
              >
                Welcome Back
              </Text>

              <View className="flex-row items-center my-2">
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
                <Ionicons name="diamond" size={8} color="#FF69B4" style={{ marginHorizontal: 6 }} />
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
              </View>

              <Text
                style={{
                  fontFamily: 'System',
                  fontSize: 14,
                  fontWeight: '300',
                  color: '#B76E79',
                  letterSpacing: 1
                }}
              >
                Continue planning your dream day
              </Text>
            </View>

            {/* Login Card */}
            <View
              className="rounded-3xl p-6"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                shadowColor: '#FFB6C1',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 5
              }}
            >
              {/* Email Input */}
              <View className="mb-4">
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 13,
                    fontWeight: '500',
                    color: '#8B4555',
                    marginBottom: 8,
                    letterSpacing: 0.5
                  }}
                >
                  Email Address
                </Text>
                <View
                  className="rounded-2xl flex-row items-center px-4 py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderWidth: 1.5,
                    borderColor: '#FFD4D4'
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#B76E79" />
                  <TextInput
                    placeholder="your@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#D4A5A5"
                    className="flex-1 ml-3"
                    style={{
                      fontFamily: 'System',
                      fontSize: 15,
                      color: '#8B4555'
                    }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 13,
                    fontWeight: '500',
                    color: '#8B4555',
                    marginBottom: 8,
                    letterSpacing: 0.5
                  }}
                >
                  Password
                </Text>
                <View
                  className="rounded-2xl flex-row items-center px-4 py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderWidth: 1.5,
                    borderColor: '#FFD4D4'
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="#B76E79" />
                  <TextInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#D4A5A5"
                    className="flex-1 ml-3 mr-2"
                    style={{
                      fontFamily: 'System',
                      fontSize: 15,
                      color: '#8B4555'
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-1"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                      size={20} 
                      color="#B76E79" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="mb-4"
                style={{
                  shadowColor: '#FF69B4',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 5
                }}
              >
                <LinearGradient
                  colors={['#FFB6C1', '#FF69B4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-2xl py-4"
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading ? (
                      <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                    ) : (
                      <>
                        <Text
                          style={{
                            fontFamily: 'System',
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#FFFFFF',
                            letterSpacing: 1.5
                          }}
                        >
                          Sign In
                        </Text>
                        <Ionicons name="heart" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-5">
                <View className="flex-1 h-[1px]" style={{ backgroundColor: '#FFD4D4' }} />
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 12,
                    fontWeight: '400',
                    color: '#B76E79',
                    marginHorizontal: 12,
                    letterSpacing: 1
                  }}
                >
                  OR
                </Text>
                <View className="flex-1 h-[1px]" style={{ backgroundColor: '#FFD4D4' }} />
              </View>

              {/* Google Login */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-2xl py-3 flex-row items-center justify-center mb-4"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 15,
                    fontWeight: '500',
                    color: '#8B4555',
                    marginLeft: 10,
                    letterSpacing: 0.5
                  }}
                >
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-8">
              <Text
                style={{
                  fontFamily: 'System',
                  fontSize: 14,
                  fontWeight: '300',
                  color: '#A85D69'
                }}
              >
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#FF1493',
                    letterSpacing: 0.3
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Decorative Bottom */}
            <View className="items-center mt-8">
              <View className="flex-row items-center">
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
                <View className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: '#FFB6C1' }} />
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Corner Decorations */}
        <View className="absolute top-8 left-6" style={{ opacity: 0.15 }}>
          <Text style={{ fontSize: 28 }}>🌸</Text>
        </View>
        <View className="absolute bottom-8 right-6" style={{ opacity: 0.15 }}>
          <Text style={{ fontSize: 32 }}>💕</Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}