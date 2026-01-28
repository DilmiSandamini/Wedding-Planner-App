import React, { useState } from 'react'
import { 
  View, Text, ScrollView, KeyboardAvoidingView, Platform, 
  Modal, TouchableOpacity, Image 
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useLoader } from '@/hooks/useLoader'
import { showToast } from '@/utils/notifications'
import { db } from '@/services/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import * as ImagePicker from 'expo-image-picker'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'

const BUDGET_OPTIONS = ["Under 1.5M", "1.5M - 3M", "3M - 5M", "Above 5M"]
const DEFAULT_COUPLE_IMAGE = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop"

export default function WeddingDetails() {
  const { user } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const router = useRouter()
  
  const [planName, setPlanName] = useState('')
  const [coupleName, setCoupleName] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [weddingDate, setWeddingDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [budget, setBudget] = useState('')
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [guests, setGuests] = useState('')
  const [location, setLocation] = useState('')

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return showToast('error', 'Permission Denied', 'Gallery access is required.');
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri) 
    }
  }

  const handleSave = async () => {
    if (!planName.trim() || !coupleName.trim() || !budget || !guests || !location.trim()) {
      return showToast('error', 'Required Fields', 'Please fill all fields to continue.')
    }

    showLoader()
    try {
      await setDoc(doc(db, "wedding_plans", user?.uid!), {
        userId: user?.uid,
        planName,
        coupleName,
        couplePhoto: DEFAULT_COUPLE_IMAGE, // Image upload not implemented, using default
        weddingDate: weddingDate.toISOString(),
        budget,
        guests: parseInt(guests),
        location,
        isSetupComplete: true,
        updatedAt: new Date().toISOString()
      })

      showToast('success', 'Perfect!', 'Wedding details saved successfully.')
      router.replace('/(dashboard)/home')
    } catch (err: any) {
      console.error("Firestore Save Error:", err)
      showToast('error', 'Save Error', "Make sure Firestore Rules are set to Public.")
    } finally {
      hideLoader()
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        
        <View className="mb-6">
          <Text className="text-gray-500 text-lg font-medium">Hii {user?.displayName || 'Partner'},</Text>
          <Text className="text-3xl font-bold text-gray-900 leading-tight">Plan Your Big Day ✨</Text>
        </View>

        <View className="bg-white p-6 rounded-[35px] shadow-sm mb-10 border border-gray-100">
          <FormInput label="Wedding plan name:" placeholder="e.g. Our Fairy Tale" value={planName} onChangeText={setPlanName} />
          <FormInput label="Couple name:" placeholder="Partner 1 & Partner 2" value={coupleName} onChangeText={setCoupleName} />

          <Text className="text-gray-700 font-medium mb-2 ml-1">Couple Photo (Optional):</Text>
          <TouchableOpacity 
            onPress={pickImage}
            className="w-full h-44 rounded-2xl overflow-hidden mb-6 bg-gray-50 border-2 border-dashed border-gray-200 justify-center items-center"
          >
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" />
            ) : (
              <View className="items-center">
                <Ionicons name="camera" size={36} color="#D1D5DB" />
                <Text className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Select Photo (Preview Only)</Text>
              </View>
            )}
          </TouchableOpacity>

          <SelectInput label="Wedding Date" value={weddingDate.toDateString()} onPress={() => setShowDatePicker(true)} icon="calendar-outline" />
          <SelectInput label="Budget Range" value={budget} onPress={() => setShowBudgetModal(true)} icon="cash-outline" />

          <FormInput label="Expected Guests" placeholder="0" value={guests} onChangeText={setGuests} keyboardType="numeric" />
          <FormInput label="Location" placeholder="City, Venue or Country" value={location} onChangeText={setLocation} />

          <View className="mt-4">
            <GlassButton title="Complete Setup" onPress={handleSave} bgColor="bg-[#5D603E]" />
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker value={weddingDate} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setWeddingDate(d); }} />
        )}
      </ScrollView>

      <Modal visible={showBudgetModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] p-8 pb-12">
            <Text className="text-center font-bold text-xl mb-6 text-gray-800">Approximate Budget</Text>
            {BUDGET_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} className="py-4 border-b border-gray-100" onPress={() => { setBudget(opt); setShowBudgetModal(false); }}>
                <Text className="text-center text-lg text-gray-700">{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowBudgetModal(false)} className="mt-4">
              <Text className="text-center text-red-400 font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}