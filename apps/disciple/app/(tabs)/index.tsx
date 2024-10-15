import { router } from 'expo-router'
import { ReactElement } from 'react'
import { SafeAreaView, ScrollView } from 'react-native'

import { Box } from '../../src/components/ui/box'
import { Button, ButtonText } from '../../src/components/ui/button'
import { Heading } from '../../src/components/ui/heading'
import { Text } from '../../src/components/ui/text'
import { VStack } from '../../src/components/ui/vstack'

export default function HomePage(): ReactElement {
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 18
        ? 'Good Afternoon'
        : 'Good Evening'

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1
        }}
        className="mb-20 flex-1 md:mb-2"
      >
        <VStack className="w-full p-4 pb-0" space="2xl">
          <Heading size="2xl" className="font-roboto">
            {greeting}
          </Heading>
          <Box className="border-outline-100 relative z-0 w-full flex-col justify-between rounded-lg border bg-white p-5">
            <Text className="tracking-sm display-inline margin-0 padding-0 position-relative word-wrap-break-word text-typography-900 my-0 box-border list-none whitespace-pre-wrap border-0 bg-transparent text-xl font-bold leading-normal no-underline">
              Welcome to Disciple
            </Text>
            <Text className="tracking-sm display-inline margin-0 padding-0 position-relative word-wrap-break-word text-typography-700 my-0 box-border list-none whitespace-pre-wrap border-0 bg-transparent text-lg font-normal leading-[21px] no-underline">
              Find your local church for the best experience.
            </Text>
            <Button
              size="md"
              variant="solid"
              action="primary"
              className="mt-4"
              onPress={() => {
                router.push({
                  pathname: '/churches',
                  params: { churchId: 'aucklandEv' }
                })
              }}
            >
              <ButtonText>Search</ButtonText>
            </Button>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
}
