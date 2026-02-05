import React, { useState, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'
import { Guest, GuestSide } from '@/types/guest'

const RELATIONSHIPS = ['Family', 'Friend', 'Colleague', 'Other']
const SIDES = ['Bride', 'Groom', 'Both']

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (data: any) => void
  editingGuest: Guest | null
}

export default function GuestModal({ visible, onClose, onSave, editingGuest }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('Friend')
  const [side, setSide] = useState<GuestSide>('Both')
  const [plusOne, setPlusOne] = useState(false)
  const [tableNumber, setTableNumber] = useState('')
  
  const [showRelModal, setShowRelModal] = useState(false)
  const [showSideModal, setShowSideModal] = useState(false)

  useEffect(() => {
    if (editingGuest) {
      setName(editingGuest.name)
      setEmail(editingGuest.email || '')
      setPhone(editingGuest.phone || '')
      setRelationship(editingGuest.relationship)
      setSide(editingGuest.side)
      setPlusOne(editingGuest.plusOne)
      setTableNumber(editingGuest.tableNumber?.toString() || '')
    } else {
      resetForm()
    }
  }, [editingGuest, visible])

  const resetForm = () => {
    setName(''); setEmail(''); setPhone('')
    setRelationship('Friend'); setSide('Both')
    setPlusOne(false); setTableNumber('')
  }

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name, email, phone, relationship, side, plusOne,
        tableNumber: tableNumber ? parseInt(tableNumber) : undefined
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
                {editingGuest ? 'Edit Guest' : 'Add Guest'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#B76E79" />
              </TouchableOpacity>
            </View>

            <FormInput label="Guest Name *" placeholder="Full Name" value={name} onChangeText={setName} />
            <FormInput label="Email" placeholder="guest@example.com" value={email} onChangeText={setEmail} />
            <FormInput label="Phone" placeholder="+94 XX XXX XXXX" value={phone} onChangeText={setPhone} />

            <SelectInput label="Relationship" value={relationship} onPress={() => setShowRelModal(true)} icon="people-outline" />
            <SelectInput label="Guest Side" value={side} onPress={() => setShowSideModal(true)} icon="heart-outline" />

            {/* Plus One Toggle - Fixed Syntax */}
            <View className="mb-5">
              <Text className="mb-2 ml-1 font-medium text-gray-700">Allow Plus One</Text>
              <TouchableOpacity onPress={() => setPlusOne(!plusOne)} className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex-row justify-between items-center">
                <Text className="text-gray-500">{plusOne ? 'Yes, allow +1' : 'No plus one'}</Text>
                <View className={`w-12 h-6 rounded-full ${plusOne ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <View 
                    className="w-5 h-5 rounded-full bg-white mt-0.5"
                    style={{ marginLeft: plusOne ? 26 : 2 }} 
                  />
                </View>
              </TouchableOpacity>
            </View>

            <FormInput label="Table Number (Optional)" placeholder="e.g., 5" value={tableNumber} onChangeText={setTableNumber} keyboardType="numeric" />

            <GlassButton title={editingGuest ? "Update Guest" : "Add Guest"} onPress={handleSave} />
          </ScrollView>

          {/* Sub Modals */}
          <SubModal visible={showRelModal} title="Select Relationship" options={RELATIONSHIPS} selected={relationship} onSelect={(val: string) => { setRelationship(val); setShowRelModal(false); }} onClose={() => setShowRelModal(false)} />
          <SubModal visible={showSideModal} title="Select Side" options={SIDES} selected={side} onSelect={(val: string) => { setSide(val as GuestSide); setShowSideModal(false); }} onClose={() => setShowSideModal(false)} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const SubModal = ({ visible, title, options, selected, onSelect, onClose }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 justify-end bg-black/50">
      <View className="rounded-t-[40px] p-6 pb-10 bg-[#FFF5F5]">
        <Text className="text-center text-xl text-[#8B4555] font-light mb-6">{title}</Text>
        {options.map((opt: string) => (
          <TouchableOpacity key={opt} onPress={() => onSelect(opt)} className="mb-3">
            <View className={`rounded-2xl p-4 flex-row justify-between border-[1.5px] ${selected === opt ? 'bg-pink-100 border-pink-400' : 'bg-white border-pink-200'}`}>
              <Text className={`text-base ${selected === opt ? 'font-bold text-[#FF1493]' : 'text-[#8B4555]'}`}>{opt}</Text>
              {selected === opt && <Ionicons name="checkmark-circle" size={24} color="#FF1493" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
)