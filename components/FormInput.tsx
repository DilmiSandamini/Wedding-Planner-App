import { View, Text, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface RomanticFormInputProps {
  label: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  keyboardType?: 'default' | 'numeric'
  icon?: any
}

export default function RomanticFormInput({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType = 'default',
  icon 
}: RomanticFormInputProps) {
  return (
    <View className="mb-5">
      <Text
        style={{
          fontFamily: 'System',
          fontSize: 13,
          fontWeight: '500',
          color: '#8B4555',
          marginBottom: 8,
          letterSpacing: 0.5
        }}
      >
        {label}
      </Text>
      <View
        className="rounded-2xl flex-row items-center px-4 py-3"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1.5,
          borderColor: '#FFD4D4'
        }}
      >
        {icon && <Ionicons name={icon} size={20} color="#B76E79" style={{ marginRight: 12 }} />}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor="#D4A5A5"
          className="flex-1"
          style={{
            fontFamily: 'System',
            fontSize: 15,
            color: '#8B4555'
          }}
        />
      </View>
    </View>
  )
}