import { api } from '@/lib/axios'
import type { RatesResponse, VersionResponse } from '@/types/rate.types'

export const ratesApi = {
  // Sans auth — page publique
  getPublic: () =>
    api.get<RatesResponse>('/rates/public').then((r) => r.data),

  // Avec JWT — sidebar
  getMain: () =>
    api.get<RatesResponse>('/rates/main').then((r) => r.data),

  // Polling version (sans auth)
  getVersion: () =>
    api.get<VersionResponse>('/rates/version').then((r) => r.data),

  // Mise à jour manuelle (Basic Auth gérée côté backend)
  updateRate: (code: string, buy?: number, sell?: number) =>
    api.post('/rates/update', { code, buy, sell }).then((r) => r.data),
}