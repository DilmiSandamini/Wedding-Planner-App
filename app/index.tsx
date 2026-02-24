import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function Index() {
  const { user, loading, isSetupComplete } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F5' }}>
        <ActivityIndicator size='large' color='#FF69B4' />
      </View>
    )
  }

  if (!user) {
    return <Redirect href='/welcome' /> 
  }

  if (isSetupComplete) {
    return <Redirect href='/(dashboard)/home' />
  }

  return <Redirect href='/(auth)/weddingdetails' />
}