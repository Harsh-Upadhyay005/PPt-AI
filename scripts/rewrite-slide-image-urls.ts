#!/usr/bin/env node

import 'dotenv/config'

import { prisma } from '#/lib/db'
import { buildImageKitUrl } from '#/features/presentation/lib/imagekit'

const FORCE_ALL = process.argv.includes('--all')

async function main() {
  const slides = await prisma.slide.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      imagePrompt: true,
      imageUrl: true,
      presentationId: true,
    },
  })

  const targets = slides.filter((slide) => {
    if (!slide.imagePrompt) return false
    if (FORCE_ALL) return true
    return (
      !slide.imageUrl ||
      slide.imageUrl.includes('/ik-genimg-prompt-') ||
      slide.imageUrl.includes('source.unsplash.com')
    )
  })

  if (!targets.length) {
    console.log('No slide image URLs need rewriting')
    return
  }

  for (const slide of targets) {
    const nextUrl = buildImageKitUrl(slide.imagePrompt!)

    await prisma.slide.update({
      where: { id: slide.id },
      data: { imageUrl: nextUrl },
    })

    console.log(`Updated slide ${slide.id} (${slide.presentationId})`)
  }

  console.log(`Rewrote ${targets.length} slide image URL(s)`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
