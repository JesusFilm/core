import { CustomizationScreen } from '../getCustomizeFlowConfig'

export function getNextCustomizeScreen(
  screens: CustomizationScreen[],
  currentScreen: CustomizationScreen
): CustomizationScreen | null {
  const currentIndex = screens.indexOf(currentScreen)
  const isLastOrInvalidScreen =
    currentIndex < 0 || currentIndex >= screens.length - 1
  if (isLastOrInvalidScreen) return null
  return screens[currentIndex + 1]
}
