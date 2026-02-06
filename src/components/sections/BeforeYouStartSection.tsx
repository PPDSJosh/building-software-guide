'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheCinematic, WideArgument, BodyText, BoldTerm } from '@/components/editorial'
import { BEFORE_YOU_START_GRADIENT } from '@/lib/data/gradientPresets'
import { DRAMATIC_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 7: Before You Start: Two Things You Need
 *
 * Red (terracotta) family. Stage Mode. Bulevar Poster.
 * The threshold section — last stop before the build phases begin.
 *
 * Structure:
 * 1. REVEAL: "Before You Start: Two Things You Need"
 * 2. EDITORIAL: "Know Your Tools"
 * 3. REVEAL: Stove analogy
 * 4. INTERACTIVE: Tech Stack Survey (WideArgument layout)
 * 5. TAKEOVER: "NOW BUILD." (Bulevar) — threshold moment
 */
export function BeforeYouStartSection() {
  return (
    <>
      {/* REVEAL: Section title */}
      <Reveal
        id="before-you-start-reveal"
        text="Before You Start: Two Things You Need"
      />

      <Section id="before-you-start" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            The first place to start is with two things: an idea and an understanding of
            what tech libraries and languages exist, along with a basic understanding of
            what they do. You need to be well-versed enough to have a conversation with
            Claude about the best way to make your idea real.
          </BodyText>
          <BodyText>
            You don&apos;t need to know a lot about the tools — just what they do. Similar
            to how you don&apos;t need to know how a stove works, but you know it&apos;s
            a good way to make grilled cheese.
          </BodyText>
        </StandardColumn>

        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            You don&apos;t need to know how a stove works. You just need to know it&apos;s
            a good way to make grilled cheese.
          </p>
        </TheCinematic>

        <StandardColumn className="mt-12">
          <BodyText>
            The combination of tools and technologies you choose is called your{' '}
            <BoldTerm>tech stack</BoldTerm>. If building software is like cooking, the
            tech stack is your kitchen setup — what stove you&apos;re using, what pans,
            what ingredients.
          </BodyText>
        </StandardColumn>

        {/* Tech stack categories — INTERACTIVE / WideArgument treatment */}
        <WideArgument
          className="my-12"
          columns={[
            <div key="structure">
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Structure &amp; Style
              </p>
              <BodyText>
                <BoldTerm>Next.js</BoldTerm> for building the structure.{' '}
                <BoldTerm>Tailwind CSS</BoldTerm> for styling.{' '}
                <BoldTerm>shadcn/ui</BoldTerm> for pre-built components.
              </BodyText>
            </div>,
            <div key="motion">
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Motion &amp; State
              </p>
              <BodyText>
                <BoldTerm>GSAP</BoldTerm> for animation and scroll effects.{' '}
                <BoldTerm>Zustand</BoldTerm> for managing shared data across your app.
              </BodyText>
            </div>,
            <div key="backend">
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Backend &amp; Hosting
              </p>
              <BodyText>
                <BoldTerm>Supabase</BoldTerm> for database, auth, and storage.{' '}
                <BoldTerm>Stripe</BoldTerm> for payments.{' '}
                <BoldTerm>Vercel</BoldTerm> for hosting.
              </BodyText>
            </div>,
          ]}
        />

        <StandardColumn className="mt-8">
          <BodyText>
            I personally prefer GSAP for motion, Next.js for the framework, Tailwind for
            styling, Zustand for state, Supabase for the backend, and Vercel for hosting.
            These tools work incredibly well together and Claude Code knows them inside
            and out.
          </BodyText>
          <BodyText>
            From there, you have a basic idea of what tools Claude Code will use to bring
            your idea to life. That&apos;s good. That&apos;s enough.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TAKEOVER: Threshold moment — entering the phases */}
      <Takeover
        id="now-build"
        displayFont="bulevar"
        lines={['Now', 'Build.']}
        preset={BEFORE_YOU_START_GRADIENT}
        animation={DRAMATIC_BREATHE}
        fallbackColor="#680300"
      />
    </>
  )
}
