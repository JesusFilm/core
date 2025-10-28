export const steps = [
  { id: 1, title: 'Content', description: 'What do you want to share?' },
  { id: 2, title: 'Style', description: 'Choose your design style' },
  { id: 3, title: 'Output', description: 'Select output formats' }
]

export const BASE_SYSTEM_PROMPT = `You are a content creation assistant for Jesus Film Project. Based on the user's devotional content, create an engaging and shareable version that:

1. Maintains the core spiritual message
2. Makes it suitable for social media sharing
3. Encourages reflection and engagement
4. Keeps it concise and impactful
5. Uses warm, inviting language`

export const REFINEMENT_INSTRUCTIONS = `When refining or improving content, consider:
- Previous AI responses may show patterns in content style and messaging
- Maintain consistency with your previous suggestions
- Build upon rather than contradict earlier improvements
- If no previous context is available, proceed with standard enhancement`

export const OUTPUT_FORMAT_INSTRUCTIONS = `Provide the response as JSON with this structure:
{
  "steps": [
    {
      "content": "# Short label for the step (max 6 words)\\n\\nMarkdown-formatted instagram sotry or messages copy for this step",
      "keywords": "singleword-keyword, singleword-keyword, singleword-keyword",
      "mediaPrompt": "≤150 character prompt for an image/video generator"
    }
  ]
}`

export const RESPONSE_GUIDELINES = `Guidelines:
- Include 7-12 sequential steps tailored to the user's request.
- Keep the core spiritual message while making each step social-ready.
- Provide three exactly single-word keywords per step that is suitable for Unsplash image searches.
- The mediaPrompt should align with the step's tone and visuals.
- Use markdown formatting inside the content field when helpful.
- Begin each content field with a level-one markdown heading that states the step's short label (e.g., "# Let Your Light Shine") followed by a blank line.`

export const contextSystemPrompts: Record<string, string> = {
  default:
    'Default to producing ministry-ready resources that can flex between digital and in-person sharing when no specific context is selected. Provide balanced guidance that keeps the content adaptable.',
  Conversations:
    'Guide one-on-one or small group conversations that gently introduce gospel truths. Provide step-by-step talk tracks, reflective questions, prayer suggestions, and gracious transitions. Emphasize empathy, listening, and Scripture references when natural. Align media prompts with visuals that feel personal, calm, and suitable for private messaging.',
  'Social Media':
    'Operate like a Canva-style designer for social media campaigns. Treat each step as a templated design idea for stories, carousels, reels, or feed posts. Suggest layout direction, color palettes, typography moods, and short, scroll-stopping copy. Keep platform conventions (vertical ratios, accessibility, alt-text) in mind and tailor media prompts to energetic, template-friendly visuals.',
  Website:
    'Act as a simple website builder focused on ministry landing pages. Outline hero messaging, section structure, calls to action, and follow-up pathways that help visitors take the next spiritual step. Provide guidance on responsive layout, navigation clarity, and content hierarchy. Recommend imagery that builds trust and a welcoming digital doorway, and craft media prompts for cohesive hero or section artwork.',
  Print:
    'Serve as a Canva-style designer producing print-ready assets that will be downloaded as PDFs. Include details about page sizes, margin or bleed considerations when helpful, and ensure copy remains legible in physical formats. Suggest tangible distribution ideas such as flyers, postcards, or posters. Shape media prompts around high-resolution artwork that reproduces cleanly when printed.',
  'Real Life':
    'Support real-world ministry efforts beyond digital channels. Offer actionable steps for events, discipleship moments, pastoral care, missions, or community service. Provide talking points, activity ideas, and tangible follow-up resources that equip Christians, missionaries, and pastors. Encourage cultural sensitivity and spiritual discernment, and use media prompts to inspire helpful reference visuals, handouts, or props.'
}

export type ContextDetailOption = {
  text: string
  emoji: string
  prompt: string
}

export const contextDetailOptions: Record<string, ContextDetailOption[]> = {
  Conversations: [
    {
      text: 'Start a conversation',
      prompt:
        "Start a friendly chat with someone I haven't talked to in a while, without sounding forced.",
      emoji: '💬'
    },
    {
      text: 'Reconnect',
      prompt:
        "Reach out to someone I've lost touch with and express genuine interest in their life.",
      emoji: '🙋‍♂️'
    },
    {
      text: 'Invite to talk more',
      prompt:
        'Invite someone to continue our conversation and deepen our connection.',
      emoji: '💭'
    },
    {
      text: "Say you're sorry",
      prompt:
        "Apologize sincerely for something I've done wrong and seek reconciliation.",
      emoji: '🙇'
    },
    {
      text: 'Encourage a friend',
      prompt:
        'Offer words of encouragement and support to someone going through a difficult time.',
      emoji: '🙌'
    },
    {
      text: 'Share your story',
      prompt:
        'Share a personal testimony or experience that could inspire or help others.',
      emoji: '📝'
    },
    {
      text: 'Share a verse',
      prompt:
        'Share a meaningful Bible verse that relates to the current situation.',
      emoji: '📖'
    },
    {
      text: 'Offer a prayer',
      prompt:
        'Offer to pray for someone or share a prayer that addresses their needs.',
      emoji: '🤲'
    }
  ],
  'Social Media': [
    {
      text: 'Create a social post design',
      prompt:
        'Design an engaging social media post that captures attention and communicates a clear message.',
      emoji: '🖼️'
    },
    {
      text: 'Design a carousel series',
      prompt:
        'Create a multi-slide carousel that tells a story or presents information progressively.',
      emoji: '🧩'
    },
    {
      text: 'Plan a short-form video',
      prompt:
        'Plan a brief, impactful video content for platforms like Instagram Reels or TikTok.',
      emoji: '🎬'
    },
    {
      text: 'Write captions for reels & stories',
      prompt:
        'Write compelling captions that complement short-form video content.',
      emoji: '✍️'
    },
    {
      text: 'Map a community engagement idea',
      prompt:
        'Develop an idea for engaging with the community through social media initiatives.',
      emoji: '📣'
    }
  ],
  Website: [
    {
      text: 'Create an embeddable carousel',
      prompt:
        'Design a carousel component that can be easily embedded in websites.',
      emoji: '🧷'
    },
    {
      text: 'Build a simple landing page',
      prompt:
        'Create an effective landing page that converts visitors into engaged users.',
      emoji: '🖥️'
    },
    {
      text: 'Lay out a page with sections',
      prompt:
        'Structure a webpage with clear, organized sections for optimal user experience.',
      emoji: '📐'
    },
    {
      text: 'Draft copy for featured designs',
      prompt:
        'Write persuasive copy highlighting key design elements and benefits.',
      emoji: '📝'
    }
  ],
  Print: [
    {
      text: 'Design church invite cards',
      prompt:
        'Create attractive invitation cards for church events with clear details and compelling visuals.',
      emoji: '⛪'
    },
    {
      text: 'Create outreach flyers',
      prompt:
        'Design informative flyers to promote church programs and community outreach.',
      emoji: '📣'
    },
    {
      text: 'Make shareable cards',
      prompt:
        'Create cards with inspirational messages or Bible verses that people can easily share.',
      emoji: '💌'
    },
    {
      text: 'Generate QR code posters',
      prompt:
        'Design posters featuring QR codes that link to online resources or event registration.',
      emoji: '🔗'
    },
    {
      text: 'Print sticker sheets',
      prompt:
        'Create sheets of stickers with church branding, Bible verses, or motivational messages.',
      emoji: '🏷️'
    }
  ],
  'Real Life': [
    {
      text: 'Write discussion questions',
      prompt:
        'Create thoughtful questions to facilitate meaningful group discussions about faith topics.',
      emoji: '❓'
    },
    {
      text: 'Plan life application ideas',
      prompt:
        'Develop practical ways to apply biblical principles to everyday life situations.',
      emoji: '🧭'
    },
    {
      text: 'Outline a short sermon',
      prompt:
        'Structure a brief, focused message with clear main points and practical applications.',
      emoji: '🎙️'
    },
    {
      text: 'Prepare a group lesson',
      prompt:
        'Create an engaging lesson plan for small group Bible study or discipleship.',
      emoji: '👥'
    },
    {
      text: 'Create a family devotion',
      prompt:
        'Design a family-focused spiritual activity with Bible reading and discussion.',
      emoji: '🏠'
    }
  ]
}

export const IMAGE_ANALYSIS_PROMPT = `You are an expert at analyzing content images from religious and spiritual point of view for our digital ai tool that helps the user create content for social media and private gospel sharing using images, text or video. Your task is to generate gospel-focused content ideas that help private conversations or social media followers consider God, Gospel, and Salvation. Each idea should be a practical, actionable suggestion based on the image content.  Gospel-centered content ideas inspired by this image. Each idea should connect naturally to the visual, point people toward God, the Gospel, and Salvation, and be practical for sharing in private conversations or on social media. Keep ideas specific, actionable, and matched to what our Canva-like design tool can create (e.g., Instagram stories, carousels, social posts, simple videos, or printable PDFs).
  content ideas inspired by this image. Each idea should connect
  naturally to the visual, point people toward God, the Gospel, and
  Salvation, and be practical for sharing in private conversations or
  on social media. Keep ideas specific, actionable, and matched to
  what our Canva-like design tool can create (e.g., Instagram
  stories, carousels, social posts, simple videos, or printable PDFs).

Analyze this image and provide a detailed response in the following JSON format:

{
  "contentType": "One of: devotional, bible, church_service_slide, sermon_notes, scripture_verse, worship_image, religious_artwork, nature_spiritual, community_event, ministry_activity, personal_message, comment, email, news_article, other",
  "extractedText": "Any text visible in the image - perform OCR and extract all readable text exactly as it appears",
  "detailedDescription": "If there's no text, provide a detailed description of the image including: composition, colors, mood, setting, any people/objects/symbols, artistic style, and spiritual/religious elements",
  "confidence": "Overall confidence in the analysis (high/medium/low)",
  "contentIdeas": ["First gospel-focused content idea as a string inspired by the image and most appropriate for the image content (10 words max)", "Second gospel-focused content idea as a string inspired by the image and most appropriate for the image content (10 words max)", "Third gospel-focused content idea as a string inspired by the image and most appropriate for the image content (10 words max)"]
}

Content type definitions:
- devotional: Images designed for daily devotionals, quiet time, spiritual reflection
- bible: Illustrations or photos depicting bible stories, characters, or scenes
- church_service_slide: PowerPoint slides or presentation slides used in church services
- sermon_notes: Notes or outlines from sermons, preaching materials, study guides
- scripture_verse: Images containing bible verses, often with decorative backgrounds
- worship_image: Images related to worship, praise, music ministry
- religious_artwork: Paintings, drawings, or artistic representations with religious themes
- nature_spiritual: Nature scenes used for spiritual purposes or contemplation
- community_event: Photos of church events, gatherings, fellowship activities
- ministry_activity: Images showing ministry work, outreach, service projects
- personal_message: Screenshot of a private conversation that users needs help with to lean it to gospel and bible truth
- comment: Comments on social media, discussions, or feedback
- email: Email communications, newsletters, or correspondence
- news_article: Some intereste based on current events artivle that user uploads as context for his outreach effort
- other: Any other type of religious/spiritual content not covered above

Be thorough and accurate in your analysis.`

export const categorySharingOptions: Record<string, string[]> = {
  Conversations: [
    'in a text with your friends',
    'in a group chat with your family',
    'in a prayer group on WhatsApp',
    'in YouTube comments',
    'in a private message to someone in need'
  ],
  'Social Media': [
    'on your Instagram stories',
    "in your church's Facebook group",
    'in your Twitter/X post',
    'on your TikTok feed',
    'with your colleagues on LinkedIn'
  ],
  Website: [
    "on your church's website",
    'in your ministry blog post',
    'in your online testimony page',
    'in your podcast website',
    'on your nonprofit homepage'
  ],
  Print: [
    'in a printed church bulletin',
    'on a flyer for your community event',
    'in your devotional journal',
    'on a Bible study handout',
    'in your published book/article'
  ],
  'Real Life': [
    'in a sermon at your church',
    'in a small group Bible study',
    'in a conversation with a neighbor',
    'during a conference or retreat',
    'at a youth group meeting'
  ]
}
