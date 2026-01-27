import { View, Text, ImageBackground, TouchableOpacity, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'

const slides = [
  {
    title: 'Wedding Bliss At Your Fingertips',
    description: 'We make your wedding planning journey simple & hassle-free',
  },
  {
    title: 'Plan Everything Easily',
    description: 'Manage venues, vendors, guests and budgets in one place',
  },
  {
    title: 'Beautiful Experiences',
    description: 'Design your dream wedding with elegance and style',
  },
  {
    title: 'Start Your Forever',
    description: 'Let us help you plan the perfect beginning',
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)

  const fadeAnim = useRef(new Animated.Value(1)).current
  const translateAnim = useRef(new Animated.Value(0)).current
  const intervalRef = useRef<any>(null)

  const animateSlide = (nextIndex: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 12,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    setActiveIndex(nextIndex)
  }

  //  Auto infinite slider
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % slides.length
        animateSlide(next)
        return next
      })
    }, 2800) // delay per slide

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Dot click manual override
  const onDotPress = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    animateSlide(index)
    setActiveIndex(index)
  }

  return (
    <ImageBackground
      source={require('../../assets/images/vecteezy_bride-and-groom-embrace-in-the-sunshine_1421231.jpg')}
      resizeMode="cover"
      className="flex-1"
    >
      <StatusBar style="light" />

      <View className="flex-1 bg-black/30 justify-between px-6 py-10">

        {/* Skip */}
        <View className="items-end">
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-white/80 text-sm">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Card */}
        <View className="bg-white/90 rounded-3xl p-9">

          {/* Animated Text */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            }}
          >
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              {slides[activeIndex].title}
            </Text>

            <Text className="text-gray-600 text-center mb-4">
              {slides[activeIndex].description}
            </Text>
          </Animated.View>

          {/* Dots */}
          <View className="flex-row justify-center mb-5">
            {slides.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onDotPress(index)}
                className={`w-2.5 h-2.5 rounded-full mx-1 ${
                  activeIndex === index ? 'bg-gray-900' : 'bg-gray-400'
                }`}
              />
            ))}
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="bg-[#5D603E] py-4 rounded-2xl"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ImageBackground>
  )
}
