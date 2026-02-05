import { View, ViewProps } from 'react-native'

interface DashboardCardProps extends ViewProps {
  children: React.ReactNode
}

export default function DashboardCard({ children, style, className, ...props }: DashboardCardProps) {
  return (
    <View
      className={`rounded-[24px] p-5 ${className}`}
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          shadowColor: '#FFB6C1',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 5,
          borderWidth: 1,
          borderColor: '#FFF0F5'
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  )
}