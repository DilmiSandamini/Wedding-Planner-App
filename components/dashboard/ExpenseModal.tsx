import React, { useState, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'
import { Expense } from '@/types/budget'

const EXPENSE_CATEGORIES = [
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

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (data: any) => void
  editingExpense: Expense | null
}

export default function ExpenseModal({ visible, onClose, onSave, editingExpense }: Props) {
  const [category, setCategory] = useState('Venue')
  const [item, setItem] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [actualCost, setActualCost] = useState('')
  const [notes, setNotes] = useState('')
  const [paid, setPaid] = useState(false)
  
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  useEffect(() => {
    if (editingExpense) {
      setCategory(editingExpense.category)
      setItem(editingExpense.item)
      setEstimatedCost(editingExpense.estimatedCost.toString())
      setActualCost(editingExpense.actualCost > 0 ? editingExpense.actualCost.toString() : '')
      setNotes(editingExpense.notes || '')
      setPaid(editingExpense.paid)
    } else {
      resetForm()
    }
  }, [editingExpense, visible])

  const resetForm = () => {
    setCategory('Venue'); setItem(''); setEstimatedCost(''); setActualCost(''); setNotes(''); setPaid(false)
  }

  const handleSave = () => {
    if (item.trim() && estimatedCost) {
      onSave({
        category, item, 
        estimatedCost: parseFloat(estimatedCost), 
        actualCost: actualCost ? parseFloat(actualCost) : 0, 
        paid, notes
      })
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 justify-end bg-black/50">
        <TouchableOpacity activeOpacity={1}>
          <ScrollView className="rounded-t-[40px] p-6 pb-10 bg-[#FFF5F5]" style={{ maxHeight: '90%' }} bounces={false}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#8B4555] text-2xl font-light tracking-wide">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#B76E79" />
              </TouchableOpacity>
            </View>

            <SelectInput label="Category" value={category} onPress={() => setShowCategoryModal(true)} icon="apps-outline" />
            <FormInput label="Item Name *" placeholder="e.g., Venue Deposit" value={item} onChangeText={setItem} />
            <FormInput label="Estimated Cost *" placeholder="0.00" value={estimatedCost} onChangeText={setEstimatedCost} keyboardType="numeric" />
            <FormInput label="Actual Cost" placeholder="0.00 (Optional)" value={actualCost} onChangeText={setActualCost} keyboardType="numeric" />
            <FormInput label="Notes" placeholder="Additional details..." value={notes} onChangeText={setNotes} />

            {/* Paid Toggle - Fixed Syntax */}
            <View className="mb-5">
              <Text className="mb-2 ml-1 font-medium text-gray-700">Payment Status</Text>
              <TouchableOpacity 
                onPress={() => setPaid(!paid)} 
                className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex-row justify-between items-center"
              >
                <Text className="text-gray-500">{paid ? 'Paid' : 'Not paid yet'}</Text>
                
                {/* Toggle Switch */}
                <View className={`w-12 h-6 rounded-full ${paid ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <View 
                    className="w-5 h-5 rounded-full bg-white mt-0.5"
                    style={{ marginLeft: paid ? 26 : 2 }} 
                  />
                </View>
              </TouchableOpacity>
            </View>

            <GlassButton title={editingExpense ? "Update Expense" : "Add Expense"} onPress={handleSave} />
          </ScrollView>

          {/* Category Sub-Modal */}
          <CategoryModal visible={showCategoryModal} onClose={() => setShowCategoryModal(false)} onSelect={(cat: string) => { setCategory(cat); setShowCategoryModal(false); }} selected={category} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const CategoryModal = ({ visible, onClose, onSelect, selected }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 justify-end bg-black/50">
      <View className="rounded-t-[40px] p-6 pb-10 bg-[#FFF5F5]">
        <Text className="text-center text-xl text-[#8B4555] font-light mb-6">Select Category</Text>
        {EXPENSE_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.name} onPress={() => onSelect(cat.name)} className="mb-3">
            <View className={`rounded-2xl p-4 flex-row items-center border-[1.5px] ${selected === cat.name ? 'bg-pink-100 border-pink-400' : 'bg-white border-pink-200'}`}>
              <Text className="text-2xl mr-3">{cat.emoji}</Text>
              <Text className={`text-base flex-1 ${selected === cat.name ? 'font-bold text-[#FF1493]' : 'text-[#8B4555]'}`}>{cat.name}</Text>
              {selected === cat.name && <Ionicons name="checkmark-circle" size={24} color="#FF1493" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
)