export interface Rate {
  code:     string
  flag:     string | null
  flag_url: string | null
  name:     string
  unit:     number
  buy:      number
  sell:     number
}

export interface RatesResponse {
  rates:      Rate[]
  updated_at: string | null
  csv_file:   string | null
  version:    number | null
  source:     string | null
}

export interface VersionResponse {
  version:    number
  updated_at: string
  csv_file:   string
}