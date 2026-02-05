import { Modal, View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const BUDGET_OPTIONS = [
  { label: "Under 1.5M", value: "Under 1.5M", icon: "💝" },
  { label: "1.5M - 3M", value: "1.5M - 3M", icon: "💍" },
  { label: "3M - 5M", value: "3M - 5M", icon: "💎" },
  { label: "Above 5M", value: "Above 5M", icon: "👑" }
]

interface BudgetModalProps {
  visible: boolean
  selectedBudget: string
  onSelect: (value: string) => void
  onClose: () => void
}

export default function BudgetModal({ visible, selectedBudget, onSelect, onClose }: BudgetModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <TouchableOpacity activeOpacity={1}>
          <View className="rounded-t-[40px] p-6 pb-10" style={{ backgroundColor: '#FFF5F5' }}>
            <View className="items-center mb-6">
              <View className="w-12 h-1 rounded-full mb-4 bg-[#FFD4D4]" />
              <Text className="text-[#8B4555] text-2xl font-light tracking-widest">Select Budget Range</Text>
            </View>

            {BUDGET_OPTIONS.map((option) => (
              <TouchableOpacity 
                key={option.value}
                className="mb-3"
                onPress={() => onSelect(option.value)}
              >
                <View
                  className="rounded-2xl p-4 flex-row items-center justify-between border-[1.5px]"
                  style={{
                    backgroundColor: selectedBudget === option.value ? 'rgba(255, 105, 180, 0.15)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: selectedBudget === option.value ? '#FF69B4' : '#FFD4D4'
                  }}
                >
                  <View className="flex-row items-center flex-1">
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{option.icon}</Text>
                    <Text className={`text-base tracking-wide ${selectedBudget === option.value ? 'font-semibold text-[#FF1493]' : 'font-normal text-[#8B4555]'}`}>
                      {option.label}
                    </Text>
                  </View>
                  {selectedBudget === option.value && <Ionicons name="checkmark-circle" size={24} color="#FF1493" />}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={onClose} className="mt-4">
              <View className="rounded-2xl py-3 bg-white/80 border-[1.5px] border-[#FFD4D4]">
                <Text className="text-center text-[#B76E79] font-medium text-[15px]">Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}