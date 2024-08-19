import { TFunction } from 'next-i18next'

export type ActionValue =
  | 'None'
  | 'NavigateToBlockAction'
  | 'LinkAction'
  | 'EmailAction'

export function actions(t: TFunction): Array<{
  value: ActionValue
  label: string
}> {
  return [
    {
      value: 'None',
      label: t('None')
    },
    {
      value: 'NavigateToBlockAction',
      label: t('Selected Card')
    },
    {
      value: 'LinkAction',
      label: t('URL/Website')
    },
    {
      value: 'EmailAction',
      label: t('Email')
    }
  ]
}

interface ActionTranslation {
  value: ActionValue
  label: string
}

/**
 * Get the action object from the value. If value is not found, return None.
 */
export function getAction(
  t: TFunction,
  value?: ActionValue
): ActionTranslation {
  if (value == null)
    return {
      value: 'None',
      label: t('None')
    }
  return actions(t).find((act) => act.value === value) as ActionTranslation
}
