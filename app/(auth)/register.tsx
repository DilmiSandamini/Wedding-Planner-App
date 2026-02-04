import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
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
import { Ionicons } from '@expo/vector-icons'

// Custom Hooks and Utilities
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import { registerUser } from '@/services/authService'

// Reusable Components
import FormInput from '@/components/FormInput'
import PasswordInput from '@/components/PasswordInput'
import GlassButton from '@/components/GlassButton'

export default function Register() {
  const router = useRouter()
  const { isLoading } = useLoader()

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(50)).current
  const sparkleAnim = useRef(new Animated.Value(1)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    startAnimations()
  }, [])

  const startAnimations = () => {
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
  }

  const handleRegister = async () => {
    // Validate all fields
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      return showToast('error', 'Validation Error', 'Please fill all fields')
    }

    // Check password match
    if (password !== confirmPassword) {
      return showToast('error', 'Validation Error', 'Passwords do not match')
    }

    try {
      await registerUser(fullName.trim(), email.trim(), password)
      showToast('success', 'Account Created', 'Welcome to your journey!')
      router.replace('/(auth)/login')
    } catch (err: any) {
      showToast('error', 'Register Error', err.message)
    }
  }

  const navigateToLogin = () => {
    router.replace('/(auth)/login')
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
        
        {/* Background */}
        <GradientBackground />
        <DecorativeCircles />

        {/* Main Content */}
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
            {/* Header */}
            <Header sparkleAnim={sparkleAnim} floatY={floatY} />

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
              {/* Full Name Input - Using FormInput component */}
              <FormInput
                label="Full Name"
                placeholder="Your full name"
                value={fullName}
                onChangeText={setFullName}
                icon="person-outline"
              />

              {/* Email Input - Using FormInput component */}
              <FormInput
                label="Email Address"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
              />

              {/* Password Input - Using PasswordInput component */}
              <PasswordInput
                label="Password"
                password={password}
                setPassword={setPassword}
                placeholder="Create a password"
              />

              {/* Confirm Password Input - Using PasswordInput component */}
              <PasswordInput
                label="Confirm Password"
                password={confirmPassword}
                setPassword={setConfirmPassword}
                placeholder="Confirm your password"
              />

              {/* Register Button - Using GlassButton component */}
              <GlassButton
                title="Create Account"
                onPress={handleRegister}
                loading={isLoading}
                icon="sparkles"
              />

              {/* Terms */}
              <TermsText />
            </View>

            {/* Login Link */}
            <LoginLink onPress={navigateToLogin} />

            {/* Decorative Bottom */}
            <DecorativeBottom />
          </Animated.View>
        </ScrollView>

        {/* Corner Decorations */}
        <CornerDecorations />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

// ==================== Reusable Sub-Components ====================

const GradientBackground = () => (
  <LinearGradient
    colors={['#FFF5F5', '#FFE8E8', '#FFF0F0']}
    locations={[0, 0.5, 1]}
    className="flex-1 absolute inset-0"
  />
)

const DecorativeCircles = () => (
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
)

interface HeaderProps {
  sparkleAnim: Animated.Value
  floatY: Animated.AnimatedInterpolation<number>
}

const Header = ({ sparkleAnim, floatY }: HeaderProps) => (
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
        fontSize: 32,
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
)

const TermsText = () => (
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
)

interface LoginLinkProps {
  onPress: () => void
}

const LoginLink = ({ onPress }: LoginLinkProps) => (
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
    <TouchableOpacity onPress={onPress}>
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
)

const DecorativeBottom = () => (
  <View className="items-center mt-6">
    <View className="flex-row items-center">
      <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
      <View className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: '#FFB6C1' }} />
      <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
    </View>
  </View>
)

const CornerDecorations = () => (
  <>
    <View className="absolute top-8 right-6" style={{ opacity: 0.15 }}>
      <Text style={{ fontSize: 28 }}>✨</Text>
    </View>
    <View className="absolute bottom-8 left-6" style={{ opacity: 0.15 }}>
      <Text style={{ fontSize: 32 }}>💝</Text>
    </View>
  </>
)