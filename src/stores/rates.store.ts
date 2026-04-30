import { create } from 'zustand'
import type { Rate } from '@/types/rate.types'

interface RatesState {
  rates:      Rate[]
  version:    number
  updatedAt:  string
  setRates:   (rates: Rate[], version: number, updatedAt: string) => void
  setVersion: (v: number) => void
}

export const useRatesStore = create<RatesState>((set) => ({
  rates:      [],
  version:    -1,
  updatedAt:  '',
  setRates:   (rates, version, updatedAt) => set({ rates, version, updatedAt }),
  setVersion: (version) => set({ version }),
}))