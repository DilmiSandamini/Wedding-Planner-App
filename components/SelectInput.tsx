import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SelectInputProps {
  label: string
  value: string
  onPress: () => void
  icon: any
}

export default function SelectInput({ label, value, onPress, icon }: SelectInputProps) {
  return (
    <View className="mb-5">
      <Text className="text-gray-700 font-medium mb-2 ml-1">{label}</Text>
      <TouchableOpacity 
        onPress={onPress}
        className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex-row justify-between items-center"
      >
        <Text className={value ? "text-gray-800" : "text-gray-400"}>
          {value || "Select option"}
        </Text>
        <Ionicons name={icon} size={20} color="#5D603E" />
      </TouchableOpacity>
    </View>
  )
}