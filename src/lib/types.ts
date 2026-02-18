export type SecretCategory = 'password' | 'api-key' | 'note' | 'credential' | 'other'

export interface Secret {
  id: string
  title: string
  value: string
  category: SecretCategory
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface SecretFormData {
  title: string
  value: string
  category: SecretCategory
  notes?: string
}
