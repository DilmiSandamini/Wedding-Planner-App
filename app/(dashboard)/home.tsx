import React, { useEffect, useState, useRef } from 'react'
import { 
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Dimensions 
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/services/firebaseConfig'
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [wedding, setWedding] = useState<any>(null)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalGuests: 0,
    confirmedGuests: 0
  })
  
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const heartBeat = useRef(new Animated.Value(1)).current
  const floatAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Heartbeat animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeat, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeat, {
          toValue: 1,
          duration: 800,
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

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start()
  }, [])

  useEffect(() => {
    if (!user) return

    // Fetch wedding data
    const unsub = onSnapshot(doc(db, "wedding_plans", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setWedding(data)
      }
    })

    // Fetch stats
    const fetchStats = async () => {
      try {
        // Tasks stats
        const tasksSnapshot = await getDocs(
          query(collection(db, "tasks"), where("userId", "==", user.uid))
        )
        const totalTasks = tasksSnapshot.size
        const completedTasks = tasksSnapshot.docs.filter(
          doc => doc.data().completed
        ).length

        // Guests stats
        const guestsSnapshot = await getDocs(
          query(collection(db, "guests"), where("userId", "==", user.uid))
        )
        const totalGuests = guestsSnapshot.size
        const confirmedGuests = guestsSnapshot.docs.filter(
          doc => doc.data().confirmed
        ).length

        setStats({ totalTasks, completedTasks, totalGuests, confirmedGuests })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()

    // Countdown timer
    const timer = setInterval(() => {
      if (wedding?.weddingDate) {
        const weddingDate = new Date(wedding.weddingDate).getTime()
        const now = new Date().getTime()
        const diff = weddingDate - now

        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24))
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const s = Math.floor((diff % (1000 * 60)) / 1000)

          setTimeLeft({
            days: d < 10 ? `0${d}` : `${d}`,
            hours: h < 10 ? `0${h}` : `${h}`,
            minutes: m < 10 ? `0${m}` : `${m}`,
            seconds: s < 10 ? `0${s}` : `${s}`
          })
        }
      }
    }, 1000)

    return () => {
      unsub()
      clearInterval(timer)
    }
  }, [user, wedding?.weddingDate])

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8]
  })

  const quickActions = [
    { icon: 'checkbox-outline', label: 'Tasks', color: '#FFB6C1', route: '/(dashboard)/tasks' },
    { icon: 'people-outline', label: 'Guests', color: '#FFC0CB', route: '/(dashboard)/guests' },
    { icon: 'calendar-outline', label: 'Plan', color: '#FFD4E5', route: '/(dashboard)/plan' },
    { icon: 'wallet-outline', label: 'Budget', color: '#E8C4C4', route: '/(dashboard)/budget' }
  ]

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FFF5F5' }}>
      <StatusBar style="dark" />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 14,
                    fontWeight: '300',
                    color: '#B76E79',
                    letterSpacing: 0.5,
                    marginBottom: 4
                  }}
                >
                  Hello, {user?.displayName || 'Lovely'} 💕
                </Text>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 26,
                    fontWeight: '300',
                    color: '#8B4555',
                    letterSpacing: 0.5
                  }}
                >
                  Your Dream Day
                </Text>
              </View>
              
              <TouchableOpacity
                className="rounded-full p-3"
                style={{
                  backgroundColor: 'rgba(255, 182, 193, 0.2)',
                  borderWidth: 1,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="notifications-outline" size={22} color="#FF1493" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Countdown Card */}
          <View className="px-6 mb-6">
            <Animated.View style={{ transform: [{ translateY: floatY }] }}>
              <LinearGradient
                colors={['#FFB6C1', '#FF69B4', '#FF1493']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[32px] p-6"
                style={{
                  shadowColor: '#FF69B4',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 10
                }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 11,
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        marginBottom: 6
                      }}
                    >
                      {wedding?.planName || "Your Wedding"}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 22,
                        fontWeight: '300',
                        color: '#FFFFFF',
                        letterSpacing: 1
                      }}
                    >
                      {wedding?.coupleName || "Couple Names"}
                    </Text>
                  </View>
                  
                  <Animated.View style={{ transform: [{ scale: heartBeat }] }}>
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 50,
                        height: 50,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Ionicons name="heart" size={26} color="#FFFFFF" />
                    </View>
                  </Animated.View>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-white/20 mb-4" />

                {/* Countdown Timer */}
                <View 
                  className="rounded-[24px] p-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <Text
                    className="text-center mb-3"
                    style={{
                      fontFamily: 'System',
                      fontSize: 11,
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.9)',
                      letterSpacing: 1.5
                    }}
                  >
                    TIME UNTIL YOUR SPECIAL DAY
                  </Text>
                  
                  <View className="flex-row justify-between">
                    <View className="items-center flex-1">
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 28,
                          fontWeight: '300',
                          color: '#FFFFFF'
                        }}
                      >
                        {timeLeft.days}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 10,
                          fontWeight: '500',
                          color: 'rgba(255, 255, 255, 0.7)',
                          letterSpacing: 1,
                          marginTop: 2
                        }}
                      >
                        DAYS
                      </Text>
                    </View>
                    
                    <Text className="text-white/40 text-2xl font-light">:</Text>
                    
                    <View className="items-center flex-1">
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 28,
                          fontWeight: '300',
                          color: '#FFFFFF'
                        }}
                      >
                        {timeLeft.hours}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 10,
                          fontWeight: '500',
                          color: 'rgba(255, 255, 255, 0.7)',
                          letterSpacing: 1,
                          marginTop: 2
                        }}
                      >
                        HRS
                      </Text>
                    </View>
                    
                    <Text className="text-white/40 text-2xl font-light">:</Text>
                    
                    <View className="items-center flex-1">
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 28,
                          fontWeight: '300',
                          color: '#FFFFFF'
                        }}
                      >
                        {timeLeft.minutes}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 10,
                          fontWeight: '500',
                          color: 'rgba(255, 255, 255, 0.7)',
                          letterSpacing: 1,
                          marginTop: 2
                        }}
                      >
                        MIN
                      </Text>
                    </View>
                    
                    <Text className="text-white/40 text-2xl font-light">:</Text>
                    
                    <View className="items-center flex-1">
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 28,
                          fontWeight: '300',
                          color: '#FFFFFF'
                        }}
                      >
                        {timeLeft.seconds}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 10,
                          fontWeight: '500',
                          color: 'rgba(255, 255, 255, 0.7)',
                          letterSpacing: 1,
                          marginTop: 2
                        }}
                      >
                        SEC
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Wedding Date & Location */}
                <View className="flex-row items-center justify-center mt-4 pt-4 border-t border-white/20">
                  <Ionicons name="location" size={14} color="rgba(255, 255, 255, 0.8)" />
                  <Text
                    className="ml-2"
                    style={{
                      fontFamily: 'System',
                      fontSize: 13,
                      fontWeight: '400',
                      color: 'rgba(255, 255, 255, 0.9)',
                      letterSpacing: 0.3
                    }}
                  >
                    {wedding?.location || 'Location'} • {wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date'}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <Text
              className="mb-4"
              style={{
                fontFamily: 'System',
                fontSize: 18,
                fontWeight: '400',
                color: '#8B4555',
                letterSpacing: 0.3
              }}
            >
              Quick Actions
            </Text>
            
            <View className="flex-row flex-wrap justify-between">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={action.label}
                  onPress={() => router.push(action.route as any)}
                  className="mb-4"
                  style={{ width: '48%' }}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: pulseAnim }]
                    }}
                  >
                    <View
                      className="rounded-[24px] p-5 items-center"
                      style={{
                        backgroundColor: `${action.color}20`,
                        borderWidth: 1,
                        borderColor: `${action.color}40`
                      }}
                    >
                      <View
                        className="rounded-full items-center justify-center mb-3"
                        style={{
                          width: 50,
                          height: 50,
                          backgroundColor: action.color
                        }}
                      >
                        <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                      </View>
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#8B4555',
                          letterSpacing: 0.3
                        }}
                      >
                        {action.label}
                      </Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Overview */}
          <View className="px-6 mb-6">
            <Text
              className="mb-4"
              style={{
                fontFamily: 'System',
                fontSize: 18,
                fontWeight: '400',
                color: '#8B4555',
                letterSpacing: 0.3
              }}
            >
              Wedding Progress
            </Text>

            <View className="flex-row justify-between mb-3">
              <View
                className="rounded-[24px] p-5 items-center"
                style={{
                  width: '48%',
                  backgroundColor: 'rgba(255, 182, 193, 0.15)',
                  borderWidth: 1,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="checkbox-outline" size={32} color="#FF69B4" />
                <Text
                  className="mt-3"
                  style={{
                    fontFamily: 'System',
                    fontSize: 24,
                    fontWeight: '300',
                    color: '#8B4555'
                  }}
                >
                  {stats.completedTasks}/{stats.totalTasks}
                </Text>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 11,
                    fontWeight: '500',
                    color: '#B76E79',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginTop: 4
                  }}
                >
                  Tasks Done
                </Text>
              </View>

              <View
                className="rounded-[24px] p-5 items-center"
                style={{
                  width: '48%',
                  backgroundColor: 'rgba(255, 192, 203, 0.15)',
                  borderWidth: 1,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="people-outline" size={32} color="#FF1493" />
                <Text
                  className="mt-3"
                  style={{
                    fontFamily: 'System',
                    fontSize: 24,
                    fontWeight: '300',
                    color: '#8B4555'
                  }}
                >
                  {stats.confirmedGuests}/{stats.totalGuests}
                </Text>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 11,
                    fontWeight: '500',
                    color: '#B76E79',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginTop: 4
                  }}
                >
                  Guests RSVP
                </Text>
              </View>
            </View>

            <View
              className="rounded-[24px] p-5 flex-row items-center justify-between"
              style={{
                backgroundColor: 'rgba(232, 196, 196, 0.15)',
                borderWidth: 1,
                borderColor: '#FFD4D4'
              }}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="wallet-outline" size={28} color="#C57B88" />
                <View className="ml-4 flex-1">
                  <Text
                    style={{
                      fontFamily: 'System',
                      fontSize: 11,
                      fontWeight: '500',
                      color: '#B76E79',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      marginBottom: 2
                    }}
                  >
                    Budget Range
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'System',
                      fontSize: 16,
                      fontWeight: '400',
                      color: '#8B4555',
                      letterSpacing: 0.3
                    }}
                  >
                    {wedding?.budget || 'Not set'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFB6C1" />
            </View>
          </View>

          {/* Inspirational Quote */}
          <View className="px-6 mb-6">
            <View
              className="rounded-[24px] p-6 items-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1,
                borderColor: '#FFD4D4'
              }}
            >
              <Ionicons name="heart" size={28} color="#FF69B4" style={{ marginBottom: 12 }} />
              <Text
                className="text-center"
                style={{
                  fontFamily: 'System',
                  fontSize: 15,
                  fontWeight: '300',
                  color: '#8B4555',
                  lineHeight: 24,
                  fontStyle: 'italic',
                  letterSpacing: 0.3
                }}
              >
                "Love is not just looking at each other,{'\n'}
                it's looking in the same direction."
              </Text>
              <View className="flex-row items-center mt-3">
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
                <Ionicons name="sparkles" size={10} color="#FF69B4" style={{ marginHorizontal: 6 }} />
                <View className="w-6 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Corner Decorations */}
      <View className="absolute top-16 left-6" style={{ opacity: 0.1 }}>
        <Text style={{ fontSize: 32 }}>🌸</Text>
      </View>
      <View className="absolute top-16 right-6" style={{ opacity: 0.1 }}>
        <Text style={{ fontSize: 28 }}>💕</Text>
      </View>
    </SafeAreaView>
  )
}