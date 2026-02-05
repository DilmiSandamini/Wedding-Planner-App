import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

// Custom Imports
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/utils/notifications'
import { Task } from '@/types/task'
import { subscribeToTasks, addTask, updateTask, deleteTask } from '@/services/taskService'

// Components
import DashboardCard from '@/components/dashboard/DashboardCard'
import SectionHeader from '@/components/dashboard/SectionHeader'
import TaskModal from '@/components/dashboard/TaskModal'

const TASK_CATEGORIES = [
  { name: 'All', color: '#FF69B4' },
  { name: 'Planning', color: '#FFB6C1' },
  { name: 'Venue', color: '#FFC0CB' },
  { name: 'Catering', color: '#FFD4E5' },
  { name: 'Shopping', color: '#E8A0BF' },
  { name: 'Other', color: '#D4A5A5' }
]

export default function TasksScreen() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')

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
    const unsubscribe = subscribeToTasks(user.uid, (data) => setTasks(data))
    return () => unsubscribe()
  }, [user])

  // Handlers
  const handleSaveTask = async (data: { title: string, description: string, category: string, dueDate: Date }) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, { ...data, dueDate: data.dueDate.toISOString() })
        showToast('success', 'Updated', 'Task updated successfully')
      } else {
        await addTask(user?.uid!, { ...data, dueDate: data.dueDate.toISOString() })
        showToast('success', 'Added', 'New task added')
      }
      setShowModal(false)
      setEditingTask(null)
    } catch (error) {
      showToast('error', 'Error', 'Something went wrong')
    }
  }

  const toggleComplete = (task: Task) => {
    updateTask(task.id, { completed: !task.completed })
  }

  const handleDelete = (task: Task) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          deleteTask(task.id)
          showToast('info', 'Deleted', 'Task removed')
      }}
    ])
  }

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const categoryMatch = filterCategory === 'All' || task.category === filterCategory
    const statusMatch = filterStatus === 'all' ? true : filterStatus === 'completed' ? task.completed : !task.completed
    return categoryMatch && statusMatch
  })

  // Stats
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5F5]">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-[#B76E79] font-light text-sm tracking-widest mb-1">Wedding Tasks</Text>
            <Text className="text-[#8B4555] font-light text-3xl tracking-wide">Your To-Do List</Text>
          </View>

          {/* Progress Card */}
          <View className="px-6 mb-6">
            <LinearGradient
              colors={['#FFB6C1', '#FF69B4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              className="rounded-[28px] p-6 shadow-lg shadow-pink-300"
            >
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-white/90 font-medium text-xs tracking-[1.5px] uppercase">Task Completion</Text>
                  <Text className="text-white font-light text-4xl mt-1">{percentage}%</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
                  <Ionicons name="list" size={30} color="#FFF" />
                </Animated.View>
              </View>
              <View className="h-2 bg-white/30 rounded-full overflow-hidden">
                <View className="h-full bg-white rounded-full" style={{ width: `${percentage}%` }} />
              </View>
              <View className="flex-row justify-between mt-3 px-1">
                <Text className="text-white/80 text-xs font-medium">{completed} Completed</Text>
                <Text className="text-white/80 text-xs font-medium">{total - completed} Pending</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Status Tabs */}
          <View className="px-6 mb-4">
            <View className="rounded-2xl p-1 flex-row bg-white/80 border border-[#FFD4D4]">
              {(['all', 'pending', 'completed'] as const).map((status) => (
                <TouchableOpacity key={status} onPress={() => setFilterStatus(status)} className={`flex-1 py-2.5 rounded-xl ${filterStatus === status ? 'bg-[#FF69B4]' : 'bg-transparent'}`}>
                  <Text className={`text-center capitalize text-sm font-${filterStatus === status ? 'semibold' : 'normal'} text-${filterStatus === status ? 'white' : '[#8B4555]'}`}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pl-6">
            {TASK_CATEGORIES.map((cat) => {
              const active = filterCategory === cat.name
              return (
                <TouchableOpacity key={cat.name} onPress={() => setFilterCategory(cat.name)} className="mr-3">
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

          {/* Task List */}
          <View className="px-6">
            <SectionHeader title={filterCategory === 'All' ? 'All Tasks' : `${filterCategory} Tasks`} />
            
            {filteredTasks.length === 0 ? (
              <View className="items-center py-12 opacity-60">
                <View className="w-20 h-20 bg-pink-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="create-outline" size={40} color="#FFB6C1" />
                </View>
                <Text className="text-[#B76E79]">No tasks found</Text>
              </View>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = !task.completed && new Date(task.dueDate) < new Date()
                return (
                  <DashboardCard key={task.id} className={`mb-3 p-4 flex-row items-center !bg-white/90 ${isOverdue ? 'border-red-200' : ''}`}>
                    <TouchableOpacity onPress={() => toggleComplete(task)} className="mr-3">
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-[#FFD4D4]'}`}>
                        {task.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                    
                    <View className="flex-1">
                      <Text className={`text-[15px] font-medium mb-1 ${task.completed ? 'text-gray-400 line-through' : 'text-[#8B4555]'}`}>
                        {task.title}
                      </Text>
                      <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded-full mr-2 ${isOverdue ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <Text className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text className="text-[10px] text-[#B76E79] font-medium bg-pink-50 px-2 py-0.5 rounded-full">{task.category}</Text>
                      </View>
                    </View>

                    <View className="flex-row">
                      <TouchableOpacity onPress={() => { setEditingTask(task); setShowModal(true); }} className="p-2 bg-blue-50 rounded-full mr-2">
                        <Ionicons name="pencil" size={14} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(task)} className="p-2 bg-red-50 rounded-full">
                        <Ionicons name="trash" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </DashboardCard>
                )
              })
            )}
          </View>

        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        onPress={() => { setEditingTask(null); setShowModal(true); }}
        className="absolute bottom-24 right-6 shadow-lg shadow-pink-400"
      >
        <LinearGradient colors={['#FFB6C1', '#FF69B4', '#FF1493']} className="w-16 h-16 rounded-full items-center justify-center">
          <Ionicons name="add" size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <TaskModal 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSaveTask} 
        editingTask={editingTask} 
      />
    </SafeAreaView>
  )
}