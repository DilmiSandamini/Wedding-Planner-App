import { Pressable, View, Text, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

interface RomanticButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  icon?: any
}

export default function RomanticButton({
  title,
  onPress,
  loading = false,
  icon
}: RomanticButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.9 : 1,
        shadowColor: '#FF69B4',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5
      })}
    >
      <LinearGradient
        colors={['#FFB6C1', '#FF69B4', '#FF1493']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-2xl py-4"
      >
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text
                style={{
                  fontFamily: 'System',
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  letterSpacing: 1.5
                }}
              >
                {title}
              </Text>
              {icon && (
                <Ionicons 
                  name={icon} 
                  size={20} 
                  color="#FFFFFF" 
                  style={{ marginLeft: 8 }}
                />
              )}
            </>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  )
}