import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '@/hooks/useAuth'
import { Ionicons } from '@expo/vector-icons'

export default function WelcomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  
  const fadeAnim = useRef(new Animated.Value(0)).current
  const hoverAnim = useRef(new Animated.Value(0)).current 
  const shineAnim = useRef(new Animated.Value(0.4)).current 

  useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1500,
    useNativeDriver: true,
  }).start()

  Animated.loop(
    Animated.sequence([
      Animated.timing(hoverAnim, {
        toValue: -15,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(hoverAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start()

  Animated.loop(
    Animated.sequence([
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(shineAnim, {
        toValue: 0.4,
        duration: 1500,
        useNativeDriver: true,
      }),
    ])
  ).start()

  const timer = setTimeout(() => {
    router.replace('/(auth)/onboarding')
  }, 4000)

  return () => clearTimeout(timer)
}, [])

  return (
    <View className="flex-1 justify-center items-center bg-[#5D603E]">
        <StatusBar style="light" translucent backgroundColor="transparent" /> 

      <Animated.View style={{ opacity: fadeAnim }} className="items-center">
        {/* Hovering and Shining Icon Container */}
        <Animated.View 
          style={{ 
            transform: [{ translateY: hoverAnim }], 
            opacity: shineAnim 
          }} 
          className="w-40 h-40 rounded-full bg-white/20 items-center justify-center border border-white/40 shadow-2xl mb-8"
        >
          <Ionicons name="infinite-outline" size={80} color="white" />
        </Animated.View>

        {/* Text Section */}
        <View className="items-center">
          <Text className="text-white text-4xl font-light tracking-[8px]">
            WEDDING
          </Text>
          <View className="w-24 h-[1px] bg-white/40 my-3" />
          <Text className="text-white text-lg font-bold tracking-[10px] ml-2">
            PLANNER
          </Text>
        </View>

        <Text className="text-white/60 mt-6 italic text-sm text-center px-10">
          Your perfect day, planned to perfection.
        </Text>
      </Animated.View>

      <View className="absolute bottom-10">
        <Text className="text-white/30 tracking-[3px] text-xs uppercase">Version 1.0</Text>
      </View>
    </View>
  )
}