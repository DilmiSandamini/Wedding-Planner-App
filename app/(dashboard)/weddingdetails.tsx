import React, { useState } from 'react'
import { 
  View, Text, ScrollView, KeyboardAvoidingView, Platform, 
  Modal, TouchableOpacity 
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import { db } from '@/services/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'
import DateTimePicker from '@react-native-community/datetimepicker'

const BUDGET_OPTIONS = ["Under 1.5M", "1.5M - 3M", "3M - 5M", "Above 5M"]

export default function WeddingDetails() {
  const { user } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const router = useRouter()
  
  const [planName, setPlanName] = useState('')
  const [coupleName, setCoupleName] = useState('')
  const [weddingDate, setWeddingDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [budget, setBudget] = useState('')
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [guests, setGuests] = useState('')
  const [location, setLocation] = useState('')

  const handleSave = async () => {
    if (!planName.trim() || !coupleName.trim() || !budget || !guests || !location.trim()) {
      return showToast('error', 'Fields Required', 'Please complete all fields to save your plan.')
    }

    showLoader()
    try {
      await setDoc(doc(db, "wedding_plans", user?.uid!), {
        userId: user?.uid,
        planName: planName.trim(),
        coupleName: coupleName.trim(),
        weddingDate: weddingDate.toISOString(),
        budget,
        guests: parseInt(guests),
        location: location.trim(),
        isSetupComplete: true,
        updatedAt: new Date().toISOString()
      })

      showToast('success', 'Perfect!', 'Your wedding plan has been created.')
      router.replace('/(dashboard)/home')
    } catch (err: any) {
      console.error("Save Error:", err)
      showToast('error', 'Error', "Failed to save details. Please check your connection.")
    } finally {
      hideLoader()
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        
        <View className="mb-8">
          <Text className="text-gray-500 text-lg font-medium">Hii {user?.displayName || 'Partner'},</Text>
          <Text className="text-3xl font-bold text-gray-900 leading-tight">Plan Your Big Day ✨</Text>
        </View>

        <View className="bg-white p-7 rounded-[40px] shadow-sm mb-10 border border-gray-100">
          <Text className="text-center text-xs font-bold text-[#5D603E] mb-8 uppercase tracking-[3px]">Wedding Basic Info</Text>

          <FormInput 
            label="Wedding plan name:" 
            placeholder="e.g. Our Dream Day" 
            value={planName} 
            onChangeText={setPlanName} 
          />
          
          <FormInput 
            label="Couple name:" 
            placeholder="e.g. Jhone & Smith" 
            value={coupleName} 
            onChangeText={setCoupleName} 
          />

          <SelectInput 
            label="Wedding Date" 
            value={weddingDate.toDateString()} 
            onPress={() => setShowDatePicker(true)} 
            icon="calendar-outline" 
          />

          <SelectInput 
            label="Budget Range" 
            value={budget} 
            onPress={() => setShowBudgetModal(true)} 
            icon="cash-outline" 
          />

          <FormInput 
            label="Expected Guests" 
            placeholder="0" 
            value={guests} 
            onChangeText={setGuests} 
            keyboardType="numeric" 
          />

          <FormInput 
            label="Location" 
            placeholder="Venue or City" 
            value={location} 
            onChangeText={setLocation} 
          />

          <View className="mt-8">
            <GlassButton title="Save & Continue" onPress={handleSave} bgColor="bg-[#5D603E]" />
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker 
            value={weddingDate} 
            mode="date" 
            display="default" 
            onChange={(e, d) => { setShowDatePicker(false); if(d) setWeddingDate(d); }} 
            minimumDate={new Date()}
          />
        )}
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8 pb-12">
            <Text className="text-center font-bold text-xl mb-6">Approximate Budget</Text>
            {BUDGET_OPTIONS.map(opt => (
              <TouchableOpacity 
                key={opt} 
                className="py-4 border-b border-gray-50" 
                onPress={() => { setBudget(opt); setShowBudgetModal(false); }}
              >
                <Text className="text-center text-lg text-gray-700">{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowBudgetModal(false)} className="mt-6">
              <Text className="text-center text-red-500 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}