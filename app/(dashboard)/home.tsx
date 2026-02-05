import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Image, Alert, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '@/hooks/useAuth'
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import { db } from '@/services/firebaseConfig'
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

// Import Components
import DashboardCard from '@/components/dashboard/DashboardCard'
import SectionHeader from '@/components/dashboard/SectionHeader'
import ProfileMenu from '@/components/dashboard/ProfileMenu'
import EditWeddingModal from '@/components/dashboard/EditWeddingModal'

export default function HomeScreen() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { showLoader, hideLoader, isLoading } = useLoader()
  
  const [wedding, setWedding] = useState<any>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Stats & Edit Form State
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, totalGuests: 0, confirmedGuests: 0 })
  const [editData, setEditData] = useState({ planName: '', coupleName: '', weddingDate: new Date(), budget: '', guests: '', location: '' })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const floatAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start()
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true })
    ])).start()
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
    ])).start()
  }, [])

  // Data Fetching Logic
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, "wedding_plans", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setWedding(data)
        setEditData({
          planName: data.planName || '', coupleName: data.coupleName || '',
          weddingDate: data.weddingDate ? new Date(data.weddingDate) : new Date(),
          budget: data.budget || '', guests: data.guests?.toString() || '', location: data.location || ''
        })
      }
    })
    
    // Stats Fetching
    const fetchStats = async () => {
        try {
            const tasksSnap = await getDocs(query(collection(db, "tasks"), where("userId", "==", user.uid)))
            const guestsSnap = await getDocs(query(collection(db, "guests"), where("userId", "==", user.uid)))
            setStats({
                totalTasks: tasksSnap.size,
                completedTasks: tasksSnap.docs.filter(d => d.data().completed).length,
                totalGuests: guestsSnap.size,
                confirmedGuests: guestsSnap.docs.filter(d => d.data().confirmed).length
            })
        } catch (error) { console.error(error) }
    }
    fetchStats()
    return () => unsub()
  }, [user])

  // Timer Logic
  useEffect(() => {
    if (!wedding?.weddingDate) return
    const timer = setInterval(() => {
      const diff = new Date(wedding.weddingDate).getTime() - new Date().getTime()
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
    }, 1000)
    return () => clearInterval(timer)
  }, [wedding?.weddingDate])

  // Handlers
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { setShowProfileMenu(false); await logout(); router.replace('/(auth)/login'); } }
    ])
  }

  const handleSaveEdit = async () => {
    if (!editData.planName || !editData.coupleName || !editData.budget || !editData.guests || !editData.location) return showToast('error', 'Fields Required', 'Please complete all fields')
    try {
      showLoader()
      await updateDoc(doc(db, "wedding_plans", user?.uid!), {
        planName: editData.planName.trim(), coupleName: editData.coupleName.trim(),
        weddingDate: editData.weddingDate.toISOString(), budget: editData.budget,
        guests: parseInt(editData.guests), location: editData.location.trim(), updatedAt: new Date().toISOString()
      })
      hideLoader(); setShowEditModal(false); showToast('success', 'Updated! 🎉', 'Details updated successfully')
    } catch (err: any) { hideLoader(); showToast('error', 'Error', 'Failed to update') }
  }

  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] })
  const quickActions = [
    { icon: 'checkbox-outline', label: 'Tasks', color: '#FFB6C1', route: '/(dashboard)/tasks' },
    { icon: 'people-outline', label: 'Guests', color: '#FFC0CB', route: '/(dashboard)/guests' },
    { icon: 'calendar-outline', label: 'Plan', color: '#FFD4E5', route: '/(dashboard)/plan' },
    { icon: 'wallet-outline', label: 'Budget', color: '#E8C4C4', route: '/(dashboard)/budget' }
  ]

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5F5]">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Header */}
          <View className="px-6 pt-6 pb-2 flex-row justify-between items-start">
            <View>
              <Text className="text-[#B76E79] font-light text-sm tracking-widest mb-1">
                Hello, {user?.displayName?.split(' ')[0] || 'Lovely'} 💕
              </Text>
              <Text className="text-[#8B4555] font-light text-3xl tracking-wide">
                Your Dream Day
              </Text>
            </View>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-white/60 border border-[#FFD4D4]">
                <Ionicons name="notifications-outline" size={20} color="#FF1493" />
                <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowProfileMenu(true)} className="w-10 h-10 rounded-full items-center justify-center bg-[#FFB6C1] border-2 border-white overflow-hidden">
                {user?.photoURL ? 
                  <Image source={{ uri: user.photoURL }} className="w-full h-full" /> : 
                  <Text className="text-white font-bold text-lg">{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Countdown Card */}
          <View className="px-6 my-6">
            <Animated.View style={{ transform: [{ translateY: floatY }] }}>
              <LinearGradient colors={['#FFB6C1', '#FF69B4', '#FF1493']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-[32px] p-6 shadow-lg shadow-pink-300">
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="text-white/80 text-[10px] font-bold tracking-[2px] uppercase mb-1">{wedding?.planName || "Wedding Plan"}</Text>
                    <Text className="text-white text-2xl font-light">{wedding?.coupleName || "Couple"}</Text>
                  </View>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"><Ionicons name="heart" size={24} color="#FFF" /></Animated.View>
                </View>
                
                {/* --- FIXED TIMER SECTION START --- */}
                {/* Removed spaces between components inside View */}
                <View className="flex-row justify-between bg-white/15 rounded-3xl p-4">
                   <TimerItem value={timeLeft.days} label="DAYS" />
                   <TimerSeparator />
                   <TimerItem value={timeLeft.hours} label="HRS" />
                   <TimerSeparator />
                   <TimerItem value={timeLeft.minutes} label="MIN" />
                   <TimerSeparator />
                   <TimerItem value={timeLeft.seconds} label="SEC" />
                </View>
                {/* --- FIXED TIMER SECTION END --- */}

                <View className="flex-row items-center justify-center mt-4 pt-3 border-t border-white/20">
                  <Ionicons name="location-sharp" size={14} color="rgba(255,255,255,0.9)" />
                  <Text className="text-white/90 text-xs font-medium ml-1 tracking-wide">{wedding?.location || 'Venue'} • {wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString() : 'Date'}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <SectionHeader title="Quick Actions" />
            <View className="flex-row flex-wrap justify-between">
              {quickActions.map((action) => (
                <TouchableOpacity key={action.label} onPress={() => router.push(action.route as any)} className="w-[48%] mb-4">
                  <DashboardCard className="items-center py-6">
                    <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${action.color}30` }}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text className="text-[#8B4555] font-medium tracking-wide">{action.label}</Text>
                  </DashboardCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Progress Stats */}
          <View className="px-6 mb-6">
            <SectionHeader title="Wedding Progress" />
            <View className="flex-row justify-between">
              <DashboardCard style={{ width: '48%', backgroundColor: '#FFF0F5' }}>
                <View className="items-center py-5">
                  <Ionicons name="checkbox" size={28} color="#FF69B4" />
                  <Text className="text-2xl font-light text-[#8B4555] mt-2">
                    {stats.completedTasks}
                    <Text className="text-sm text-[#B76E79]">/{stats.totalTasks}</Text>
                  </Text>
                  <Text className="text-[10px] text-[#B76E79] font-bold tracking-widest uppercase mt-1">Tasks Done</Text>
                </View>
              </DashboardCard>
              <DashboardCard style={{ width: '48%', backgroundColor: '#FFF0F5' }}>
                <View className="items-center py-5">
                  <Ionicons name="people" size={28} color="#FF1493" />
                  <Text className="text-2xl font-light text-[#8B4555] mt-2">
                    {stats.confirmedGuests}
                    <Text className="text-sm text-[#B76E79]">/{stats.totalGuests}</Text>
                  </Text>
                  <Text className="text-[10px] text-[#B76E79] font-bold tracking-widest uppercase mt-1">RSVP Count</Text>
                </View>
              </DashboardCard>
            </View>
          </View>

          {/* Budget & Quote */}
          <View className="px-6 mb-8">
            <DashboardCard>
              <TouchableOpacity onPress={() => router.push('/(dashboard)/budget')} className="flex-row items-center justify-between p-2">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-[#E8C4C4]/30"><Ionicons name="wallet" size={20} color="#C57B88" /></View>
                  <View>
                    <Text className="text-[10px] text-[#B76E79] font-bold uppercase tracking-widest">Budget</Text>
                    <Text className="text-[#8B4555] font-medium mt-0.5">{wedding?.budget || 'Not Set'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFB6C1" />
              </TouchableOpacity>
            </DashboardCard>
            <View className="items-center mt-6 opacity-60">
              <Text className="text-[#8B4555] italic text-center text-xs leading-5">"Love is not just looking at each other,{'\n'}it's looking in the same direction."</Text>
              <Ionicons name="heart-half" size={14} color="#FF69B4" style={{ marginTop: 6 }} />
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Modals */}
      <ProfileMenu visible={showProfileMenu} onClose={() => setShowProfileMenu(false)} onEdit={() => { setShowProfileMenu(false); setShowEditModal(true); }} onLogout={handleLogout} user={user} />
      
      <EditWeddingModal 
        visible={showEditModal} onClose={() => setShowEditModal(false)}
        editData={editData} setEditData={setEditData}
        showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker}
        showBudgetModal={showBudgetModal} setShowBudgetModal={setShowBudgetModal}
        handleBudgetSelect={(val: string) => { setEditData({...editData, budget: val}); setShowBudgetModal(false); }}
        formatDate={() => editData.weddingDate.toLocaleDateString()}
        handleSave={handleSaveEdit} isLoading={isLoading}
      />
    </SafeAreaView>
  )
}

// Timer Helper Components
const TimerItem = ({ value, label }: { value: string; label: string }) => (
  <View className="items-center w-12">
    <Text className="text-white text-2xl font-light">{value}</Text>
    <Text className="text-white/60 text-[8px] font-bold tracking-widest mt-1">{label}</Text>
  </View>
)

const TimerSeparator = () => (
  <Text className="text-white/40 text-xl pt-1">:</Text>
)