'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheSplit, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { PromptCard } from '@/components/interactive'
import { PHASE3_SPEC_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE, DRAMATIC_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 10: Phase 3 — The Spec
 *
 * Blue/Purple (violet end). Frame Mode. Tusker Grotesk.
 * The most intellectually rigorous section. Authority and depth.
 *
 * Structure:
 * 1. REVEAL: "Phase 3: The Spec"
 * 2. TAKEOVER: "THE SPEC IS THE BIBLE" (Tusker)
 * 3. EDITORIAL: Anatomy of a Spec
 * 4. EDITORIAL + TAKEOVER: SSOT / "ROOMS ON A LOT"
 * 5. EDITORIAL: Have Claude Grade Itself
 * 6. REVEAL: "improve this dramatically"
 * 7. EDITORIAL: Claude Is Terrible at UI
 * 8. TAKEOVER: "DON'T LET CLAUDE GUESS. GIVE IT A SYSTEM." (Tusker)
 */
export function Phase3SpecSection() {
  return (
    <>
      {/* REVEAL: Phase title */}
      <Reveal
        id="phase-3-reveal"
        text="Phase 3: The Spec"
      />

      {/* TAKEOVER: The weight of the spec */}
      <Takeover
        id="spec-is-the-bible"
        displayFont="tusker"
        lines={['The Spec', 'Is The', 'Bible']}
        preset={PHASE3_SPEC_GRADIENT}
        animation={DRAMATIC_BREATHE}
        fallbackColor="#150B49"
      />

      {/* EDITORIAL: What a spec is */}
      <Section id="phase-3-anatomy" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            A <BoldTerm>spec</BoldTerm> (short for specification) is a detailed document
            that describes exactly what you&apos;re building, how it should work, what
            technologies it uses, and how everything connects. It&apos;s the blueprint for
            your software. The more detailed the spec, the better Claude can build what
            you actually want.
          </BodyText>
          <BodyText>
            The spec describes what you&apos;re building — the full picture, all the
            details, the philosophy behind it. Think of it as the blueprint for a house.
            It shows every room, every material, every fixture. It doesn&apos;t tell the
            contractor what order to build things in — that&apos;s the plan — but it tells
            them exactly what the finished house should look like.
          </BodyText>
        </StandardColumn>

        <TheSplit
          className="my-12"
          left={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                What the spec contains
              </p>
              <BodyText>
                <BoldTerm>Philosophy</BoldTerm> — why this exists.{' '}
                <BoldTerm>Tech Stack</BoldTerm> — what tools you&apos;re using.{' '}
                <BoldTerm>Architecture</BoldTerm> — how pieces connect.{' '}
                <BoldTerm>Features</BoldTerm> — every feature in detail.
              </BodyText>
            </div>
          }
          right={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                What makes it strong
              </p>
              <BodyText>
                <BoldTerm>UI Spec</BoldTerm> — the visual system.{' '}
                <BoldTerm>SSOT Structure</BoldTerm> — how things are organized.{' '}
                <BoldTerm>Edge Cases</BoldTerm> — what happens when things go wrong.
              </BodyText>
            </div>
          }
        />
      </Section>

      {/* EDITORIAL: SSOT explanation */}
      <Section id="phase-3-ssot" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            <BoldTerm>Single Source of Truth</BoldTerm>, or <BoldTerm>SSOT</BoldTerm>.
            This is a critical concept. What can happen when building with Claude is that
            it starts to create surface-level versions of what you asked for.
          </BodyText>
          <BodyText>
            Imagine you&apos;re building a house. You say you want three bedrooms, a
            kitchen, two bathrooms. Version one — the version you want — is that it&apos;s
            all connected. There&apos;s a flow. The rooms are in places that make sense.
          </BodyText>
          <BodyText>
            Version two — the version you don&apos;t want — is where Claude looks at it
            at face value and puts one room at the back of the lot, two rooms at the front,
            bathrooms in the middle. It says &ldquo;I built what you wanted.&rdquo;
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TAKEOVER: The devastating analogy */}
      <Takeover
        id="rooms-on-a-lot"
        displayFont="tusker"
        lines={['You Didn\'t', 'Build A', 'House. You', 'Just Put', 'Rooms On', 'A Lot.']}
        preset={PHASE3_SPEC_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#150B49"
      />

      {/* EDITORIAL: Grade itself + dramatically */}
      <Section id="phase-3-grade" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Once the spec is created, ask Claude to grade itself on a scale of 1 to 10
            according to the information that you&apos;ve gathered so far.
          </BodyText>
          <BodyText>
            Usually what will happen is it will find improvements. The best way to get
            those improvements is to say one magic word:
          </BodyText>
        </StandardColumn>
      </Section>

      {/* REVEAL: The recurring motif */}
      <Reveal
        id="dramatically-reveal"
        text="&ldquo;Improve this dramatically.&rdquo;"
      />

      {/* EDITORIAL: Claude is terrible at UI */}
      <Section id="phase-3-ui" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            I&apos;m going to be blunt about this: Claude&apos;s default visual output is
            bad. It&apos;s not bad at code. It&apos;s not bad at logic. But when it comes
            to making something that actually looks good — the colors, the spacing, the
            typography, the overall feel — it will give you something that looks like a
            homework assignment unless you put in the work upfront.
          </BodyText>
          <BodyText>
            This is probably the single biggest gap between what Claude builds out of the
            box and what you actually want. And the fix is the same approach we&apos;ve
            been talking about:
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TAKEOVER: The directive */}
      <Takeover
        id="give-it-a-system"
        displayFont="tusker"
        lines={['Don\'t Let', 'Claude', 'Guess. Give', 'It A System.']}
        preset={PHASE3_SPEC_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#150B49"
      />

      {/* EDITORIAL: How to fix it */}
      <Section id="phase-3-fix-ui" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Describe what you want in broad strokes. Have Claude quiz you about your
            visual preferences. Share visual examples — lots of them — and have Claude
            analyze what it sees in granular detail. Build a UI spec from all of that.
          </BodyText>
          <BodyText>
            And critically: don&apos;t let Claude hardcode styles page by page. Have it
            create a <BoldTerm>theming system</BoldTerm> — a single place where all your
            design decisions live. Every page and every component pulls from that one
            source. Want to change your primary color? One change, done.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-8">
          <PromptCard
            prompt="Create a theme configuration that serves as the single source of truth for all visual styles. Colors, typography, spacing, border radius — everything should reference this theme. No hardcoded values anywhere in the components."
            label="The theming prompt"
            gradientFrom="#8C00FF"
            gradientTo="#3500FF"
          />
        </StandardColumn>
      </Section>
    </>
  )
}
