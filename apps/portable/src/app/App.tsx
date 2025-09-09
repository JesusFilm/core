import React from 'react'

import '../i18n' // Import i18n configuration
import AppNavigator from '../navigation/AppNavigator'
import ErrorBoundary from '../components/ErrorBoundary'
import '../global.css'

export const App = () => {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  )
}

export default App
