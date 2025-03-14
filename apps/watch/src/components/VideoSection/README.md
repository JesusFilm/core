# VideoSection Component

A reusable component for displaying video content with related information sections in the Collection Page.

## Features

- Video player with mute control
- Title and subtitle section
- Description section
- Q&A section with expandable answers
- Bible quotes carousel with optional free resource slide
- Fully customizable content through props

## Usage

```tsx
import { VideoSection } from '@/components/VideoSection'

// Example usage
const MyComponent = () => {
  const handleMuteChange = (muted: boolean) => {
    console.log('Mute changed:', muted)
  }

  const handleOpenDialog = () => {
    console.log('Dialog opened')
  }

  return (
    <VideoSection
      contentId="video-content-id"
      subtitle="Video Subtitle"
      title="Video Title"
      description="Video description text goes here..."
      questions={[
        {
          id: 1,
          question: 'Question text?',
          answer: 'Answer text or JSX element'
        }
      ]}
      bibleQuotes={[
        {
          imageUrl: 'https://example.com/image.jpg',
          bgColor: '#1A1815',
          author: 'Author Name',
          text: 'Quote text'
        }
      ]}
      onMuteChange={handleMuteChange}
      onOpenDialog={handleOpenDialog}
    />
  )
}
```

## Props

| Prop             | Type                     | Required | Default              | Description                                     |
| ---------------- | ------------------------ | -------- | -------------------- | ----------------------------------------------- |
| showDivider      | boolean                  | No       | true                 | Whether to show a divider before the section    |
| contentId        | string                   | Yes      | -                    | Video content ID                                |
| videoTitle       | string                   | No       | " "                  | Video title                                     |
| pageMuted        | boolean                  | No       | true                 | Whether the video is muted                      |
| subtitle         | string                   | Yes      | -                    | Subtitle displayed above the title              |
| title            | string                   | Yes      | -                    | Main title of the section                       |
| description      | string                   | Yes      | -                    | Description text                                |
| questions        | QuestionData[]           | No       | []                   | Questions and answers                           |
| questionsTitle   | string                   | No       | "Other People Asked" | Title for the questions section                 |
| askButtonText    | string                   | No       | "Ask yours"          | Button text for asking questions                |
| bibleQuotes      | BibleQuoteData[]         | No       | []                   | Bible quotes to display                         |
| bibleQuotesTitle | string                   | No       | "Bible quotes"       | Title for the Bible quotes section              |
| freeResource     | FreeResourceData         | No       | undefined            | Free resource data (last slide in Bible quotes) |
| onMuteChange     | (muted: boolean) => void | No       | undefined            | Callback when mute state changes                |
| onOpenDialog     | () => void               | No       | undefined            | Callback when dialog open button is clicked     |

## Types

### QuestionData

```ts
interface QuestionData {
  id: number
  question: string
  answer: ReactElement | string
}
```

### BibleQuoteData

```ts
interface BibleQuoteData {
  imageUrl: string
  bgColor: string
  author?: string
  text: string
}
```

### FreeResourceData

```ts
interface FreeResourceData {
  imageUrl: string
  bgColor: string
  title: string
  subtitle: string
  buttonText: string
}
```
