import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { MyRouterContext } from './routes/__root'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    // Provide a placeholder context to satisfy the router's expected context type.
    context: {} as unknown as MyRouterContext,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

