import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import FormInput from '@/components/FormInput'
import SelectInput from '@/components/SelectInput'
import GlassButton from '@/components/GlassButton'
import BudgetModal from '@/components/BudgetModal'

interface EditModalProps {
  visible: boolean
  onClose: () => void
  editData: any
  setEditData: (data: any) => void
  showDatePicker: boolean
  setShowDatePicker: (val: boolean) => void
  showBudgetModal: boolean
  setShowBudgetModal: (val: boolean) => void
  handleBudgetSelect: (val: string) => void
  formatDate: () => string
  handleSave: () => void
  isLoading: boolean
}

export default function EditWeddingModal(props: EditModalProps) {
  const { 
    visible, onClose, editData, setEditData, showDatePicker, setShowDatePicker,
    showBudgetModal, setShowBudgetModal, handleBudgetSelect, formatDate, 
    handleSave, isLoading 
  } = props

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 justify-end bg-black/50">
        <TouchableOpacity activeOpacity={1}>
          <ScrollView className="rounded-t-[40px] p-6 pb-10 bg-[#FFF5F5]" style={{ maxHeight: '90%' }} bounces={false}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#8B4555] text-2xl font-light tracking-wide">Edit Wedding Details</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#B76E79" />
              </TouchableOpacity>
            </View>

            <FormInput label="Wedding Plan Name" placeholder="e.g., Our Dream Day" value={editData.planName} onChangeText={(text) => setEditData({ ...editData, planName: text })} icon="bookmark-outline" />
            <FormInput label="Couple Names" placeholder="e.g., John & Sarah" value={editData.coupleName} onChangeText={(text) => setEditData({ ...editData, coupleName: text })} icon="heart-outline" />
            
            <SelectInput label="Wedding Date" value={formatDate()} onPress={() => setShowDatePicker(true)} icon="calendar-outline" />
            <SelectInput label="Budget Range" value={editData.budget || 'Select your budget'} onPress={() => setShowBudgetModal(true)} icon="wallet-outline" />
            
            <FormInput label="Expected Guests" placeholder="Number of guests" value={editData.guests} onChangeText={(text) => setEditData({ ...editData, guests: text })} keyboardType="numeric" icon="people-outline" />
            <FormInput label="Wedding Location" placeholder="Venue or City" value={editData.location} onChangeText={(text) => setEditData({ ...editData, location: text })} icon="location-outline" />

            <GlassButton title="Save Changes" onPress={handleSave} loading={isLoading} icon="checkmark-circle" />
          </ScrollView>

          {showDatePicker && (
            <DateTimePicker 
              value={editData.weddingDate} mode="date" display="default" minimumDate={new Date()}
              onChange={(e, d) => { setShowDatePicker(false); if(d) setEditData({ ...editData, weddingDate: d }); }} 
            />
          )}

          <BudgetModal visible={showBudgetModal} selectedBudget={editData.budget} onSelect={handleBudgetSelect} onClose={() => setShowBudgetModal(false)} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}