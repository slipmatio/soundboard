export type UiMode = 'play' | 'edit'
export interface SampleMetadata {
  shortcutKey?: string
  volume?: number
  tags?: string[]
  [key: string]: any
}
export interface Sample {
  id: string
  name: string
  path: string
  mode: 'oneshot' | 'loop'
  metadata?: SampleMetadata
}

export interface Board {
  id: string
  name: string
  sampleIds: string[]
}
