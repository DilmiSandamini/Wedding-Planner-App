import React, { useState, useRef, useEffect } from 'react'
import { 
  View, Text, ScrollView, KeyboardAvoidingView, Platform, 
  Modal, TouchableOpacity, TextInput, Animated
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import { db } from '@/services/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'

const BUDGET_OPTIONS = [
  { label: "Under 1.5M", value: "Under 1.5M", icon: "💝" },
  { label: "1.5M - 3M", value: "1.5M - 3M", icon: "💍" },
  { label: "3M - 5M", value: "3M - 5M", icon: "💎" },
  { label: "Above 5M", value: "Above 5M", icon: "👑" }
]

export default function WeddingDetails() {
  const { user } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const router = useRouter()
  
  const [planName, setPlanName] = useState('')
  const [coupleName, setCoupleName] = useState('')
  const [weddingDate, setWeddingDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [budget, setBudget] = useState('')
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [guests, setGuests] = useState('')
  const [location, setLocation] = useState('')

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(30)).current
  const heartBeat = useRef(new Animated.Value(1)).current
  const sparkleRotate = useRef(new Animated.Value(0)).current

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
        Animated.timing(heartBeat, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeat, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start()

    // Sparkle rotation
    Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start()
  }, [])

  const handleSave = async () => {
    if (!planName.trim() || !coupleName.trim() || !budget || !guests || !location.trim()) {
      return showToast('error', 'Fields Required', 'Please complete all fields to save your plan.')
    }

    showLoader()
    try {
      await setDoc(doc(db, "wedding_plans", user?.uid!), {
        userId: user?.uid,
        planName: planName.trim(),
        coupleName: coupleName.trim(),
        weddingDate: weddingDate.toISOString(),
        budget,
        guests: parseInt(guests),
        location: location.trim(),
        isSetupComplete: true,
        updatedAt: new Date().toISOString()
      })

      showToast('success', 'Perfect!', 'Your wedding plan has been created.')
      router.replace('/(dashboard)/home')
    } catch (err: any) {
      console.error("Save Error:", err)
      showToast('error', 'Error', "Failed to save details. Please check your connection.")
    } finally {
      hideLoader()
    }
  }

  const sparkleRotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
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
            right: -60,
            width: 280,
            height: 280,
            backgroundColor: '#FFB6C1',
            opacity: 0.15
          }}
        />
        <View 
          className="absolute rounded-full"
          style={{
            bottom: -80,
            left: -50,
            width: 250,
            height: 250,
            backgroundColor: '#FFC0CB',
            opacity: 0.2
          }}
        />
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingTop: 60 }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUp }]
          }}
        >
          {/* Header with Animation */}
          <View className="items-center mb-8">
            <Animated.View
              style={{
                transform: [{ scale: heartBeat }],
                marginBottom: 16
              }}
            >
              <View 
                className="items-center justify-center rounded-full"
                style={{
                  width: 70,
                  height: 70,
                  backgroundColor: 'rgba(255, 182, 193, 0.3)',
                  shadowColor: '#FF69B4',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16
                }}
              >
                <Ionicons name="calendar-outline" size={35} color="#FF1493" />
              </View>
            </Animated.View>

            <Text
              style={{
                fontFamily: 'System',
                fontSize: 14,
                fontWeight: '300',
                color: '#B76E79',
                letterSpacing: 1,
                marginBottom: 8
              }}
            >
              Hello {user?.displayName || 'Lovely Couple'} 💕
            </Text>

            <Text
              style={{
                fontFamily: 'System',
                fontSize: 32,
                fontWeight: '200',
                color: '#8B4555',
                letterSpacing: 2,
                textAlign: 'center',
                marginBottom: 8
              }}
            >
              Plan Your Dream Day
            </Text>

            <View className="flex-row items-center my-2">
              <View className="w-8 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
              <Animated.View style={{ transform: [{ rotate: sparkleRotation }] }}>
                <Ionicons name="sparkles" size={12} color="#FF69B4" style={{ marginHorizontal: 8 }} />
              </Animated.View>
              <View className="w-8 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
            </View>

            <Text
              style={{
                fontFamily: 'System',
                fontSize: 13,
                fontWeight: '300',
                color: '#A85D69',
                letterSpacing: 0.5,
                textAlign: 'center'
              }}
            >
              Let's create something beautiful together
            </Text>
          </View>

          {/* Form Card */}
          <View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              shadowColor: '#FFB6C1',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 5
            }}
          >
            <View className="items-center mb-6">
              <Text
                style={{
                  fontFamily: 'System',
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#FF69B4',
                  letterSpacing: 3,
                  textTransform: 'uppercase'
                }}
              >
                Wedding Details
              </Text>
              <View className="w-12 h-[2px] mt-2 rounded-full" style={{ backgroundColor: '#FFB6C1' }} />
            </View>

            {/* Wedding Plan Name */}
            <View className="mb-5">
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
                Wedding Plan Name
              </Text>
              <View
                className="rounded-2xl flex-row items-center px-4 py-3"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="bookmark-outline" size={20} color="#B76E79" />
                <TextInput
                  placeholder="e.g., Our Dream Day"
                  value={planName}
                  onChangeText={setPlanName}
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

            {/* Couple Names */}
            <View className="mb-5">
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
                Couple Names
              </Text>
              <View
                className="rounded-2xl flex-row items-center px-4 py-3"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="heart-outline" size={20} color="#B76E79" />
                <TextInput
                  placeholder="e.g., John & Sarah"
                  value={coupleName}
                  onChangeText={setCoupleName}
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

            {/* Wedding Date */}
            <View className="mb-5">
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
                Wedding Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="rounded-2xl flex-row items-center justify-between px-4 py-3"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="calendar-outline" size={20} color="#B76E79" />
                  <Text
                    className="ml-3"
                    style={{
                      fontFamily: 'System',
                      fontSize: 15,
                      color: '#8B4555'
                    }}
                  >
                    {weddingDate.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#FFB6C1" />
              </TouchableOpacity>
            </View>

            {/* Budget Range */}
            <View className="mb-5">
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
                Budget Range
              </Text>
              <TouchableOpacity
                onPress={() => setShowBudgetModal(true)}
                className="rounded-2xl flex-row items-center justify-between px-4 py-3"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="wallet-outline" size={20} color="#B76E79" />
                  <Text
                    className="ml-3"
                    style={{
                      fontFamily: 'System',
                      fontSize: 15,
                      color: budget ? '#8B4555' : '#D4A5A5'
                    }}
                  >
                    {budget || 'Select your budget'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#FFB6C1" />
              </TouchableOpacity>
            </View>

            {/* Expected Guests */}
            <View className="mb-5">
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
                Expected Guests
              </Text>
              <View
                className="rounded-2xl flex-row items-center px-4 py-3"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="people-outline" size={20} color="#B76E79" />
                <TextInput
                  placeholder="Number of guests"
                  value={guests}
                  onChangeText={setGuests}
                  keyboardType="numeric"
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

            {/* Location */}
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
                Wedding Location
              </Text>
              <View
                className="rounded-2xl flex-row items-center px-4 py-3"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="location-outline" size={20} color="#B76E79" />
                <TextInput
                  placeholder="Venue or City"
                  value={location}
                  onChangeText={setLocation}
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

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              style={{
                shadowColor: '#FF69B4',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 5
              }}
            >
              <LinearGradient
                colors={['#FFB6C1', '#FF69B4', '#FF1493']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl py-4"
              >
                <View className="flex-row items-center justify-center">
                  <Text
                    style={{
                      fontFamily: 'System',
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#FFFFFF',
                      letterSpacing: 1.5
                    }}
                  >
                    Save & Continue
                  </Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Decorative Bottom */}
          <View className="items-center mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
              <View className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: '#FFB6C1' }} />
              <View className="w-8 h-[1px]" style={{ backgroundColor: '#FFB6C1' }} />
            </View>
          </View>
        </Animated.View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker 
            value={weddingDate} 
            mode="date" 
            display="default" 
            onChange={(e, d) => { 
              setShowDatePicker(false); 
              if(d) setWeddingDate(d); 
            }} 
            minimumDate={new Date()}
          />
        )}
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="slide">
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowBudgetModal(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              className="rounded-t-[40px] p-6 pb-10"
              style={{ backgroundColor: '#FFF5F5' }}
            >
              <View className="items-center mb-6">
                <View className="w-12 h-1 rounded-full mb-4" style={{ backgroundColor: '#FFD4D4' }} />
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 22,
                    fontWeight: '300',
                    color: '#8B4555',
                    letterSpacing: 1
                  }}
                >
                  Select Budget Range
                </Text>
                <View className="flex-row items-center mt-3">
                  <View className="w-6 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
                  <Ionicons name="diamond" size={8} color="#FF69B4" style={{ marginHorizontal: 6 }} />
                  <View className="w-6 h-[1px]" style={{ backgroundColor: '#FF69B4' }} />
                </View>
              </View>

              {BUDGET_OPTIONS.map((option, index) => (
                <TouchableOpacity 
                  key={option.value}
                  className="mb-3"
                  onPress={() => { 
                    setBudget(option.value); 
                    setShowBudgetModal(false); 
                  }}
                >
                  <View
                    className="rounded-2xl p-4 flex-row items-center justify-between"
                    style={{
                      backgroundColor: budget === option.value ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 255, 255, 0.8)',
                      borderWidth: 1.5,
                      borderColor: budget === option.value ? '#FF69B4' : '#FFD4D4'
                    }}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text style={{ fontSize: 24, marginRight: 12 }}>{option.icon}</Text>
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 16,
                          fontWeight: budget === option.value ? '600' : '400',
                          color: budget === option.value ? '#FF1493' : '#8B4555',
                          letterSpacing: 0.3
                        }}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {budget === option.value && (
                      <Ionicons name="checkmark-circle" size={24} color="#FF1493" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                onPress={() => setShowBudgetModal(false)} 
                className="mt-4"
              >
                <View
                  className="rounded-2xl py-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 1.5,
                    borderColor: '#FFD4D4'
                  }}
                >
                  <Text
                    className="text-center"
                    style={{
                      fontFamily: 'System',
                      fontSize: 15,
                      fontWeight: '500',
                      color: '#B76E79',
                      letterSpacing: 0.5
                    }}
                  >
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Corner Decorations */}
      <View className="absolute top-12 left-6" style={{ opacity: 0.12 }}>
        <Text style={{ fontSize: 32 }}>💐</Text>
      </View>
      <View className="absolute top-12 right-6" style={{ opacity: 0.12 }}>
        <Text style={{ fontSize: 28 }}>🌺</Text>
      </View>
    </KeyboardAvoidingView>
  )
}