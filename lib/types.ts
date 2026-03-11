export interface ResumeLocation {
  address?: string
  postalCode?: string
  city?: string
  countryCode?: string
  region?: string
}

export interface ResumeSocialProfile {
  network: string
  username: string
  url: string
}

export interface ResumeBasics {
  name: string
  label?: string
  image?: string
  email: string
  phone?: string
  url?: string
  summary: string
  location?: ResumeLocation
  profiles?: ResumeSocialProfile[]
}

export interface ResumeWorkItem {
  id: string
  name: string
  position: string
  url?: string
  startDate: string
  endDate?: string
  summary?: string
  highlights?: string[]
}

export interface ResumeVolunteerItem {
  id: string
  organization: string
  position: string
  url?: string
  startDate: string
  endDate?: string
  summary?: string
  highlights?: string[]
}

export interface ResumeEducationItem {
  id: string
  institution: string
  url?: string
  area: string
  studyType: string
  startDate: string
  endDate?: string
  score?: string
  courses?: string[]
}

export interface ResumeAwardItem {
  id: string
  title: string
  date: string
  awarder: string
  summary?: string
}

export interface ResumePublicationItem {
  id: string
  name: string
  publisher: string
  releaseDate: string
  url?: string
  summary?: string
}

export interface ResumeSkillItem {
  id: string
  name: string
  level?: string
  keywords?: string[]
}

export interface ResumeLanguageItem {
  id: string
  language: string
  fluency: string
}

export interface ResumeInterestItem {
  id: string
  name: string
  keywords?: string[]
}

export interface ResumeReferenceItem {
  id: string
  name: string
  reference: string
}

export interface ResumeCertificateItem {
  id: string
  name: string
  date?: string
  issuer: string
  url?: string
}

export interface ResumeProjectItem {
  id: string
  name: string
  description?: string
  highlights?: string[]
  keywords?: string[]
  startDate?: string
  endDate?: string
  url?: string
  roles?: string[]
  entity?: string
  type?: string
}

export interface ResumeContent {
  basics: ResumeBasics
  work?: ResumeWorkItem[]
  volunteer?: ResumeVolunteerItem[]
  education?: ResumeEducationItem[]
  awards?: ResumeAwardItem[]
  certificates?: ResumeCertificateItem[]
  publications?: ResumePublicationItem[]
  skills?: ResumeSkillItem[]
  languages?: ResumeLanguageItem[]
  interests?: ResumeInterestItem[]
  references?: ResumeReferenceItem[]
  projects?: ResumeProjectItem[]
}

export interface SectionConfig {
  key: SectionKey
  visible: boolean
}

export type SectionKey =
  | 'basics'
  | 'work'
  | 'volunteer'
  | 'education'
  | 'awards'
  | 'certificates'
  | 'publications'
  | 'skills'
  | 'languages'
  | 'interests'
  | 'references'
  | 'projects'

export interface ResumeStructure {
  sections: SectionConfig[]
  layout: {
    columns: 1 | 2
  }
}

export interface Profile {
  user_id: string
  username: string
  created_at: string
}

export interface ResumeRow {
  id: string
  user_id: string
  content: ResumeContent
  structure: ResumeStructure
  updated_at: string
}
