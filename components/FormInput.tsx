import { View, Text, TextInput } from 'react-native'

interface FormInputProps {
  label: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  keyboardType?: 'default' | 'numeric'
}

export default function FormInput({ label, placeholder, value, onChangeText, keyboardType = 'default' }: FormInputProps) {
  return (
    <View className="mb-5">
      <Text className="text-gray-700 font-medium mb-2 ml-1">{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
        className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm text-gray-800"
      />
    </View>
  )
}