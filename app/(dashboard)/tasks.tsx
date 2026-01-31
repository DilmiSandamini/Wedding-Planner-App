import React, { useEffect, useState, useRef } from 'react'
import { 
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, 
  Modal, Alert, Animated
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/services/firebaseConfig'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { showToast } from '@/utils/notifications'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'

interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  completed: boolean
  category: string
  createdAt: string
}

const TASK_CATEGORIES = [
  { name: 'All', icon: 'apps', color: '#FF69B4' },
  { name: 'Planning', icon: 'calendar-outline', color: '#FFB6C1' },
  { name: 'Venue', icon: 'business-outline', color: '#FFC0CB' },
  { name: 'Catering', icon: 'restaurant-outline', color: '#FFD4E5' },
  { name: 'Shopping', icon: 'cart-outline', color: '#E8A0BF' },
  { name: 'Decor', icon: 'color-palette-outline', color: '#FFA8B5' },
  { name: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: '#E8C4C4' }
]

export default function TasksScreen() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Planning')
  const [dueDate, setDueDate] = useState(new Date())

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

    const q = query(collection(db, "tasks"), where("userId", "==", user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task))
      setTasks(data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
    })

    return () => unsubscribe()
  }, [user])

  const handleAddOrUpdate = async () => {
    if (!title.trim()) {
      return showToast('error', 'Error', 'Please enter a task title')
    }

    try {
      if (editingTask) {
        await updateDoc(doc(db, "tasks", editingTask.id), {
          title: title.trim(),
          description: description.trim(),
          category,
          dueDate: dueDate.toISOString(),
          updatedAt: new Date().toISOString()
        })
        showToast('success', 'Updated!', 'Task updated successfully')
      } else {
        await addDoc(collection(db, "tasks"), {
          userId: user?.uid,
          title: title.trim(),
          description: description.trim(),
          category,
          dueDate: dueDate.toISOString(),
          completed: false,
          createdAt: new Date().toISOString()
        })
        showToast('success', 'Added!', 'New task added')
      }
      closeModal()
    } catch (error) {
      showToast('error', 'Error', 'Failed to save task')
    }
  }

  const toggleComplete = async (task: Task) => {
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        completed: !task.completed
      })
    } catch (error) {
      showToast('error', 'Error', 'Failed to update task')
    }
  }

  const handleDelete = (task: Task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "tasks", task.id))
              showToast('success', 'Deleted', 'Task removed')
            } catch (error) {
              showToast('error', 'Error', 'Failed to delete task')
            }
          }
        }
      ]
    )
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setCategory(task.category)
    setDueDate(new Date(task.dueDate))
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setShowCategoryModal(false)
    setEditingTask(null)
    setTitle('')
    setDescription('')
    setCategory('Planning')
    setDueDate(new Date())
  }

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = filterCategory === 'All' || task.category === filterCategory
    const statusMatch = 
      filterStatus === 'all' ? true :
      filterStatus === 'completed' ? task.completed :
      !task.completed
    return categoryMatch && statusMatch
  })

  const isOverdue = (dateString: string, completed: boolean) => {
    if (completed) return false
    return new Date(dateString) < new Date()
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const overdue = tasks.filter(t => isOverdue(t.dueDate, t.completed)).length
    return { total, completed, overdue, pending: total - completed }
  }

  const stats = getTaskStats()
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
              Wedding Tasks
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
              Your To-Do List
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="px-6 mb-6">
            <Animated.View 
              className="flex-row justify-between"
              style={{ transform: [{ translateY: floatY }] }}
            >
              <View
                className="rounded-[24px] p-5 items-center"
                style={{
                  width: '31%',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(59, 130, 246, 0.3)'
                }}
              >
                <Ionicons name="list-outline" size={28} color="#3B82F6" />
                <Text
                  className="mt-2"
                  style={{
                    fontFamily: 'System',
                    fontSize: 24,
                    fontWeight: '300',
                    color: '#8B4555'
                  }}
                >
                  {stats.total}
                </Text>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 10,
                    fontWeight: '500',
                    color: '#3B82F6',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginTop: 2
                  }}
                >
                  Total
                </Text>
              </View>

              <View
                className="rounded-[24px] p-5 items-center"
                style={{
                  width: '31%',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(16, 185, 129, 0.3)'
                }}
              >
                <Ionicons name="checkmark-done-outline" size={28} color="#10B981" />
                <Text
                  className="mt-2"
                  style={{
                    fontFamily: 'System',
                    fontSize: 24,
                    fontWeight: '300',
                    color: '#8B4555'
                  }}
                >
                  {stats.completed}
                </Text>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 10,
                    fontWeight: '500',
                    color: '#10B981',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginTop: 2
                  }}
                >
                  Done
                </Text>
              </View>

              <View
                className="rounded-[24px] p-5 items-center"
                style={{
                  width: '31%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
              >
                <Ionicons name="time-outline" size={28} color="#EF4444" />
                <Text
                  className="mt-2"
                  style={{
                    fontFamily: 'System',
                    fontSize: 24,
                    fontWeight: '300',
                    color: '#8B4555'
                  }}
                >
                  {stats.overdue}
                </Text>
                <Text
                  style={{
                    fontFamily: 'System',
                    fontSize: 10,
                    fontWeight: '500',
                    color: '#EF4444',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginTop: 2
                  }}
                >
                  Overdue
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Filter Tabs */}
          <View className="px-6 mb-4">
            <View 
              className="rounded-2xl p-1 flex-row"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1.5, borderColor: '#FFD4D4' }}
            >
              {(['all', 'pending', 'completed'] as const).map((status) => (
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

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mb-6"
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48 }}
          >
            {TASK_CATEGORIES.map((cat) => {
              const isActive = filterCategory === cat.name
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setFilterCategory(cat.name)}
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

          {/* Tasks List */}
          <View className="px-6">
            {filteredTasks.length === 0 ? (
              <View className="items-center py-16">
                <View
                  className="rounded-full items-center justify-center mb-4"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255, 182, 193, 0.2)'
                  }}
                >
                  <Ionicons name="checkbox-outline" size={40} color="#FFB6C1" />
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
                  No tasks found
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
                  Start adding your wedding to-dos!
                </Text>
              </View>
            ) : (
              filteredTasks.map((task) => {
                const categoryData = TASK_CATEGORIES.find(c => c.name === task.category)
                const taskOverdue = isOverdue(task.dueDate, task.completed)
                
                return (
                  <View
                    key={task.id}
                    className="rounded-[24px] p-4 mb-3"
                    style={{
                      backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.08)' : taskOverdue ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                      borderWidth: 1.5,
                      borderColor: task.completed ? '#10B981' : taskOverdue ? '#EF4444' : '#FFD4D4'
                    }}
                  >
                    <View className="flex-row items-start">
                      <TouchableOpacity
                        onPress={() => toggleComplete(task)}
                        className="mr-3 mt-1"
                      >
                        <View
                          className="rounded-full items-center justify-center"
                          style={{
                            width: 26,
                            height: 26,
                            backgroundColor: task.completed ? '#10B981' : 'transparent',
                            borderWidth: 2,
                            borderColor: task.completed ? '#10B981' : '#FFD4D4'
                          }}
                        >
                          {task.completed && (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>

                      <View className="flex-1">
                        <Text
                          style={{
                            fontFamily: 'System',
                            fontSize: 16,
                            fontWeight: '600',
                            color: task.completed ? '#6B7280' : '#8B4555',
                            textDecorationLine: task.completed ? 'line-through' : 'none',
                            letterSpacing: 0.2,
                            marginBottom: 4
                          }}
                        >
                          {task.title}
                        </Text>
                        
                        {task.description && (
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 13,
                              fontWeight: '300',
                              color: '#9CA3AF',
                              lineHeight: 18,
                              marginBottom: 8
                            }}
                          >
                            {task.description}
                          </Text>
                        )}
                        
                        <View className="flex-row items-center flex-wrap">
                          <View
                            className="rounded-full px-3 py-1.5 flex-row items-center mr-2 mb-2"
                            style={{ backgroundColor: `${categoryData?.color}20` }}
                          >
                            <Ionicons 
                              name={categoryData?.icon as any} 
                              size={12} 
                              color={categoryData?.color}
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '600',
                                color: categoryData?.color,
                                letterSpacing: 0.3
                              }}
                            >
                              {task.category}
                            </Text>
                          </View>
                          
                          <View
                            className="rounded-full px-3 py-1.5 flex-row items-center mb-2"
                            style={{ backgroundColor: taskOverdue ? '#FEE2E2' : '#F3F4F6' }}
                          >
                            <Ionicons 
                              name="calendar-outline" 
                              size={12} 
                              color={taskOverdue ? '#EF4444' : '#6B7280'}
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '600',
                                color: taskOverdue ? '#EF4444' : '#6B7280',
                                letterSpacing: 0.3
                              }}
                            >
                              {new Date(task.dueDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex-row ml-2">
                        <TouchableOpacity
                          onPress={() => openEditModal(task)}
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
                          onPress={() => handleDelete(task)}
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
            <ScrollView
              className="rounded-t-[40px] p-6 pb-10"
              style={{ backgroundColor: '#FFF5F5', maxHeight: '85%' }}
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
                  {editingTask ? 'Edit Task' : 'New Task'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color="#B76E79" />
                </TouchableOpacity>
              </View>

              {/* Using FormInput component */}
              <FormInput
                label="Task Title *"
                placeholder="e.g., Order wedding cake"
                value={title}
                onChangeText={setTitle}
              />

              <FormInput
                label="Description"
                placeholder="Add more details (optional)"
                value={description}
                onChangeText={setDescription}
              />

              {/* Using SelectInput component for Category */}
              <SelectInput
                label="Category"
                value={category}
                onPress={() => setShowCategoryModal(true)}
                icon="apps-outline"
              />

              {/* Using SelectInput component for Due Date */}
              <SelectInput
                label="Due Date"
                value={dueDate.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
                onPress={() => setShowDatePicker(true)}
                icon="calendar-outline"
              />

              {/* Using GlassButton component */}
              <GlassButton
                title={editingTask ? 'Update Task' : 'Add Task'}
                onPress={handleAddOrUpdate}
                // bgColor="bg-[#FF69B4]"
              />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
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
                  Select Category
                </Text>
              </View>

              {TASK_CATEGORIES.filter(c => c.name !== 'All').map((cat) => (
                <TouchableOpacity 
                  key={cat.name}
                  className="mb-3"
                  onPress={() => { 
                    setCategory(cat.name)
                    setShowCategoryModal(false)
                  }}
                >
                  <View
                    className="rounded-2xl p-4 flex-row items-center justify-between"
                    style={{
                      backgroundColor: category === cat.name ? `${cat.color}20` : 'rgba(255, 255, 255, 0.8)',
                      borderWidth: 1.5,
                      borderColor: category === cat.name ? cat.color : '#FFD4D4'
                    }}
                  >
                    <View className="flex-row items-center flex-1">
                      <Ionicons name={cat.icon as any} size={24} color={cat.color} style={{ marginRight: 12 }} />
                      <Text
                        style={{
                          fontFamily: 'System',
                          fontSize: 16,
                          fontWeight: category === cat.name ? '600' : '400',
                          color: '#8B4555',
                          letterSpacing: 0.3
                        }}
                      >
                        {cat.name}
                      </Text>
                    </View>
                    {category === cat.name && (
                      <Ionicons name="checkmark-circle" size={24} color={cat.color} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowDatePicker(false)
            if (date) setDueDate(date)
          }}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  )
}