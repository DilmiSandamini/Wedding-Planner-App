import { Text } from 'react-native'

interface SectionHeaderProps {
  title: string
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text
      className="mb-4 px-1"
      style={{
        fontFamily: 'System',
        fontSize: 18,
        fontWeight: '500',
        color: '#8B4555',
        letterSpacing: 0.5
      }}
    >
      {title}
    </Text>
  )
}