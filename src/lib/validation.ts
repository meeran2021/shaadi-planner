import { z } from 'zod'

const GUEST_COUNT_VALUES = ['<100', '100-300', '300-500', '500+'] as const
const VENUE_TYPE_VALUES = ['banquet_hall', 'farmhouse', 'heritage_property', 'destination', 'home'] as const
const BUDGET_BRACKET_VALUES = ['10-25L', '25-50L', '50L-1Cr', '1-2Cr', '2Cr+'] as const

export const IntakeSchema = z.object({
  weddingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine(d => new Date(d) > new Date(), 'Wedding date must be in the future'),
  guestCount: z.enum(GUEST_COUNT_VALUES),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  venueType: z.enum(VENUE_TYPE_VALUES),
  budgetBracket: z.enum(BUDGET_BRACKET_VALUES),
  priorities: z
    .array(z.string().min(1))
    .length(2, 'Exactly 2 priorities required'),
})

export const PaymentSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  recommendationId: z.string().uuid('Invalid recommendation ID'),
  vendorName: z.string().min(1, 'Vendor name is required').max(200),
  amount: z.number().int().positive('Amount must be a positive integer'),
  paymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine(d => new Date(d) <= new Date(), 'Payment date cannot be in the future'),
  notes: z.string().max(500).optional(),
})

export type IntakeInput = z.infer<typeof IntakeSchema>
export type PaymentInput = z.infer<typeof PaymentSchema>
