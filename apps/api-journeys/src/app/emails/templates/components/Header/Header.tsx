import {
  Column,
  Container,
  Heading,
  Img,
  Row,
  Tailwind,
  Text
} from '@react-email/components'
import { ReactElement } from 'react'

import { User } from '@core/nest/common/firebaseClient'

import { EmailLogo } from '../EmailLogo'

interface HeaderProps {
  sender: Omit<User, 'id' | 'email'>
}

export function Header({ sender }: HeaderProps): ReactElement {
  return (
    <Tailwind>
      <Container className="bg-[#FFFFFF] h-[72px] ">
        <Container>
          <Row className="align-middle">
            <Column className="text-center">
              <EmailLogo />
            </Column>
            <Column className="text-center w-[10px] pr-[10px]">
              {sender?.imageUrl != null ? (
                <Img
                  src={sender.imageUrl ?? ''}
                  alt={sender?.firstName}
                  width={32}
                  height={32}
                  className="rounded-full border-solid border-2 border-[#FFFFFF] shadow-md"
                />
              ) : (
                <div className="bg-zinc-400 h-[32px] w-[32px] rounded-full border-solid border-2 border-[#FFFFFF] shadow-md">
                  <Text className="font-sans font-bold text-[#FFFFFF] m-[5px]">
                    {sender.firstName.at(0)}
                  </Text>
                </div>
              )}
            </Column>
            <Column className="text-start">
              <Heading
                as="h2"
                className="text-black text-[16px] font-normal font-['Helvetica']"
              >{`${sender.firstName} ${sender.lastName}`}</Heading>
            </Column>
          </Row>
        </Container>
      </Container>
    </Tailwind>
  )
}

Header.PreviewProps = {
  sender: {
    firstName: 'Joe',
    lastName: 'Ron-Imo',
    imageUrl: undefined
  }
} satisfies HeaderProps

export default Header
