import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

// Custom Imports
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/utils/notifications'
import { ChecklistItem, PriorityLevel } from '@/types/checklist'
import { 
  subscribeToChecklist, addChecklistItem, 
  updateChecklistItem, deleteChecklistItem 
} from '@/services/checklistService'

// Components
import DashboardCard from '@/components/dashboard/DashboardCard'
import SectionHeader from '@/components/dashboard/SectionHeader'
import ChecklistModal from '@/components/dashboard/ChecklistModal'

const CATEGORY_FILTERS = [
  { name: 'All', color: '#FF69B4' },
  { name: 'Venue', color: '#FFB6C1' },
  { name: 'Catering', color: '#FFC0CB' },
  { name: 'Decoration', color: '#FFD4E5' },
  { name: 'Photography', color: '#E8A0BF' },
  { name: 'Other', color: '#D4A5A5' }
]

export default function PlanScreen() {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start()
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
    ])).start()
  }, [])

  // Subscribe to Data
  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToChecklist(user.uid, (data) => setItems(data))
    return () => unsubscribe()
  }, [user])

  // Handlers
  const handleSaveItem = async (title: string, category: string, priority: PriorityLevel) => {
    try {
      if (editingItem) {
        await updateChecklistItem(editingItem.id, { title, category, priority })
        showToast('success', 'Updated', 'Task updated successfully')
      } else {
        await addChecklistItem(user?.uid!, title, category, priority)
        showToast('success', 'Added', 'New task added to checklist')
      }
      setShowModal(false)
      setEditingItem(null)
    } catch (error) {
      showToast('error', 'Error', 'Something went wrong')
    }
  }

  const toggleComplete = (item: ChecklistItem) => {
    updateChecklistItem(item.id, { completed: !item.completed })
  }

  const handleDelete = (item: ChecklistItem) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          deleteChecklistItem(item.id)
          showToast('info', 'Deleted', 'Task removed')
      }}
    ])
  }

  // Derived State
  const filteredItems = selectedCategory === 'All' ? items : items.filter(i => i.category === selectedCategory)
  const progress = items.length > 0 ? Math.round((items.filter(i => i.completed).length / items.length) * 100) : 0

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5F5]">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-[#B76E79] font-light text-sm tracking-widest mb-1">Wedding Checklist</Text>
            <Text className="text-[#8B4555] font-light text-3xl tracking-wide">Your Journey</Text>
          </View>

          {/* Progress Card */}
          <View className="px-6 mb-6">
            <LinearGradient
              colors={['#FFB6C1', '#FF69B4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              className="rounded-[28px] p-6 shadow-lg shadow-pink-300"
            >
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-white/90 font-medium text-xs tracking-[1.5px] uppercase">Overall Progress</Text>
                  <Text className="text-white font-light text-4xl mt-1">{progress}%</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
                  <Ionicons name="checkbox" size={30} color="#FFF" />
                </Animated.View>
              </View>
              <View className="h-2 bg-white/30 rounded-full overflow-hidden">
                <View className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
              </View>
              <View className="flex-row justify-between mt-3 px-1">
                <Text className="text-white/80 text-xs font-medium">{items.filter(i => i.completed).length} Done</Text>
                <Text className="text-white/80 text-xs font-medium">{items.filter(i => !i.completed).length} To Do</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pl-6">
            {CATEGORY_FILTERS.map((cat) => {
              const active = selectedCategory === cat.name
              return (
                <TouchableOpacity key={cat.name} onPress={() => setSelectedCategory(cat.name)} className="mr-3">
                  <View 
                    className="rounded-full px-5 py-2 border-[1.5px]"
                    style={{ 
                      backgroundColor: active ? cat.color : 'rgba(255,255,255,0.8)',
                      borderColor: active ? cat.color : '#FFD4D4'
                    }}
                  >
                    <Text style={{ color: active ? '#FFF' : '#8B4555', fontWeight: active ? '600' : '400' }}>{cat.name}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
            <View className="w-6" /> 
          </ScrollView>

          {/* List Items */}
          <View className="px-6">
            <SectionHeader title={selectedCategory === 'All' ? 'All Tasks' : `${selectedCategory} Tasks`} />
            
            {filteredItems.length === 0 ? (
              <View className="items-center py-12 opacity-60">
                <View className="w-20 h-20 bg-pink-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="clipboard-outline" size={40} color="#FFB6C1" />
                </View>
                <Text className="text-[#B76E79] text-base">No tasks found</Text>
                <Text className="text-[#D4A5A5] text-xs mt-1">Tap + to add one!</Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <DashboardCard key={item.id} className="mb-3 p-4 flex-row items-center !bg-white/90">
                  <TouchableOpacity onPress={() => toggleComplete(item)} className="mr-3">
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${item.completed ? 'bg-green-500 border-green-500' : 'border-[#FFD4D4]'}`}>
                      {item.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                  </TouchableOpacity>
                  
                  <View className="flex-1">
                    <Text className={`text-[15px] font-medium mb-1 ${item.completed ? 'text-gray-400 line-through' : 'text-[#8B4555]'}`}>
                      {item.title}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-gray-100 px-2 py-0.5 rounded-full mr-2">
                        <Text className="text-[10px] text-gray-500 font-medium">{item.category}</Text>
                      </View>
                      {item.priority === 'high' && <Text className="text-[10px]">🔥</Text>}
                      {item.priority === 'medium' && <Text className="text-[10px]">⭐</Text>}
                    </View>
                  </View>

                  <View className="flex-row">
                    <TouchableOpacity onPress={() => { setEditingItem(item); setShowModal(true); }} className="p-2 bg-blue-50 rounded-full mr-2">
                      <Ionicons name="pencil" size={14} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} className="p-2 bg-red-50 rounded-full">
                      <Ionicons name="trash" size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </DashboardCard>
              ))
            )}
          </View>

        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        onPress={() => { setEditingItem(null); setShowModal(true); }}
        className="absolute bottom-24 right-6 shadow-lg shadow-pink-400"
      >
        <LinearGradient
          colors={['#FFB6C1', '#FF69B4', '#FF1493']}
          className="w-16 h-16 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <ChecklistModal 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSaveItem} 
        editingItem={editingItem} 
      />
    </SafeAreaView>
  )
}