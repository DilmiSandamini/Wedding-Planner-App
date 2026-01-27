import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import { registerUser } from '@/services/authService'
import GlassButton from '@/components/GlassButton'
import PasswordInput from '@/components/PasswordInput'

export default function Register () {
  const router = useRouter()
  const { showLoader, hideLoader, isLoading } = useLoader()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      return showToast('error', 'Validation Error', 'Please fill all fields')
    }
    if (password !== confirmPassword) {
      return showToast('error', 'Validation Error', 'Passwords do not match')
    }

    // showLoader()
    try {
      await registerUser(fullName, email, password)
      showToast('success', 'Account Created', 'Welcome!')
      router.replace('/(auth)/login')
    } catch (err: any) {
      showToast('error', 'Register Error', err.message)
    } finally {
      // hideLoader()
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require('../../assets/images/7d1686e3c2c889d1e6d57ccada27631b.webp')} // same bg as login
        resizeMode="cover"
        className="flex-1"
      >
        {/* Dark overlay */}
        <View className="flex-1 bg-black/40 justify-center items-center p-6">

          {/* Register Card */}
          <View className="w-full bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl">

            <Text className="text-3xl font-bold mb-6 text-center text-gray-900">
              Register
            </Text>

            <TextInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#6B7280"
              className="border border-gray-300 p-3 mb-4 rounded-xl bg-white"
            />

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#6B7280"
              className="border border-gray-300 p-3 mb-4 rounded-xl bg-white"
            />

            <PasswordInput
              password={password}
              setPassword={setPassword}
              placeholder="Password"
            />

            <PasswordInput
              password={confirmPassword}
              setPassword={setConfirmPassword}
              placeholder="Confirm Password"
            />

            <GlassButton
              title={isLoading ? 'Please wait...' : 'Register'}
              onPress={handleRegister}
              loading={isLoading}
              bgColor="bg-[#5D603E]"
            />

            {/* Login redirect */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-700">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text className="text-green-900 font-semibold">Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  )
}
