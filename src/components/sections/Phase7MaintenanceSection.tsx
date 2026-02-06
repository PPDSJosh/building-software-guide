'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { CodeBlock } from '@/components/interactive'
import { PHASE7_MAINTENANCE_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 14: Phase 7 — Maintenance & Iteration
 *
 * Teal (desaturated) family. Frame Mode. Tusker Grotesk.
 * The long game. Steady, ongoing, mature.
 *
 * Structure:
 * 1. REVEAL: "Phase 7: Maintenance"
 * 2. TAKEOVER: "LAUNCHING IS NOT THE END. IT'S BARELY THE BEGINNING." (Tusker)
 * 3. EDITORIAL: Reality of live software, monitoring, hidden dependencies
 * 4. EDITORIAL: Git safety net, commit workflow
 * 5. REVEAL: "Commit early, commit often."
 * 6. EDITORIAL: When to update dependencies, 3GB mystery, keeping Claude honest
 */
export function Phase7MaintenanceSection() {
  return (
    <>
      {/* REVEAL: Phase title */}
      <Reveal
        id="phase-7-reveal"
        text="Phase 7: Maintenance"
      />

      {/* TAKEOVER: The reframe */}
      <Takeover
        id="launching-is-not-the-end"
        displayFont="tusker"
        lines={['Launching', 'Is Not The', 'End. It\u2019s', 'Barely The', 'Beginning.']}
        preset={PHASE7_MAINTENANCE_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#122526"
      />

      {/* EDITORIAL: Reality of live software */}
      <Section id="phase-7-reality" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            When your app is on localhost, only you can break it. When your app is on the
            internet, anything can break it. A user enters an email format you didn&apos;t
            anticipate. Stripe changes how they format webhook data. A browser update
            shifts how CSS renders. A library you depend on releases a new version that
            introduces a bug.
          </BodyText>
          <BodyText>
            This isn&apos;t failure — this is the normal lifecycle of software. The apps
            you use every day have entire teams whose job is just dealing with this ongoing
            reality. You don&apos;t have a team, but you have Claude.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Monitoring
          </p>
          <BodyText>
            <BoldTerm>Vercel Logs</BoldTerm> are your first line of defense. When something
            fails on your live app, the error shows up in Vercel&apos;s dashboard. This is
            the first place to look.
          </BodyText>
          <BodyText>
            <BoldTerm>Browser Console</BoldTerm> (Cmd+Option+I on Mac) shows frontend
            errors. The combination of Vercel logs for backend and browser console for
            frontend covers the vast majority of debugging.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Hidden Dependencies
          </p>
          <BodyText>
            This will happen: you make a small, seemingly innocent change and somehow it
            breaks something completely unrelated. This happens because of{' '}
            <BoldTerm>hidden dependencies</BoldTerm> — pieces of code that are connected
            in ways that aren&apos;t obvious.
          </BodyText>
          <BodyText>
            The fix is structural: <BoldTerm>isolation</BoldTerm>. Every major feature
            should be self-contained. Tell Claude: &ldquo;If you need to change something,
            explain what other parts of the app might be affected before you make the
            change.&rdquo;
          </BodyText>
        </StandardColumn>
      </Section>

      {/* EDITORIAL: Git safety net */}
      <Section id="phase-7-git" treatment="EDITORIAL">
        <StandardColumn>
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Git: Your Safety Net
          </p>
          <BodyText>
            Every time you&apos;re about to make a significant change, commit what you have
            first. It&apos;s like saving your game before a boss fight. If the change goes
            wrong, you can roll back to the last working state with one command.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-8">
          <CodeBlock
            code={`cd ~/Documents/your-project
git add .
git commit -m "Description of what you changed"
git push`}
            language="bash"
            caption="Your commit workflow — do this often"
            bgColor="#1C3C3D"
            accentColor="#41AAAE"
          />
        </StandardColumn>
      </Section>

      {/* REVEAL: The motto */}
      <Reveal
        id="commit-early-often"
        text="Commit early, commit often."
      />

      {/* EDITORIAL: Dependencies, 3GB mystery, keeping Claude honest */}
      <Section id="phase-7-deps" treatment="EDITORIAL">
        <StandardColumn>
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            When to Update Dependencies
          </p>
          <BodyText>
            Here&apos;s my advice: <BoldTerm>don&apos;t update unless you have a
            reason</BoldTerm>. Every update is a risk of breaking something. When you do
            need to update, do it surgically. Update one thing at a time. Test immediately
            after. Commit before and after so you can roll back.
          </BodyText>
        </StandardColumn>

        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            Don&apos;t update your framework, your database library, and your UI components
            all at once. That&apos;s the software equivalent of moving, starting a new job,
            and getting a puppy on the same day.
          </p>
        </TheCinematic>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The 3GB Folder Mystery
          </p>
          <BodyText>
            Your project folder might be 3GB or more, but the vast majority is{' '}
            <BoldTerm>node_modules</BoldTerm> — all the packages your project depends on.
            It&apos;s not your code, it&apos;s not tracked by Git, and if you deleted it
            you could recreate it by running <BoldTerm>npm install</BoldTerm>.
          </BodyText>
          <BodyText>
            When you push to GitHub, you&apos;re only pushing your code — maybe 5-50MB.
            The lesson: push to GitHub regularly. That&apos;s your real backup. The 3GB on
            your hard drive is disposable.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Keeping Claude Honest Over Time
          </p>
          <BodyText>
            When maintaining a project over weeks or months, each conversation with Claude
            is fresh — it doesn&apos;t remember what you talked about last time. This is
            where the spec, the plan, the progress file, and your CLAUDE.md earn their
            keep. When you start a new session, point Claude at those files.
          </BodyText>
          <BodyText>
            I also keep a file called <BoldTerm>KNOWN-ISSUES.md</BoldTerm> in the codebase.
            When I find a bug I&apos;m not fixing right now, I log it there. This file
            becomes incredibly valuable when you sit down to do a maintenance session.
          </BodyText>
        </StandardColumn>
      </Section>
    </>
  )
}
