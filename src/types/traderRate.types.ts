/**
 * Types pour les taux négociés par les traders.
 */

export interface TraderRate {
    code:             string  // EUR, USD, ...
    label:            string | null
    flag:             string | null
    buy:              number
    sell:             number
    updated_by:       number | null
    updated_by_name:  string | null
    updated_at:       string  // ISO datetime
}

export interface TraderRatesList {
    rates:       TraderRate[]
    last_update: string | null
}

export interface TraderRateUpdatePayload {
    buy:  number
    sell: number
}

export interface TraderRateBatchUpdatePayload {
    updates: Record<string, TraderRateUpdatePayload>
}

/** Event WebSocket reçu quand un taux est modifié */
export interface TraderRateWsEvent {
    type:             'trader_rates_updated'
    code:             string
    buy:              number
    sell:             number
    updated_by:       number
    updated_by_name:  string | null
    updated_at:       string
}