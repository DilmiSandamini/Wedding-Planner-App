import React, { useState, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'
import { Task } from '@/types/task'

const CATEGORIES = [
  { name: 'Planning', icon: 'calendar-outline', color: '#FFB6C1' },
  { name: 'Venue', icon: 'business-outline', color: '#FFC0CB' },
  { name: 'Catering', icon: 'restaurant-outline', color: '#FFD4E5' },
  { name: 'Shopping', icon: 'cart-outline', color: '#E8A0BF' },
  { name: 'Decor', icon: 'color-palette-outline', color: '#FFA8B5' },
  { name: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: '#E8C4C4' }
]

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (data: { title: string, description: string, category: string, dueDate: Date }) => void
  editingTask: Task | null
}

export default function TaskModal({ visible, onClose, onSave, editingTask }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Planning')
  const [dueDate, setDueDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setCategory(editingTask.category)
      setDueDate(new Date(editingTask.dueDate))
    } else {
      setTitle('')
      setDescription('')
      setCategory('Planning')
      setDueDate(new Date())
    }
  }, [editingTask, visible])

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title, description, category, dueDate })
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 justify-end bg-black/50">
        <TouchableOpacity activeOpacity={1}>
          <ScrollView className="rounded-t-[40px] p-6 pb-10 bg-[#FFF5F5]" bounces={false}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#8B4555] text-2xl font-light tracking-wide">
                {editingTask ? 'Edit Task' : 'New Task'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#B76E79" />
              </TouchableOpacity>
            </View>

            <FormInput label="Task Title" placeholder="e.g., Pay venue deposit" value={title} onChangeText={setTitle} icon="text-outline" />
            <FormInput label="Description" placeholder="Additional details..." value={description} onChangeText={setDescription} icon="document-text-outline" />

            <SelectInput 
              label="Due Date" 
              value={dueDate.toLocaleDateString()} 
              onPress={() => setShowDatePicker(true)} 
              icon="calendar-outline" 
            />

            <Text className="text-[#8B4555] text-xs font-medium tracking-wide mb-2 mt-2">CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.name} onPress={() => setCategory(cat.name)} className="mr-2">
                  <View 
                    className="rounded-2xl px-4 py-3 flex-row items-center border-[1.5px]"
                    style={{ 
                      backgroundColor: category === cat.name ? `${cat.color}20` : 'rgba(255, 255, 255, 0.9)',
                      borderColor: category === cat.name ? cat.color : '#FFD4D4'
                    }}
                  >
                    <Ionicons name={cat.icon as any} size={16} color={category === cat.name ? cat.color : '#B76E79'} style={{ marginRight: 6 }} />
                    <Text style={{ color: category === cat.name ? cat.color : '#8B4555', fontWeight: category === cat.name ? '600' : '400' }}>
                      {cat.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <GlassButton title={editingTask ? "Update Task" : "Add Task"} onPress={handleSave} icon={editingTask ? "save-outline" : "add-circle-outline"} />
            
            {showDatePicker && (
              <DateTimePicker 
                value={dueDate} 
                mode="date" 
                display="default" 
                minimumDate={new Date()}
                onChange={(e, d) => { setShowDatePicker(false); if(d) setDueDate(d); }} 
              />
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}