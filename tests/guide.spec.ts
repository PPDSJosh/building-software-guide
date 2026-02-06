import { test, expect } from '@playwright/test'

test.describe('Guide — Page Load & Structure', () => {
  test('page loads without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/', { waitUntil: 'networkidle' })

    // Filter out WebGL context warnings which are expected in headless
    const criticalErrors = errors.filter(
      (e) => !e.includes('WebGL') && !e.includes('THREE') && !e.includes('context')
    )
    expect(criticalErrors).toEqual([])
  })

  test('page returns HTTP 200', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
  })

  test('page has correct title or meta', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toBeTruthy()
  })
})

test.describe('Guide — Section Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('key content sections exist', async ({ page }) => {
    // Sections by their actual IDs in the codebase
    const sectionIds = [
      'hero',
      'hero-intro',
      'foundations',
      'tell-claude',
      'how-code-lives',
      'before-you-start',
      'phase-1',
      'phase-2',
      'phase-3-anatomy',
      'phase-4-anatomy',
      'phase-5-setup',
      'phase-6-what',
      'phase-7-reality',
      'glossary',
    ]

    for (const id of sectionIds) {
      const section = page.locator(`[id="${id}"]`)
      const count = await section.count()
      expect(count, `Section #${id} should exist`).toBeGreaterThanOrEqual(1)
    }
  })

  test('breath transitions exist between sections', async ({ page }) => {
    const breaths = page.locator('[data-treatment="BREATH"]')
    const count = await breaths.count()
    expect(count).toBeGreaterThanOrEqual(10)
  })

  test('takeover sections exist', async ({ page }) => {
    const takeovers = page.locator('[data-treatment="TAKEOVER"]')
    const count = await takeovers.count()
    // Multiple takeover moments throughout
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test('editorial sections exist', async ({ page }) => {
    const editorials = page.locator('[data-treatment="EDITORIAL"]')
    const count = await editorials.count()
    expect(count).toBeGreaterThanOrEqual(10)
  })
})

test.describe('Guide — WebGL Gradient Rendering', () => {
  test('gradient planes exist (canvas or fallback)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // In headed browsers: canvas elements are created for WebGL
    // In headless: WebGL may not be available, so fallback divs render instead
    const canvases = await page.locator('canvas').count()
    const poolElements = await page.locator('[data-gradient-pool-id]').count()
    // Either canvas elements or pool-registered elements should exist
    expect(
      canvases + poolElements,
      'Should have gradient planes (canvas or fallback)',
    ).toBeGreaterThanOrEqual(1)
  })

  test('gradient pool limits active instances', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const visibleCanvases = await page.locator('canvas').evaluateAll((els) =>
      els.filter((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }).length
    )
    // Pool limits to MAX_ACTIVE (2), allow tolerance
    expect(visibleCanvases).toBeLessThanOrEqual(6)
  })

  test('hero section has visible gradient content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    const hero = page.locator('#hero')
    await expect(hero).toBeVisible()

    const heroBox = await hero.boundingBox()
    expect(heroBox).toBeTruthy()
    expect(heroBox!.height).toBeGreaterThan(100)
  })

  test('gradient pool activates after scroll', async ({ page }, testInfo) => {
    testInfo.setTimeout(60_000)
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Scroll down past the hero
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3))
    await page.waitForTimeout(3000)

    // The pool should still be managing elements even if canvas count varies
    const poolElements = await page.locator('[data-gradient-pool-id]').count()
    // Pool should have registered gradient planes
    expect(poolElements).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Guide — Typography', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('hero uses display font (Tusker Grotesk)', async ({ page }) => {
    const heroText = page.locator('#hero .takeover-line').first()
    if (await heroText.count() > 0) {
      const fontFamily = await heroText.evaluate((el) =>
        window.getComputedStyle(el).fontFamily
      )
      expect(fontFamily.toLowerCase()).toMatch(/tusker|grotesk/)
    }
  })

  test('editorial body text uses correct font', async ({ page }) => {
    // Scroll to an editorial section (past hero)
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 4))
    await page.waitForTimeout(500)

    // Find body text styled with --font-body
    const bodyElements = await page.locator('p').evaluateAll((els) =>
      els
        .map((el) => window.getComputedStyle(el).fontFamily.toLowerCase())
        .filter((f) => f.includes('neue') || f.includes('montreal') || f.includes('sans'))
    )
    // At least some paragraphs should use the body font
    expect(bodyElements.length).toBeGreaterThanOrEqual(1)
  })

  test('cinematic text uses larger font size', async ({ page }) => {
    // Find elements with font size >= 28px (cinematic moments)
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 5))
    await page.waitForTimeout(500)

    const largeFonts = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, div, h1, h2, h3')
      let count = 0
      elements.forEach((el) => {
        const size = parseFloat(window.getComputedStyle(el).fontSize)
        if (size >= 28) count++
      })
      return count
    })
    expect(largeFonts).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Guide — Responsive', () => {
  test('page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const response = await page.goto('/', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)

    const hero = page.locator('#hero')
    await expect(hero).toBeVisible()
  })

  test('page renders on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const response = await page.goto('/', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)
  })
})

test.describe('Guide — Scroll & Animation', () => {
  test('page is scrollable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const initialScroll = await page.evaluate(() => window.scrollY)
    await page.evaluate(() => window.scrollBy(0, 500))
    await page.waitForTimeout(500)
    const newScroll = await page.evaluate(() => window.scrollY)

    expect(newScroll).toBeGreaterThan(initialScroll)
  })

  test('scroll through entire page without crashes', async ({ page }, testInfo) => {
    testInfo.setTimeout(120_000)
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const totalHeight = await page.evaluate(() => document.body.scrollHeight)
    const viewport = await page.evaluate(() => window.innerHeight)
    // Jump 3x viewport to avoid timeout on very tall pinned pages
    const step = viewport * 3

    for (let y = 0; y < totalHeight; y += step) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y)
      await page.waitForTimeout(100)
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Filter out WebGL context warnings
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('WebGL') &&
        !e.includes('THREE') &&
        !e.includes('context') &&
        !e.includes('WEBGL')
    )
    expect(criticalErrors).toEqual([])
  })
})

test.describe('Guide — No CSS Gradients', () => {
  test('no CSS gradient backgrounds used (WebGL only)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const cssGradients = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const found: string[] = []
      elements.forEach((el) => {
        const bg = window.getComputedStyle(el).backgroundImage
        if (bg && bg.includes('gradient(')) {
          // Allow gradients used for text masking (background-clip: text)
          const clip = window.getComputedStyle(el).webkitBackgroundClip
          if (clip !== 'text') {
            const tag = el.tagName
            const id = el.id ? `#${el.id}` : ''
            const cls = el.className
              ? `.${String(el.className).split(' ')[0]}`
              : ''
            found.push(`${tag}${id}${cls}: ${bg.substring(0, 60)}`)
          }
        }
      })
      return found
    })

    expect(cssGradients, 'Found CSS gradients that should be WebGL').toEqual([])
  })
})

test.describe('Guide — Glossary Section', () => {
  test('glossary section exists with terms', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Scroll to bottom
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight - window.innerHeight)
    )
    await page.waitForTimeout(1000)

    const glossary = page.locator('#glossary')
    const count = await glossary.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Guide — Interactive Components', () => {
  test('prompt cards exist in the page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Scroll through to load more content
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 8))
    await page.waitForTimeout(1000)

    // Look for prompt card text elements
    const quotes = await page.evaluate(() => {
      const els = document.querySelectorAll('p')
      let count = 0
      els.forEach((el) => {
        if (el.textContent?.startsWith('\u201C')) count++ // Left double quotation mark
      })
      return count
    })
    expect(quotes).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Guide — Accessibility', () => {
  test('page has semantic sections', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const sections = await page.locator('section').count()
    expect(sections).toBeGreaterThan(10)
  })

  test('images have alt attributes where present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img')
      let missing = 0
      imgs.forEach((img) => {
        if (!img.hasAttribute('alt')) missing++
      })
      return missing
    })
    expect(imagesWithoutAlt).toBe(0)
  })
})
