import { Image } from 'expo-image'
import { ReactElement } from 'react'
import { Text, View } from 'react-native'

interface ChurchPopularSectionItemProps {
  rank: number
  contentName: string
  bibleBooks?: string[]
  studentCount?: number
  contentImage?: string | null
}

export function ChurchPopularSectionItem({
  rank,
  contentName,
  bibleBooks,
  studentCount
}: ChurchPopularSectionItemProps): ReactElement {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center'
      }}
    >
      <Text style={{ color: 'white', fontWeight: 500 }}>{rank}</Text>
      <View
        style={{
          overflow: 'hidden',
          borderRadius: 10,
          height: 64,
          width: 64
        }}
      >
        <Image
          style={{
            height: '100%',
            width: '100%'
          }}
          contentFit="cover"
          source="https://picsum.photos/seed/696/3000/2000"
        />
      </View>
      <View>
        <Text style={{ color: 'white', fontWeight: 500 }}>{contentName}</Text>
        <View
          style={{
            flexDirection: 'row'
          }}
        >
          {bibleBooks?.map((book, i, arr) => {
            const lastItem = i === arr.length - 1
            return (
              <Text key={i} style={{ color: 'white', fontWeight: 200 }}>
                {lastItem ? `${book}` : `${book}, `}
              </Text>
            )
          })}
        </View>
      </View>
    </View>
  )
}
