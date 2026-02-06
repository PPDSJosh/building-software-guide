'use client'

import { GridContainer, ContentZone } from '@/components/ui/Grid'
import { Section } from '@/components/sections/Section'
import { Breath } from '@/components/sections/Breath'
import { Takeover } from '@/components/sections/Takeover'
import { FoundationsSection } from '@/components/sections/FoundationsSection'
import { TellClaudeSection } from '@/components/sections/TellClaudeSection'
import { HowCodeLivesSection } from '@/components/sections/HowCodeLivesSection'
import { SetupSection } from '@/components/sections/SetupSection'
import { ToolSections } from '@/components/sections/ToolSections'
import { BeforeYouStartSection } from '@/components/sections/BeforeYouStartSection'
import { Phase1IdeaSection } from '@/components/sections/Phase1IdeaSection'
import { Phase2ResearchSection } from '@/components/sections/Phase2ResearchSection'
import { Phase3SpecSection } from '@/components/sections/Phase3SpecSection'
import { Phase4PlanSection } from '@/components/sections/Phase4PlanSection'
import { Phase5BuildingSection } from '@/components/sections/Phase5BuildingSection'
import { Phase6DeploySection } from '@/components/sections/Phase6DeploySection'
import { Phase7MaintenanceSection } from '@/components/sections/Phase7MaintenanceSection'
import { WhenThingsGoWrongSection } from '@/components/sections/WhenThingsGoWrongSection'
import { GlossarySection } from '@/components/sections/GlossarySection'
import { SUBTLE_BREATHE, DRAMATIC_BREATHE, EDITORIAL_DRIFT } from '@/components/gradient/GradientPlane'
import {
  HERO_GRADIENT,
  HERO_STAGE_MID,
  HERO_STAGE_FG,
} from '@/lib/data/gradientPresets'

export default function Home() {
  return (
    <>
      {/* ================================================================
          SECTION 1: HERO / OPENING — TAKEOVER
          Gold family. Stage Mode. Tusker Grotesk.
          The first thing the reader sees. Sets the entire visual language.
          ================================================================ */}
      <Takeover
        id="hero"
        displayFont="tusker"
        lines={['Building', 'Software', 'With', 'Claude Code']}
        subtitle="A guide for non-engineers by Josh Bull"
        preset={HERO_GRADIENT}
        animation={DRAMATIC_BREATHE}
        fallbackColor="#592D11"
        startAssembled
        headingLevel="h1"
        additionalPlanes={[
          {
            preset: HERO_STAGE_MID,
            animation: SUBTLE_BREATHE,
            fallbackColor: '#680300',
          },
          {
            preset: HERO_STAGE_FG,
            animation: EDITORIAL_DRIFT,
            fallbackColor: '#150B49',
          },
        ]}
      />

      {/* "How to Use This Guide" — warm handshake after the visual explosion */}
      <Section id="hero-intro" treatment="EDITORIAL">
        <GridContainer>
          <ContentZone zone="narrow">
            <p
              style={{
                fontFamily: 'var(--font-body)',
                maxWidth: 'var(--body-max-width)',
                lineHeight: 1.7,
              }}
            >
              This guide is for people who have ideas for software but have never written code.
              It will teach you how to use Claude Code to turn those ideas into real, working
              applications — from your very first terminal command to deploying something people
              can actually use.
            </p>
            <p
              className="mt-6"
              style={{
                fontFamily: 'var(--font-body)',
                maxWidth: 'var(--body-max-width)',
                lineHeight: 1.7,
              }}
            >
              You don&apos;t need to become a programmer to build software. You need to learn
              how to think about software clearly enough to tell an AI what to build. That&apos;s
              what this guide teaches.
            </p>
          </ContentZone>
        </GridContainer>
      </Section>

      {/* BREATH: Hero (Gold) → Foundations (Blue/Purple) */}
      <Breath
        id="breath-hero-foundations"
        outgoingDeep="#592D11"
        bridgeColor="#680300"
        incomingDeep="#150B49"
        fallbackColor="#592D11"
      />

      {/* ================================================================
          SECTION 2: FOUNDATIONS — "What Is Software, Actually?"
          Blue/Purple family. Frame Mode. BT Super Eighty.
          ================================================================ */}
      <FoundationsSection />

      {/* BREATH: Foundations (Blue) → Tell Claude (Green) */}
      <Breath
        id="breath-foundations-tellclaude"
        outgoingDeep="#150B49"
        bridgeColor="#006653"
        incomingDeep="#091410"
        fallbackColor="#150B49"
      />

      {/* ================================================================
          SECTION 3: TELL CLAUDE — "The Very First Thing You Should Do"
          Green family. Stage Mode. BT Super Eighty.
          ================================================================ */}
      <TellClaudeSection />

      {/* BREATH: Tell Claude (Green) → How Code Lives (Blue/Purple violet) */}
      <Breath
        id="breath-tellclaude-howcode"
        outgoingDeep="#091410"
        bridgeColor="#480C79"
        incomingDeep="#150B49"
        fallbackColor="#091410"
      />

      {/* ================================================================
          SECTION 4: HOW CODE LIVES ON YOUR COMPUTER
          Blue/Purple (violet end). Frame + Stage. Tusker Grotesk.
          ================================================================ */}
      <HowCodeLivesSection />

      {/* BREATH: How Code Lives (Blue/Purple) → Setup (Gold) */}
      <Breath
        id="breath-howcode-setup"
        outgoingDeep="#150B49"
        bridgeColor="#680300"
        incomingDeep="#592D11"
        fallbackColor="#150B49"
      />

      {/* ================================================================
          SECTION 5: SETTING UP YOUR WORKSHOP
          Gold family. Frame Mode. BT Super Eighty.
          ================================================================ */}
      <SetupSection />

      {/* BREATH: Setup (Gold) → Tool Sections (Teal) */}
      <Breath
        id="breath-setup-tools"
        outgoingDeep="#592D11"
        bridgeColor="#1C3C3D"
        incomingDeep="#122526"
        fallbackColor="#592D11"
      />

      {/* ================================================================
          SECTION 6: CLAUDE.MD + THREE CLAUDES + MCPs
          Teal family. Frame + Stage. Tusker Grotesk.
          ================================================================ */}
      <ToolSections />

      {/* BREATH: Tool Sections (Teal) → Before You Start (Red) */}
      <Breath
        id="breath-tools-beforestart"
        outgoingDeep="#122526"
        bridgeColor="#8F0300"
        incomingDeep="#680300"
        fallbackColor="#122526"
      />

      {/* ================================================================
          SECTION 7: BEFORE YOU START: TWO THINGS YOU NEED
          Red (terracotta). Stage Mode. Bulevar Poster.
          ================================================================ */}
      <BeforeYouStartSection />

      {/* BREATH: Before You Start (Red) → Phase 1 (Red coral) */}
      <Breath
        id="breath-beforestart-phase1"
        outgoingDeep="#680300"
        bridgeColor="#F5241F"
        incomingDeep="#680300"
        fallbackColor="#680300"
      />

      {/* ================================================================
          SECTION 8: PHASE 1 — YOUR IDEA
          Red (coral end). Stage Mode. BT Super Eighty.
          ================================================================ */}
      <Phase1IdeaSection />

      {/* BREATH: Phase 1 (Red) → Phase 2 (Teal) */}
      <Breath
        id="breath-phase1-phase2"
        outgoingDeep="#680300"
        bridgeColor="#006653"
        incomingDeep="#122526"
        fallbackColor="#680300"
      />

      {/* ================================================================
          SECTION 9: PHASE 2 — RESEARCH
          Teal family. Mix shapes. Bulevar Poster.
          ================================================================ */}
      <Phase2ResearchSection />

      {/* BREATH: Phase 2 (Teal) → Phase 3 (Blue/Purple violet) */}
      <Breath
        id="breath-phase2-phase3"
        outgoingDeep="#122526"
        bridgeColor="#480C79"
        incomingDeep="#150B49"
        fallbackColor="#122526"
      />

      {/* ================================================================
          SECTION 10: PHASE 3 — THE SPEC
          Blue/Purple (violet end). Frame Mode. Tusker Grotesk.
          ================================================================ */}
      <Phase3SpecSection />

      {/* BREATH: Phase 3 (Blue/Purple violet) → Phase 4 (Gold) */}
      <Breath
        id="breath-phase3-phase4"
        outgoingDeep="#150B49"
        bridgeColor="#680300"
        incomingDeep="#592D11"
        fallbackColor="#150B49"
      />

      {/* ================================================================
          SECTION 11: PHASE 4 — THE PLAN
          Gold family. Stage Mode. Bulevar Poster + Tusker Grotesk.
          ================================================================ */}
      <Phase4PlanSection />

      {/* BREATH: Phase 4 (Gold) → Phase 5 (Blue/Purple blue) */}
      <Breath
        id="breath-phase4-phase5"
        outgoingDeep="#592D11"
        bridgeColor="#1B0C6F"
        incomingDeep="#150B49"
        fallbackColor="#592D11"
      />

      {/* ================================================================
          SECTION 12: PHASE 5 — BUILDING
          Blue/Purple (blue end). Frame + Stage. BT Super Eighty.
          ================================================================ */}
      <Phase5BuildingSection />

      {/* BREATH: Phase 5 (Blue/Purple blue) → Phase 6 (Green) */}
      <Breath
        id="breath-phase5-phase6"
        outgoingDeep="#150B49"
        bridgeColor="#006653"
        incomingDeep="#091410"
        fallbackColor="#150B49"
      />

      {/* ================================================================
          SECTION 13: PHASE 6 — DEPLOYMENT
          Green family. Frame Mode. Bulevar Poster.
          ================================================================ */}
      <Phase6DeploySection />

      {/* BREATH: Phase 6 (Green) → Phase 7 (Teal desat) */}
      <Breath
        id="breath-phase6-phase7"
        outgoingDeep="#091410"
        bridgeColor="#41AAAE"
        incomingDeep="#122526"
        fallbackColor="#091410"
      />

      {/* ================================================================
          SECTION 14: PHASE 7 — MAINTENANCE & ITERATION
          Teal (desaturated). Frame Mode. Tusker Grotesk.
          ================================================================ */}
      <Phase7MaintenanceSection />

      {/* BREATH: Phase 7 (Teal) → When Things Go Wrong (Gold light) */}
      <Breath
        id="breath-phase7-wrong"
        outgoingDeep="#122526"
        bridgeColor="#DCA14C"
        incomingDeep="#592D11"
        fallbackColor="#122526"
      />

      {/* ================================================================
          SECTION 15: WHEN THINGS GO WRONG
          Gold (light end) + Red (light end). Ovals only. Tusker Grotesk.
          ================================================================ */}
      <WhenThingsGoWrongSection />

      {/* BREATH: When Things Go Wrong (Gold light) → Glossary (Neutral) */}
      <Breath
        id="breath-wrong-glossary"
        outgoingDeep="#592D11"
        bridgeColor="#969696"
        incomingDeep="#F9F9F9"
        fallbackColor="#592D11"
      />

      {/* ================================================================
          SECTION 16: GLOSSARY
          Neutral family. Frame Mode. Bulevar Regular.
          ================================================================ */}
      <GlossarySection />
    </>
  )
}
