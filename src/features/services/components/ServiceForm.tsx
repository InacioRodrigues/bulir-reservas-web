import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { applyFieldErrors, getErrorMessage } from '@/shared/api/errors'
import { fieldA11y } from '@/shared/components/field-a11y'
import { FormField } from '@/shared/components/FormField'
import {
  LIMITS,
  serviceSchema,
  type ServiceInput,
  type ServiceValues,
} from '@/shared/contract/schemas'
import type { Service } from '@/shared/contract/types'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import type { ServicePayload } from '../api'

const FIELDS = ['name', 'description', 'price'] as const

interface ServiceFormProps {
  /** Serviço a editar; sem ele o formulário cria um novo. */
  service?: Service
  /** Recebe só os campos alterados quando edita (PATCH parcial). */
  onSubmit: (payload: Partial<ServicePayload>) => Promise<unknown>
  onCancel?: () => void
  submitLabel: string
}

/** Formulário único para criar e editar serviços (mesmas regras do contrato). */
export function ServiceForm({ service, onSubmit, onCancel, submitLabel }: ServiceFormProps) {
  const form = useForm<ServiceInput, unknown, ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? '',
      description: service?.description ?? '',
      price: service?.price ?? '',
    },
  })
  const { errors, isSubmitting, dirtyFields, isDirty } = form.formState
  const description = useWatch({ control: form.control, name: 'description' })

  const submit = form.handleSubmit(async (values) => {
    const payload: Partial<ServicePayload> = service
      ? Object.fromEntries(FIELDS.filter((field) => dirtyFields[field]).map((f) => [f, values[f]]))
      : values
    try {
      await onSubmit(payload)
    } catch (error) {
      if (!applyFieldErrors(error, form.setError, FIELDS)) {
        form.setError('root', { message: getErrorMessage(error) })
      }
    }
  })

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {errors.root && (
        <Alert variant="destructive" aria-live="assertive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <FormField id="service-name" label="Título" error={errors.name?.message}>
        <Input
          {...fieldA11y('service-name', errors.name?.message)}
          {...form.register('name')}
          placeholder="Ex.: Canalização ao domicílio"
          maxLength={LIMITS.service.name.max}
          className="h-10"
        />
      </FormField>

      <FormField
        id="service-description"
        label="Descrição"
        error={errors.description?.message}
        hint={`${description.length}/${LIMITS.service.description.max} caracteres`}
      >
        <Textarea
          {...fieldA11y('service-description', errors.description?.message, true)}
          {...form.register('description')}
          rows={5}
          maxLength={LIMITS.service.description.max}
          placeholder="O que está incluído, prazos, zona de atuação…"
        />
      </FormField>

      <FormField
        id="service-price"
        label="Preço (Kz)"
        error={errors.price?.message}
        hint="Até 2 casas decimais. Ex.: 15000 ou 15000,50"
      >
        <div className="relative">
          <Input
            {...fieldA11y('service-price', errors.price?.message, true)}
            {...form.register('price')}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            className="h-10 pr-10 tabular-nums"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
            Kz
          </span>
        </div>
      </FormField>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="lg" disabled={isSubmitting || (service && !isDirty)}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
