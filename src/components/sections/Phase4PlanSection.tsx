'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheSplit, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { PromptCard } from '@/components/interactive'
import { PHASE4_PLAN_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE, DRAMATIC_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 11: Phase 4 — The Plan
 *
 * Gold family. Stage Mode. Bulevar Poster + Tusker Grotesk.
 * Structure meets momentum. Architecture of the build.
 *
 * Structure:
 * 1. REVEAL: "Phase 4: The Plan"
 * 2. TAKEOVER: "THE SPEC IS THE WHAT. THE PLAN IS THE HOW." (Bulevar)
 * 3. EDITORIAL: Anatomy of a plan (phases, vertical slices, dependencies, etc.)
 * 4. TheSplit: Wrong way vs. Right way (horizontal vs. vertical)
 * 5. REVEAL: "Comprehensive. Granular. Rigorous."
 * 6. REVEAL: "Dramatically." (motif recurrence)
 * 7. EDITORIAL: Magic words, prompting
 * 8. TAKEOVER: "THE FIRST 70% IS EXHILARATING. THE LAST 30% IS A GRIND." (Tusker)
 * 9. EDITORIAL: Context window, progress tracking
 */
export function Phase4PlanSection() {
  return (
    <>
      {/* REVEAL: Phase title */}
      <Reveal
        id="phase-4-reveal"
        text="Phase 4: The Plan"
      />

      {/* TAKEOVER: The distinction */}
      <Takeover
        id="spec-vs-plan"
        headingLevel="h2"
        displayFont="bulevar"
        lines={['The Spec Is', 'The What.', 'The Plan Is', 'The How.']}
        preset={PHASE4_PLAN_GRADIENT}
        animation={DRAMATIC_BREATHE}
        fallbackColor="#592D11"
      />

      {/* EDITORIAL: What a plan is and why it matters */}
      <Section id="phase-4-anatomy" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            You&apos;ve got a spec. Now you need a plan. These are two different things,
            and understanding the difference is one of the most important concepts in this
            entire guide.
          </BodyText>
          <BodyText>
            The spec describes what you&apos;re building — the full picture. The plan takes
            everything in the spec and breaks it into a sequenced set of steps that Claude
            Code can execute one at a time. If you hand Claude a massive spec and say
            &ldquo;build this,&rdquo; it&apos;ll try to hold the whole thing in its head
            and either get overwhelmed, skip things, or lose its place halfway through.
          </BodyText>
          <BodyText>
            The spec is the blueprint. The plan is the construction schedule. You need both.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Anatomy of a Plan
          </p>
          <BodyText>
            <BoldTerm>Phases</BoldTerm> — the work broken into logical stages. Each one
            delivers something tangible and testable. You should be able to look at the
            result of each phase and see something that works.
          </BodyText>
          <BodyText>
            <BoldTerm>Vertical Slices</BoldTerm> — the organizing principle that makes a
            plan actually useful. Each phase is a complete, working feature from top to
            bottom — frontend, backend, database — rather than building in horizontal
            layers.
          </BodyText>
          <BodyText>
            <BoldTerm>Dependencies</BoldTerm> — what needs to be built before other things
            can work. The plan should sequence things so you&apos;re never trying to build
            something that depends on a piece that doesn&apos;t exist yet.
          </BodyText>
          <BodyText>
            <BoldTerm>Acceptance Criteria</BoldTerm> — for each phase, a clear definition
            of what &ldquo;done&rdquo; looks like. Not &ldquo;login works&rdquo; but
            &ldquo;user can enter their email, receive a magic link, click it, and arrive
            at their dashboard with their name displayed.&rdquo;
          </BodyText>
          <BodyText>
            <BoldTerm>Checkpoints</BoldTerm> — points where you stop, review, and make
            sure everything is solid before moving forward. Never let Claude barrel through
            the entire plan without stopping.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TheSplit: Wrong way vs. right way */}
      <Section id="phase-4-slices" treatment="EDITORIAL">
        <TheSplit
          left={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                The wrong way (horizontal)
              </p>
              <BodyText>
                Build all the database tables first, then all the API routes, then all the
                frontend pages, then wire everything together at the end. This is how you
                end up with a beautiful menu system where half the buttons don&apos;t do
                anything.
              </BodyText>
            </div>
          }
          right={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                The right way (vertical)
              </p>
              <BodyText>
                Build one complete feature that works end to end. User can sign up, see a
                confirmation, and their data is actually saved. Done. Then build the next
                feature. Each slice is testable and shippable on its own.
              </BodyText>
            </div>
          }
        />
      </Section>

      {/* REVEAL: The three magic words */}
      <Reveal
        id="comprehensive-granular-rigorous"
        text="Comprehensive. Granular. Rigorous."
      />

      {/* EDITORIAL: Magic words */}
      <Section id="phase-4-magic-words" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            These three words get better results out of Claude almost all the time. Whether
            you&apos;re in the spec phase, the plan phase, or the building phase — ask
            Claude to make things <BoldTerm>comprehensive</BoldTerm>,{' '}
            <BoldTerm>granular</BoldTerm>, and <BoldTerm>rigorous</BoldTerm>.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* REVEAL: Dramatically — recurring motif */}
      <Reveal
        id="dramatically-reveal-2"
        text="&ldquo;Dramatically.&rdquo;"
      />

      <Section id="phase-4-prompting" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Beyond those, there are a few more phrases that get consistently better results:
          </BodyText>
          <BodyText>
            <BoldTerm>&ldquo;Be tenacious and solve every single problem until it&apos;s
            solved.&rdquo;</BoldTerm> — This prevents Claude from glossing over hard parts
            or saying &ldquo;this is left as an exercise.&rdquo;
          </BodyText>
          <BodyText>
            <BoldTerm>&ldquo;Implement every single element of this plan and fix every
            single problem, deferring or skipping none of them.&rdquo;</BoldTerm> — Claude
            has a tendency to punt on things it finds complicated. This phrase closes that
            door.
          </BodyText>
          <BodyText>
            <BoldTerm>&ldquo;Be sure to think through the UI implications and be extremely
            thoughtful around UI and UX.&rdquo;</BoldTerm> — Claude defaults to making
            things that work but look generic. You have to explicitly tell it to care about
            how things look and feel.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-8">
          <PromptCard
            prompt="Based on this spec, create a comprehensive build plan. Organize it into phases using vertical slices — each phase should deliver a complete, working feature from frontend to backend. Include dependencies, sequencing, and clear acceptance criteria for each phase."
            label="The plan prompt"
            gradientFrom="#E38227"
            gradientTo="#F9A223"
          />
        </StandardColumn>
      </Section>

      {/* TAKEOVER: The 70% Problem */}
      <Takeover
        id="seventy-percent"
        headingLevel="h2"
        displayFont="tusker"
        lines={['The First', '70% Is', 'Exhilarating.', 'The Last 30%', 'Is A Grind.']}
        preset={PHASE4_PLAN_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#592D11"
      />

      {/* EDITORIAL: Context window + progress tracking */}
      <Section id="phase-4-tracking" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Claude has a <BoldTerm>context window</BoldTerm> — a limit on how much it can
            hold in its head at once. In long sessions, it starts to forget earlier parts
            of the conversation. This is called <BoldTerm>context compaction</BoldTerm>,
            and it can cause Claude to lose its place, go in loops, or redo work it already
            did.
          </BodyText>
          <BodyText>
            The fix: have Claude track its progress in an MD file in the codebase. Tell
            Claude: &ldquo;Track your progress in an md file and consult it often. Mark
            down everything you learn and map out.&rdquo; This way, even if it loses
            context, it can read the file and pick up where it left off.
          </BodyText>
        </StandardColumn>

        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            It&apos;s like giving Claude a notebook so it doesn&apos;t have to remember
            everything in its head.
          </p>
        </TheCinematic>
      </Section>
    </>
  )
}
