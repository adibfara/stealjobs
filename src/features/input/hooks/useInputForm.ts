import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface UseInputFormReturn {
  value: string
  setValue: (value: string) => void
  handleSubmit: () => void
  isSubmitting: boolean
}

export function useInputForm(): UseInputFormReturn {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate({ to: '/' })
    }, 300)
  }, [navigate])

  return {
    value,
    setValue,
    handleSubmit,
    isSubmitting,
  }
}
