import {
  Button,
  Column,
  Container,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text
} from '@react-email/components'
import { ReactElement } from 'react'

import { User } from '../../../firebaseClient'
import { JourneyForEmails } from '../../types/types'

interface ActionCardProps {
  url: string
  headerText?: string
  subHeaderText?: string
  bodyText?: string
  buttonText: string
  recipient?: Omit<User, 'id' | 'emailVerified'>
  sender?: Omit<User, 'id' | 'emailVerified'>
  journey?: JourneyForEmails
  variant?: 'accessRequest' | 'sharedWithYou' | 'emailVerify'
  token?: string
}

export function ActionCard({
  url,
  headerText,
  subHeaderText,
  bodyText,
  buttonText,
  sender,
  recipient,
  journey,
  variant,
  token
}: ActionCardProps): ReactElement {
  return (
    <Section className="mt-[60px] mb-[15px] max-w-[500px] ">
      <Container
        align="center"
        className="w-full bg-[#FFFFFF] pt-[20px] pb-[40px] rounded-lg"
      >
        <Section align="center" className="px-[28px]">
          <Row align="center" style={{ marginTop: '-50px' }}>
            <Column align="center">
              {recipient?.imageUrl != null ? (
                <Img
                  src={recipient.imageUrl ?? ''}
                  alt={recipient?.firstName ?? ''}
                  width={64}
                  height={64}
                  className="rounded-full border-solid border-4 border-[#FFFFFF] shadow-md"
                />
              ) : (
                <div className="bg-[#FFFFFF] h-[64px] w-[64px] rounded-full border-solid border-4 border-[#FFFFFF] shadow-md">
                  <Text className="font-sans font-bold text-[#FFFFFF] text-3xl mt-[14px] mr-[2px]">
                    👋
                  </Text>
                </div>
              )}
            </Column>
          </Row>
          <Row>
            <th>
              <Text className="font-semibold text-[16px] leading-[28px] mt-[12px] mb-[0px] text-center">
                {variant === 'accessRequest'
                  ? `Hi ${recipient?.firstName ?? ''}, do you want to`
                  : `Hi ${recipient?.firstName ?? ''},`}
              </Text>
              {variant === 'emailVerify' && (
                <Text className="font-semibold text-[16px] leading-[28px] mt-0 mb-[24px] text-center">
                  Verify your email address to start making interactive
                  Journeys!
                </Text>
              )}
              {variant != null && headerText != null && (
                <Text className="font-semibold text-[20px] leading-[28px] mt-[0px] mb-[20px] text-center">
                  {headerText}
                </Text>
              )}
              {variant == null && headerText != null && (
                <Text className="font-semibold text-[16px] leading-[24px] mt-[0px] mb-[20px] text-center">
                  {headerText}
                </Text>
              )}
              {variant == null && subHeaderText != null && (
                <Text className="font-semibold text-[20px] leading-[24px] mt-[0px] mb-[20px] text-center">
                  {subHeaderText}
                </Text>
              )}
              {variant == null && bodyText != null && (
                <Text className="font-[400] text-[16px] leading-[24px] mt-[0px] mb-[20px] text-center">
                  {bodyText}
                </Text>
              )}
              {variant !== 'accessRequest' && variant !== 'sharedWithYou' && (
                <Button
                  className="bg-[#26262D] rounded-lg text-white text-[16px] font-semibold no-underline text-center px-5 py-3"
                  style={{
                    font: '16px "Open Sans", sans-serif'
                  }}
                  href={url}
                >
                  {buttonText}
                </Button>
              )}
              {variant === 'emailVerify' && token != null && (
                <Text className="text-[14px] font-[400] leading-[24px] mt-[24px] mb-[0px] text-center">
                  If the link above does not work, enter the following code at
                  the link below:
                </Text>
              )}
              {variant === 'emailVerify' && token != null && (
                <Text className="text-[14px] font-[400] leading-[24px] my-0 text-center">
                  {token}
                </Text>
              )}
              {variant === 'emailVerify' && token != null && (
                <Link href={url} style={{ textDecoration: 'none' }}>
                  <Text className="text-center mt-[24px] text-[#C52D3A] font-[400] text-[12px] leading-[16px]">
                    {url}
                  </Text>
                </Link>
              )}
            </th>
          </Row>
          {variant != null && sender != null && (
            <Row className="mt-[20px] mb-[20px]">
              <Column align="right" className="pr-[10px]">
                {sender?.imageUrl != null ? (
                  <Img
                    src={sender.imageUrl ?? ''}
                    alt={sender?.firstName}
                    width={60}
                    height={60}
                    className="rounded-full shadow-md border-[#FFFFFF]"
                  />
                ) : (
                  <div className="bg-zinc-400 h-[60px] w-[60px] rounded-full border-solid border-2 border-[#FFFFFF] shadow-md">
                    <Text className="font-sans font-bold text-center text-[#FFFFFF] text-3xl mt-[12px] mr-[1px]">
                      {sender.firstName.at(0)}
                    </Text>
                  </div>
                )}
              </Column>
              <Column align="left" className="pl-[10px]">
                {sender.firstName != null && (
                  <Text className="font-sans text-[16px] leading-[24px] font-semibold m-[0px]">
                    {`${sender.firstName}`}
                  </Text>
                )}
                {sender.email != null && (
                  <Text className="font-sans text-[14px] leading-[24px] font-normal m-[0px]">
                    {`${sender.email}`}
                  </Text>
                )}
                <Text className="font-sans text-[16px] leading-[24px] font-semibold m-[0px]">
                  {variant === 'accessRequest'
                    ? 'requested access to the following journey: '
                    : 'shared the following journey: '}
                </Text>
              </Column>
            </Row>
          )}
        </Section>
        {variant != null && journey != null && (
          <Section align="center">
            <Hr className="mt-[20px]" />
            <Row className="px-[28px]">
              <Column align="center">
                {journey.primaryImageBlock?.src != null ? (
                  <Img
                    className="rounded-lg mt-[30px]"
                    width={160}
                    height={160}
                    src={journey.primaryImageBlock?.src}
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-zinc-400 h-[160px] w-[160px] rounded-lg mt-[30px]">
                    <Text className="font-sans font-bold text-center align-middle text-[#FFFFFF] text-3xl m-[0px] pt-[65px]">
                      {journey?.title.at(0)}
                    </Text>
                  </div>
                )}
              </Column>
            </Row>
            {variant === 'accessRequest' && (
              <Row className="px-[28px]">
                <Column align="center">
                  <Text className="font-sans font-semibold text-[12px] leading-[16px] text-[#ABADB7] mb-[0px]">
                    {journey?.team?.title.toUpperCase()}
                  </Text>
                </Column>
              </Row>
            )}
            <Row className="px-[28px]">
              <Column align="center">
                <Text className="font-sans font-semibold text-[20px] leading-[28px]">
                  {journey.title}
                </Text>
              </Column>
            </Row>
            <Row className="px-[28px]">
              <Column align="center">
                <Button
                  className="bg-[#26262D] rounded-lg text-white text-[16px] font-semibold no-underline text-center mt-[20px] px-5 py-3"
                  style={{
                    font: '16px "Open Sans", sans-serif'
                  }}
                  href={url}
                >
                  {buttonText}
                </Button>
              </Column>
            </Row>
          </Section>
        )}
      </Container>
    </Section>
  )
}

ActionCard.PreviewProps = {
  journey: {
    title: 'Why Jesus?',
    team: {
      title: 'Ukrainian outreach team Odessa'
    },
    primaryImageBlock: {
      src: 'https://s3-alpha-sig.figma.com/img/772d/9819/02ebd5f068f6a3d437b4fc9f012a7102?Expires=1708905600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C6QXa0ycSXjPnW8H~f5fo49JwKf~aW~GMm8CSifCuWcCLDs-ft-h8Db9DNzIfaxlnYPNNJ2OzEzxcmYinmB~RL5CGYJQZUGKvu1YwoximgzXP~0vDbxYJ2Hrm~M9uQhIth2yHFZmDeBt1j6YtBmxpuAb89e1GYbOeOXqFF8gZqD74rL0nhwdw5vX3-J7LLd31bUOJhQ8CEdcZHNjQlqb3Twv3pxShAS0OIBlpwON8TLwKASKedYvz-3qwxNsr97AbyOocNFrmCXtVZv8Eqe6-qMatDnLrXRNBklQcLjK36tDzNx1SBv8-iBj~BasAva2FwQmu9aegkjlTP43eMbRLw__'
    }
  } as unknown as JourneyForEmails,
  headerText: 'To join them create an account with Next Steps',
  buttonText: 'Create Account',
  url: 'https://admin.nextstep.is/',
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    email: 'joeRonImo@example.com',
    imageUrl: undefined
  }
} satisfies ActionCardProps

export default ActionCard
