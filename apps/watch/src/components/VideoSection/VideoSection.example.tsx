import { ReactElement } from 'react'
import { VideoSection } from './VideoSection'

export const VideoSectionExample = (): ReactElement => {
  // Example handler for mute change
  const handleMuteChange = (muted: boolean): void => {
    console.log('Mute changed:', muted)
  }

  // Example handler for dialog open
  const handleOpenDialog = (): void => {
    console.log('Dialog opened')
  }

  // Example questions data
  const questions = [
    {
      id: 1,
      question: "How can I trust in God's sovereignty when the world feels so chaotic?",
      answer: (
        <>
          <p>
            Even in times of chaos and uncertainty, we can trust in
            God's sovereignty because:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              God remains in control even when circumstances feel out
              of control
            </li>
            <li>His purposes are higher than our understanding</li>
            <li>
              He promises to work all things for good for those who
              love Him
            </li>
            <li>
              The Bible shows countless examples of God bringing order
              from chaos
            </li>
          </ul>
        </>
      )
    },
    {
      id: 2,
      question: "Why is Easter the most important Christian holiday?",
      answer: (
        <>
          <p>Easter is central to Christian faith because:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              It marks Jesus' resurrection, proving His victory over
              death
            </li>
            <li>
              It fulfills Old Testament prophecies about the Messiah
            </li>
            <li>It demonstrates God's power to give new life</li>
            <li>
              It provides hope for our own resurrection and eternal
              life
            </li>
          </ul>
        </>
      )
    },
    {
      id: 3,
      question: "What happened during the three days between Jesus' death and resurrection?",
      answer: (
        <>
          <p>The Bible tells us several key events occurred:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              Jesus' body was placed in a tomb and guarded by Roman
              soldiers
            </li>
            <li>His followers mourned and waited in uncertainty</li>
            <li>
              According to Scripture, He descended to the realm of the
              dead
            </li>
            <li>On the third day, He rose victorious over death</li>
          </ul>
        </>
      )
    }
  ]

  // Example Bible quotes data
  const bibleQuotes = [
    {
      imageUrl: "https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVhc3RlcnxlbnwwfHwwfHx8MA%3D%3D",
      bgColor: "#1A1815",
      author: "Apostle Paul",
      text: ""Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D",
      bgColor: "#A88E78",
      author: "Apostle Paul",
      text: ""Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ."
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D",
      bgColor: "#72593A",
      author: "Apostle Paul",
      text: ""Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ."
    }
  ]

  // Example free resource data
  const freeResource = {
    imageUrl: "https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvcGhlY2llc3xlbnwwfHwwfHx8MA%3D%3D",
    bgColor: "#5F4C5E",
    subtitle: "Free Resources",
    title: "Want to grow deep in your understanding of the Bible?",
    buttonText: "Join Our Bible study"
  }

  return (
    <VideoSection
      contentId="chosen-witness/english"
      subtitle="Jesus' Victory Over Sin and Death"
      title="The True Meaning of Easter"
      description="Easter is about more than eggs and bunnies—it's about Jesus and His amazing love for us. He died on the cross for our sins and rose from the dead, showing His power over sin and death. Because of Him, we can have forgiveness and the promise of eternal life. Easter is a time to celebrate this great hope and God's incredible gift to us."
      questions={questions}
      bibleQuotes={bibleQuotes}
      bibleQuotesTitle="Bible quotes about true meaning of Easter"
      freeResource={freeResource}
      onMuteChange={handleMuteChange}
      onOpenDialog={handleOpenDialog}
    />
  )
} 