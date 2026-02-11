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
          console.log("User has a plan, redirecting to Dashboard")
          setHasDetails(true)
        } else {
          console.log("User has NO plan, redirecting to Details Form")
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
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size='large' color='#FF69B4' />
      </View>
    )
  }


  if (!user) {
    return <Redirect href='/welcome' />
  }

  if (hasDetails) {
    return <Redirect href='/(dashboard)/home' />
  }

  return <Redirect href='/(auth)/weddingdetails' />
}