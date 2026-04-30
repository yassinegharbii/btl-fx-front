import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ratesApi } from '@/api/rates.api'
import { useRatesStore } from '@/stores/rates.store'

const POLL_INTERVAL = 5000

export function usePublicRates() {
  const { setRates, setVersion } = useRatesStore()
  const knownVersion = useRef(-1)

  const query = useQuery({
    queryKey: ['rates', 'public'],
    queryFn:  ratesApi.getPublic,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data) {
      setRates(query.data.rates, query.data.version ?? 0, query.data.updated_at ?? '')
      knownVersion.current = query.data.version ?? 0
    }
  }, [query.data])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const v = await ratesApi.getVersion()
        if (v.version !== knownVersion.current) {
          knownVersion.current = v.version
          setVersion(v.version)
          query.refetch()
        }
      } catch {}
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return query
}

/** Remplit aussi le store pour afficher "En direct" + heure */
export function useAllRatesSidebar() {
  const setRates = useRatesStore((s) => s.setRates)
  const knownVersion = useRef(-1)

  const query = useQuery({
    queryKey: ['rates', 'sidebar'],
    queryFn:  ratesApi.getPublic,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })

  useEffect(() => {
    if (query.data) {
      setRates(query.data.rates, query.data.version ?? 0, query.data.updated_at ?? '')
      knownVersion.current = query.data.version ?? 0
    }
  }, [query.data])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const v = await ratesApi.getVersion()
        if (v.version !== knownVersion.current) {
          knownVersion.current = v.version
          query.refetch()
        }
      } catch {}
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return query
}