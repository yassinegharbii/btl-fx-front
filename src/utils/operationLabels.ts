/**
 * Helper centralisé pour afficher les opérations selon le rôle de l'utilisateur.
 *
 * CONVENTION (perspective bancaire) :
 * - La base de données stocke TOUJOURS la perspective du TRADER (banque)
 * - operation = 'BUY' : le trader achète des devises au client (= le client vend)
 * - operation = 'SELL' : le trader vend des devises au client (= le client achète)
 *
 * Pour le CLIENT, l'opération affichée est l'OPPOSÉ.
 */

import type { Operation } from '@/types/ticket.types'

export type ViewerRole = 'TRADER' | 'CLIENT' | 'ADMIN' | 'AGENCE'

/**
 * Retourne le libellé de l'opération depuis la perspective du viewer.
 *
 * @param operation - La valeur stockée en BDD (perspective trader)
 * @param viewerRole - Le rôle de la personne qui regarde
 * @returns "Achat" ou "Vente"
 */
export function getOperationLabel(
    operation: Operation,
    viewerRole: ViewerRole | undefined,
): 'Achat' | 'Vente' {
    /* Côté client : on inverse */
    if (viewerRole === 'CLIENT') {
        return operation === 'BUY' ? 'Vente' : 'Achat'
    }
    /* Côté trader / admin / agence : valeur native */
    return operation === 'BUY' ? 'Achat' : 'Vente'
}

/**
 * Retourne la couleur sémantique de l'opération du point de vue du viewer.
 * - Achat (entrée de devise) = vert (success)
 * - Vente (sortie de devise) = rouge (danger)
 */
export function getOperationSemantic(
    operation: Operation,
    viewerRole: ViewerRole | undefined,
): 'success' | 'danger' {
    const label = getOperationLabel(operation, viewerRole)
    return label === 'Achat' ? 'success' : 'danger'
}

/**
 * Retourne l'opération inverse (utile pour conversion client <-> trader).
 */
export function invertOperation(operation: Operation): Operation {
    return operation === 'BUY' ? 'SELL' : 'BUY'
}

/**
 * Retourne TRUE si l'opération du point de vue du viewer est un Achat.
 */
export function isOperationBuyForViewer(
    operation: Operation,
    viewerRole: ViewerRole | undefined,
): boolean {
    return getOperationLabel(operation, viewerRole) === 'Achat'
}