'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { Section } from './Section'
import { Reveal } from './Reveal'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

/**
 * Section 16: Glossary
 *
 * Neutral family. Frame Mode. Bulevar Regular (not Poster).
 * Reference. Clean, functional, designed but efficient.
 * Category color-coding echoes origin sections.
 */

/** Category → accent color mapping (echoes the section where term is most prominent) */
const CATEGORY_COLORS: Record<string, string> = {
  concept: '#3500FF',      // Blue/Purple — conceptual foundations
  tool: '#41AAAE',         // Teal — tool sections
  workflow: '#F9A223',     // Gold — building/planning phases
  troubleshooting: '#F5241F', // Red — when things go wrong
  deployment: '#1E7C40',   // Green — deployment phase
}

interface GlossaryTerm {
  term: string
  definition: string
  category: keyof typeof CATEGORY_COLORS
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  { term: 'API', definition: 'A way for different pieces of software to talk to each other. Think of it like a waiter — you tell the waiter what you want, the waiter goes to the kitchen, and brings back what you asked for.', category: 'concept' },
  { term: 'Atomic Slice', definition: 'The smallest possible unit of work that produces a complete, testable result. A 2,000-word plan might break into 15\u201325 atomic slices.', category: 'workflow' },
  { term: 'Authentication / OAuth', definition: 'The process of proving you are who you say you are. OAuth is a standard way for apps to verify your identity without handling your password directly.', category: 'concept' },
  { term: 'Auto-accept Mode', definition: 'A Claude Code setting (toggled with Shift+Tab) that lets Claude make file changes without asking for permission each time.', category: 'tool' },
  { term: 'Backend', definition: 'The part of the software people don\u2019t see. The database, the logic that processes payments, the code that sends emails, the security rules.', category: 'concept' },
  { term: 'Build', definition: 'The process Vercel runs to turn your code into a working website. It checks for errors, compiles files, and creates an optimized version.', category: 'deployment' },
  { term: 'CLAUDE.md', definition: 'A markdown file that Claude Code reads at the start of every session. Contains project-specific instructions and rules.', category: 'tool' },
  { term: 'CLI', definition: 'Command Line Interface. A tool you interact with by typing text commands in the terminal, as opposed to clicking buttons.', category: 'tool' },
  { term: 'Codebase', definition: 'All the code files for your project, organized in folders. It\u2019s literally just a folder on your computer with text files inside.', category: 'concept' },
  { term: 'Component', definition: 'A reusable piece of your interface. A button is a component. A navigation bar is a component. You build them once and use them everywhere.', category: 'concept' },
  { term: 'Context Compaction', definition: 'When Claude\u2019s context window fills up during long sessions, causing it to forget earlier parts of the conversation.', category: 'troubleshooting' },
  { term: 'Context Window', definition: 'The limit on how much information Claude can hold in its head at once during a conversation.', category: 'concept' },
  { term: 'Continuous Deployment', definition: 'The automatic connection between GitHub and Vercel where every push triggers a new deployment.', category: 'deployment' },
  { term: 'Custom Domain', definition: 'A real URL like yourapp.com instead of the default yourapp.vercel.app. Requires DNS configuration.', category: 'deployment' },
  { term: 'Database', definition: 'A collection of organized tables that store information. Think of it as a really structured spreadsheet.', category: 'concept' },
  { term: 'Database Schema', definition: 'The structure of your database tables \u2014 what columns exist, what type of data each column holds, and how tables relate to each other.', category: 'concept' },
  { term: 'Deploy / Deployment', definition: 'Making your app available on the internet. Taking your code from your computer and putting it on a service like Vercel.', category: 'deployment' },
  { term: 'Dev Server', definition: 'The tool that reads your code files and turns them into a live, working preview of your app on your computer.', category: 'tool' },
  { term: 'DNS', definition: 'Domain Name System. The phone book of the internet \u2014 translates human-readable domain names into server addresses.', category: 'deployment' },
  { term: 'Environment Variables', definition: 'Secret values (API keys, database URLs) that your app needs but shouldn\u2019t be stored in your code. Stored in .env.local locally and Vercel\u2019s dashboard for production.', category: 'deployment' },
  { term: 'Framework', definition: 'A pre-built foundation that gives your project structure and common features. Next.js is a framework.', category: 'tool' },
  { term: 'Frontend', definition: 'The part of the software people see and interact with. Buttons, layouts, animations, text, images.', category: 'concept' },
  { term: 'Git', definition: 'Version control software that tracks every change you make to your code. Lets you go back to any previous version.', category: 'tool' },
  { term: 'GitHub', definition: 'The most popular place to store code online. Think of it as Dropbox for code.', category: 'tool' },
  { term: 'Hidden Dependencies', definition: 'Connections between different parts of your code that aren\u2019t obvious. When changing one component breaks an unrelated one.', category: 'troubleshooting' },
  { term: 'Homebrew', definition: 'A package manager for Mac that installs developer tools through the terminal.', category: 'tool' },
  { term: 'Isolation', definition: 'Keeping different parts of your app independent from each other so changes in one area don\u2019t break another.', category: 'concept' },
  { term: 'Lazy Initialization', definition: 'Creating a connection only when it\u2019s first needed, rather than when the file loads. Prevents build-time errors on Vercel.', category: 'deployment' },
  { term: 'Library', definition: 'A package of pre-written code that adds specific functionality. GSAP is an animation library. You install them rather than writing the code yourself.', category: 'tool' },
  { term: 'Localhost', definition: 'A URL like http://localhost:3000 that lets you preview your app on your own computer. Nobody else can see it.', category: 'concept' },
  { term: 'Markdown / MD File', definition: 'A simple text file (.md) that uses lightweight formatting \u2014 headings with #, bold with **, lists with -. Readable as plain text.', category: 'tool' },
  { term: 'MCP', definition: 'Model Context Protocol. A plugin that connects Claude to an external tool or service, like Notion, Supabase, or GitHub.', category: 'tool' },
  { term: 'Module Level', definition: 'Code that runs when a file first loads, before any function is called. Can cause Vercel build failures.', category: 'troubleshooting' },
  { term: 'node_modules', definition: 'The folder containing all your dependencies (other people\u2019s code). Usually 1\u20133GB, not tracked by Git, recreatable via npm install.', category: 'concept' },
  { term: 'npm', definition: 'Node Package Manager. The tool that installs JavaScript packages and libraries.', category: 'tool' },
  { term: 'Package', definition: 'A bundle of pre-written code that adds functionality. Like buying a premade pie crust instead of making one from scratch.', category: 'tool' },
  { term: 'package.json', definition: 'A small text file listing all the packages your project depends on. npm reads this to download everything.', category: 'tool' },
  { term: 'PATH', definition: 'Your terminal\u2019s address book \u2014 a list of folders where it looks for programs when you type a command.', category: 'tool' },
  { term: 'Plan', definition: 'A sequenced set of steps that breaks your spec into phases Claude Code can execute one at a time. The how and in what order.', category: 'workflow' },
  { term: 'Playwright', definition: 'A tool that lets Claude open an invisible browser and interact with your app like a person would. Used for automated QA testing.', category: 'tool' },
  { term: 'Progress File', definition: 'A markdown file where Claude logs what it\u2019s completed, what\u2019s working, and what\u2019s next. Acts as Claude\u2019s external memory.', category: 'workflow' },
  { term: 'QA', definition: 'Quality Assurance. Testing your software to make sure it works correctly.', category: 'workflow' },
  { term: 'Recursive Quality Loop', definition: 'Having Claude grade its own work, find gaps, fix them, and repeat until it reaches a high standard (9+ out of 10).', category: 'workflow' },
  { term: 'Repository (Repo)', definition: 'Your codebase stored online, usually on GitHub. Keeps a backup and tracks every change.', category: 'tool' },
  { term: 'Routing', definition: 'How your app decides which page to show based on the URL.', category: 'concept' },
  { term: 'Server', definition: 'A computer connected to the internet that runs your app 24/7. Vercel provides these.', category: 'deployment' },
  { term: 'Spec', definition: 'A detailed document describing exactly what you\u2019re building, how it should work, what technologies it uses, and how everything connects. The what.', category: 'workflow' },
  { term: 'SSL Certificate', definition: 'What gives your site https:// instead of http://. Vercel provisions these automatically. Encrypts the connection.', category: 'deployment' },
  { term: 'SSOT', definition: 'Single Source of Truth. Each piece of information defined in one place and referenced everywhere else.', category: 'concept' },
  { term: 'State', definition: 'Data shared across different parts of your app \u2014 like whether a user is logged in or what\u2019s in their cart.', category: 'concept' },
  { term: 'SWE', definition: 'Software Engineer. Someone who writes code professionally. Pronounced \u201Cswee.\u201D', category: 'concept' },
  { term: 'Tech Stack', definition: 'The combination of tools and technologies used to build a project. Like describing your kitchen setup.', category: 'concept' },
  { term: 'Terminal', definition: 'The text-based interface where you type commands instead of clicking. Used to run Claude Code, push code, and start your dev server.', category: 'tool' },
  { term: 'TypeScript', definition: 'A version of JavaScript with strict type-checking. Vercel requires TypeScript errors to be fixed before deploying.', category: 'tool' },
  { term: 'Vertical Slice', definition: 'A building approach where each phase delivers a complete, working feature from top to bottom rather than horizontal layers.', category: 'workflow' },
  { term: 'Webhook', definition: 'A URL on your app that external services (like Stripe) can send data to when events happen.', category: 'deployment' },
]

function GlossaryCard({ term, definition, category }: GlossaryTerm) {
  const accentColor = CATEGORY_COLORS[category] || '#969696'

  return (
    <div
      className="p-5 rounded-lg"
      style={{
        backgroundColor: 'rgba(249, 249, 249, 0.04)',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <h3
          className="text-lg font-medium"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--white)',
          }}
        >
          {term}
        </h3>
        <span
          className="text-[10px] uppercase tracking-widest opacity-40"
          style={{ fontFamily: 'var(--font-body)', color: accentColor }}
        >
          {category}
        </span>
      </div>
      <p
        className="text-sm opacity-70"
        style={{
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
        }}
      >
        {definition}
      </p>
    </div>
  )
}

export function GlossarySection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = gridRef.current
    if (!el || prefersReduced) return

    const cards = el.querySelectorAll('[data-glossary-card]')

    gsap.fromTo(
      cards,
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.03,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      },
    )

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === el)
        .forEach((st) => st.kill())
    }
  }, [])

  return (
    <>
      {/* REVEAL: Section title — Bulevar Regular at moderate scale (not Poster, not Canela) */}
      <Reveal
        id="glossary-reveal"
        text="Glossary"
        fontFamily="var(--font-bulevar)"
        fontSize="clamp(32px, 6vw, 72px)"
      />

      <Section id="glossary" treatment="EDITORIAL">
        <GridContainer>
          <ContentZone zone="wide">
            <p
              className="text-sm mb-8 opacity-50"
              style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
            >
              Quick-reference definitions for every term used in this guide. These are
              all explained in context throughout the sections above — this is just a
              place to look things up if you need a refresher.
            </p>

            {/* Category legend */}
            <div className="flex flex-wrap gap-4 mb-10">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-widest opacity-50"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {cat}
                  </span>
                </div>
              ))}
            </div>

            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {GLOSSARY_TERMS.map((entry) => (
                <div key={entry.term} data-glossary-card>
                  <GlossaryCard {...entry} />
                </div>
              ))}
            </div>
          </ContentZone>
        </GridContainer>
      </Section>
    </>
  )
}
