import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

interface ExampleComponentProps {
  style?: any
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  style
}) => {
  const { t } = useTranslation('common')

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{t('common.loading')}</Text>
      <Text style={styles.subtitle}>{t('common.error')}</Text>
      <Text style={styles.button}>{t('common.retry')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    margin: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8
  },
  button: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500'
  }
})
