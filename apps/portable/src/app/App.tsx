import React from 'react'

import AppNavigator from '../navigation/AppNavigator'
import ErrorBoundary from '../components/ErrorBoundary'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import '../global.css'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '../lib/apollo-client'

export const App = () => {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ApolloProvider client={apolloClient}>
          <AppNavigator />
        </ApolloProvider>
      </I18nextProvider>
    </ErrorBoundary>
  )
}

export default App
