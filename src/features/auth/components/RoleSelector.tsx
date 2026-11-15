import { BriefcaseBusiness, ShoppingBag } from 'lucide-react'
import type { Role } from '@/shared/contract/types'
import { cn } from '@/shared/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'

const OPTIONS = [
  {
    value: 'CLIENT',
    title: 'Cliente',
    description: 'Quero contratar serviços',
    icon: ShoppingBag,
  },
  {
    value: 'PROVIDER',
    title: 'Prestador',
    description: 'Quero oferecer serviços',
    icon: BriefcaseBusiness,
  },
] as const satisfies ReadonlyArray<{
  value: Role
  title: string
  description: string
  icon: unknown
}>

export function RoleSelector({
  value,
  onChange,
  invalid,
}: {
  value: Role | undefined
  onChange: (role: Role) => void
  invalid?: boolean
}) {
  return (
    <RadioGroup
      value={value ?? ''}
      onValueChange={(next) => onChange(next as Role)}
      className="grid-cols-2"
      aria-label="Tipo de conta"
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? 'role-error' : undefined}
    >
      {OPTIONS.map(({ value: optionValue, title, description, icon: Icon }) => (
        <label
          key={optionValue}
          htmlFor={`role-${optionValue}`}
          className={cn(
            'flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-accent/60',
            'has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent',
            invalid && 'border-destructive',
          )}
        >
          <span className="flex items-center justify-between">
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <RadioGroupItem id={`role-${optionValue}`} value={optionValue} />
          </span>
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </label>
      ))}
    </RadioGroup>
  )
}
