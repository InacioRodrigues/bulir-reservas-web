import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { getErrorMessage, toApiError } from '@/shared/api/errors'
import { fieldA11y } from '@/shared/components/field-a11y'
import { FormField } from '@/shared/components/FormField'
import { PasswordInput } from '@/shared/components/PasswordInput'
import { loginSchema, type LoginInput, type LoginValues } from '@/shared/contract/schemas'
import type { User } from '@/shared/contract/types'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useLogin } from '../hooks'

export function LoginForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const login = useLogin()
  const cooldown = useCountdown()
  const form = useForm<LoginInput, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })
  const { errors, isSubmitting } = form.formState
  const identifier = useWatch({ control: form.control, name: 'identifier' })
  const mode = identifier.includes('@') ? 'e-mail' : identifier.trim() ? 'NIF' : null

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const session = await login.mutateAsync(values)
      onSuccess(session.user)
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.retryAfter) cooldown.start(apiError.retryAfter)
      form.setValue('password', '')
      form.setFocus('password')
    }
  })

  const busy = isSubmitting || login.isPending
  const errorMessage = login.error ? getErrorMessage(login.error) : null

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {errorMessage && (
        <Alert variant="destructive" aria-live="assertive">
          <AlertDescription>
            {cooldown.active
              ? `Demasiadas tentativas. Tente novamente dentro de ${cooldown.secondsLeft} s.`
              : errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <FormField
        id="identifier"
        label="E-mail ou NIF"
        error={errors.identifier?.message}
        hint={mode ? `A entrar com ${mode}.` : 'Use o e-mail ou o NIF da sua conta.'}
      >
        <Input
          {...fieldA11y('identifier', errors.identifier?.message, true)}
          {...form.register('identifier')}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="nome@exemplo.ao ou 004512345LA041"
          className="h-10"
        />
      </FormField>

      <FormField id="password" label="Senha" error={errors.password?.message}>
        <PasswordInput
          {...fieldA11y('password', errors.password?.message)}
          {...form.register('password')}
          autoComplete="current-password"
        />
      </FormField>

      <Button type="submit" size="lg" className="h-10" disabled={busy || cooldown.active}>
        {busy ? <Loader2 className="animate-spin" /> : <LogIn />}
        {cooldown.active ? `Aguarde ${cooldown.secondsLeft} s` : 'Entrar'}
      </Button>
    </form>
  )
}
