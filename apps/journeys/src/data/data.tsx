export const radioOptions = [{
  "id":"radio",
  "__typename": "radioOption" as const,
  "options": ["first choice", "second choice"]
}]

export const videos = [{
  "id":"Questions",
  "__typename": "video" as const,
  "src": "yoyoyo"
}]

export const data1 = [{
    "id":"Root",
    "__typename": "video" as const,
    "src": "videosource"
  },
  {
    "parentId":"Root",
    "id":"Radio Option",
    "__typename": "radioOption" as const,
    "options": ["first choice", "second choice"],
    "action": "SecondBlock That's a Video"
  },
  {
    "parentId":"Root",
    "id":"Another Radio Option",
    "__typename": "radioOption" as const,
    "options": ["great choice", "terrible choice"]
  },
  {
    "id":"SecondBlock That's a Video",
    "__typename": "video" as const,
    "src": "yoyoyo2"
  },
  {
    "id":"ThirdBlock also Video",
    "__typename": "video" as const,
    "src": "yoyoyo"
  },
  {
    "parentId":"ThirdBlock also Video",
    "id":"MoreQuestions",
    "__typename": "radioOption" as const,
    "options": ["Button1 choice", "Button2 choice", "Button3 choice"]
  },
  {
    "parentId":"MoreQuestions",
    "id":"NestedMoreQuestions",
    "__typename": "radioOption" as const,
    "options": ["a nested choice", "another nested choice"]
  },
]

export const data2 = [{
    "id":"Root",
    "__typename": "video" as const,
    "src": "yoyoyo"
  },
  {
    "parentId":"Root",
    "id":"Questions",
    "__typename": "video" as const,
    "src": "yoyoyo"
  },
  {
    "id":"Signup",
    "__typename": "video" as const,
    "src": "yoyoyo"
  },
]
