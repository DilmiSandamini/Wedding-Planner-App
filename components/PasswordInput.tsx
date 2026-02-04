import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PasswordInputProps {
  label: string
  password: string
  setPassword: (text: string) => void
  placeholder?: string
}

export default function PasswordInput({ label, password, setPassword, placeholder }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className="mb-6">
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
        className="rounded-2xl flex-row items-center px-4 py-1"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1.5,
          borderColor: '#FFD4D4'
        }}
      >
        <Ionicons name="lock-closed-outline" size={20} color="#B76E79" style={{ marginRight: 12 }} />
        <TextInput
          placeholder={placeholder || 'Enter your password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#D4A5A5"
          className="flex-1"
          style={{
            fontFamily: 'System',
            fontSize: 15,
            color: '#8B4555'
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
           <Ionicons 
             name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
             size={20} 
             color="#B76E79" 
           />
        </TouchableOpacity>
      </View>
    </View>
  )
}