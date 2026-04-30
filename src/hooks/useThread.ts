import { useQuery } from '@tanstack/react-query'
import { chatApi } from '@/api/chat.api'
import { useChatStore } from '@/stores/chat.store'
import { useEffect } from 'react'

/** Pour le CLIENT — récupère ou crée son thread unique */
export function useMyThread() {
  const setThreads = useChatStore((s) => s.setThreads)

  const query = useQuery({
    queryKey: ['my-thread'],
    queryFn:  chatApi.getMyThread,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (query.data) setThreads([query.data])
  }, [query.data])

  return query
}

/** Pour le TRADER — liste de tous les threads */
export function useAllThreads() {
  const setThreads = useChatStore((s) => s.setThreads)

  const query = useQuery({
    queryKey: ['threads'],
    queryFn:  () => chatApi.getAllThreads(),
    refetchInterval: 10_000,  // refresh toutes les 10s
  })

  useEffect(() => {
    if (query.data) setThreads(query.data)
  }, [query.data])

  return query
}

/** Nombre de messages non lus dans un thread */
export function useUnreadCount(threadId: number | null) {
  return useQuery({
    queryKey: ['unread', threadId],
    queryFn:  () => chatApi.getUnreadCount(threadId!),
    enabled:  !!threadId,
    refetchInterval: 5_000,
  })
}