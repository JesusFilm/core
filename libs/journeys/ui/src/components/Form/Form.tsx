import { FormiumClient } from '@formium/client'
import { Form as FormType } from '@formium/types'
import { User } from 'next-firebase-auth'
import { ReactElement, useEffect, useState } from 'react'

import { FormiumForm, getFormiumClient } from '@core/shared/ui/FormiumForm'

import { TreeBlock } from '../../libs/block'
import { WrappersProps } from '../BlockRenderer'

import { FormFields } from './__generated__/FormFields'

interface FormProps extends TreeBlock<FormFields> {
  wrappers?: WrappersProps
}

export function Form({ id, wrappers }: FormProps): ReactElement {
  // const form = await formiumClient.getFormBySlug(formSlug)
  const [form, setForm] = useState<FormType | undefined>(undefined)
  const [formiumClient, setFormiumClient] = useState<FormiumClient | undefined>(
    undefined
  )

  const projectId = '6525eb824f0b2e0001234bab'
  const apiToken =
    'FQRIJgbWxDXvfYCjmnXKNEhduJOfimJKeeTHz2B7S4VKn8a1JkOUtXiJY9NiRGWx'
  const formSlug = 'ns-onboarding-form-dev'

  useEffect(() => {
    const init = async (): Promise<void> => {
      const formiumClient = await getFormiumClient(projectId, apiToken)
      const form = await formiumClient.getFormBySlug(formSlug)

      if (formiumClient != null && form != null) {
        setFormiumClient(formiumClient)
        setForm(form)
      }
    }
    init().catch(console.error)
  }, [projectId, apiToken, formSlug])

  const user = {
    id: 'test_id',
    email: 'test_email'
  } as unknown as User

  return form != null && formiumClient != null ? (
    <div
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <FormiumForm
        form={form}
        formiumClient={formiumClient}
        userId={user.id}
        email={user.email}
        hiddenPageTitle
        submitText="Next"
        // submitIcon={<ArrowRightIcon />}
        // onSubmit={handleSubmit}
      />
    </div>
  ) : (
    <></>
  )
}
