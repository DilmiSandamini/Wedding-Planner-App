import React, { useEffect, useState, useRef } from 'react'
import { 
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, 
  Modal, TextInput, Alert, Animated
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/services/firebaseConfig'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@/utils/notifications'

interface ChecklistItem {
  id: string
  title: string
  category: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}

const CATEGORIES = [
  { name: 'All', icon: 'apps', color: '#FF69B4' },
  { name: 'Venue', icon: 'business', color: '#FFB6C1' },
  { name: 'Catering', icon: 'restaurant', color: '#FFC0CB' },
  { name: 'Decoration', icon: 'color-palette', color: '#FFD4E5' },
  { name: 'Photography', icon: 'camera', color: '#E8A0BF' },
  { name: 'Entertainment', icon: 'musical-notes', color: '#FFA8B5' },
  { name: 'Attire', icon: 'shirt', color: '#E8C4C4' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: '#D4A5A5' }
]

const PRIORITIES = [
  { value: 'high', label: 'High', color: '#FF1493', emoji: '🔥' },
  { value: 'medium', label: 'Medium', color: '#FF69B4', emoji: '⭐' },
  { value: 'low', label: 'Low', color: '#FFB6C1', emoji: '✨' }
]

export default function PlanScreen() {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Venue')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')

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

    const q = query(collection(db, "checklist_items"), where("userId", "==", user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChecklistItem))
      setItems(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    })

    return () => unsubscribe()
  }, [user])

  const handleAddOrUpdate = async () => {
    if (!title.trim()) {
      return showToast('error', 'Error', 'Please enter a title')
    }

    try {
      if (editingItem) {
        await updateDoc(doc(db, "checklist_items", editingItem.id), {
          title: title.trim(),
          category,
          priority,
          updatedAt: new Date().toISOString()
        })
        showToast('success', 'Updated!', 'Checklist item updated successfully')
      } else {
        await addDoc(collection(db, "checklist_items"), {
          userId: user?.uid,
          title: title.trim(),
          category,
          priority,
          completed: false,
          createdAt: new Date().toISOString()
        })
        showToast('success', 'Added!', 'New item added to your checklist')
      }
      closeModal()
    } catch (error) {
      showToast('error', 'Error', 'Failed to save item')
    }
  }

  const toggleComplete = async (item: ChecklistItem) => {
    try {
      await updateDoc(doc(db, "checklist_items", item.id), {
        completed: !item.completed
      })
    } catch (error) {
      showToast('error', 'Error', 'Failed to update item')
    }
  }

  const handleDelete = (item: ChecklistItem) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "checklist_items", item.id))
              showToast('success', 'Deleted', 'Item removed from checklist')
            } catch (error) {
              showToast('error', 'Error', 'Failed to delete item')
            }
          }
        }
      ]
    )
  }

  const openEditModal = (item: ChecklistItem) => {
    setEditingItem(item)
    setTitle(item.title)
    setCategory(item.category)
    setPriority(item.priority)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setTitle('')
    setCategory('Venue')
    setPriority('medium')
  }

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  const completionRate = items.length > 0 
    ? Math.round((items.filter(i => i.completed).length / items.length) * 100) 
    : 0

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
              Wedding Checklist
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
              Your Planning Journey
            </Text>
          </View>

          {/* Progress Card */}
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
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 12,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.9)',
                        letterSpacing: 1.5,
                        textTransform: 'uppercase'
                      }}
                    >
                      Overall Progress
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 36,
                        fontWeight: '300',
                        color: '#FFFFFF',
                        marginTop: 4
                      }}
                    >
                      {completionRate}%
                    </Text>
                  </View>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 60,
                        height: 60,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Ionicons name="checkbox" size={32} color="#FFFFFF" />
                    </View>
                  </Animated.View>
                </View>

                {/* Progress Bar */}
                <View 
                  className="rounded-full h-3 mb-4 overflow-hidden"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${completionRate}%`,
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </View>

                {/* Stats */}
                <View className="flex-row justify-between pt-4 border-t border-white/20">
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 20,
                        fontWeight: '400',
                        color: '#FFFFFF'
                      }}
                    >
                      {items.filter(i => i.completed).length}
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
                      Completed
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 20,
                        fontWeight: '400',
                        color: '#FFFFFF'
                      }}
                    >
                      {items.filter(i => !i.completed).length}
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
                      Remaining
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 20,
                        fontWeight: '400',
                        color: '#FFFFFF'
                      }}
                    >
                      {items.length}
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
                      Total
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mb-6"
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.name
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setSelectedCategory(cat.name)}
                  className="mr-3"
                >
                  <View
                    className="rounded-full px-5 py-2.5 flex-row items-center"
                    style={{
                      backgroundColor: isActive ? cat.color : 'rgba(255, 255, 255, 0.8)',
                      borderWidth: 1.5,
                      borderColor: isActive ? cat.color : '#FFD4D4'
                    }}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={16} 
                      color={isActive ? '#FFFFFF' : cat.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 14,
                        fontWeight: isActive ? '600' : '400',
                        color: isActive ? '#FFFFFF' : '#8B4555',
                        letterSpacing: 0.3
                      }}
                    >
                      {cat.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Checklist Items */}
          <View className="px-6">
            {filteredItems.length === 0 ? (
              <View className="items-center py-16">
                <View
                  className="rounded-full items-center justify-center mb-4"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255, 182, 193, 0.2)'
                  }}
                >
                  <Ionicons name="clipboard-outline" size={40} color="#FFB6C1" />
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
                  No items yet
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
                  Tap the + button to add your first checklist item!
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const priorityData = PRIORITIES.find(p => p.value === item.priority)
                
                return (
                  <View
                    key={item.id}
                    className="rounded-[24px] p-4 mb-3"
                    style={{
                      backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                      borderWidth: 1.5,
                      borderColor: item.completed ? '#10B981' : '#FFD4D4'
                    }}
                  >
                    <View className="flex-row items-start">
                      <TouchableOpacity
                        onPress={() => toggleComplete(item)}
                        className="mr-3 mt-0.5"
                      >
                        <View
                          className="rounded-full items-center justify-center"
                          style={{
                            width: 26,
                            height: 26,
                            backgroundColor: item.completed ? '#10B981' : 'transparent',
                            borderWidth: 2,
                            borderColor: item.completed ? '#10B981' : '#FFD4D4'
                          }}
                        >
                          {item.completed && (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>

                      <View className="flex-1">
                        <Text
                          style={{
                            fontFamily: 'System',
                            fontSize: 15,
                            fontWeight: '500',
                            color: item.completed ? '#6B7280' : '#8B4555',
                            textDecorationLine: item.completed ? 'line-through' : 'none',
                            letterSpacing: 0.2,
                            marginBottom: 8
                          }}
                        >
                          {item.title}
                        </Text>
                        
                        <View className="flex-row items-center flex-wrap">
                          <View
                            className="rounded-full px-3 py-1.5 mr-2 mb-2"
                            style={{ backgroundColor: '#F3F4F6' }}
                          >
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '500',
                                color: '#6B7280',
                                letterSpacing: 0.3
                              }}
                            >
                              {item.category}
                            </Text>
                          </View>
                          
                          <View
                            className="rounded-full px-3 py-1.5 flex-row items-center mb-2"
                            style={{ backgroundColor: `${priorityData?.color}15` }}
                          >
                            <Text style={{ fontSize: 12, marginRight: 4 }}>
                              {priorityData?.emoji}
                            </Text>
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '600',
                                color: priorityData?.color,
                                letterSpacing: 0.3
                              }}
                            >
                              {priorityData?.label}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex-row ml-2">
                        <TouchableOpacity
                          onPress={() => openEditModal(item)}
                          className="rounded-full items-center justify-center mr-2"
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                          }}
                        >
                          <Ionicons name="pencil" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleDelete(item)}
                          className="rounded-full items-center justify-center"
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }}
                        >
                          <Ionicons name="trash" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )
              })
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
          <Ionicons name="add" size={32} color="#FFFFFF" />
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
            <View
              className="rounded-t-[40px] p-6 pb-10"
              style={{ backgroundColor: '#FFF5F5' }}
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
                  {editingItem ? 'Edit Item' : 'New Item'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color="#B76E79" />
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <Text
                className="mb-2"
                style={{
                  fontFamily: 'System',
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#8B4555',
                  letterSpacing: 0.5
                }}
              >
                Title
              </Text>
              <View
                className="rounded-2xl flex-row items-center px-4 py-3 mb-5"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1.5,
                  borderColor: '#FFD4D4'
                }}
              >
                <Ionicons name="text-outline" size={20} color="#B76E79" />
                <TextInput
                  placeholder="e.g., Book the venue"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#D4A5A5"
                  className="flex-1 ml-3"
                  style={{
                    fontFamily: 'System',
                    fontSize: 15,
                    color: '#8B4555'
                  }}
                />
              </View>

              {/* Category */}
              <Text
                className="mb-2"
                style={{
                  fontFamily: 'System',
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#8B4555',
                  letterSpacing: 0.5
                }}
              >
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
                {CATEGORIES.filter(c => c.name !== 'All').map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setCategory(cat.name)}
                    className="mr-2"
                  >
                    <View
                      className="rounded-2xl px-4 py-3 flex-row items-center"
                      style={{
                        backgroundColor: category === cat.name ? `${cat.color}20` : 'rgba(255, 255, 255, 0.9)',
                        borderWidth: 1.5,
                        borderColor: category === cat.name ? cat.color : '#FFD4D4'
                      }}
                    >
                      <Ionicons 
                        name={cat.icon as any} 
                        size={16} 
                        color={cat.color}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 13,
                          fontWeight: category === cat.name ? '600' : '400',
                          color: cat.color,
                          letterSpacing: 0.3
                        }}
                      >
                        {cat.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Priority */}
              <Text
                className="mb-2"
                style={{
                  fontFamily: 'System',
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#8B4555',
                  letterSpacing: 0.5
                }}
              >
                Priority
              </Text>
              <View className="flex-row justify-between mb-6">
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setPriority(p.value as any)}
                    className="flex-1 mx-1"
                  >
                    <View
                      className="rounded-2xl py-3 items-center"
                      style={{
                        backgroundColor: priority === p.value ? `${p.color}20` : 'rgba(255, 255, 255, 0.9)',
                        borderWidth: 2,
                        borderColor: priority === p.value ? p.color : '#FFD4D4'
                      }}
                    >
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>
                        {p.emoji}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 13,
                          fontWeight: priority === p.value ? '600' : '400',
                          color: priority === p.value ? p.color : '#8B4555',
                          letterSpacing: 0.3
                        }}
                      >
                        {p.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleAddOrUpdate}
                style={{
                  shadowColor: '#FF69B4',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5
                }}
              >
                <LinearGradient
                  colors={['#FFB6C1', '#FF69B4', '#FF1493']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-2xl py-4"
                >
                  <Text
                    className="text-center"
                    style={{
                      fontFamily: 'System',
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#FFFFFF',
                      letterSpacing: 1.5
                    }}
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}