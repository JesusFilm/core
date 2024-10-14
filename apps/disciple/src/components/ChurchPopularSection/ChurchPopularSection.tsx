import { ReactElement } from 'react'
import { Text, View } from 'react-native'
import { ChurchPopularSectionItem } from './ChurchPopularSectionItem'

const mockPopularChurchContentData = [
  {
    id: 'd1a37b25-bd59-4e2b-8e92-4d61c0d4eec1',
    __typename: 'PopularChurchContent',
    contentId: 'e0c93c5f-5162-4b49-aed3-83724ab78b8c',
    contentName: 'Freedom',
    bibleBooks: ['Galatians'],
    studentCount: 400,
    churchId: 'a5f48e22-c9d7-4b34-a13d-c23269f53b49',
    churchName: 'Auckland Ev',
    contentImage: 'string'
  },
  {
    id: 'c9eb54b9-8ef6-49ff-bb5f-3a70d9d46f10',
    __typename: 'PopularChurchContent',
    contentId: '1f043c23-8284-4ba5-9a29-98b654bc8b36',
    contentName: '...to be continued',
    bibleBooks: ['Acts'],
    studentCount: 300,
    churchId: '2d6977fc-234d-4bb9-b614-efb4e5bde98a',
    churchName: 'Auckland Ev',
    contentImage: 'string'
  },
  {
    id: '8b1a0299-dae6-4936-b073-0c123ea05b55',
    __typename: 'PopularChurchContent',
    contentId: '839f0674-2c41-4411-9892-05e616ff33f1',
    contentName: 'Defining Moments',
    bibleBooks: ['1 Conrinthians', 'Mark', 'Ephesians'],
    contentDescription:
      'A deep dive into the power of belief and faith in everyday life.',
    studentCount: 250,
    churchId: 'd6be21f4-95f2-45f5-b93f-d23c2fbb329a',
    churchName: 'Auckland Ev',
    contentImage: 'string'
  },
  {
    id: '623ad1e2-0124-44be-b8b3-c7ff5a029a75',
    __typename: 'PopularChurchContent',
    contentId: 'c1b7c2fc-36b9-45c7-87c4-7e482ad4f9a2',
    contentName: 'True Freedom',
    bibleBooks: ['Romans'],
    studentCount: 220,
    churchId: '60522683-1274-4f95-b58c-91f35a13583d',
    churchName: 'Auckland Ev',
    contentImage: 'string'
  },
  {
    id: '57a39a99-278f-42b0-8d63-498f65509bcf',
    __typename: 'PopularChurchContent',
    contentId: 'ab04e0f7-d10c-4f0f-a25b-3c58e51d5310',
    contentName: 'Indestructible Joy',
    bibleBooks: ['Philippians'],
    contentDescription:
      'How to live a life of love and kindness in a challenging world.',
    studentCount: 180,
    churchId: '2d80d403-66c7-4652-a6a7-f0e30b6353a2',
    churchName: 'Auckland Ev',
    contentImage: 'string'
  }
]

export function ChurchPopularSection(): ReactElement {
  return (
    <View
      style={{
        display: 'flex',
        gap: 20
      }}
    >
      <Text
        style={{
          fontSize: 25,
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        Popular
      </Text>
      <View
        style={{
          gap: 20
        }}
      >
        {mockPopularChurchContentData.map(
          ({ id, contentName, bibleBooks, studentCount, contentImage }, i) => (
            <ChurchPopularSectionItem
              rank={i + 1}
              key={id}
              contentName={contentName}
              bibleBooks={bibleBooks}
              studentCount={studentCount}
              contentImage={contentImage}
            />
          )
        )}
      </View>
    </View>
  )
}
