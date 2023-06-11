export type SwrResponse = {
  data: MemberResponse
  isLoading: boolean
  isError: boolean
}

export type Member = {
  id: string
  name: string
  age: number
  email: string
  joined: string
  iconUrl: string
  department: {
    id: string
    createdAt: string
    publishedAt: string
    revisedAt: string
    title: string
    updatedAt: string
  }
}

export type MemberResponse = {
  limit: number
  offset: number
  totalCount: number
  contents: Member[]
}

export type Message = {
  id?: string // iFrame識別子
  title?: string
  description?: string
  imageUrl?: string
  updatedAt?: Date
  data: Member | null
}

export type Data = {
  id: string
  message: Message
}

export type StyleMessage = {
  height: number
}

export type Style = {
  id: string
  message: StyleMessage
}
