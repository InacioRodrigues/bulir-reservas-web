import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useCurrentUser, useLogout } from '@/features/auth/hooks'
import { ROLE_LABEL } from '@/features/auth/roles'
import { initials } from '@/shared/lib/strings'
import { useThemeStore, type Theme } from '@/shared/theme/theme-store'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function UserMenu() {
  const user = useCurrentUser()
  const logout = useLogout()
  const { theme, setTheme } = useThemeStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label="Menu da conta">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-36 truncate text-left text-sm lg:block">
            {user.fullName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="grid gap-1 font-normal">
          <span className="truncate font-medium text-foreground">{user.fullName}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          <span className="text-xs text-muted-foreground">NIF {user.nif}</span>
          <Badge variant="secondary" className="mt-1 w-fit">
            {ROLE_LABEL[user.role]}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Tema</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          <DropdownMenuRadioItem value="light">
            <Sun /> Claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Escuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> Sistema
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut /> Terminar sessão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
