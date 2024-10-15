import Feather from '@expo/vector-icons/Feather'
import { Link, Stack } from 'expo-router'
import { ReactElement } from 'react'
import { SafeAreaView } from 'react-native'

import { Avatar, AvatarImage } from '../../src/components/ui/avatar'
import { Box } from '../../src/components/ui/box'
import { Button, ButtonIcon, ButtonText } from '../../src/components/ui/button'
import { Grid, GridItem } from '../../src/components/ui/grid'
import { HStack } from '../../src/components/ui/hstack'
import { SearchIcon } from '../../src/components/ui/icon'
import {
  Input,
  InputField,
  InputIcon,
  InputSlot
} from '../../src/components/ui/input'
import { Text } from '../../src/components/ui/text'
import { VStack } from '../../src/components/ui/vstack'

export default function Churches(): ReactElement {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView>
        <Box className="align-center flex w-full flex-row gap-x-4 px-4">
          <Box className="flex-1">
            <Input variant="rounded" size="sm">
              <InputSlot className="bg-primary-500 m-1.5 h-6 w-6 rounded-full">
                <InputIcon as={SearchIcon} color="#FEFEFF" />
              </InputSlot>
              <InputField placeholder="Find My Church" />
            </Input>
          </Box>
          <Link href="/" asChild>
            <Button variant="link">
              <ButtonIcon as={() => <Feather name="x" size={28} />} />
            </Button>
          </Link>
        </Box>
        <Box className="m-5 flex">
          <Grid _extra={{ className: 'gap-5' }}>
            <GridItem
              _extra={{
                className: 'col-span-12 sm:col-span-6 lg:col-span-4'
              }}
            >
              <HStack
                space="md"
                className="border-border-300 items-center justify-between rounded-lg border p-4"
              >
                <HStack space="xl" className="items-center">
                  <Avatar>
                    <AvatarImage height="100%" width="100%" />
                  </Avatar>
                  <VStack>
                    <Text className="text-typography-900 line-clamp-1 font-semibold">
                      Auckland Ev
                    </Text>
                    <Text className="line-clamp-1">Auckland, New Zealand</Text>
                  </VStack>
                </HStack>
                <Link href="/churches/auckland-ev" asChild>
                  <Button size="xs">
                    <ButtonText>View</ButtonText>
                  </Button>
                </Link>
              </HStack>
            </GridItem>
          </Grid>
        </Box>
      </SafeAreaView>
    </>
  )
}
