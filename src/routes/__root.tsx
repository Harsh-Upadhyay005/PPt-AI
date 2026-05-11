import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import Navbar from '../components/navbar'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { AppQueryClientProvider } from '#/integrations/tanstack-query/root-provider'
import { Toaster } from '#/components/ui/sonner'

export interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'PPT.ai - Generate presentations from text',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

export function NotFound() {
  return (
    <div className="min-h-svh flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">Sorry, we couldn't find that page.</p>
      </div>
    </div>
  )
}

function RootLayout() {
  return (
    <div className="min-h-svh">
      <Navbar />
      <Outlet />
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary/20">
        <AppQueryClientProvider>
          {children}
          <Toaster closeButton position="top-center" richColors />
          <Scripts />
        </AppQueryClientProvider>
      </body>
    </html>
  )
}