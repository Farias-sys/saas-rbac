import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({    
    server: {
        SERVER_PORT: z.coerce.number().default(5000),
        DATABASE_URL: z.string().url(),
        JWT_SECRET: z.string(),
        GITHUB_OAUTH_CLIENT_ID: z.string(),
        GITHUB_OAUTH_CLIENT_SECRET: z.string(),
        GITHUB_OAUTH_CLIENT_REDIRECT_URL: z.string().url()
    },
    client: {},
    shared: {},
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        GITHUB_OAUTH_CLIENT_ID: process.env.GITHUB_OAUTH_CLIENT_ID,
        GITHUB_OAUTH_CLIENT_SECRET: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        GITHUB_OAUTH_CLIENT_REDIRECT_URL: process.env.GITHUB_OAUTH_CLIENT_REDIRECT_URL,
        SERVER_PORT: process.env.SERVER_PORT
    },
    emptyStringAsUndefined: true
})