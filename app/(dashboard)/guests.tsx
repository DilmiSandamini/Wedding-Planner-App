import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Alert, TextInput } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

// Custom Imports
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/utils/notifications'
import { Guest, GuestSide } from '@/types/guest'
import { subscribeToGuests, addGuest, updateGuest, deleteGuest } from '@/services/guestService'

// Components
import DashboardCard from '@/components/dashboard/DashboardCard'
import SectionHeader from '@/components/dashboard/SectionHeader'
import GuestModal from '@/components/dashboard/GuestModal'

const SIDES = ['All', 'Bride', 'Groom', 'Both']

export default function GuestsScreen() {
  const { user } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSide, setFilterSide] = useState('All')
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all')

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start()
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
    ])).start()
  }, [])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToGuests(user.uid, (data) => setGuests(data))
    return () => unsubscribe()
  }, [user])

  // Handlers
  const handleSaveGuest = async (data: any) => {
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, data)
        showToast('success', 'Updated', 'Guest details updated')
      } else {
        await addGuest(user?.uid!, data)
        showToast('success', 'Added', 'New guest added to list')
      }
      setShowModal(false)
      setEditingGuest(null)
    } catch (error) {
      showToast('error', 'Error', 'Something went wrong')
    }
  }

  const toggleConfirmed = (guest: Guest) => {
    updateGuest(guest.id, { confirmed: !guest.confirmed })
  }

  const handleDelete = (guest: Guest) => {
    Alert.alert('Remove Guest', `Remove ${guest.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
          deleteGuest(guest.id)
          showToast('success', 'Removed', 'Guest removed')
      }}
    ])
  }

  // Filtering & Stats
  const filteredGuests = guests.filter(guest => {
    const searchMatch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || guest.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const sideMatch = filterSide === 'All' || guest.side === filterSide
    const statusMatch = filterStatus === 'all' ? true : filterStatus === 'confirmed' ? guest.confirmed : !guest.confirmed
    return searchMatch && sideMatch && statusMatch
  })

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.confirmed).length,
    pending: guests.length - guests.filter(g => g.confirmed).length,
    totalWithPlusOnes: guests.reduce((sum, g) => sum + (g.plusOne ? 2 : 1), 0)
  }

  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] })

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5F5]">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-[#B76E79] font-light text-sm tracking-widest mb-1">Wedding Guests</Text>
            <Text className="text-[#8B4555] font-light text-3xl tracking-wide">Your Guest List</Text>
          </View>

          {/* Stats Card */}
          <View className="px-6 mb-6">
            <Animated.View style={{ transform: [{ translateY: floatY }] }}>
              <LinearGradient colors={['#FFB6C1', '#FF69B4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-[28px] p-6 shadow-lg shadow-pink-300">
                <Text className="text-white/90 text-xs font-bold tracking-[1.5px] uppercase mb-4">Guest Overview</Text>
                <View className="flex-row justify-between">
                  <StatItem value={stats.total} label="Invited" />
                  <StatItem value={stats.confirmed} label="Confirmed" />
                  <StatItem value={stats.pending} label="Pending" />
                  <StatItem value={stats.totalWithPlusOnes} label="Total +1s" />
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Search */}
          <View className="px-6 mb-4">
            <View className="rounded-2xl flex-row items-center px-4 py-3 bg-white/90 border-[1.5px] border-[#FFD4D4]">
              <Ionicons name="search-outline" size={20} color="#B76E79" />
              <TextInput 
                placeholder="Search by name or email..." 
                value={searchQuery} onChangeText={setSearchQuery} 
                placeholderTextColor="#D4A5A5" 
                className="flex-1 ml-3 text-[#8B4555] text-[15px]" 
              />
              {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color="#B76E79" /></TouchableOpacity>}
            </View>
          </View>

          {/* Status Filters */}
          <View className="px-6 mb-4">
            <View className="rounded-2xl p-1 flex-row bg-white/80 border border-[#FFD4D4]">
              {(['all', 'confirmed', 'pending'] as const).map((status) => (
                <TouchableOpacity key={status} onPress={() => setFilterStatus(status)} className={`flex-1 py-2.5 rounded-xl ${filterStatus === status ? 'bg-[#FF69B4]' : 'bg-transparent'}`}>
                  <Text className={`text-center capitalize text-sm font-${filterStatus === status ? 'semibold' : 'normal'} text-${filterStatus === status ? 'white' : '[#8B4555]'}`}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Side Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pl-6">
            {SIDES.map((s) => (
              <TouchableOpacity key={s} onPress={() => setFilterSide(s)} className="mr-3">
                <View className={`rounded-full px-5 py-2.5 border-[1.5px] ${filterSide === s ? 'bg-[#FF69B4] border-[#FF69B4]' : 'bg-white/80 border-[#FFD4D4]'}`}>
                  <Text className={`text-sm ${filterSide === s ? 'text-white font-semibold' : 'text-[#8B4555]'}`}>
                    {s === 'All' ? 'All Guests' : `${s}'s Side`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <View className="w-6" />
          </ScrollView>

          {/* List */}
          <View className="px-6">
            {filteredGuests.length === 0 ? (
              <View className="items-center py-12 opacity-60">
                <View className="w-20 h-20 bg-pink-100 rounded-full items-center justify-center mb-4"><Ionicons name="people-outline" size={40} color="#FFB6C1" /></View>
                <Text className="text-[#B76E79] text-base">{searchQuery ? 'No guests found' : 'No guests yet'}</Text>
                <Text className="text-[#D4A5A5] text-xs mt-1">{searchQuery ? 'Try a different search' : 'Start building your guest list!'}</Text>
              </View>
            ) : (
              filteredGuests.map((guest) => (
                <DashboardCard key={guest.id} className={`mb-3 p-4 !bg-white/90 ${guest.confirmed ? 'border-green-200' : ''}`}>
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-[17px] font-semibold text-[#8B4555] flex-1">{guest.name}</Text>
                        <TouchableOpacity onPress={() => toggleConfirmed(guest)} className={`ml-2 px-3 py-1.5 rounded-full ${guest.confirmed ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Text className={`text-[11px] font-bold ${guest.confirmed ? 'text-green-600' : 'text-gray-500'}`}>{guest.confirmed ? '✓ RSVP' : 'Pending'}</Text>
                        </TouchableOpacity>
                      </View>
                      
                      {guest.email && <View className="flex-row items-center mt-1"><Ionicons name="mail-outline" size={14} color="#9CA3AF" /><Text className="ml-2 text-[13px] text-gray-500">{guest.email}</Text></View>}
                      {guest.phone && <View className="flex-row items-center mt-1"><Ionicons name="call-outline" size={14} color="#9CA3AF" /><Text className="ml-2 text-[13px] text-gray-500">{guest.phone}</Text></View>}

                      <View className="flex-row items-center mt-3 flex-wrap">
                        <Badge label={`${guest.side}'s Side`} color="#7C3AED" bg="#EDE9FE" />
                        <Badge label={guest.relationship} color="#2563EB" bg="#DBEAFE" />
                        {guest.plusOne && <Badge label="+1" color="#EA580C" bg="#FED7AA" />}
                        {guest.tableNumber && <Badge label={`Table ${guest.tableNumber}`} color="#4B5563" bg="#F3F4F6" />}
                      </View>
                    </View>
                  </View>

                  <View className="flex-row justify-end pt-3 border-t border-gray-100">
                    <ActionButton icon="pencil" color="#3B82F6" bg="rgba(59, 130, 246, 0.1)" label="Edit" onPress={() => { setEditingGuest(guest); setShowModal(true); }} />
                    <ActionButton icon="trash" color="#EF4444" bg="rgba(239, 68, 68, 0.1)" label="Remove" onPress={() => handleDelete(guest)} />
                  </View>
                </DashboardCard>
              ))
            )}
          </View>

        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={() => { setEditingGuest(null); setShowModal(true); }} className="absolute bottom-24 right-6 shadow-lg shadow-pink-400">
        <LinearGradient colors={['#FFB6C1', '#FF69B4', '#FF1493']} className="w-16 h-16 rounded-full items-center justify-center">
          <Ionicons name="person-add" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <GuestModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleSaveGuest} editingGuest={editingGuest} />
    </SafeAreaView>
  )
}

// Helpers
const StatItem = ({ value, label }: any) => (
  <View className="items-center">
    <Text className="text-white text-3xl font-light">{value}</Text>
    <Text className="text-white/80 text-[11px] font-medium tracking-wide mt-1">{label}</Text>
  </View>
)

const Badge = ({ label, color, bg }: any) => (
  <View className="px-3 py-1.5 rounded-full mr-2 mb-2" style={{ backgroundColor: bg }}>
    <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{label}</Text>
  </View>
)

const ActionButton = ({ icon, color, bg, label, onPress }: any) => (
  <TouchableOpacity onPress={onPress} className="px-4 py-2 rounded-xl flex-row items-center ml-2" style={{ backgroundColor: bg }}>
    <Ionicons name={icon as any} size={16} color={color} />
    <Text className="ml-2 text-[13px] font-semibold" style={{ color }}>{label}</Text>
  </TouchableOpacity>
)