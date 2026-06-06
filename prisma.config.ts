import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { PrismaNeon } from '@prisma/adapter-neon'

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: './prisma/schema.prisma',
  },
  migrate: {
    async adapter(env) {
      return new PrismaNeon({ connectionString: env.DIRECT_URL })
    },
  },
})