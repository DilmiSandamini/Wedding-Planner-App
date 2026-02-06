import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, Easing, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const petalAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0)
    }))
  ).current
  const heartBeatAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const textReveal = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Main fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Text reveal with stagger
    Animated.timing(textReveal, {
      toValue: 1,
      duration: 1200,
      delay: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()

    // Heartbeat animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeatAnim, {
          toValue: 1.1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heartBeatAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(1200)
      ])
    ).start()

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start()

    // Falling petals animation
    petalAnims.forEach((petal, index) => {
      const startDelay = index * 300
      const duration = 4000 + Math.random() * 2000
      const xOffset = (Math.random() - 0.5) * 60
      
      Animated.loop(
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.parallel([
            Animated.timing(petal.translateY, {
              toValue: height,
              duration: duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(petal.translateX, {
              toValue: xOffset,
              duration: duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(petal.rotate, {
              toValue: 360,
              duration: duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(petal.opacity, {
                toValue: 0.8,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.delay(duration - 1000),
              Animated.timing(petal.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              })
            ]),
            Animated.timing(petal.scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            })
          ]),
          // Reset
          Animated.parallel([
            Animated.timing(petal.translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(petal.translateX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(petal.rotate, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(petal.opacity, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(petal.scale, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ])
      ).start()
    })

    // Navigate to onboarding
    const timer = setTimeout(() => {
      router.replace('/onboarding')
    }, 4500)

    return () => clearTimeout(timer)
  }, [])

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  })

  const textTranslateY = textReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0]
  })

  return (
    <View className="flex-1">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Soft Gradient Background */}
      <LinearGradient
        colors={['#FFF5F5', '#FFE8E8', '#FFF0F0', '#FFEAEA']}
        locations={[0, 0.3, 0.7, 1]}
        className="flex-1 absolute inset-0"
      />

      {/* Decorative Background Elements */}
      <View className="absolute inset-0">
        {/* Large soft circles */}
        <View 
          className="absolute rounded-full"
          style={{
            top: -100,
            right: -50,
            width: 300,
            height: 300,
            backgroundColor: '#FFD4D4',
            opacity: 0.3
          }}
        />
        <View 
          className="absolute rounded-full"
          style={{
            bottom: -80,
            left: -60,
            width: 250,
            height: 250,
            backgroundColor: '#E8C4C4',
            opacity: 0.2
          }}
        />
      </View>

      {/* Falling Petals */}
      {petalAnims.map((petal, index) => {
        const leftPosition = (index / petalAnims.length) * width
        const petalColors = ['#FFB6C1', '#FFC0CB', '#FFD4E5', '#E8A0BF', '#FFA8B5']
        const color = petalColors[index % petalColors.length]
        
        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              top: -20,
              left: leftPosition,
              width: 12,
              height: 12,
              backgroundColor: color,
              borderRadius: 8,
              transform: [
                { translateY: petal.translateY },
                { translateX: petal.translateX },
                { rotate: petal.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })},
                { scale: petal.scale }
              ],
              opacity: petal.opacity,
              shadowColor: color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8
            }}
          />
        )
      })}

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            alignItems: 'center'
          }}
        >
          {/* Decorative Floral Elements */}
          <View className="absolute" style={{ top: -80 }}>
            <Text style={{ fontSize: 60, opacity: 0.15 }}>🌸</Text>
          </View>
          <View className="absolute" style={{ top: -60, right: -40 }}>
            <Text style={{ fontSize: 40, opacity: 0.15 }}>🌺</Text>
          </View>
          <View className="absolute" style={{ bottom: -100, left: -50 }}>
            <Text style={{ fontSize: 50, opacity: 0.15 }}>🌹</Text>
          </View>

          {/* Center Heart with Glow */}
          <View className="items-center justify-center mb-12">
            <Animated.View
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: '#FFB6C1',
                opacity: glowOpacity,
                transform: [{ scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
                })}]
              }}
            />
            
            <Animated.View
              style={{
                transform: [{ scale: heartBeatAnim }]
              }}
            >
              <View 
                className="items-center justify-center rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  backgroundColor: 'rgba(255, 182, 193, 0.2)',
                  shadowColor: '#FF69B4',
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.3,
                  shadowRadius: 30,
                  elevation: 10
                }}
              >
                <View 
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 110,
                    height: 110,
                    backgroundColor: 'rgba(255, 182, 193, 0.3)'
                  }}
                >
                  <Ionicons name="heart" size={60} color="#FF1493" />
                </View>
              </View>
            </Animated.View>

            {/* Small floating hearts */}
            <Animated.View
              style={{
                position: 'absolute',
                top: -10,
                right: 10,
                opacity: glowAnim
              }}
            >
              <Ionicons name="heart" size={20} color="#FF69B4" />
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 10,
                left: 0,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3]
                })
              }}
            >
              <Ionicons name="heart" size={16} color="#FFB6C1" />
            </Animated.View>
          </View>

          {/* Text Content with Reveal Animation */}
          <Animated.View
            style={{
              opacity: textReveal,
              transform: [{ translateY: textTranslateY }]
            }}
            className="items-center"
          >
            {/* Main Title */}
            <View className="items-center mb-4">
              <Text 
                className="text-center mb-2"
                style={{
                  fontFamily: 'System',
                  fontSize: 48,
                  fontWeight: '200',
                  color: '#8B4555',
                  letterSpacing: 4,
                  textShadowColor: 'rgba(255, 105, 180, 0.1)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8
                }}
              >
                Forever
              </Text>
              
              {/* Decorative Flourish */}
              <View className="flex-row items-center my-2">
                <View className="w-8 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
                <Ionicons name="diamond" size={12} color="#FF69B4" style={{ marginHorizontal: 8 }} />
                <View className="w-8 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
              </View>

              <Text 
                className="text-center"
                style={{
                  fontFamily: 'System',
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#B76E79',
                  letterSpacing: 8,
                }}
              >
                BEGINS
              </Text>
            </View>

            {/* Subtitle */}
            <View className="items-center mt-6">
              <Text 
                className="text-center mb-1"
                style={{
                  fontFamily: 'System',
                  fontSize: 15,
                  fontWeight: '400',
                  color: '#A85D69',
                  letterSpacing: 3,
                }}
              >
                Wedding Planner
              </Text>
              
              {/* Tagline */}
              <View className="mt-6 px-8">
                <Text 
                  className="text-center italic"
                  style={{
                    fontFamily: 'System',
                    fontSize: 16,
                    fontWeight: '300',
                    color: '#C57B88',
                    lineHeight: 26,
                    letterSpacing: 0.5
                  }}
                >
                  Your love story,
                  {'\n'}
                  beautifully planned
                </Text>
              </View>
            </View>

            {/* Loading Dots */}
            <View className="mt-10 flex-row space-x-2">
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FFB6C1',
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: index === 1 ? [0.3, 1] : [1, 0.3]
                    })
                  }}
                />
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Bottom Decorative Line */}
      <View className="absolute bottom-16 w-full items-center">
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="items-center"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
            <View className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: '#FFB6C1' }} />
            <View className="w-12 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
          </View>
          <Text 
            className="text-center"
            style={{
              fontFamily: 'System',
              fontSize: 9,
              fontWeight: '300',
              color: '#D4A5A5',
              letterSpacing: 2
            }}
          >
            VERSION 1.0
          </Text>
        </Animated.View>
      </View>

      {/* Corner Flower Decorations */}
      <View className="absolute top-8 left-8" style={{ opacity: 0.15 }}>
        <Text style={{ fontSize: 32 }}>🌸</Text>
      </View>
      <View className="absolute top-8 right-8" style={{ opacity: 0.15 }}>
        <Text style={{ fontSize: 32 }}>🌸</Text>
      </View>
    </View>
  )
}