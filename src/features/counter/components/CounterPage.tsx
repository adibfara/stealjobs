import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Minus, Plus, RotateCcw, FileText } from 'lucide-react'
import { useCounter } from '../hooks/useCounter'

export function CounterPage() {
  const { count, increment, decrement, reset } = useCounter({ initialValue: 0 })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-[var(--spacing-md)]">
      <div className="rounded-[var(--radius-xl)] border border-border bg-card p-[var(--spacing-2xl)] shadow-[var(--shadow-lg)]">

        <h1 className="mb-[var(--spacing-xl)] text-center  font-[var(--font-semibold)] text-card-foreground">
          Counter
        </h1>

        <div className="flex flex-col items-center gap-[var(--spacing-lg)]">
          <div className=" font-[var(--font-bold)] text-foreground tabular-nums">
            {count}
          </div>

          <div className="flex items-center gap-[var(--spacing-md)]">
            <Button
              variant="outline"
              size="lg"
              onClick={decrement}
              aria-label="Decrease counter"
              className="h-[var(--size-lg)] w-[var(--size-lg)]"
            >
              <Minus className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              aria-label="Reset counter"
              className="h-[var(--size-md)] w-[var(--size-md)]"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={increment}
              aria-label="Increase counter"
              className="h-[var(--size-lg)] w-[var(--size-lg)]"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-[var(--spacing-xl)] border-t border-border pt-[var(--spacing-lg)]">
          <Button asChild variant="secondary" className="w-full">
            <Link to="/">
              <FileText className="mr-[var(--spacing-sm)] h-4 w-4" />
              Open Form
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
