import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { getWeddingPlan } from '@/services/weddingdetails'

export default function Index() {
  const { user, loading: authLoading } = useAuth()
  const [isCheckingDb, setIsCheckingDb] = useState(true)
  const [hasDetails, setHasDetails] = useState(false)

  useEffect(() => {
    const checkUserStatus = async () => {
      if (authLoading) return
      
      if (!user) {
        setIsCheckingDb(false)
        return
      }

      try {
        const plan = await getWeddingPlan(user.uid)
        if (plan && plan.isSetupComplete) {
          setHasDetails(true)
        } else {
          setHasDetails(false)
        }
      } catch (error) {
        console.error("Failed to check wedding plan", error)
        setHasDetails(false)
      } finally {
        setIsCheckingDb(false)
      }
    }

    checkUserStatus()
  }, [user, authLoading])

  if (authLoading || (user && isCheckingDb)) {
    return (
      <View 
        className='flex-1 justify-center items-center bg-[#FFF5F5]'
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} // මැදට ගන්න බව සහතික කිරීමට
      >
        <ActivityIndicator size='large' color='#FF69B4' />
      </View>
    )
  }

  if (!user) {
    return <Redirect href='/(auth)/weddingdetails' />
  }

  if (!hasDetails) {
    return <Redirect href='/(auth)/weddingdetails' />
  }

  return <Redirect href='/(dashboard)/home' />
}