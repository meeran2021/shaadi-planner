'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { notifications } from '@mantine/notifications'
import { useRecommend } from '@/src/hooks/useRecommend'
import { StepIndicator }     from './StepIndicator'
import { Step1WeddingBasics } from './Step1WeddingBasics'
import { Step2Venue }         from './Step2Venue'
import { Step3Budget }        from './Step3Budget'
import { Step4Priorities }    from './Step4Priorities'
import { StepReview }         from './StepReview'
import { NavigationButtons }  from './NavigationButtons'
import type { GuestCountBracket, VenueType, BudgetBracket, IntakeFormInput } from '@/src/types'

interface FormData {
  weddingDate:   string
  guestCount:    GuestCountBracket | ''
  city:          string
  venueType:     VenueType | ''
  budgetBracket: BudgetBracket | ''
  priorities:    string[]
}

const INITIAL: FormData = {
  weddingDate:   '',
  guestCount:    '',
  city:          '',
  venueType:     '',
  budgetBracket: '',
  priorities:    [],
}

const TOTAL_STEPS = 5

function validateStep(step: number, d: FormData): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 1) {
    if (!d.weddingDate) e.weddingDate = 'Please select your wedding date'
    else if (new Date(d.weddingDate) <= new Date()) e.weddingDate = 'Wedding date must be in the future'
    if (!d.guestCount) e.guestCount = 'Please select approximate guest count'
  }
  if (step === 2) {
    if (!d.city.trim()) e.city = 'Please enter your city'
    if (!d.venueType)   e.venueType = 'Please select a venue type'
  }
  if (step === 3) {
    if (!d.budgetBracket) e.budgetBracket = 'Please select a budget range'
  }
  if (step === 4) {
    if (d.priorities.length < 2) e.priorities = 'Please select exactly 2 priorities'
  }
  return e
}

export function IntakeWizard() {
  const router     = useRouter()
  const recommend  = useRecommend()
  const [step,     setStep]     = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL)
  const [errors,   setErrors]   = useState<Record<string, string>>({})

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[field as string]
      return next
    })
  }, [])

  const handleNext = () => {
    const stepErrors = validateStep(step, formData)
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return }
    setStep(s => s + 1)
    setErrors({})
  }

  const handleBack = () => {
    setStep(s => s - 1)
    setErrors({})
  }

  const handleEdit = (targetStep: number) => {
    setStep(targetStep)
    setErrors({})
  }

  const handleSubmit = () => {
    recommend.generate(formData as IntakeFormInput, {
      onSuccess: (planId) => {
        router.push(`/plan/${planId}`)
      },
      onError: err => {
        notifications.show({
          title:   'Something went wrong',
          message: err.message || 'Failed to generate your plan. Please try again.',
          color:   'red',
        })
      },
    })
  }

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'linear-gradient(135deg, #FDF6EE 0%, #FFF5ED 50%, #FDF2E8 100%)',
      padding:        '24px 16px',
    }}>
      <div style={{
        width:        '100%',
        maxWidth:     560,
        background:   'white',
        borderRadius: 20,
        padding:      'clamp(24px, 5vw, 40px)',
        boxShadow:    '0 8px 40px rgba(181,69,27,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <StepIndicator current={step} total={TOTAL_STEPS} />

        <div style={{ minHeight: 340, marginTop: 28, marginBottom: 8 }}>
          {step === 1 && (
            <Step1WeddingBasics
              weddingDate={formData.weddingDate}
              guestCount={formData.guestCount}
              errors={errors}
              onChange={updateField}
            />
          )}
          {step === 2 && (
            <Step2Venue
              city={formData.city}
              venueType={formData.venueType}
              errors={errors}
              onChange={updateField}
            />
          )}
          {step === 3 && (
            <Step3Budget
              budgetBracket={formData.budgetBracket}
              errors={errors}
              onChange={updateField}
            />
          )}
          {step === 4 && (
            <Step4Priorities
              priorities={formData.priorities}
              errors={errors}
              onChange={updateField}
            />
          )}
          {step === 5 && (
            <StepReview
              formData={formData}
              onEdit={handleEdit}
              disabled={recommend.isPending}
              statusMessage={recommend.statusMessage}
            />
          )}
        </div>

        <NavigationButtons
          step={step}
          totalSteps={TOTAL_STEPS}
          isLoading={recommend.isPending}
          onBack={handleBack}
          onNext={step === TOTAL_STEPS ? handleSubmit : handleNext}
        />
      </div>
    </div>
  )
}
