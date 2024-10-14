import { router } from 'expo-router'
import React, { ReactElement } from 'react'

import { Button, ButtonText } from '../src/components/ui/button'
import { SafeAreaView } from '../src/components/ui/safe-area-view'
import { VStack } from '../src/components/ui/vstack'

export default function IndexPage(): ReactElement {
  return (
    <SafeAreaView className="md:flex flex-col items-center justify-center md:w-full h-full">
      <VStack className="p-2 md:max-w-[440px] w-full" space="xl">
        <Button
          onPress={() => {
            router.push('auth/splash-screen')
          }}
        >
          <ButtonText>SplashScreen</ButtonText>
        </Button>
        <Button
          className="w-full"
          onPress={() => {
            router.push('auth/sign-in')
          }}
        >
          <ButtonText>Sign in</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push('auth/sign-up')
          }}
        >
          <ButtonText>Sign up</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push('auth/forgot-password')
          }}
        >
          <ButtonText>Forgot password</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push('auth/create-password')
          }}
        >
          <ButtonText>Create password</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push('news-feed/news-and-feed')
          }}
        >
          <ButtonText>News feed</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push('dashboard/dashboard-layout')
          }}
        >
          <ButtonText>Dashboard</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push('profile/profile')
          }}
        >
          <ButtonText>Profile</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  )
}
