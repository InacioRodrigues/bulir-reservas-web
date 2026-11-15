import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { API, clientUser, ok } from './fixtures'

/** Handlers por omissão; cada teste sobrepõe o que precisa com server.use(...). */
export const server = setupServer(
  http.get(`${API}/auth/me`, () => HttpResponse.json(ok(clientUser))),
)
