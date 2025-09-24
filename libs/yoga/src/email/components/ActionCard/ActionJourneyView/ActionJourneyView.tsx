import {
  Button,
  Column,
  Hr,
  Img,
  Row,
  Section,
  Text
} from '@react-email/components'
import { ReactElement } from 'react'

import { JourneyForEmails } from '../../../types/types'
import { ActionButton } from '../ActionButton'

interface ActionJourneyViewProps {
  journey: JourneyForEmails
  url: string
  buttonText: string
  variant?: 'withTeam'
}

export function ActionJourneyView({
  journey,
  url,
  buttonText,
  variant
}: ActionJourneyViewProps): ReactElement {
  return (
    <Section align="center">
      <Hr className="mt-[20px]" />
      <Row>
        <Column align="center">
          <Button href={url}>
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
            {variant === 'withTeam' && (
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
                <Text className="font-sans font-semibold text-[20px] text-black visited:text-black leading-[28px]">
                  {journey.title}
                </Text>
              </Column>
            </Row>
          </Button>
        </Column>
      </Row>
      {url != null && buttonText != null && (
        <Row className="px-[28px] mt-[20px]">
          <Column align="center">
            <ActionButton url={url} buttonText={buttonText} />
          </Column>
        </Row>
      )}
    </Section>
  )
}

export default ActionJourneyView
