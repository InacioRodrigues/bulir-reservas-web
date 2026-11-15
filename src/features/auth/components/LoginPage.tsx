import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { paths } from '@/shared/config/paths'
import type { User } from '@/shared/contract/types'
import { homePathFor } from '../roles'
import { AuthCard } from './AuthCard'
import { LoginForm } from './LoginForm'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const handleSuccess = (user: User) => {
    toast.success(`Olá, ${user.fullName.split(' ')[0]}!`)
    navigate(from && from !== paths.home ? from : homePathFor(user.role), { replace: true })
  }

  return (
    <AuthCard
      title="Iniciar sessão"
      description="Entre com o seu e-mail ou NIF e a sua senha."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link
            to={paths.register}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm onSuccess={handleSuccess} />
    </AuthCard>
  )
}
