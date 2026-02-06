'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { CodeBlock } from '@/components/interactive'
import { COMFORT_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 15: When Things Go Wrong
 *
 * Gold (light end) + Red (light end). Ovals + circles only. Tusker Grotesk.
 * Empathy. The most emotionally honest section.
 *
 * Structure:
 * 1. REVEAL: "When Things Go Wrong"
 * 2. EDITORIAL: Claude going in circles, wrong root cause
 * 3. EDITORIAL: Claude getting stuck in a mode
 * 4. EDITORIAL: When Claude makes a mess + Git Recovery Hierarchy (Levels 1-4)
 * 5. EDITORIAL: First deploy fails (it's fine)
 * 6. EDITORIAL: When you're stuck and frustrated
 * 7. TAKEOVER: "WALK AWAY." (Tusker — emotional climax, warmest palette)
 * 8. EDITORIAL: Protecting against future problems
 */
export function WhenThingsGoWrongSection() {
  return (
    <>
      {/* REVEAL: Section title */}
      <Reveal
        id="when-things-go-wrong-reveal"
        text="When Things Go Wrong"
      />

      {/* EDITORIAL: Claude going in circles */}
      <Section id="things-wrong-circles" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            This section isn&apos;t about a specific phase. It&apos;s about the moments
            that happen at any phase — the frustration, the confusion, the &ldquo;why is
            this broken and I don&apos;t understand anything&rdquo; moments. Because they
            will happen, and how you handle them determines whether you keep going or give
            up.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Claude Going in Circles
          </p>
          <BodyText>
            You ask Claude to fix a problem. It makes a change. The problem persists. You
            tell Claude it&apos;s still broken. It makes another change. Still broken.
            Four attempts deep and you&apos;re going backwards.
          </BodyText>
          <BodyText>
            Usually it&apos;s one of two things: <BoldTerm>context loss</BoldTerm> (Claude
            forgot what it already tried — start a fresh conversation) or{' '}
            <BoldTerm>wrong root cause</BoldTerm> (Claude is fixing symptoms instead of
            the actual problem — force it to think deeper).
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Claude Getting Stuck in a Mode
          </p>
          <BodyText>
            Sometimes Claude will get behaviorally stuck — planning over and over but never
            executing, or running tests that timeout endlessly. The prompt:{' '}
            <BoldTerm>&ldquo;Stop chasing the full test run. The fix works. Summarize
            changes.&rdquo;</BoldTerm> That gives it a clear exit and a clear next action.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* EDITORIAL + INTERACTIVE: When Claude makes a mess — Git Recovery */}
      <Section id="things-wrong-recovery" treatment="EDITORIAL">
        <StandardColumn>
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            When Claude Makes a Mess — The Recovery Hierarchy
          </p>
          <BodyText>
            Claude will attempt to fix one thing and break three others. It&apos;ll
            rewrite files it shouldn&apos;t have touched. Here&apos;s your escalation path:
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-6">
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-body)', color: '#DCA14C' }}
          >
            Level 1: Single File Rollback
          </p>
          <CodeBlock
            code="git checkout -- path/to/broken/file"
            language="bash"
            caption="Reverts one file to its last committed state"
            bgColor="#592D11"
            accentColor="#DCA14C"
          />
        </StandardColumn>

        <StandardColumn className="mt-6">
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-body)', color: '#E38227' }}
          >
            Level 2: Targeted Rollback
          </p>
          <CodeBlock
            code="git checkout -- src/lib/shaders/utils/effects.glsl.ts src/lib/shaders/types/aurora.frag.ts"
            language="bash"
            caption="Reverts multiple specific files at once"
            bgColor="#592D11"
            accentColor="#E38227"
          />
        </StandardColumn>

        <StandardColumn className="mt-6">
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-body)', color: '#F5241F' }}
          >
            Level 3: Full Rollback
          </p>
          <CodeBlock
            code="git checkout ."
            language="bash"
            caption="Restores ALL files to the last committed state — everything Claude did since the last commit, gone"
            bgColor="#592D11"
            accentColor="#F5241F"
          />
        </StandardColumn>

        <StandardColumn className="mt-6">
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-body)', color: '#8F0300' }}
          >
            Level 4: Starting Over
          </p>
          <BodyText>
            Sometimes the codebase is so tangled that the cleanest option is to rebuild a
            specific feature from scratch. Keep the CSS and visual design but rebuild the
            logic. The new version takes a fraction of the time because you know what
            worked and what didn&apos;t.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* EDITORIAL: First deploy fails */}
      <Section id="things-wrong-first-deploy" treatment="EDITORIAL">
        <StandardColumn>
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The First Deploy Fails (and That&apos;s Fine)
          </p>
          <BodyText>
            Almost everyone&apos;s first deploy fails. Push to Vercel, build fails, panic.
            The error log is full of cryptic messages. Take a breath. Read the error
            message. It&apos;s almost always one of three things:
          </BodyText>
          <BodyText>
            <BoldTerm>TypeScript error</BoldTerm> — a type mismatch your local dev server
            was tolerating but Vercel won&apos;t. The error tells you the exact file and
            line. Tell Claude to fix it.
          </BodyText>
          <BodyText>
            <BoldTerm>Missing environment variable</BoldTerm> — your code references a
            secret that exists locally but not in Vercel&apos;s dashboard. Add it and
            redeploy.
          </BodyText>
          <BodyText>
            <BoldTerm>Missing component or package</BoldTerm> — something got imported
            but not installed. You&apos;ll see &ldquo;Module not found.&rdquo; Install the
            missing thing and push again.
          </BodyText>
          <BodyText>
            Each failed deploy teaches you something about the difference between your
            local environment and production. After a few of these, the failures become
            rare.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* EDITORIAL: When you're stuck */}
      <Section id="things-wrong-stuck" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            I need to be honest about something: building software with AI is not always
            fun. There are moments where you&apos;re exhausted, confused, and wondering
            why you ever thought you could do this. You spend an hour debugging only to
            realize it was a missing semicolon.
          </BodyText>
          <BodyText>
            This is normal. This is especially normal when you&apos;re learning.
            Experienced developers feel this way too — they just recognize it and keep
            going because they&apos;ve been through it enough times to know it passes.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TAKEOVER: The emotional climax — "WALK AWAY." */}
      <Takeover
        id="walk-away"
        headingLevel="h2"
        displayFont="tusker"
        lines={['Walk', 'Away.']}
        preset={COMFORT_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#592D11"
      />

      {/* EDITORIAL: Recovery and future protection */}
      <Section id="things-wrong-protect" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            If you&apos;ve been staring at the same bug for 45 minutes and making no
            progress, close the laptop. Go do something else. Come back later. You will
            almost always see the problem more clearly with fresh eyes.
          </BodyText>
        </StandardColumn>

        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            Remember the 70% problem. The first 70% is exhilarating. The last 30% is a
            grind. Knowing that in advance helps you push through it.
          </p>
        </TheCinematic>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Protecting Against Future Problems
          </p>
          <BodyText>
            <BoldTerm>Commit before every Claude Code session.</BoldTerm> Every time. No
            exceptions. It takes ten seconds and it&apos;s your undo button.
          </BodyText>
          <BodyText>
            <BoldTerm>One thing at a time.</BoldTerm> Don&apos;t ask Claude to fix a bug,
            add a feature, and refactor a component in the same session. Do one, verify,
            commit, then do the next.
          </BodyText>
          <BodyText>
            <BoldTerm>Read the error message.</BoldTerm> Error messages in modern
            frameworks are surprisingly helpful. They tell you the file, the line number,
            and usually what&apos;s wrong.
          </BodyText>
          <BodyText>
            <BoldTerm>Test on the real thing.</BoldTerm> Don&apos;t just check localhost.
            After every significant change, deploy and test the live version.
          </BodyText>
          <BodyText>
            <BoldTerm>Keep your spec updated.</BoldTerm> As your project evolves, update
            the spec. The spec is only useful if it reflects what the project actually is,
            not what it was when you started.
          </BodyText>
        </StandardColumn>
      </Section>
    </>
  )
}
