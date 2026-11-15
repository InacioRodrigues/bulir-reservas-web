/**
 * Configuração lida das variáveis de ambiente do Vite (prefixo VITE_).
 * Falha cedo, no arranque, se a URL da API não estiver definida.
 */
function readApiUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  if (!raw) {
    throw new Error('VITE_API_URL não está definida. Copie .env.example para .env.')
  }
  return raw.replace(/\/+$/, '')
}

export const env = {
  apiUrl: readApiUrl(),
  apiBaseUrl: `${readApiUrl()}/api/v1`,
} as const
