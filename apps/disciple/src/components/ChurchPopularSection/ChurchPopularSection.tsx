import { ReactElement } from 'react'
import { Pressable, Text, View } from 'react-native'

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
    contentImage:
      'https://aev-resources.s3.amazonaws.com/c08rdmogdmgvaf482z8vozjfm86u?response-content-disposition=inline%3B%20filename%3D%22Galatians%20Sermon%20Series%20Announcement%20Banner.jpg%22%3B%20filename%2A%3DUTF-8%27%27Galatians%2520Sermon%2520Series%2520Announcement%2520Banner.jpg&response-content-type=image%2Fjpeg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA46KMS42YLXPD3BVG%2F20241014%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241014T205132Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=f476117b514d96f7f5a221dcd5c2c62ba8b36c6190afce7a81dcaae98e22e18a'
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
    contentImage:
      'https://resources.aucklandev.co.nz/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaEpJaWsyTldKak1UWTFPQzB5WkdVekxUUmhOV010WW1RNE15MDFOV0kxWmpabU5EYzJZbUVHT2daRlZBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2JfaWQifX0=--9f4660290f0a0811e9ef3ae4f5c0e776d9d2202d/Acts%20outline%20title%20banner.jpg'
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
    contentImage:
      'https://aev-resources.s3.amazonaws.com/bbpqax4k1o7i80zhwdsocywbxd8c?response-content-disposition=inline%3B%20filename%3D%22Defining%20Moments%20Sermon%20Series%20Banner.jpg%22%3B%20filename%2A%3DUTF-8%27%27Defining%2520Moments%2520Sermon%2520Series%2520Banner.jpg&response-content-type=image%2Fjpeg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA46KMS42YLXPD3BVG%2F20241014%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241014T205136Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=2bb923e9ad3836ad987757f229c6ecc7571680af5f99c1674c688d972682986a'
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
    contentImage:
      'https://resources.aucklandev.co.nz/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaEpJaWsyTTJZMU9Ea3pNaTA0TmpObUxUUXpPR0V0T1RReU5DMWpPR1prWkRaa05HRTRZekVHT2daRlZBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2JfaWQifX0=--1702fa1fb9087e80c1e8b2af53a8b28573d6d533/Romans%20Banner%201920%20x%201080.jpg'
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
    contentImage:
      'https://resources.aucklandev.co.nz/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaEpJaWszTW1VNVptRTJOeTB3TUdGaUxUUTFOemd0T0dKbU15MHpZemxpWVRRNVpqRXpPRFFHT2daRlZBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2JfaWQifX0=--fbb2d67fda87d08a8a6b6b6ef27ec7b0fc6cb18b/Philippians-Indestructible-Joy-Banner%201920x1080.jpg'
  }
]

export function ChurchPopularSection(): ReactElement {
  return (
    <View
      style={{
        display: 'flex',
        gap: 20,
        marginBottom: 30
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
          ({ id, contentName, bibleBooks, contentImage }, i) => (
            <Pressable
              key={id}
              onPress={() =>
                console.log(
                  `good content choice! ${contentName} is a favourite of mine!`
                )
              }
            >
              <ChurchPopularSectionItem
                rank={i + 1}
                key={id}
                contentName={contentName}
                bibleBooks={bibleBooks}
                contentImage={contentImage}
              />
            </Pressable>
          )
        )}
      </View>
    </View>
  )
}
