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
import { showToast } from '@/utils/notifications'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'

interface Expense {
  id: string
  category: string
  item: string
  estimatedCost: number
  actualCost: number
  paid: boolean
  notes?: string
  createdAt: string
}

const EXPENSE_CATEGORIES = [
  { name: 'All', icon: 'apps', color: '#FF69B4', emoji: '💰' },
  { name: 'Venue', icon: 'business', color: '#FFB6C1', emoji: '🏛️' },
  { name: 'Catering', icon: 'restaurant', color: '#FFC0CB', emoji: '🍽️' },
  { name: 'Photography', icon: 'camera', color: '#FFD4E5', emoji: '📸' },
  { name: 'Decoration', icon: 'color-palette', color: '#E8A0BF', emoji: '🎨' },
  { name: 'Attire', icon: 'shirt', color: '#FFA8B5', emoji: '👗' },
  { name: 'Entertainment', icon: 'musical-notes', color: '#E8C4C4', emoji: '🎵' },
  { name: 'Invitations', icon: 'mail', color: '#D4A5A5', emoji: '💌' },
  { name: 'Transportation', icon: 'car', color: '#C9A9A9', emoji: '🚗' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: '#B8A0A0', emoji: '✨' }
]

export default function BudgetScreen() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState('All')

  // Form states
  const [category, setCategory] = useState('Venue')
  const [item, setItem] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [actualCost, setActualCost] = useState('')
  const [notes, setNotes] = useState('')
  const [paid, setPaid] = useState(false)

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

    const q = query(collection(db, "expenses"), where("userId", "==", user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Expense))
      setExpenses(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    })

    return () => unsubscribe()
  }, [user])

  const handleAddOrUpdate = async () => {
    if (!item.trim() || !estimatedCost) {
      return showToast('error', 'Error', 'Please enter item name and estimated cost')
    }

    try {
      const expenseData = {
        category,
        item: item.trim(),
        estimatedCost: parseFloat(estimatedCost),
        actualCost: actualCost ? parseFloat(actualCost) : 0,
        paid,
        notes: notes.trim(),
        updatedAt: new Date().toISOString()
      }

      if (editingExpense) {
        await updateDoc(doc(db, "expenses", editingExpense.id), expenseData)
        showToast('success', 'Updated!', 'Expense updated successfully')
      } else {
        await addDoc(collection(db, "expenses"), {
          ...expenseData,
          userId: user?.uid,
          createdAt: new Date().toISOString()
        })
        showToast('success', 'Added!', 'New expense added')
      }
      closeModal()
    } catch (error) {
      showToast('error', 'Error', 'Failed to save expense')
    }
  }

  const togglePaid = async (expense: Expense) => {
    try {
      await updateDoc(doc(db, "expenses", expense.id), {
        paid: !expense.paid
      })
    } catch (error) {
      showToast('error', 'Error', 'Failed to update payment status')
    }
  }

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "expenses", expense.id))
              showToast('success', 'Deleted', 'Expense removed')
            } catch (error) {
              showToast('error', 'Error', 'Failed to delete expense')
            }
          }
        }
      ]
    )
  }

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense)
    setCategory(expense.category)
    setItem(expense.item)
    setEstimatedCost(expense.estimatedCost.toString())
    setActualCost(expense.actualCost > 0 ? expense.actualCost.toString() : '')
    setNotes(expense.notes || '')
    setPaid(expense.paid)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setShowCategoryModal(false)
    setEditingExpense(null)
    setCategory('Venue')
    setItem('')
    setEstimatedCost('')
    setActualCost('')
    setNotes('')
    setPaid(false)
  }

  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(exp => exp.category === filterCategory)

  const getBudgetStats = () => {
    const totalEstimated = expenses.reduce((sum, exp) => sum + exp.estimatedCost, 0)
    const totalActual = expenses.reduce((sum, exp) => sum + exp.actualCost, 0)
    const totalPaid = expenses.filter(exp => exp.paid).reduce((sum, exp) => sum + exp.actualCost, 0)
    const remaining = totalEstimated - totalActual
    const percentSpent = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0
    
    return { totalEstimated, totalActual, totalPaid, remaining, percentSpent }
  }

  const getCategoryBreakdown = () => {
    return EXPENSE_CATEGORIES
      .filter(cat => cat.name !== 'All')
      .map(cat => {
        const categoryExpenses = expenses.filter(exp => exp.category === cat.name)
        const estimated = categoryExpenses.reduce((sum, exp) => sum + exp.estimatedCost, 0)
        const actual = categoryExpenses.reduce((sum, exp) => sum + exp.actualCost, 0)
        return { ...cat, estimated, actual, count: categoryExpenses.length }
      })
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.estimated - a.estimated)
  }

  const stats = getBudgetStats()
  const categoryBreakdown = getCategoryBreakdown()
  
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6]
  })

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`
  }

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
              Wedding Budget
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
              Financial Planning
            </Text>
          </View>

          {/* Budget Overview Card */}
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
                      Budget Overview
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 28,
                        fontWeight: '300',
                        color: '#FFFFFF',
                        marginTop: 4
                      }}
                    >
                      {stats.percentSpent}%
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 11,
                        fontWeight: '400',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5
                      }}
                    >
                      of budget spent
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
                      <Ionicons name="wallet" size={32} color="#FFFFFF" />
                    </View>
                  </Animated.View>
                </View>

                {/* Progress Bar */}
                <View 
                  className="rounded-full h-3 mb-5 overflow-hidden"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${Math.min(stats.percentSpent, 100)}%`,
                      backgroundColor: stats.percentSpent > 100 ? '#EF4444' : '#FFFFFF'
                    }}
                  />
                </View>

                {/* Stats Grid */}
                <View className="flex-row justify-between pt-4 border-t border-white/20">
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 16,
                        fontWeight: '400',
                        color: '#FFFFFF'
                      }}
                    >
                      {formatCurrency(stats.totalEstimated)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 10,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5,
                        marginTop: 2
                      }}
                    >
                      Estimated
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 16,
                        fontWeight: '400',
                        color: '#FFFFFF'
                      }}
                    >
                      {formatCurrency(stats.totalActual)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 10,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5,
                        marginTop: 2
                      }}
                    >
                      Actual
                    </Text>
                  </View>
                  
                  <View className="items-center">
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 16,
                        fontWeight: '400',
                        color: stats.remaining >= 0 ? '#FFFFFF' : '#FEE2E2'
                      }}
                    >
                      {formatCurrency(Math.abs(stats.remaining))}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'System',
                        fontSize: 10,
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.8)',
                        letterSpacing: 0.5,
                        marginTop: 2
                      }}
                    >
                      {stats.remaining >= 0 ? 'Left' : 'Over'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
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
                Category Breakdown
              </Text>
              
              {categoryBreakdown.map((cat) => {
                const percent = stats.totalEstimated > 0 
                  ? Math.round((cat.estimated / stats.totalEstimated) * 100) 
                  : 0
                
                return (
                  <View
                    key={cat.name}
                    className="rounded-[20px] p-4 mb-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderWidth: 1.5,
                      borderColor: '#FFD4D4'
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <Text style={{ fontSize: 24, marginRight: 10 }}>
                          {cat.emoji}
                        </Text>
                        <View className="flex-1">
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 15,
                              fontWeight: '600',
                              color: '#8B4555',
                              letterSpacing: 0.2
                            }}
                          >
                            {cat.name}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 12,
                              fontWeight: '400',
                              color: '#9CA3AF',
                              marginTop: 2
                            }}
                          >
                            {cat.count} {cat.count === 1 ? 'item' : 'items'}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="items-end">
                        <Text
                          style={{
                            fontFamily: 'System',
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#8B4555'
                          }}
                        >
                          {formatCurrency(cat.estimated)}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'System',
                            fontSize: 11,
                            fontWeight: '500',
                            color: cat.color,
                            marginTop: 2
                          }}
                        >
                          {percent}% of budget
                        </Text>
                      </View>
                    </View>
                    
                    {/* Category Progress Bar */}
                    <View 
                      className="rounded-full h-2 overflow-hidden"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <View 
                        className="h-full rounded-full"
                        style={{ 
                          width: cat.estimated > 0 
                            ? `${Math.min((cat.actual / cat.estimated) * 100, 100)}%` 
                            : '0%',
                          backgroundColor: cat.color
                        }}
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="mb-6"
            contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48 }}
          >
            {EXPENSE_CATEGORIES.map((cat) => {
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
                    <Text style={{ fontSize: 16, marginRight: 6 }}>
                      {cat.emoji}
                    </Text>
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

          {/* Expense List */}
          <View className="px-6">
            {filteredExpenses.length === 0 ? (
              <View className="items-center py-16">
                <View
                  className="rounded-full items-center justify-center mb-4"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255, 182, 193, 0.2)'
                  }}
                >
                  <Ionicons name="receipt-outline" size={40} color="#FFB6C1" />
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
                  No expenses yet
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
                  Start tracking your wedding expenses!
                </Text>
              </View>
            ) : (
              filteredExpenses.map((expense) => {
                const categoryData = EXPENSE_CATEGORIES.find(c => c.name === expense.category)
                const overBudget = expense.actualCost > expense.estimatedCost
                
                return (
                  <View
                    key={expense.id}
                    className="rounded-[24px] p-4 mb-3"
                    style={{
                      backgroundColor: expense.paid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                      borderWidth: 1.5,
                      borderColor: expense.paid ? '#10B981' : overBudget && expense.actualCost > 0 ? '#EF4444' : '#FFD4D4'
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text style={{ fontSize: 20, marginRight: 8 }}>
                            {categoryData?.emoji}
                          </Text>
                          <Text
                            className="flex-1"
                            style={{
                              fontFamily: 'System',
                              fontSize: 16,
                              fontWeight: '600',
                              color: '#8B4555',
                              letterSpacing: 0.2
                            }}
                          >
                            {expense.item}
                          </Text>
                        </View>
                        
                        <View
                          className="px-3 py-1.5 rounded-full self-start mb-3"
                          style={{ backgroundColor: `${categoryData?.color}20` }}
                        >
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 11,
                              fontWeight: '600',
                              color: categoryData?.color,
                              letterSpacing: 0.3
                            }}
                          >
                            {expense.category}
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between mb-2">
                          <View>
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '500',
                                color: '#9CA3AF',
                                letterSpacing: 0.3,
                                textTransform: 'uppercase'
                              }}
                            >
                              Estimated
                            </Text>
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#6B7280',
                                marginTop: 2
                              }}
                            >
                              {formatCurrency(expense.estimatedCost)}
                            </Text>
                          </View>

                          <View className="items-end">
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 11,
                                fontWeight: '500',
                                color: '#9CA3AF',
                                letterSpacing: 0.3,
                                textTransform: 'uppercase'
                              }}
                            >
                              Actual
                            </Text>
                            <Text
                              style={{
                                fontFamily: 'System',
                                fontSize: 16,
                                fontWeight: '600',
                                color: overBudget && expense.actualCost > 0 ? '#EF4444' : '#10B981',
                                marginTop: 2
                              }}
                            >
                              {expense.actualCost > 0 ? formatCurrency(expense.actualCost) : '-'}
                            </Text>
                          </View>
                        </View>

                        {expense.notes && (
                          <Text
                            style={{
                              fontFamily: 'System',
                              fontSize: 13,
                              fontWeight: '300',
                              color: '#9CA3AF',
                              lineHeight: 18,
                              marginTop: 4
                            }}
                          >
                            {expense.notes}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
                      <TouchableOpacity
                        onPress={() => togglePaid(expense)}
                        className="px-4 py-2 rounded-xl flex-row items-center"
                        style={{
                          backgroundColor: expense.paid ? '#D1FAE5' : '#FEE2E2'
                        }}
                      >
                        <Ionicons 
                          name={expense.paid ? 'checkmark-circle' : 'close-circle'} 
                          size={16} 
                          color={expense.paid ? '#059669' : '#DC2626'} 
                        />
                        <Text
                          className="ml-2"
                          style={{
                            fontFamily: 'System',
                            fontSize: 13,
                            fontWeight: '600',
                            color: expense.paid ? '#059669' : '#DC2626',
                            letterSpacing: 0.3
                          }}
                        >
                          {expense.paid ? 'Paid' : 'Unpaid'}
                        </Text>
                      </TouchableOpacity>

                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={() => openEditModal(expense)}
                          className="px-4 py-2 rounded-xl flex-row items-center mr-2"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        >
                          <Ionicons name="pencil" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleDelete(expense)}
                          className="px-4 py-2 rounded-xl flex-row items-center"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
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
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color="#B76E79" />
                </TouchableOpacity>
              </View>

              {/* Using SelectInput for Category */}
              <SelectInput
                label="Category"
                value={category}
                onPress={() => setShowCategoryModal(true)}
                icon="apps-outline"
              />

              {/* Using FormInput components */}
              <FormInput
                label="Item Name *"
                placeholder="e.g., Wedding venue booking"
                value={item}
                onChangeText={setItem}
              />

              <FormInput
                label="Estimated Cost *"
                placeholder="0"
                value={estimatedCost}
                onChangeText={setEstimatedCost}
                keyboardType="numeric"
              />

              <FormInput
                label="Actual Cost"
                placeholder="0 (Leave empty if not finalized)"
                value={actualCost}
                onChangeText={setActualCost}
                keyboardType="numeric"
              />

              <FormInput
                label="Notes"
                placeholder="Add any additional details (optional)"
                value={notes}
                onChangeText={setNotes}
              />

              {/* Paid Toggle */}
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
                  Payment Status
                </Text>
                <TouchableOpacity
                  onPress={() => setPaid(!paid)}
                  className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex-row justify-between items-center"
                >
                  <Text style={{ color: '#6B7280' }}>
                    {paid ? 'Paid' : 'Not paid yet'}
                  </Text>
                  <View
                    className="w-12 h-6 rounded-full"
                    style={{
                      backgroundColor: paid ? '#10B981' : '#D1D5DB'
                    }}
                  >
                    <View
                      className="w-5 h-5 rounded-full bg-white mt-0.5"
                      style={{
                        marginLeft: paid ? 26 : 2
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Using GlassButton */}
              <GlassButton
                title={editingExpense ? 'Update Expense' : 'Add Expense'}
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

              {EXPENSE_CATEGORIES.filter(c => c.name !== 'All').map((cat) => (
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
                      <Text style={{ fontSize: 24, marginRight: 12 }}>
                        {cat.emoji}
                      </Text>
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
    </SafeAreaView>
  )
}