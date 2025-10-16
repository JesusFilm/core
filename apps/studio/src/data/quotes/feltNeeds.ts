export interface FeltNeedQuote {
  text: string;
  reference: string;
}

export interface FeltNeedCategory {
  id: string;
  title: string;
  summary: string;
  quotes: FeltNeedQuote[];
}

export const feltNeedCategories: FeltNeedCategory[] = [
  {
    id: 'peace-anxiety',
    title: 'Peace for Anxious Hearts',
    summary: 'Verses that calm worry and invite the peace Jesus promised.',
    quotes: [
      {
        text:
          "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.",
        reference: 'Philippians 4:6-7 (ESV)'
      },
      {
        text:
          "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.",
        reference: 'John 14:27 (ESV)'
      }
    ]
  },
  {
    id: 'strength-weakness',
    title: 'Strength in Weakness',
    summary: 'Promises of God’s strength when you feel worn thin.',
    quotes: [
      {
        text:
          "But he said to me, ‘My grace is sufficient for you, for my power is made perfect in weakness.’ Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me.",
        reference: '2 Corinthians 12:9 (ESV)'
      },
      {
        text:
          "He gives power to the faint, and to him who has no might he increases strength. Even youths shall faint and be weary, and young men shall fall exhausted; but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
        reference: 'Isaiah 40:29-31 (ESV)'
      }
    ]
  },
  {
    id: 'guidance-purpose',
    title: 'Guidance and Purpose',
    summary: 'Direction for those seeking God’s will for their steps.',
    quotes: [
      {
        text:
          "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
        reference: 'Proverbs 3:5-6 (ESV)'
      },
      {
        text:
          "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
        reference: 'Jeremiah 29:11 (ESV)'
      }
    ]
  },
  {
    id: 'freedom-fear',
    title: 'Freedom from Fear',
    summary: 'Assurance of God’s presence when fear and uncertainty rise.',
    quotes: [
      {
        text:
          "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
        reference: 'Isaiah 41:10 (ESV)'
      },
      {
        text:
          "The LORD is my light and my salvation; whom shall I fear? The LORD is the stronghold of my life; of whom shall I be afraid?",
        reference: 'Psalm 27:1 (ESV)'
      }
    ]
  },
  {
    id: 'grace-salvation',
    title: 'Grace and Salvation',
    summary: 'Celebrations of the gift of salvation in Christ.',
    quotes: [
      {
        text:
          "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.",
        reference: 'Ephesians 2:8-9 (ESV)'
      },
      {
        text:
          "Because, if you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved. For with the heart one believes and is justified, and with the mouth one confesses and is saved.",
        reference: 'Romans 10:9-10 (ESV)'
      }
    ]
  }
];
