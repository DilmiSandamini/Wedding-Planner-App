import React, { useEffect, useState, useRef } from 'react'
import { 
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, 
  Modal, Alert, Animated, TextInput
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/services/firebaseConfig'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@/utils/notifications'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'

interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  relationship: string
  side: 'Bride' | 'Groom' | 'Both'
  invited: boolean
  confirmed: boolean
  attending: boolean
  plusOne: boolean
  tableNumber?: number
  createdAt: string
}

const RELATIONSHIPS = ['Family', 'Friend', 'Colleague', 'Other']
const SIDES = ['Bride', 'Groom', 'Both']

export default function GuestsScreen() {
  const { user } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showRelationshipModal, setShowRelationshipModal] = useState(false)
  const [showSideModal, setShowSideModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSide, setFilterSide] = useState('All')
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all')

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('Friend')
  const [side, setSide] = useState<'Bride' | 'Groom' | 'Both'>('Both')
  const [plusOne, setPlusOne] = useState(false)
  const [tableNumber, setTableNumber] = useState('')

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start()
  }, [])

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "guests"), where("userId", "==", user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Guest))
      setGuests(data.sort((a, b) => a.name.localeCompare(b.name)))
    })

    return () => unsubscribe()
  }, [user])

  const handleAddOrUpdate = async () => {
    if (!name.trim()) {
      return showToast('error', 'Error', 'Please enter guest name')
    }

    try {
      const guestData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        relationship,
        side,
        plusOne,
        tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
        updatedAt: new Date().toISOString()
      }

      if (editingGuest) {
        await updateDoc(doc(db, "guests", editingGuest.id), guestData)
        showToast('success', 'Updated!', 'Guest updated successfully')
      } else {
        await addDoc(collection(db, "guests"), {
          ...guestData,
          userId: user?.uid,
          invited: true,
          confirmed: false,
          attending: false,
          createdAt: new Date().toISOString()
        })
        showToast('success', 'Added!', 'New guest added')
      }
      closeModal()
    } catch (error) {
      showToast('error', 'Error', 'Failed to save guest')
    }
  }

  const toggleConfirmed = async (guest: Guest) => {
    try {
      await updateDoc(doc(db, "guests", guest.id), {
        confirmed: !guest.confirmed,
        attending: !guest.confirmed ? true : guest.attending
      })
    } catch (error) {
      showToast('error', 'Error', 'Failed to update guest status')
    }
  }

  const handleDelete = (guest: Guest) => {
    Alert.alert(
      'Remove Guest',
      `Are you sure you want to remove ${guest.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "guests", guest.id))
              showToast('success', 'Removed', 'Guest removed from list')
            } catch (error) {
              showToast('error', 'Error', 'Failed to remove guest')
            }
          }
        }
      ]
    )
  }

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest)
    setName(guest.name)
    setEmail(guest.email || '')
    setPhone(guest.phone || '')
    setRelationship(guest.relationship)
    setSide(guest.side)
    setPlusOne(guest.plusOne)
    setTableNumber(guest.tableNumber?.toString() || '')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setShowRelationshipModal(false)
    setShowSideModal(false)
    setEditingGuest(null)
    setName('')
    setEmail('')
    setPhone('')
    setRelationship('Friend')
    setSide('Both')
    setPlusOne(false)
    setTableNumber('')
  }

  const filteredGuests = guests.filter(guest => {
    const searchMatch = 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const sideMatch = filterSide === 'All' || guest.side === filterSide
    const statusMatch = 
      filterStatus === 'all' ? true :
      filterStatus === 'confirmed' ? guest.confirmed : !guest.confirmed
    return searchMatch && sideMatch && statusMatch
  })

  const getGuestStats = () => {
    const total = guests.length
    const confirmed = guests.filter(g => g.confirmed).length
    const pending = total - confirmed
    const totalWithPlusOnes = guests.reduce((sum, g) => sum + (g.plusOne ? 2 : 1), 0)
    return { total, confirmed, pending, totalWithPlusOnes }
  }

  const stats = getGuestStats()
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6]
  })

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
              Wedding Guests
            </Text>
            <Text
              style={{
                fontFamily: 'System',
                fontSize: 28,
                fontWeight: '300',
                color: '#8B4555',
                letterSpacing: 0.5
              }}
            >
              Your Guest List
            </Text>
          </View>

          {/* Stats Card */}
          <View className="px-6 mb-6">
            <Animated.View style={{ transform: [{ translateY: floatY }] }}>
              <LinearGradient
                colors={['#FFB6C1', '#FF69B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-[28px] p-6"
                style={{
                  shadowColor: '#FF69B4',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 8
                }}
              >
                <Text
                  className="mb-4"
                  style={{
                    fontFamily: 'System',
                    fontSize: 12,
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase'
                  }}
                >
                  Guest Overview
                </Text>
                
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 32,
                        fontWeight: '300',
                        color: '#FFFFFF'
                      }}
                    >
                      {stats.total}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 11,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5,
                        marginTop: 2
                      }}
                    >
                      Invited
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 32,
                        fontWeight: '300',
                        color: '#FFFFFF'
                      }}
                    >
                      {stats.confirmed}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 11,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5,
                        marginTop: 2
                      }}
                    >
                      Confirmed
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 32,
                        fontWeight: '300',
                        color: '#FFFFFF'
                      }}
                    >
                      {stats.pending}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 11,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5,
                        marginTop: 2
                      }}
                    >
                      Pending
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 32,
                        fontWeight: '300',
                        color: '#FFFFFF'
                      }}
                    >
                      {stats.totalWithPlusOnes}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 11,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5,
                        marginTop: 2
                      }}
                    >
                      Total +1s
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Search Bar */}
          <View className="px-6 mb-4">
            <View
              className="rounded-2xl flex-row items-center px-4 py-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 1.5,
                borderColor: '#FFD4D4'
              }}
            >
              <Ionicons name="search-outline" size={20} color="#B76E79" />
              <TextInput
                placeholder="Search by name or email..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#D4A5A5"
                className="flex-1 ml-3 mr-2"
                style={{
                  fontFamily: 'System',
                  fontSize: 15,
                  color: '#8B4555'
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#B76E79" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <View className="px-6 mb-4">
            <View 
              className="rounded-2xl p-1 flex-row"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1.5, borderColor: '#FFD4D4' }}
            >
              {(['all', 'confirmed', 'pending'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilterStatus(status)}
                  className="flex-1 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: filterStatus === status ? '#FF69B4' : 'transparent'
                  }}
                >
                  <Text
                    className="text-center capitalize"
                    style={{
                      fontFamily: 'System',
                      fontSize: 14,
                      fontWeight: filterStatus === status ? '600' : '400',
                      color: filterStatus === status ? '#FFFFFF' : '#8B4555',
                      letterSpacing: 0.3
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Side Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mb-6"
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48 }}
          >
            <TouchableOpacity
              onPress={() => setFilterSide('All')}
              className="mr-3"
            >
              <View
                className="rounded-full px-5 py-2.5"
                style={{
                  backgroundColor: filterSide === 'All' ? '#FF69B4' : 'rgba(255, 255, 255, 0.8)',
                  borderWidth: 1.5,
                  borderColor: filterSide === 'All' ? '#FF69B4' : '#FFD4D4'
                }}
              >
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 14,
                    fontWeight: filterSide === 'All' ? '600' : '400',
                    color: filterSide === 'All' ? '#FFFFFF' : '#8B4555',
                    letterSpacing: 0.3
                  }}
                >
                  All Guests
                </Text>
              </View>
            </TouchableOpacity>
            
            {SIDES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFilterSide(s)}
                className="mr-3"
              >
                <View
                  className="rounded-full px-5 py-2.5"
                  style={{
                    backgroundColor: filterSide === s ? '#FF69B4' : 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 1.5,
                    borderColor: filterSide === s ? '#FF69B4' : '#FFD4D4'
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'System',
                      fontSize: 14,
                      fontWeight: filterSide === s ? '600' : '400',
                      color: filterSide === s ? '#FFFFFF' : '#8B4555',
                      letterSpacing: 0.3
                    }}
                  >
                    {s}'s Side
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Guest List */}
          <View className="px-6">
            {filteredGuests.length === 0 ? (
              <View className="items-center py-16">
                <View
                  className="rounded-full items-center justify-center mb-4"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255, 182, 193, 0.2)'
                  }}
                >
                  <Ionicons name="people-outline" size={40} color="#FFB6C1" />
                </View>
                <Text
                  className="text-center mb-2"
                  style={{
                    fontFamily: 'System',
                    fontSize: 16,
                    fontWeight: '400',
                    color: '#B76E79'
                  }}
                >
                  {searchQuery ? 'No guests found' : 'No guests yet'}
                </Text>
                <Text
                  className="text-center px-8"
                  style={{
                    fontFamily: 'System',
                    fontSize: 13,
                    fontWeight: '300',
                    color: '#D4A5A5',
                    lineHeight: 20
                  }}
                >
                  {searchQuery ? 'Try a different search term' : 'Start building your guest list!'}
                </Text>
              </View>
            ) : (
              filteredGuests.map((guest) => (
                <View
                  key={guest.id}
                  className="rounded-[24px] p-4 mb-3"
                  style={{
                    backgroundColor: guest.confirmed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                    borderWidth: 1.5,
                    borderColor: guest.confirmed ? '#10B981' : '#FFD4D4'
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text
                          className="flex-1"
                          style={{
                            fontFamily: 'System',
                            fontSize: 17,
                            fontWeight: '600',
                            color: '#8B4555',
                            letterSpacing: 0.2
                          }}
                        >
                          {guest.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleConfirmed(guest)}
                          className="ml-2 px-3 py-1.5 rounded-full"
                          style={{
                            backgroundColor: guest.confirmed ? '#D1FAE5' : '#F3F4F6'
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 11,
                              fontWeight: '700',
                              color: guest.confirmed ? '#059669' : '#6B7280',
                              letterSpacing: 0.3
                            }}
                          >
                            {guest.confirmed ? '✓ RSVP' : 'Pending'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      
                      {guest.email && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                          <Text
                            className="ml-2"
                            style={{
                              fontFamily: 'System',
                              fontSize: 13,
                              fontWeight: '400',
                              color: '#6B7280'
                            }}
                          >
                            {guest.email}
                          </Text>
                        </View>
                      )}
                      
                      {guest.phone && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                          <Text
                            className="ml-2"
                            style={{
                              fontFamily: 'System',
                              fontSize: 13,
                              fontWeight: '400',
                              color: '#6B7280'
                            }}
                          >
                            {guest.phone}
                          </Text>
                        </View>
                      )}

                      <View className="flex-row items-center mt-3 flex-wrap">
                        <View
                          className="px-3 py-1.5 rounded-full mr-2 mb-2"
                          style={{ backgroundColor: '#EDE9FE' }}
                        >
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 11,
                              fontWeight: '600',
                              color: '#7C3AED',
                              letterSpacing: 0.3
                            }}
                          >
                            {guest.side}'s Side
                          </Text>
                        </View>
                        
                        <View
                          className="px-3 py-1.5 rounded-full mr-2 mb-2"
                          style={{ backgroundColor: '#DBEAFE' }}
                        >
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 11,
                              fontWeight: '600',
                              color: '#2563EB',
                              letterSpacing: 0.3
                            }}
                          >
                            {guest.relationship}
                          </Text>
                        </View>
                        
                        {guest.plusOne && (
                          <View
                            className="px-3 py-1.5 rounded-full mr-2 mb-2"
                            style={{ backgroundColor: '#FED7AA' }}
                          >
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '600',
                                color: '#EA580C',
                                letterSpacing: 0.3
                              }}
                            >
                              +1
                            </Text>
                          </View>
                        )}
                        
                        {guest.tableNumber && (
                          <View
                            className="px-3 py-1.5 rounded-full mb-2"
                            style={{ backgroundColor: '#F3F4F6' }}
                          >
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '600',
                                color: '#6B7280',
                                letterSpacing: 0.3
                              }}
                            >
                              Table {guest.tableNumber}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View className="flex-row justify-end pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
                    <TouchableOpacity
                      onPress={() => openEditModal(guest)}
                      className="px-4 py-2 rounded-xl flex-row items-center mr-2"
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    >
                      <Ionicons name="pencil" size={16} color="#3B82F6" />
                      <Text
                        className="ml-2"
                        style={{
                          fontFamily: 'System',
                          fontSize: 13,
                          fontWeight: '600',
                          color: '#3B82F6',
                          letterSpacing: 0.3
                        }}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDelete(guest)}
                      className="px-4 py-2 rounded-xl flex-row items-center"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                      <Text
                        className="ml-2"
                        style={{
                          fontFamily: 'System',
                          fontSize: 13,
                          fontWeight: '600',
                          color: '#EF4444',
                          letterSpacing: 0.3
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="absolute bottom-24 right-6 rounded-full items-center justify-center"
        style={{
          width: 64,
          height: 64,
          shadowColor: '#FF69B4',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8
        }}
      >
        <LinearGradient
          colors={['#FFB6C1', '#FF69B4', '#FF1493']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-full items-center justify-center"
          style={{ width: 64, height: 64 }}
        >
          <Ionicons name="person-add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <TouchableOpacity 
          activeOpacity={1}
          onPress={closeModal}
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <TouchableOpacity activeOpacity={1}>
            <ScrollView
              className="rounded-t-[40px] p-6 pb-10"
              style={{ backgroundColor: '#FFF5F5', maxHeight: '90%' }}
              bounces={false}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 24,
                    fontWeight: '300',
                    color: '#8B4555',
                    letterSpacing: 0.5
                  }}
                >
                  {editingGuest ? 'Edit Guest' : 'Add Guest'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color="#B76E79" />
                </TouchableOpacity>
              </View>

              {/* Using FormInput components */}
              <FormInput
                label="Guest Name *"
                placeholder="Full name"
                value={name}
                onChangeText={setName}
              />

              <FormInput
                label="Email"
                placeholder="guest@example.com"
                value={email}
                onChangeText={setEmail}
              />

              <FormInput
                label="Phone"
                placeholder="+94 XX XXX XXXX"
                value={phone}
                onChangeText={setPhone}
              />

              {/* Using SelectInput for Relationship */}
              <SelectInput
                label="Relationship"
                value={relationship}
                onPress={() => setShowRelationshipModal(true)}
                icon="people-outline"
              />

              {/* Using SelectInput for Side */}
              <SelectInput
                label="Guest Side"
                value={side}
                onPress={() => setShowSideModal(true)}
                icon="heart-outline"
              />

              {/* Plus One Toggle */}
              <View className="mb-5">
                <Text
                  className="mb-2 ml-1"
                  style={{
                    fontFamily: 'System',
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151'
                  }}
                >
                  Allow Plus One
                </Text>
                <TouchableOpacity
                  onPress={() => setPlusOne(!plusOne)}
                  className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex-row justify-between items-center"
                >
                  <Text style={{ color: '#6B7280' }}>
                    {plusOne ? 'Yes, allow +1' : 'No plus one'}
                  </Text>
                  <View
                    className="w-12 h-6 rounded-full"
                    style={{
                      backgroundColor: plusOne ? '#10B981' : '#D1D5DB'
                    }}
                  >
                    <View
                      className="w-5 h-5 rounded-full bg-white mt-0.5"
                      style={{
                        marginLeft: plusOne ? 26 : 2
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <FormInput
                label="Table Number (Optional)"
                placeholder="e.g., 5"
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="numeric"
              />

              {/* Using GlassButton */}
              <GlassButton
                title={editingGuest ? 'Update Guest' : 'Add Guest'}
                onPress={handleAddOrUpdate}
                // bgColor="bg-[#FF69B4]"
              />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Relationship Modal */}
      <Modal visible={showRelationshipModal} transparent animationType="slide">
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowRelationshipModal(false)}
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
                  Select Relationship
                </Text>
              </View>

              {RELATIONSHIPS.map((rel) => (
                <TouchableOpacity 
                  key={rel}
                  className="mb-3"
                  onPress={() => { 
                    setRelationship(rel)
                    setShowRelationshipModal(false)
                  }}
                >
                  <View
                    className="rounded-2xl p-4 flex-row items-center justify-between"
                    style={{
                      backgroundColor: relationship === rel ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 255, 255, 0.8)',
                      borderWidth: 1.5,
                      borderColor: relationship === rel ? '#FF69B4' : '#FFD4D4'
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 16,
                        fontWeight: relationship === rel ? '600' : '400',
                        color: '#8B4555',
                        letterSpacing: 0.3
                      }}
                    >
                      {rel}
                    </Text>
                    {relationship === rel && (
                      <Ionicons name="checkmark-circle" size={24} color="#FF69B4" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Side Modal */}
      <Modal visible={showSideModal} transparent animationType="slide">
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowSideModal(false)}
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
                  Select Guest Side
                </Text>
              </View>

              {SIDES.map((s) => (
                <TouchableOpacity 
                  key={s}
                  className="mb-3"
                  onPress={() => { 
                    setSide(s as any)
                    setShowSideModal(false)
                  }}
                >
                  <View
                    className="rounded-2xl p-4 flex-row items-center justify-between"
                    style={{
                      backgroundColor: side === s ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 255, 255, 0.8)',
                      borderWidth: 1.5,
                      borderColor: side === s ? '#FF69B4' : '#FFD4D4'
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 16,
                        fontWeight: side === s ? '600' : '400',
                        color: '#8B4555',
                        letterSpacing: 0.3
                      }}
                    >
                      {s}
                    </Text>
                    {side === s && (
                      <Ionicons name="checkmark-circle" size={24} color="#FF69B4" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}