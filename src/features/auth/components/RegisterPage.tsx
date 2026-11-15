import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { paths } from '@/shared/config/paths'
import type { User } from '@/shared/contract/types'
import { homePathFor, ROLE_LABEL } from '../roles'
import { AuthCard } from './AuthCard'
import { RegisterForm } from './RegisterForm'

export function RegisterPage() {
  const navigate = useNavigate()

  const handleSuccess = (user: User) => {
    toast.success(`Conta de ${ROLE_LABEL[user.role].toLowerCase()} criada. Bem-vindo(a)!`)
    navigate(homePathFor(user.role), { replace: true })
  }

  return (
    <AuthCard
      title="Criar conta"
      description="Contrate serviços como cliente ou ofereça-os como prestador."
      footer={
        <>
          Já tem conta?{' '}
          <Link
            to={paths.login}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Iniciar sessão
          </Link>
        </>
      }
    >
      <RegisterForm onSuccess={handleSuccess} />
    </AuthCard>
  )
}
