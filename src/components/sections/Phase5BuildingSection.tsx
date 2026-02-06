'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { PromptCard } from '@/components/interactive'
import { BUILDING_GRADIENT } from '@/lib/data/gradientPresets'
import { DRAMATIC_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 12: Phase 5 — Building
 *
 * Blue/Purple (blue end). Frame + Stage. BT Super Eighty.
 * Peak intensity. The longest, most focused phase.
 *
 * Structure:
 * 1. REVEAL: "Phase 5: Building"
 * 2. EDITORIAL: Setup, atomic slices, progress file
 * 3. EDITORIAL + PromptCard: Running autonomously
 * 4. EDITORIAL: QA (Playwright, CforC)
 * 5. TAKEOVER: "THE MOST POWERFUL PROMPT IN THIS ENTIRE GUIDE" (BT Super Eighty)
 * 6. PromptCard: The 1-to-10 quality prompt (maximum visual prominence)
 * 7. EDITORIAL: Recursive quality loop
 */
export function Phase5BuildingSection() {
  return (
    <>
      {/* REVEAL: Phase title */}
      <Reveal
        id="phase-5-reveal"
        text="Phase 5: Building"
      />

      {/* EDITORIAL: Setup and atomic slices */}
      <Section id="phase-5-setup" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            You&apos;ve got your idea. You&apos;ve done your research. You&apos;ve written
            the spec. You&apos;ve created the plan. Now it&apos;s time to actually build
            the thing.
          </BodyText>
          <BodyText>
            This is where you move from Claude Chat to Claude Code. You&apos;re going from
            the whiteboard to the construction site. And the way you run this matters a lot,
            because Claude has a tendency to cut corners on big plans — not out of malice,
            but because it&apos;s trying to be efficient, and its version of
            &ldquo;efficient&rdquo; often means &ldquo;surface-level.&rdquo;
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Set Up Your Project Folder
          </p>
          <BodyText>
            Before Claude Code starts writing anything, you want a clean, organized place
            for everything to live. Have Claude create a project folder with your spec,
            your plan, and a blank file called <BoldTerm>progress.md</BoldTerm>. This way,
            all of your planning documents and tracking are in one place, right alongside
            the code. Claude can reference the spec when it needs to remember what
            it&apos;s building, check the plan for what comes next, and log its work in
            progress.md as it goes.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Atomic Slices
          </p>
          <BodyText>
            Break your plan down into <BoldTerm>atomic slices</BoldTerm> — the smallest
            possible unit of work that produces a complete, testable result.
            &ldquo;Atomic&rdquo; means it can&apos;t be broken down any further. Not
            &ldquo;build the dashboard&rdquo; — that&apos;s too big. More like
            &ldquo;create the dashboard page layout with the sidebar navigation and empty
            content area.&rdquo;
          </BodyText>
          <BodyText>
            Each slice should be a <BoldTerm>vertical slice</BoldTerm> — meaning it goes
            top to bottom, frontend to backend, and produces something you can actually
            see and verify when it&apos;s done.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* EDITORIAL: Why atomic slices matter */}
      <Section id="phase-5-why-atomic" treatment="EDITORIAL">
        <StandardColumn>
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Why Atomic Slices Matter
          </p>
          <BodyText>
            Claude struggles with big plans. Give it a 2,000-word plan and say
            &ldquo;build this,&rdquo; and one of two things will happen. Either it&apos;ll
            lose its place halfway through and start skipping things, or it&apos;ll take
            shortcuts to get to &ldquo;done&rdquo; faster — doing surface-level
            implementations instead of actually following the plan.
          </BodyText>
          <BodyText>
            Atomic slices remove that temptation. Claude isn&apos;t looking at a massive
            plan and trying to figure out how to get through all of it. It&apos;s looking
            at one small, clear task. Do this one thing. Make it work. Mark it done. Move
            to the next one.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* EDITORIAL + PromptCard: Running autonomously */}
      <Section id="phase-5-autonomous" treatment="EDITORIAL">
        <StandardColumn>
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Running Autonomously
          </p>
          <BodyText>
            Once you&apos;ve got your atomic slices defined and your progress file set up,
            you can essentially let Claude run on its own. Claude will work through the
            slices sequentially — building, testing, logging, moving on. You don&apos;t
            have to babysit every single step.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-8">
          <PromptCard
            prompt="Follow the plan, one atomic slice at a time. Complete each slice, test it, log your progress in progress.md, and move to the next one. Don't skip anything. Don't defer anything to later. Complete each slice fully before moving on."
            label="The autonomous building prompt"
            gradientFrom="#3500FF"
            gradientTo="#00FFC5"
          />
        </StandardColumn>

        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            You&apos;ve done all the hard thinking upfront. Now Claude is executing a
            well-defined set of instructions, and the structure you built is what keeps it
            honest.
          </p>
        </TheCinematic>
      </Section>

      {/* EDITORIAL: QA */}
      <Section id="phase-5-qa" treatment="EDITORIAL">
        <StandardColumn>
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Quality Assurance
          </p>
          <BodyText>
            <BoldTerm>Playwright</BoldTerm> is a tool that lets Claude open a web browser
            and use it like a person would — clicking buttons, filling in forms, navigating
            between pages, and checking that things behave the way they&apos;re supposed
            to. It&apos;s basically a robot that operates a browser.
          </BodyText>
          <BodyText>
            <BoldTerm>Claude for Chrome</BoldTerm> is better for the kind of QA where you
            want Claude to actually look at your app the way a user would. You can point it
            at your localhost and ask it to evaluate what it sees.
          </BodyText>
          <BodyText>
            I typically use Playwright during the build — having Claude test each slice as
            it goes. Then once Claude says it&apos;s done with the full plan, I use Claude
            for Chrome to do a more thorough visual walkthrough. It&apos;s the difference
            between checking each room as you build it versus doing a full walk-through of
            the finished house.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TAKEOVER: The most powerful prompt */}
      <Takeover
        id="most-powerful-prompt"
        headingLevel="h2"
        displayFont="bt-super"
        lines={['The Most', 'Powerful', 'Prompt In', 'This Entire', 'Guide']}
        preset={BUILDING_GRADIENT}
        animation={DRAMATIC_BREATHE}
        fallbackColor="#150B49"
      />

      {/* The actual prompt — maximum visual prominence */}
      <Section id="phase-5-the-prompt" treatment="EDITORIAL">
        <StandardColumn>
          <PromptCard
            prompt="On a scale of 1 to 10, if graded against a comprehensive list against the plan that we're executing and the spec, how would you grade execution? If it's less than a 9, don't stop until you get to a 9 or higher."
            label="The recursive quality prompt"
            gradientFrom="#3500FF"
            gradientTo="#00FFC5"
            featured
          />
        </StandardColumn>
      </Section>

      {/* EDITORIAL: Why this works */}
      <Section id="phase-5-quality-loop" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Claude — like a human — will often do a subpar job just to get to
            &ldquo;done&rdquo; more quickly. It&apos;ll implement something at 70% quality,
            say it&apos;s finished, and move on. Not because it can&apos;t do better, but
            because &ldquo;good enough&rdquo; is faster than &ldquo;excellent.&rdquo;
          </BodyText>
          <BodyText>
            What happens when you ask Claude to grade itself is genuinely surprising.
            It&apos;ll go back, re-read the spec and the plan, compare what it actually
            built against what it was supposed to build, and almost every time it&apos;ll
            find things it missed. Then it fixes them. And if it still rates itself below
            a 9, it keeps going.
          </BodyText>
          <BodyText>
            This creates a <BoldTerm>recursive quality loop</BoldTerm> — Claude checks its
            work, finds gaps, fixes them, checks again, fixes again, until it hits the
            standard you set. It is the single biggest lever you have for getting from
            &ldquo;this technically works&rdquo; to &ldquo;this is actually good.&rdquo;
          </BodyText>
        </StandardColumn>
      </Section>
    </>
  )
}
