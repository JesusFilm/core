import { OverlayProvider } from '@gluestack-ui/overlay'
import { ToastProvider } from '@gluestack-ui/toast'
import React from 'react'
import { View } from 'react-native'

import { config } from './config'

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: 'light' | 'dark'
  children?: any
}) {
  return (
    <View
      style={[
        config[mode],
        { flex: 1, height: '100%', width: '100%' },
        // @ts-expect-error
        props.style
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  )
}
