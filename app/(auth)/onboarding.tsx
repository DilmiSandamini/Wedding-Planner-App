import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

const slides = [
  {
    emoji: '💍',
    title: 'Your Dream Day',
    subtitle: 'Plan Every Detail',
    description: 'From venue to vows, organize your perfect wedding with elegance and ease',
    color: '#FFB6C1',
    accentColor: '#FF69B4',
    icon: 'heart-circle'
  },
  {
    emoji: '✨',
    title: 'Beautiful Moments',
    subtitle: 'Cherish Forever',
    description: 'Track tasks, manage guests, and create memories that last a lifetime',
    color: '#FFC0CB',
    accentColor: '#FF1493',
    icon: 'sparkles'
  },
  {
    emoji: '🌸',
    title: 'Stress-Free Planning',
    subtitle: 'We Guide You',
    description: 'Smart checklists and timelines keep everything organized and on track',
    color: '#FFD4E5',
    accentColor: '#E8A0BF',
    icon: 'calendar'
  },
  {
    emoji: '💝',
    title: 'Begin Your Journey',
    subtitle: 'Together Forever',
    description: 'Start planning the celebration of your love story today',
    color: '#E8C4C4',
    accentColor: '#C57B88',
    icon: 'infinite'
  }
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const floatAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  // Particle animations for each slide
  const particles = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0)
    }))
  ).current

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start()

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start()

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: activeIndex,
      duration: 400,
      useNativeDriver: false,
    }).start()

    // Animate particles
    particles.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: -50,
              duration: 4000,
              useNativeDriver: true,
            })
          ]),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            })
          ]),
          // Reset
          Animated.parallel([
            Animated.timing(particle.y, {
              toValue: height + 50,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ])
      ).start()
    })
  }, [activeIndex])

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / width)
    setActiveIndex(index)
  }

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true })
    setActiveIndex(index)
  }

  const handleGetStarted = () => {
    router.replace('/(auth)/login')
  }

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 15]
  })

  const currentSlide = slides[activeIndex]

  return (
    <View className="flex-1">
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
            top: -80,
            right: -60,
            width: 250,
            height: 250,
            backgroundColor: currentSlide.color,
            opacity: 0.2
          }}
        />
        <View 
          className="absolute rounded-full"
          style={{
            bottom: -100,
            left: -50,
            width: 300,
            height: 300,
            backgroundColor: currentSlide.accentColor,
            opacity: 0.15
          }}
        />
      </View>

      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: 0, 
            top: 0,  
            transform: [
              { translateX: particle.x }, 
              { translateY: particle.y },
              { scale: particle.scale }
            ],
            opacity: particle.opacity
          }}
        >
          <View className="rounded-full w-2 h-2" style={{ backgroundColor: currentSlide.color }} />
        </Animated.View>
      ))}

      {/* Skip Button */}
      <Animated.View 
        style={{ opacity: fadeAnim }}
        className="absolute top-12 right-6 z-10"
      >
        <TouchableOpacity
          onPress={handleGetStarted}
          className="px-5 py-2 rounded-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        >
          <Text
            style={{
              fontFamily: 'System',
              fontSize: 13,
              fontWeight: '500',
              color: '#B76E79',
              letterSpacing: 1
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View key={index} style={{ width }} className="flex-1 justify-center items-center px-8">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: floatY }],
                alignItems: 'center'
              }}
            >
              {/* Emoji Icon with Glow */}
              <View className="items-center justify-center mb-8">
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 180,
                    height: 180,
                    borderRadius: 90,
                    backgroundColor: slide.color,
                    opacity: 0.3,
                    transform: [{ scale: pulseAnim }]
                  }}
                />
                
                <View 
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 140,
                    height: 140,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    shadowColor: slide.accentColor,
                    shadowOffset: { width: 0, height: 15 },
                    shadowOpacity: 0.25,
                    shadowRadius: 25,
                    elevation: 10
                  }}
                >
                  <View 
                    className="items-center justify-center rounded-full"
                    style={{
                      width: 120,
                      height: 120,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <Text style={{ fontSize: 56 }}>{slide.emoji}</Text>
                  </View>
                </View>

                {/* Orbiting small hearts */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 15,
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [0.4, 1]
                    })
                  }}
                >
                  <Ionicons name="heart" size={16} color={slide.accentColor} />
                </Animated.View>
                <Animated.View
                  style={{
                    position: 'absolute',
                    bottom: 15,
                    left: 10,
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [1, 0.4]
                    })
                  }}
                >
                  <Ionicons name="heart" size={12} color={slide.color} />
                </Animated.View>
              </View>

              {/* Text Content */}
              <View className="items-center">
                <Text
                  className="text-center mb-2"
                  style={{
                    fontFamily: 'System',
                    fontSize: 36,
                    fontWeight: '200',
                    color: '#8B4555',
                    letterSpacing: 2
                  }}
                >
                  {slide.title}
                </Text>

                {/* Decorative Line */}
                <View className="flex-row items-center my-3">
                  <View className="w-6 h-[1px]" style={{ backgroundColor: slide.accentColor }} />
                  <Ionicons name="diamond" size={10} color={slide.accentColor} style={{ marginHorizontal: 6 }} />
                  <View className="w-6 h-[1px]" style={{ backgroundColor: slide.accentColor }} />
                </View>

                <Text
                  className="text-center mb-6"
                  style={{
                    fontFamily: 'System',
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#B76E79',
                    letterSpacing: 3
                  }}
                >
                  {slide.subtitle}
                </Text>

                <Text
                  className="text-center px-4"
                  style={{
                    fontFamily: 'System',
                    fontSize: 15,
                    fontWeight: '300',
                    color: '#A85D69',
                    lineHeight: 24,
                    letterSpacing: 0.3
                  }}
                >
                  {slide.description}
                </Text>
              </View>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View className="absolute bottom-0 w-full pb-12">
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          {/* Pagination Dots */}
          <View className="flex-row items-center mb-8 space-x-2">
            {slides.map((slide, index) => {
              const isActive = activeIndex === index
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToSlide(index)}
                  className="mx-1"
                >
                  <Animated.View
                    style={{
                      width: isActive ? 32 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: isActive ? slide.accentColor : '#FFD4D4',
                      opacity: isActive ? 1 : 0.4
                    }}
                  />
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Progress Bar */}
          <View className="w-48 h-1 bg-white/50 rounded-full mb-6 overflow-hidden">
            <Animated.View
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, slides.length - 1],
                  outputRange: ['0%', '100%']
                }),
                height: '100%',
                backgroundColor: currentSlide.accentColor,
                borderRadius: 4
              }}
            />
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={activeIndex === slides.length - 1 ? handleGetStarted : () => goToSlide(activeIndex + 1)}
            className="mx-6"
            style={{
              shadowColor: currentSlide.accentColor,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8
            }}
          >
            <LinearGradient
              colors={[currentSlide.color, currentSlide.accentColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full px-12 py-4"
              style={{ minWidth: 280 }}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 17,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    letterSpacing: 1.5
                  }}
                >
                  {activeIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
                </Text>
                <Ionicons 
                  name={activeIndex === slides.length - 1 ? 'heart' : 'arrow-forward'} 
                  size={20} 
                  color="#FFFFFF" 
                  style={{ marginLeft: 8 }}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Decorative Bottom Line */}
          <View className="flex-row items-center mt-8">
            <View className="w-8 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
            <View className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: '#FFB6C1' }} />
            <View className="w-8 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
          </View>
        </Animated.View>
      </View>

      {/* Decorative Flowers in Corners */}
      <View className="absolute top-12 left-6" style={{ opacity: 0.15 }}>
        <Text style={{ fontSize: 28 }}>🌸</Text>
      </View>
      <View className="absolute bottom-32 right-6" style={{ opacity: 0.15 }}>
        <Text style={{ fontSize: 32 }}>🌺</Text>
      </View>
    </View>
  )
}