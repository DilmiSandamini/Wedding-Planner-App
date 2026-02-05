import React, { useState, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import FormInput from '@/components/FormInput'
import GlassButton from '@/components/GlassButton'
import { ChecklistItem, PriorityLevel } from '@/types/checklist'

const CATEGORIES = [
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

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (title: string, category: string, priority: PriorityLevel) => void
  editingItem: ChecklistItem | null
}

export default function ChecklistModal({ visible, onClose, onSave, editingItem }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Venue')
  const [priority, setPriority] = useState<PriorityLevel>('medium')

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title)
      setCategory(editingItem.category)
      setPriority(editingItem.priority)
    } else {
      setTitle('')
      setCategory('Venue')
      setPriority('medium')
    }
  }, [editingItem, visible])

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, category, priority)
      setTitle('') // Clear after save
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 justify-end bg-black/50">
        <TouchableOpacity activeOpacity={1}>
          <View className="rounded-t-[40px] p-6 pb-10 bg-[#FFF5F5]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#8B4555] text-2xl font-light tracking-wide">
                {editingItem ? 'Edit Item' : 'New Task'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#B76E79" />
              </TouchableOpacity>
            </View>

            <FormInput 
              label="Task Title" 
              placeholder="e.g., Book the venue" 
              value={title} 
              onChangeText={setTitle} 
              icon="text-outline" 
            />

            <Text className="text-[#8B4555] text-xs font-medium tracking-wide mb-2">CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
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

            <Text className="text-[#8B4555] text-xs font-medium tracking-wide mb-2">PRIORITY</Text>
            <View className="flex-row justify-between mb-6">
              {PRIORITIES.map((p) => (
                <TouchableOpacity key={p.value} onPress={() => setPriority(p.value as any)} className="flex-1 mx-1">
                  <View 
                    className="rounded-2xl py-3 items-center border-2"
                    style={{ 
                      backgroundColor: priority === p.value ? `${p.color}15` : 'rgba(255, 255, 255, 0.9)',
                      borderColor: priority === p.value ? p.color : '#FFD4D4'
                    }}
                  >
                    <Text className="text-xl mb-1">{p.emoji}</Text>
                    <Text style={{ color: priority === p.value ? p.color : '#8B4555', fontWeight: '600', fontSize: 12 }}>{p.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <GlassButton 
              title={editingItem ? "Update Task" : "Add Task"} 
              onPress={handleSave} 
              icon={editingItem ? "save-outline" : "add-circle-outline"} 
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}