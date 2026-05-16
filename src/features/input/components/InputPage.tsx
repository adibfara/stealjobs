import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useInputForm } from '../hooks/useInputForm'

export function InputPage() {
  const { value, setValue, handleSubmit, isSubmitting } = useInputForm()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-[var(--spacing-md)]">
      <div className="rounded-[var(--radius-xl)] border border-border bg-card p-[var(--spacing-2xl)] shadow-[var(--shadow-lg)]">
        <Link
          to="/"
          className="mb-[var(--spacing-lg)] inline-flex items-center gap-[var(--spacing-xs)] text-[var(--text-sm)] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Counter
        </Link>

        <h1 className="mb-[var(--spacing-xl)] text-[var(--text-2xl)] font-[var(--font-semibold)] text-card-foreground">
          Submit Form
        </h1>

        <form onSubmit={onSubmit} className="flex flex-col gap-[var(--spacing-lg)]">
          <div className="flex flex-col gap-[var(--spacing-sm)]">
            <label
              htmlFor="fake-input"
              className="text-[var(--text-sm)] font-[var(--font-medium)] text-foreground"
            >
              Enter something
            </label>
            <Input
              id="fake-input"
              type="text"
              placeholder="Type anything here..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-[var(--size-md)]"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )
}
