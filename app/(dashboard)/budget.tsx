import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

// Custom Imports
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/utils/notifications'
import { Expense } from '@/types/budget'
import { subscribeToExpenses, addExpense, updateExpense, deleteExpense } from '@/services/budgetService'

// Components
import DashboardCard from '@/components/dashboard/DashboardCard'
import SectionHeader from '@/components/dashboard/SectionHeader'
import ExpenseModal from '@/components/dashboard/ExpenseModal'

// ✅ Updated Category List (Added missing categories)
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState('All')

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
    const unsubscribe = subscribeToExpenses(user.uid, (data) => setExpenses(data))
    return () => unsubscribe()
  }, [user])

  // Handlers
  const handleSaveExpense = async (data: any) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data)
        showToast('success', 'Updated', 'Expense updated successfully')
      } else {
        await addExpense(user?.uid!, data)
        showToast('success', 'Added', 'New expense added')
      }
      setShowModal(false)
      setEditingExpense(null)
    } catch (error) {
      showToast('error', 'Error', 'Something went wrong')
    }
  }

  const togglePaid = (expense: Expense) => {
    updateExpense(expense.id, { paid: !expense.paid })
  }

  const handleDelete = (expense: Expense) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          deleteExpense(expense.id)
          showToast('success', 'Deleted', 'Expense removed')
      }}
    ])
  }

  // Stats & Filtering
  const filteredExpenses = filterCategory === 'All' ? expenses : expenses.filter(e => e.category === filterCategory)
  
  const stats = {
    totalEstimated: expenses.reduce((sum, e) => sum + e.estimatedCost, 0),
    totalActual: expenses.reduce((sum, e) => sum + e.actualCost, 0),
    remaining: expenses.reduce((sum, e) => sum + e.estimatedCost, 0) - expenses.reduce((sum, e) => sum + e.actualCost, 0),
    percentSpent: expenses.length > 0 ? Math.round((expenses.reduce((sum, e) => sum + e.actualCost, 0) / expenses.reduce((sum, e) => sum + e.estimatedCost, 0)) * 100) : 0
  }

  // Category Breakdown Calculation
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

  const categoryBreakdown = getCategoryBreakdown()
  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] })

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5F5]">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-[#B76E79] font-light text-sm tracking-widest mb-1">Wedding Budget</Text>
            <Text className="text-[#8B4555] font-light text-3xl tracking-wide">Financial Planning</Text>
          </View>

          {/* Budget Overview Card */}
          <View className="px-6 mb-6">
            <Animated.View style={{ transform: [{ translateY: floatY }] }}>
              <LinearGradient colors={['#FFB6C1', '#FF69B4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-[28px] p-6 shadow-lg shadow-pink-300">
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className="text-white/90 text-xs font-bold tracking-[1.5px] uppercase">Budget Overview</Text>
                    <Text className="text-white font-light text-4xl mt-1">{stats.percentSpent}%</Text>
                    <Text className="text-white/80 text-xs tracking-wider">of budget spent</Text>
                  </View>
                  <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"><Ionicons name="wallet" size={30} color="#FFF" /></View>
                </View>
                
                <View className="h-2 bg-white/30 rounded-full overflow-hidden mb-5">
                  <View className={`h-full rounded-full ${stats.percentSpent > 100 ? 'bg-red-500' : 'bg-white'}`} style={{ width: `${Math.min(stats.percentSpent, 100)}%` }} />
                </View>

                <View className="flex-row justify-between pt-4 border-t border-white/20">
                  <StatBox label="Estimated" value={formatCurrency(stats.totalEstimated)} />
                  <StatBox label="Actual" value={formatCurrency(stats.totalActual)} />
                  <StatBox label={stats.remaining >= 0 ? 'Left' : 'Over'} value={formatCurrency(Math.abs(stats.remaining))} color={stats.remaining >= 0 ? 'text-white' : 'text-red-200'} />
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Category Breakdown (New Section) */}
          {categoryBreakdown.length > 0 && (
            <View className="px-6 mb-6">
              <SectionHeader title="Category Breakdown" />
              {categoryBreakdown.map((cat) => {
                const percent = stats.totalEstimated > 0 ? Math.round((cat.estimated / stats.totalEstimated) * 100) : 0
                return (
                  <View key={cat.name} className="rounded-[20px] p-4 mb-3 bg-white/90 border-[1.5px] border-[#FFD4D4]">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <Text style={{ fontSize: 24, marginRight: 10 }}>{cat.emoji}</Text>
                        <View className="flex-1">
                          <Text className="text-[#8B4555] font-semibold text-[15px] tracking-wide">{cat.name}</Text>
                          <Text className="text-gray-400 text-xs font-normal mt-0.5">{cat.count} {cat.count === 1 ? 'item' : 'items'}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-[#8B4555] font-semibold text-base">{formatCurrency(cat.estimated)}</Text>
                        <Text className="text-xs font-medium mt-0.5" style={{ color: cat.color }}>{percent}% of budget</Text>
                      </View>
                    </View>
                    <View className="rounded-full h-2 overflow-hidden" style={{ backgroundColor: `${cat.color}20` }}>
                      <View className="h-full rounded-full" style={{ width: cat.estimated > 0 ? `${Math.min((cat.actual / cat.estimated) * 100, 100)}%` : '0%', backgroundColor: cat.color }} />
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pl-6">
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.name} onPress={() => setFilterCategory(cat.name)} className="mr-3">
                <View className={`rounded-full px-5 py-2.5 flex-row items-center border-[1.5px] ${filterCategory === cat.name ? 'bg-[#FF69B4] border-[#FF69B4]' : 'bg-white/80 border-[#FFD4D4]'}`}>
                  <Text className="text-base mr-2">{cat.emoji}</Text>
                  <Text className={`text-sm ${filterCategory === cat.name ? 'text-white font-semibold' : 'text-[#8B4555]'}`}>{cat.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <View className="w-6" />
          </ScrollView>

          {/* Expense List */}
          <View className="px-6">
            {filteredExpenses.length === 0 ? (
              <View className="items-center py-12 opacity-60">
                <View className="w-20 h-20 bg-pink-100 rounded-full items-center justify-center mb-4"><Ionicons name="receipt-outline" size={40} color="#FFB6C1" /></View>
                <Text className="text-[#B76E79]">No expenses found</Text>
              </View>
            ) : (
              filteredExpenses.map((expense) => {
                const isOverBudget = expense.actualCost > expense.estimatedCost
                return (
                  <DashboardCard key={expense.id} className={`mb-3 p-4 !bg-white/90 ${expense.paid ? 'border-green-200' : isOverBudget ? 'border-red-200' : ''}`}>
                    <View className="flex-row justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-[17px] font-semibold text-[#8B4555] mb-1">{expense.item}</Text>
                        <View className="flex-row items-center">
                          <Text className="text-[10px] text-[#B76E79] bg-pink-50 px-2 py-0.5 rounded-full mr-2">{expense.category}</Text>
                          {expense.paid && <Text className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Paid</Text>}
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs text-gray-400 uppercase tracking-wide">Estimated</Text>
                        <Text className="text-sm font-semibold text-gray-500 mb-1">{formatCurrency(expense.estimatedCost)}</Text>
                        <Text className="text-xs text-gray-400 uppercase tracking-wide">Actual</Text>
                        <Text className={`text-base font-bold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                          {expense.actualCost > 0 ? formatCurrency(expense.actualCost) : '-'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-end pt-3 border-t border-gray-100">
                      <TouchableOpacity onPress={() => togglePaid(expense)} className={`px-3 py-1.5 rounded-lg mr-2 ${expense.paid ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Text className={`text-xs font-semibold ${expense.paid ? 'text-green-600' : 'text-gray-500'}`}>{expense.paid ? 'Mark Unpaid' : 'Mark Paid'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingExpense(expense); setShowModal(true); }} className="p-2 bg-blue-50 rounded-lg mr-2"><Ionicons name="pencil" size={14} color="#3B82F6" /></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(expense)} className="p-2 bg-red-50 rounded-lg"><Ionicons name="trash" size={14} color="#EF4444" /></TouchableOpacity>
                    </View>
                  </DashboardCard>
                )
              })
            )}
          </View>

        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={() => { setEditingExpense(null); setShowModal(true); }} className="absolute bottom-24 right-6 shadow-lg shadow-pink-400">
        <LinearGradient colors={['#FFB6C1', '#FF69B4', '#FF1493']} className="w-16 h-16 rounded-full items-center justify-center">
          <Ionicons name="add" size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <ExpenseModal visible={showModal} onClose={() => setShowModal(false)} onSave={handleSaveExpense} editingExpense={editingExpense} />
    </SafeAreaView>
  )
}

const StatBox = ({ label, value, color = 'text-white' }: any) => (
  <View className="items-center">
    <Text className={`text-base font-normal ${color}`}>{value}</Text>
    <Text className="text-[10px] font-medium text-white/80 uppercase tracking-widest mt-1">{label}</Text>
  </View>
)