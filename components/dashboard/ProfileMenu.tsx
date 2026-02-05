import { Modal, View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ProfileMenuProps {
  visible: boolean
  onClose: () => void
  onEdit: () => void
  onLogout: () => void
  user: any
}

export default function ProfileMenu({ visible, onClose, onEdit, onLogout, user }: ProfileMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50"
      >
        <View className="absolute top-20 right-6">
          <TouchableOpacity activeOpacity={1}>
            <View className="rounded-[24px] p-4 bg-[#FFF5F5] min-w-[200px] shadow-lg shadow-black/20">
              {/* Profile Info */}
              <View className="pb-4 mb-4 border-b border-[#FFD4D4]">
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 rounded-full items-center justify-center overflow-hidden mr-3 bg-[#FFB6C1] border-2 border-white">
                    {user?.photoURL ? (
                      <Image source={{ uri: user.photoURL }} className="w-full h-full" />
                    ) : (
                      <Text className="text-white font-bold text-xl">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#8B4555] font-semibold text-base mb-0.5">{user?.displayName || 'User'}</Text>
                    <Text className="text-[#B76E79] text-xs font-normal">{user?.email}</Text>
                  </View>
                </View>
              </View>

              {/* Menu Items */}
              <MenuItem icon="create-outline" label="Edit Wedding Details" onPress={onEdit} />
              <MenuItem icon="settings-outline" label="Settings" onPress={() => console.log('Settings')} />
              
              <View className="my-2 h-[1px] bg-[#FFD4D4]" />
              
              <MenuItem icon="log-out-outline" label="Logout" onPress={onLogout} color="#EF4444" />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const MenuItem = ({ icon, label, onPress, color = "#8B4555" }: any) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center py-3 px-2">
    <Ionicons name={icon} size={20} color={color} />
    <Text className="ml-3 text-[15px] font-medium" style={{ color }}>{label}</Text>
  </TouchableOpacity>
)