import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { applyFieldErrors, getErrorMessage, toApiError } from '@/shared/api/errors'
import { fieldA11y } from '@/shared/components/field-a11y'
import { FormField } from '@/shared/components/FormField'
import { PasswordInput } from '@/shared/components/PasswordInput'
import { registerSchema, type RegisterInput, type RegisterValues } from '@/shared/contract/schemas'
import type { User } from '@/shared/contract/types'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useRegister } from '../hooks'
import { RoleSelector } from './RoleSelector'

const FIELDS = ['fullName', 'nif', 'email', 'password', 'role'] as const

export function RegisterForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const registerUser = useRegister()
  const form = useForm<RegisterInput, unknown, RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      nif: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _confirm, ...payload }) => {
    try {
      const session = await registerUser.mutateAsync(payload)
      onSuccess(session.user)
    } catch (error) {
      const apiError = toApiError(error)
      // Conflitos de unicidade apontam para o campo certo.
      if (apiError.is('EMAIL_ALREADY_EXISTS')) {
        form.setError('email', { message: getErrorMessage(apiError) }, { shouldFocus: true })
      } else if (apiError.is('NIF_ALREADY_EXISTS')) {
        form.setError('nif', { message: getErrorMessage(apiError) }, { shouldFocus: true })
      } else {
        applyFieldErrors(apiError, form.setError, FIELDS)
      }
    }
  })

  const busy = isSubmitting || registerUser.isPending
  const apiError = registerUser.error ? toApiError(registerUser.error) : null
  const showBanner =
    apiError && !apiError.is('EMAIL_ALREADY_EXISTS') && !apiError.is('NIF_ALREADY_EXISTS')

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {showBanner && (
        <Alert variant="destructive" aria-live="assertive">
          <AlertDescription>{getErrorMessage(apiError)}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-1.5">
        <Label id="role-label">Tipo de conta</Label>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <RoleSelector value={field.value} onChange={field.onChange} invalid={!!errors.role} />
          )}
        />
        {errors.role && (
          <p id="role-error" role="alert" className="text-xs font-medium text-destructive">
            {errors.role.message}
          </p>
        )}
      </div>

      <FormField id="fullName" label="Nome completo" error={errors.fullName?.message}>
        <Input
          {...fieldA11y('fullName', errors.fullName?.message)}
          {...form.register('fullName')}
          autoComplete="name"
          className="h-10"
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="nif"
          label="NIF"
          error={errors.nif?.message}
          hint="9 a 14 letras ou dígitos."
        >
          <Input
            {...fieldA11y('nif', errors.nif?.message, true)}
            {...form.register('nif')}
            autoCapitalize="characters"
            spellCheck={false}
            className="h-10 uppercase"
          />
        </FormField>
        <FormField id="email" label="E-mail" error={errors.email?.message}>
          <Input
            {...fieldA11y('email', errors.email?.message)}
            {...form.register('email')}
            type="email"
            autoComplete="email"
            className="h-10"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="password"
          label="Senha"
          error={errors.password?.message}
          hint="Mínimo 8 caracteres, com letras e números."
        >
          <PasswordInput
            {...fieldA11y('password', errors.password?.message, true)}
            {...form.register('password')}
            autoComplete="new-password"
          />
        </FormField>
        <FormField
          id="confirmPassword"
          label="Confirmar senha"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            {...fieldA11y('confirmPassword', errors.confirmPassword?.message)}
            {...form.register('confirmPassword')}
            autoComplete="new-password"
          />
        </FormField>
      </div>

      <Button type="submit" size="lg" className="h-10" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Criar conta
      </Button>
    </form>
  )
}
