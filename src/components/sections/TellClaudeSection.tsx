'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { PromptCard } from '@/components/interactive'
import { TELL_CLAUDE_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 3: The Very First Thing You Should Do
 *
 * Green family. Stage Mode. BT Super Eighty.
 * The single most important habit in the guide.
 *
 * Structure:
 * 1. REVEAL: "The Very First Thing You Should Do"
 * 2. TAKEOVER: "Tell Claude You Are Not a Software Engineer" (BT Super Eighty)
 * 3. EDITORIAL: Why this matters
 * 4. INTERACTIVE: The prompt card (precious artifact)
 */
export function TellClaudeSection() {
  return (
    <>
      {/* REVEAL: Section title — creates anticipation */}
      <Reveal
        id="tell-claude-reveal"
        text="The Very First Thing You Should Do"
      />

      {/* TAKEOVER: The single most important sentence in the guide */}
      <Takeover
        id="tell-claude"
        displayFont="bt-super"
        lines={['Tell Claude', 'You Are Not', 'A Software', 'Engineer']}
        preset={TELL_CLAUDE_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#091410"
      />

      {/* EDITORIAL: The explanation */}
      <Section id="tell-claude-why" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Before you start building anything, before you write a spec, before you
            even get into the workflow — the very first thing you should do in any
            conversation with Claude is tell it that you are not a software engineer.
          </BodyText>
          <BodyText>
            A <BoldTerm>software engineer</BoldTerm> — sometimes shortened to{' '}
            <BoldTerm>SWE</BoldTerm> (pronounced &ldquo;swee&rdquo;) — is someone who
            writes code professionally. They went to school for it, or taught themselves
            over years, and they speak the language of code fluently. You&apos;re not that.
            And that&apos;s completely fine, but Claude needs to know that.
          </BodyText>
          <BodyText>
            Why? Because by default, Claude will talk to you like you&apos;re a developer.
            It&apos;ll throw around terms, skip explanations, and make assumptions about
            what you already know. And you&apos;ll sit there nodding, feeling like you&apos;re
            supposed to understand, while quietly getting lost. I know this because I did
            exactly that for a while before I realized I could just... tell it to stop.
          </BodyText>
        </StandardColumn>

        {/* The prompt card — first precious artifact */}
        <StandardColumn className="mt-8">
          <PromptCard
            prompt="I'm not a software engineer. Explain everything to me clearly. When you make a decision, explain the philosophy behind your approach — why you're doing it this way and not another way. When you use a technical term, define it. Be an explanatory partner, not just an executor."
            label="Your first prompt"
            gradientFrom="#1E7C40"
            gradientTo="#78DB89"
          />
        </StandardColumn>

        <StandardColumn className="mt-12">
          <BodyText>
            That last part is important. You don&apos;t just want Claude to do things —
            you want to understand what it&apos;s doing and why. This is how you actually
            learn. This is how you go from feeling like you&apos;re blindly trusting an AI
            to feeling like you have a genuine grasp of what&apos;s being built.
          </BodyText>
          <BodyText>
            Over time, you&apos;ll start recognizing patterns. You&apos;ll know what a{' '}
            <BoldTerm>component</BoldTerm> is (a reusable piece of your interface — a
            button, a navigation bar, a card), what an API call looks like, why something
            is structured a certain way. Not because you studied computer science, but
            because Claude explained it to you in context, in real time, while building
            your actual project.
          </BodyText>
        </StandardColumn>

        {/* The closing beat */}
        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            This one habit — setting the expectation upfront that Claude should be your
            teacher, not just your builder — changes everything about the experience.
          </p>
        </TheCinematic>
      </Section>
    </>
  )
}
