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
import { registerUser } from '@/services/authService'
import { Ionicons } from '@expo/vector-icons'

export default function Register() {
  const router = useRouter()
  const { isLoading } = useLoader()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(50)).current
  const sparkleAnim = useRef(new Animated.Value(1)).current
  const floatAnim = useRef(new Animated.Value(0)).current

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

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start()

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        })
      ])
    ).start()
  }, [])

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      return showToast('error', 'Validation Error', 'Please fill all fields')
    }
    if (password !== confirmPassword) {
      return showToast('error', 'Validation Error', 'Passwords do not match')
    }

    try {
      await registerUser(fullName, email, password)
      showToast('success', 'Account Created', 'Welcome to your journey!')
      router.replace('/(auth)/login')
    } catch (err: any) {
      showToast('error', 'Register Error', err.message)
    }
  }

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10]
  })

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
              top: -120,
              left: -70,
              width: 300,
              height: 300,
              backgroundColor: '#FFC0CB',
              opacity: 0.2
            }}
          />
          <View 
            className="absolute rounded-full"
            style={{
              bottom: -140,
              right: -80,
              width: 350,
              height: 350,
              backgroundColor: '#FFB6C1',
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
            {/* Header with Sparkle Icon */}
            <View className="items-center mb-6">
              <Animated.View
                style={{
                  transform: [
                    { scale: sparkleAnim },
                    { translateY: floatY }
                  ],
                  marginBottom: 16
                }}
              >
                <View 
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255, 192, 203, 0.3)',
                    shadowColor: '#FF69B4',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16
                  }}
                >
                  <Ionicons name="sparkles" size={40} color="#FF1493" />
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
                Begin Your Journey
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
                Create your wedding planner account
              </Text>
            </View>

            {/* Register Card */}
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
              {/* Full Name Input */}
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
                  Full Name
                </Text>
                <View
                  className="rounded-2xl flex-row items-center px-4 py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderWidth: 1.5,
                    borderColor: '#FFD4D4'
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#B76E79" />
                  <TextInput
                    placeholder="Your full name"
                    value={fullName}
                    onChangeText={setFullName}
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
                    placeholder="Create a password"
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

              {/* Confirm Password Input */}
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
                  Confirm Password
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
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#D4A5A5"
                    className="flex-1 ml-3 mr-2"
                    style={{
                      fontFamily: 'System',
                      fontSize: 15,
                      color: '#8B4555'
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                      size={20} 
                      color="#B76E79" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
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
                  colors={['#FFC0CB', '#FF69B4', '#FF1493']}
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
                          Create Account
                        </Text>
                        <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Terms */}
              <Text
                className="text-center px-6 mb-4"
                style={{
                  fontFamily: 'System',
                  fontSize: 11,
                  fontWeight: '300',
                  color: '#B76E79',
                  lineHeight: 16,
                  letterSpacing: 0.2
                }}
              >
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text
                style={{
                  fontFamily: 'System',
                  fontSize: 14,
                  fontWeight: '300',
                  color: '#A85D69'
                }}
              >
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#FF1493',
                    letterSpacing: 0.3
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Decorative Bottom */}
            <View className="items-center mt-6">
              <View className="flex-row items-center">
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
                <View className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: '#FFB6C1' }} />
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Corner Decorations */}
        <View className="absolute top-8 right-6" style={{ opacity: 0.15 }}>
          <Text style={{ fontSize: 28 }}>✨</Text>
        </View>
        <View className="absolute bottom-8 left-6" style={{ opacity: 0.15 }}>
          <Text style={{ fontSize: 32 }}>💝</Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}