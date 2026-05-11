#!/usr/bin/env node
// One-off script to find presentations stuck in GENERATING and requeue them
import { PrismaClient } from '@prisma/client'
import { Inngest } from 'inngest'

const prisma = new PrismaClient()
const inngest = new Inngest({ id: 'ppt-ai' })

const STALE_MS = 2 * 60 * 1000 // 2 minutes

async function main() {
  const cutoff = new Date(Date.now() - STALE_MS)

  const stuck = await prisma.presentation.findMany({
    where: {
      status: 'GENERATING',
      updatedAt: { lt: cutoff },
      slides: { none: {} },
    },
  })

  if (!stuck.length) {
    console.log('No stuck presentations found')
    await prisma.$disconnect()
    return
  }

  for (const p of stuck) {
    const lastAttemptAge = p.generationAttemptedAt
      ? Date.now() - new Date(p.generationAttemptedAt).getTime()
      : Number.POSITIVE_INFINITY

    if (lastAttemptAge < STALE_MS) {
      console.log(`Skipping ${p.id} — recent attempt (${Math.round(lastAttemptAge)}ms)`) 
      continue
    }

    console.log(`Requeuing presentation ${p.id}`)
    await prisma.presentation.update({
      where: { id: p.id },
      data: { generationAttemptedAt: new Date() },
    })

    await inngest.send({ name: 'presentation/generate', data: { presentationId: p.id } })
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
