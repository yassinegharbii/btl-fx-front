export type Role = 'ADMIN' | 'CLIENT' | 'TRADER' | 'AGENCE'

export interface User {
  user_id:    number
  username:   string
  full_name:  string | null
  email:      string | null
  role:       Role
  is_active:  number
  is_online?: number
  last_seen_at?:  string | null
  last_login_at?: string | null
  must_change_password?: number
  created_at?: string
}

export interface TokenResponse {
  access_token: string
  token_type:   string
}

export interface LoginRequest {
  username: string
  password: string
}