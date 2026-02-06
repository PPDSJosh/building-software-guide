'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, BodyText } from '@/components/editorial'
import { PromptCard } from '@/components/interactive'
import { PHASE1_IDEA_GRADIENT } from '@/lib/data/gradientPresets'
import { DRAMATIC_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 8: Phase 1 — Your Idea
 *
 * Red (coral end) family. Stage Mode. BT Super Eighty.
 * Short, energetic. The starting gun.
 *
 * Structure:
 * 1. REVEAL: "Phase 1: Your Idea"
 * 2. EDITORIAL: Idea clarity, questionnaire approach
 * 3. TAKEOVER: "DO NOTHING BUT REPEAT THE PLAN BACK TO ME" (BT Super Eighty)
 * 4. EDITORIAL: How to phrase it
 */
export function Phase1IdeaSection() {
  return (
    <>
      {/* REVEAL: Phase title */}
      <Reveal
        id="phase-1-reveal"
        text="Phase 1: Your Idea"
      />

      <Section id="phase-1" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Your idea should be clear. You&apos;re solving a problem, you&apos;re building
            a solution.
          </BodyText>
          <BodyText>
            If it&apos;s helpful, have Claude create a questionnaire after you share your
            initial thoughts on what you want to build. Ask Claude to make the
            questionnaire comprehensive but NOT to waste your time with filler questions.
            The goal is to collect enough pertinent information to get to the next
            important phase: writing a spec.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TAKEOVER: The key technique */}
      <Takeover
        id="repeat-the-plan"
        headingLevel="h2"
        displayFont="bt-super"
        lines={['Do Nothing', 'But Repeat', 'The Plan', 'Back To Me']}
        preset={PHASE1_IDEA_GRADIENT}
        animation={DRAMATIC_BREATHE}
        fallbackColor="#680300"
      />

      <Section id="phase-1-repeat" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            This is a technique I use constantly and it saves an enormous amount of time
            and headache. Before Claude starts building, before it opens any files, before
            it does anything — tell it to repeat the plan back to you.
          </BodyText>
          <BodyText>
            This forces Claude to show you what it thinks you&apos;re asking for.
            You&apos;d be surprised how often it misunderstands something, or has a
            completely different idea of what &ldquo;done&rdquo; looks like than you do.
            It&apos;s much easier to correct a plan than to undo hours of wrong work.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-8">
          <PromptCard
            prompt="Before you start, before you go into any files, repeat the plan back to me. Break it up into parts and do each part. Stop. Consult with me."
            label="Repeat the plan"
            gradientFrom="#F5241F"
            gradientTo="#E38227"
          />
        </StandardColumn>

        <StandardColumn className="mt-12">
          <BodyText>
            This also breaks the work into phases you can approve one at a time, rather
            than Claude running off and doing everything at once and getting lost.
          </BodyText>
        </StandardColumn>
      </Section>
    </>
  )
}
