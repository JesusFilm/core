import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { PageWrapper } from '../PageWrapper'

import { CollectionsPageContent } from './CollectionsPageContent'
import { CollectionsVideoContent } from './CollectionsVideoContent'
import { ContainerHero } from './ContainerHero'

export function CollectionsPage(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [mutePage, setMutePage] = useState(true)

  return (
    <PageWrapper hero={<ContainerHero />} hideHeader hideFooter>
      <CollectionsPageContent>
        <CollectionsVideoContent
          contentId="easter-explained/english"
          subtitle={t("Jesus' Victory Over Sin and Death")}
          title={t('The True Meaning of Easter')}
          description={t(
            "Easter is about more than eggs and bunnies—it's about Jesus and His amazing love for us. He died on the cross for our sins and rose from the dead, showing His power over sin and death. Because of Him, we can have forgiveness and the promise of eternal life. Easter is a time to celebrate this great hope and God's incredible gift to us."
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t(
                "How can I trust in God's sovereignty when the world feels so chaotic?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Even in times of chaos and uncertainty, we can trust in God's sovereignty because:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'God remains in control even when circumstances feel out of control'
                      )}
                    </li>
                    <li>
                      {t('His purposes are higher than our understanding')}
                    </li>
                    <li>
                      {t(
                        'He promises to work all things for good for those who love Him'
                      )}
                    </li>
                    <li>
                      {t(
                        'The Bible shows countless examples of God bringing order from chaos'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t(
                'Why is Easter the most important Christian holiday?'
              ),
              answer: (
                <>
                  <p>{t('Easter is central to Christian faith because:')}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        "It marks Jesus' resurrection, proving His victory over death"
                      )}
                    </li>
                    <li>
                      {t(
                        'It fulfills Old Testament prophecies about the Messiah'
                      )}
                    </li>
                    <li>{t("It demonstrates God's power to give new life")}</li>
                    <li>
                      {t(
                        'It provides hope for our own resurrection and eternal life'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                "What happened during the three days between Jesus' death and resurrection?"
              ),
              answer: (
                <>
                  <p>{t('The Bible tells us several key events occurred:')}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        "Jesus' body was placed in a tomb and guarded by Roman soldiers"
                      )}
                    </li>
                    <li>
                      {t('His followers mourned and waited in uncertainty')}
                    </li>
                    <li>
                      {t(
                        'According to Scripture, He descended to the realm of the dead'
                      )}
                    </li>
                    <li>
                      {t('On the third day, He rose victorious over death')}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1508558936510-0af1e3cccbab?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmljdG9yeXxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#201617',
              author: t('Apostle Paul'),
              text: t(
                '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
              bgColor: '#A88E78',
              author: t('Apostle Paul'),
              text: t(
                '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
              bgColor: '#72593A',
              author: t('Apostle Paul'),
              text: t(
                '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t('Want to grow deep in your understanding of the Bible?'),
            buttonText: t('Join Our Bible study')
          }}
          showDivider={false}
        />
        <CollectionsVideoContent
          contentId="my-last-day/english"
          subtitle={t('My Last Day')}
          title={t("Last hour of Jesus' life from criminal's point of view")}
          description={t(
            "A condemned thief watches in horror as Jesus is brutally flogged in Pilate's courtyard, memories of his own crimes flooding his mind. Why would they punish an innocent man? The roar of the crowd seals their fate—crucifixion. Forced to carry their crosses to Golgotha, he stumbles beside Jesus, the weight of his past and his sentence crushing him. As nails pierce flesh and the sky darkens, he makes a desperate plea—could this truly be the Messiah? In his final moments, Jesus gives him an unexpected promise: Today, you will be with me in paradise. Watch as this powerful moment unfolds."
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t('Why would Jesus forgive a criminal so easily?'),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus' forgiveness is a demonstration of God's grace and mercy. The thief on the cross recognized Jesus' innocence and divinity, humbly asking to be remembered in His kingdom. Jesus' response shows:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('Salvation is based on faith, not deeds')}</li>
                    <li>
                      {t("God's mercy extends to all, even the worst sinners")}
                    </li>
                    <li>
                      {t(
                        'Jesus came to save the lost, including criminals and outcasts'
                      )}
                    </li>
                    <li>
                      {t(
                        'Grace is freely given to those who sincerely seek it'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t(
                "If Jesus was innocent, why didn't he save himself instead of accepting death?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus willingly accepted death because it was part of God's plan for redemption. His sacrifice was necessary to fulfill prophecy and bring salvation. Key reasons include:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'His death fulfilled Old Testament prophecies (Isaiah 53)'
                      )}
                    </li>
                    <li>
                      {t("He took on the punishment for humanity's sins")}
                    </li>
                    <li>
                      {t(
                        'By not saving Himself, He demonstrated His ultimate love and obedience to God'
                      )}
                    </li>
                    <li>
                      {t(
                        'His resurrection proved His victory over sin and death'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                "What does it really mean to be 'in paradise' with Jesus?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      'Being in paradise with Jesus means eternal life in the presence of God. The thief on the cross was assured of his place with Jesus in heaven because of his faith. Important aspects of this promise include:'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'It signifies immediate presence with Christ after death'
                      )}
                    </li>
                    <li>{t('It confirms salvation through faith alone')}</li>
                    <li>{t('It offers hope of eternal joy and peace')}</li>
                    <li>
                      {t(
                        "Jesus' words affirm the reality of life beyond this world"
                      )}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1542272201-b1ca555f8505?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreXxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#176361',
              author: t('Jesus (Luke 23:43)'),
              text: t(
                'Truly I tell you, today you will be with me in paradise.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGZvcmdpdmV8ZW58MHx8MHx8fDA%3D',
              bgColor: '#031829',
              author: t('Jesus (Luke 23:34)'),
              text: t(
                'Father, forgive them, for they do not know what they are doing.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1595119591974-a9bd1532c1b0?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#0E0D0F',
              author: t('Isaiah 53:5'),
              text: t(
                'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t('Want to grow deep in your understanding of the Bible?'),
            buttonText: t('Join Our Bible study')
          }}
        />
        <CollectionsVideoContent
          contentId="why-did-jesus-have-to-die/english"
          subtitle={t('Why Did Jesus Have to Die?')}
          title={t("The Purpose of Jesus' Sacrifice")}
          description={t(
            "God created humans to be spiritually and relationally connected with Him, but how can we keep God's commands? How can we live without shame? We can't restore ourselves to honor. It would seem we're doomed, except God doesn't want His creation to die. He is merciful and loving, and wants us to be restored, living with Him in full life."
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t("Why was Jesus' death necessary?"),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus' death was necessary to fulfill God's plan of redemption. Because of sin, humanity was separated from God, but Jesus' sacrifice provided the way for reconciliation. Here's why His death was essential:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('Sin creates a barrier between us and God')}</li>
                    <li>{t("God's justice requires a payment for sin")}</li>
                    <li>
                      {t('Jesus, as the perfect sacrifice, took our place')}
                    </li>
                    <li>
                      {t(
                        'Through His death, we receive forgiveness and restoration'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t(
                "If God is loving, why didn't He just forgive sin without Jesus' sacrifice?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "God's love and justice go hand in hand. While He desires to forgive, He also upholds justice. Jesus' sacrifice was the ultimate expression of both:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'Forgiveness requires a cost, and Jesus paid that cost'
                      )}
                    </li>
                    <li>
                      {t(
                        "His death satisfied God's justice while showing His mercy"
                      )}
                    </li>
                    <li>
                      {t(
                        'Through Jesus, God demonstrated His love for humanity'
                      )}
                    </li>
                    <li>
                      {t(
                        'His sacrifice allows us to be restored without compromising divine justice'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                "How does Jesus' death affect our relationship with God?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus' death and resurrection opened the way for us to be reconciled with God. Through Him, we can:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('Experience forgiveness and freedom from sin')}</li>
                    <li>{t('Have direct access to God through Christ')}</li>
                    <li>{t('Receive the gift of eternal life')}</li>
                    <li>
                      {t('Live in restored relationship with our Creator')}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#060606',
              author: t('Romans 5:8'),
              text: t(
                'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: t('John 3:16'),
              text: t(
                'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: t('1 Peter 2:24'),
              text: t(
                'He himself bore our sins in his body on the cross, so that we might die to sins and live for righteousness; by his wounds you have been healed.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t("Want to understand more about Jesus' sacrifice?"),
            buttonText: t('Join Our Bible study')
          }}
          showDivider={false}
        />
        <CollectionsVideoContent
          contentId="did-jesus-come-back-from-the-dead/english"
          subtitle={t('Did Jesus Come Back From the Dead?')}
          title={t("The Truth About Jesus' Resurrection")}
          description={t(
            "Jesus told people that he would die and then come back to life. This short film explains the details surrounding Jesus' death and resurrection. His closest followers struggled to believe, but eyewitnesses confirmed the truth: He rose again. The news of His resurrection spread across the world, changing lives forever. Because of these witnesses, we can have confidence in the reality of Jesus' resurrection."
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t('How do we know Jesus really died and rose again?'),
              answer: (
                <>
                  <p>
                    {t(
                      "There is strong historical and biblical evidence for Jesus' death and resurrection:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'Roman soldiers confirmed His death before burying Him'
                      )}
                    </li>
                    <li>{t("Jesus' tomb was sealed and guarded")}</li>
                    <li>
                      {t(
                        'Hundreds of witnesses saw Jesus alive after His resurrection'
                      )}
                    </li>
                    <li>
                      {t(
                        'His disciples, once afraid, boldly preached and died for this truth'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t('Why is the resurrection of Jesus important?'),
              answer: (
                <>
                  <p>
                    {t(
                      'The resurrection is central to Christian faith because:'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t("It proves Jesus' victory over sin and death")}</li>
                    <li>{t('It fulfills prophecies about the Messiah')}</li>
                    <li>{t('It confirms that Jesus is the Son of God')}</li>
                    <li>
                      {t('It gives believers hope of eternal life with Him')}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                "How should we respond to Jesus' death and resurrection?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus' resurrection calls for a personal response. We can:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('Believe in Him as our Savior and Lord')}</li>
                    <li>{t('Repent from sin and follow His teachings')}</li>
                    <li>
                      {t('Share the good news of His resurrection with others')}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#060606',
              author: t('Romans 5:8'),
              text: t(
                'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: t('John 3:16'),
              text: t(
                'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: t('1 Peter 2:24'),
              text: t(
                'He himself bore our sins in his body on the cross, so that we might die to sins and live for righteousness; by his wounds you have been healed.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t('Want to understand more about the resurrection?'),
            buttonText: t('Join Our Bible study')
          }}
          showDivider={false}
        />
        <CollectionsVideoContent
          contentId="the-story-short-film/english"
          subtitle={t('The Story Short Film')}
          title={t('The Story: How It All Began and How It Will Never End')}
          description={t(
            "The Story is a short film of how everything began and how it can never end. This film shares the overarching story of the Bible, a story that redeems all stories and brings new life through salvation in Jesus alone. It answers life's biggest questions: Where did we come from? What went wrong? Is there any hope? And what does the future hold?"
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t(
                'Where did everything come from? Is there a purpose to life?'
              ),
              answer: (
                <>
                  <p>
                    {t(
                      'The Bible teaches that everything began with God, the Creator of the universe. He spoke everything into existence with purpose and design. Humanity was created in His image to live in harmony with Him, each other, and creation.'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('God created the world out of love and order')}</li>
                    <li>
                      {t(
                        'Everything was originally perfect, without pain or suffering'
                      )}
                    </li>
                    <li>
                      {t(
                        'Humans were designed to have a personal relationship with God'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t(
                'If God is good, why is there so much suffering in the world?'
              ),
              answer: (
                <>
                  <p>
                    {t(
                      'Suffering exists because sin entered the world when humanity chose to rebel against God. This disobedience broke the original perfection, introducing death, pain, and separation from God.'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('Sin brought suffering, brokenness, and death')}</li>
                    <li>{t('We all contribute to the problem of sin')}</li>
                    <li>
                      {t(
                        'Despite this, God did not abandon humanity—He provided a way for restoration'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                'Is there any hope for the world to be made right again?'
              ),
              answer: (
                <>
                  <p>
                    {t(
                      'Yes! God sent Jesus as the rescuer. Jesus lived a perfect life, died on the cross to pay for sin, and rose from the dead to defeat death itself. Through Him, we can be restored to God and experience a new life.'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t("Jesus' sacrifice makes forgiveness possible")}</li>
                    <li>{t('His resurrection proves His power over death')}</li>
                    <li>
                      {t(
                        'Those who trust in Jesus receive new life and a restored relationship with God'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 4,
              question: t(
                'What will happen in the future? Is there life after death?'
              ),
              answer: (
                <>
                  <p>
                    {t(
                      'According to the Bible, God has promised a future where He will restore everything. Those who trust in Jesus will live forever with Him in a perfect, renewed world. Sin, suffering, and death will be no more.'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('God will create a new heaven and a new earth')}</li>
                    <li>
                      {t('There will be no more pain, suffering, or death')}
                    </li>
                    <li>
                      {t('Jesus will return to judge the living and the dead')}
                    </li>
                    <li>
                      {t(
                        'Everyone must decide how they will respond to this truth'
                      )}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y3JlYXRpb258ZW58MHx8MHx8fDA%3D',
              bgColor: '#010101',
              author: t('Genesis 1:1'),
              text: t(
                'In the beginning, God created the heavens and the earth.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1513082325166-c105b20374bb?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pc3Rha2V8ZW58MHx8MHx8fDA%3D',
              bgColor: '#6C7B80',
              author: t('Romans 3:23-24'),
              text: t(
                'For all have sinned and fall short of the glory of God, and all are justified freely by His grace through the redemption that came by Christ Jesus.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1524088484081-4ca7e08e3e19?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhcnN8ZW58MHx8MHx8fDA%3D',
              bgColor: '#87695B',
              author: t('Revelation 21:4'),
              text: t(
                'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t("Want to explore life's biggest questions?"),
            buttonText: t('Join Our Bible study')
          }}
          showDivider={false}
        />
        <CollectionsVideoContent
          contentId="chosen-witness/english"
          subtitle={t('Chosen Witness')}
          title={t('Mary Magdalene: A Life Transformed by Jesus')}
          description={t(
            "Mary Magdalene's life was dramatically transformed by Jesus, the man who would change the world forever. Once an outcast, she became one of His most devoted followers. In this animated short film, witness the life of Jesus through her eyes—from her redemption to the moment she became the first to witness His resurrection."
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t(
                'In what ways do you identify with the main character, Mary Magdalene?'
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Mary Magdalene's story is one of transformation and redemption. Like many of us, she carried a past filled with struggles, but Jesus freed her and gave her a new purpose. Her story teaches us:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t('Jesus offers redemption regardless of our past')}
                    </li>
                    <li>{t('Faith in Christ brings healing and purpose')}</li>
                    <li>
                      {t('God calls the least expected to be His witnesses')}
                    </li>
                    <li>{t('Encountering Jesus changes everything')}</li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t(
                "Why do you think the elders didn't approve of Jesus?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      'The religious leaders opposed Jesus because His teachings challenged their authority and traditions. Key reasons include:'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'He welcomed sinners and outcasts, disrupting social norms'
                      )}
                    </li>
                    <li>
                      {t(
                        'His claim to be the Son of God threatened their power'
                      )}
                    </li>
                    <li>
                      {t(
                        'He emphasized mercy over legalism, angering those who relied on the law'
                      )}
                    </li>
                    <li>
                      {t(
                        'His miracles and growing influence unsettled their control over the people'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                'After his resurrection, why do you think Jesus chose to speak first with Mary?'
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus' first appearance to Mary Magdalene was deeply significant. It showed:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('His care for those the world overlooked')}</li>
                    <li>
                      {t('The importance of faith and devotion over status')}
                    </li>
                    <li>
                      {t(
                        'That women played a vital role in His ministry and message'
                      )}
                    </li>
                    <li>
                      {t(
                        'How a transformed life can become a powerful testimony'
                      )}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60',
              bgColor: '#1A1815',
              author: t('Luke 8:2'),
              text: t(
                'And also some women who had been cured of evil spirits and diseases: Mary (called Magdalene) from whom seven demons had come out.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: t('John 20:16'),
              text: t(
                'Jesus said to her, "Mary." She turned toward him and cried out in Aramaic, "Rabboni!" (which means "Teacher").'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: t('Mark 16:9'),
              text: t(
                'Now when Jesus was risen early the first day of the week, he appeared first to Mary Magdalene, out of whom he had cast seven devils.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t("Want to deepen your understanding of Jesus' life?"),
            buttonText: t('Join Our Bible study')
          }}
          showDivider={false}
        />
      </CollectionsPageContent>
    </PageWrapper>
  )
}
