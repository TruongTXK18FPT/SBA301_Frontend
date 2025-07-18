import { SubscriptionResponse } from '@/components/premium/dto/subscription.dto'
import { atom } from 'jotai'

export const userAtom = atom<any>(null)
export const subscriptionAtom = atom<SubscriptionResponse[]>([])