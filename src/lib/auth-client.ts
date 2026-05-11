import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    /** Use same-origin requests so auth works across local/dev/prod hosts. */
    baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
})