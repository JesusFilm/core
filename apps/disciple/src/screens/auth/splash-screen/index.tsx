import { useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { Button, ButtonText } from 'src/components/ui/button'
import { Icon } from 'src/components/ui/icon'
import { VStack } from 'src/components/ui/vstack'

import { AuthLayout } from '../layout'

import { GluestackIcon, GluestackIconDark } from './assets/icons/gluestack-icon'

const SplashScreenWithLeftBackground = () => {
  const router = useRouter()
  const { colorScheme } = useColorScheme()
  return (
    <VStack
      className="w-full max-w-[440px] items-center h-full justify-center"
      space="lg"
    >
      {colorScheme === 'dark' ? (
        <Icon as={GluestackIconDark} className="w-[219px] h-10" />
      ) : (
        <Icon as={GluestackIcon} className="w-[219px] h-10" />
      )}
      <VStack className="w-full" space="lg">
        <Button
          className="w-full"
          onPress={() => {
            router.push('/auth/signin')
          }}
        >
          <ButtonText className="font-medium">Log in</ButtonText>
        </Button>
        <Button
          onPress={() => {
            router.push('/auth/signup')
          }}
        >
          <ButtonText className="font-medium">Sign Up</ButtonText>
        </Button>
      </VStack>
    </VStack>
  )
}

export const SplashScreen = () => {
  return (
    <AuthLayout>
      <SplashScreenWithLeftBackground />
    </AuthLayout>
  )
}
