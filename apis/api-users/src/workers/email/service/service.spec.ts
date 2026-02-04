import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { sendEmail } from '@core/yoga/email'

import { prismaMock } from '../../../../test/prismaMock'
import { user } from '../../../schema/user/user.mock'

import { type VerifyUserJob, service } from './service'

jest.mock('@react-email/render')

jest.mock('@core/yoga/email')

const renderMock = render as jest.MockedFunction<typeof render>
const sendEmailMock = sendEmail as jest.MockedFunction<typeof sendEmail>

describe('service', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.JOURNEYS_ADMIN_URL = 'https://admin.example.com'
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('should send NextSteps email by default if no app type provided', async () => {
    const job: Job<VerifyUserJob, unknown, string> = {
      name: 'verifyUser',
      data: {
        userId: 'userId',
        email: 'test@example.com',
        token: '123456',
        redirect: undefined
        // app is not provided
      }
    } as unknown as Job<VerifyUserJob, unknown, string>

    prismaMock.user.findUnique.mockResolvedValue(user)
    renderMock.mockResolvedValueOnce('<div>Mocked HTML email content</div>')
    renderMock.mockResolvedValueOnce('Mocked plain text email content')
    await service(job)

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { userId: 'userId' }
    })

    expect(renderMock).toHaveBeenCalledTimes(2)
    expect(renderMock.mock.calls[1]).toEqual([
      expect.anything(),
      { plainText: true }
    ])

    expect(sendEmailMock).toHaveBeenCalledWith(
      {
        to: 'test@example.com',
        subject: 'Verify your email address on Next Steps',
        text: 'Mocked plain text email content',
        html: '<div>Mocked HTML email content</div>',
        from: '"Next Steps Support" <support@nextstep.is>'
      },
      undefined
    )
  })

  it('should send Jesus Film Project email if app type is JFPOne', async () => {
    const job: Job<VerifyUserJob, unknown, string> = {
      name: 'verifyUser',
      data: {
        userId: 'userId',
        email: 'test@example.com',
        token: '123456',
        redirect: undefined,
        app: 'JFPOne'
      }
    } as unknown as Job<VerifyUserJob, unknown, string>

    prismaMock.user.findUnique.mockResolvedValue(user)
    renderMock.mockResolvedValueOnce('<div>Mocked HTML email content</div>')
    renderMock.mockResolvedValueOnce('Mocked plain text email content')
    await service(job)

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { userId: 'userId' }
    })

    expect(renderMock).toHaveBeenCalledTimes(2)
    expect(renderMock.mock.calls[1]).toEqual([
      expect.anything(),
      { plainText: true }
    ])

    expect(sendEmailMock).toHaveBeenCalledWith(
      {
        to: 'test@example.com',
        subject: 'Verify your email address with the Jesus Film Project',
        text: 'Mocked plain text email content',
        html: '<div>Mocked HTML email content</div>',
        from: '"Jesus Film Project" <no-reply@jesusfilm.org>'
      },
      undefined
    )
  })
})
