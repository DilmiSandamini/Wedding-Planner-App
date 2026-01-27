import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground
} from 'react-native'
import { useRouter } from 'expo-router'
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import GlassButton from '@/components/GlassButton'
import PasswordInput from '@/components/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { Ionicons } from '@expo/vector-icons'


export default function Login () {
  const router = useRouter()
  const { login } = useAuth()
  const { showLoader, hideLoader, isLoading } = useLoader()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      return showToast(
        'error',
        'Validation Error',
        'Please enter email and password'
      )
    }

    // showLoader()
    try {
      await login(email, password)
      router.replace('/(dashboard)/home')
    } catch (err: any) {
      showToast('error', 'Login Error', err.message)
    } finally {
      // hideLoader()
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require('../../assets/images/7d1686e3c2c889d1e6d57ccada27631b.webp')}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Dark overlay */}
        <View className="flex-1 bg-black/40 justify-center items-center p-6">

          {/* Login Card */}
          <View className="w-full bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl">

            <Text className="text-3xl font-bold mb-6 text-center text-gray-900">
              Login
            </Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#6B7280"
              className="border border-gray-300 p-3 mb-4 rounded-xl bg-white"
            />

            <PasswordInput password={password} setPassword={setPassword} />

            <GlassButton
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              bgColor="bg-[#5D603E]"
            />

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <Text className="mx-2 text-gray-600 text-sm">OR</Text>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </View>

            {/* Google Login (UI only) */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-row items-center justify-center border border-gray-300 py-3 rounded-xl bg-white"
            >
              <Ionicons name="logo-google" size={22} color="#DB4437" />
              <Text className="ml-3 text-gray-800 font-semibold">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Register */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-700">Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/register')}
              >
                <Text className="text-green-900 font-semibold">Register</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  )
}
