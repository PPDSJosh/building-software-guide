'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheSplit, TheCinematic, WideArgument, BodyText, BoldTerm } from '@/components/editorial'
import { CodeBlock } from '@/components/interactive'
import { TOOLS_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 6: CLAUDE.md File + Three Claudes + MCPs
 *
 * Teal family. Frame + Stage. Tusker Grotesk for takeover.
 * Three subsections sharing a palette family.
 *
 * Structure:
 * 6a. CLAUDE.md File — REVEAL + EDITORIAL + INTERACTIVE
 * 6b. Three Claudes — REVEAL + EDITORIAL + TAKEOVER: "THINK. BUILD. AUTOMATE."
 * 6c. MCPs — REVEAL + EDITORIAL + REVEAL: "Same brain. Way more useful."
 */
export function ToolSections() {
  return (
    <>
      {/* ===== 6a: THE CLAUDE.MD FILE ===== */}
      <Reveal
        id="claudemd-reveal"
        text="The CLAUDE.md File"
      />

      <Section id="claudemd" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            This deserves its own section because it&apos;s one of the most powerful
            features of Claude Code, and most people don&apos;t realize how much it
            changes the experience.
          </BodyText>
          <BodyText>
            Claude Code looks for a file called <code>CLAUDE.md</code> in the root of
            your project folder. This is like a persistent instruction manual for Claude —
            preferences, patterns, things to avoid, notes about your project. Every time
            Claude Code starts a session, it reads this file first. It means you&apos;re
            not re-explaining your preferences every single session.
          </BodyText>
          <BodyText>
            But here&apos;s the thing most people don&apos;t know: there are actually two
            levels of CLAUDE.md, and using both is a game-changer.
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
                Project Level
              </p>
              <p
                className="mb-4"
                style={{
                  fontFamily: 'var(--font-canela)',
                  fontWeight: 100,
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  lineHeight: 1.2,
                }}
              >
                Lives in your project folder
              </p>
              <BodyText>
                Contains instructions specific to this project — tech stack, architecture,
                rules, naming conventions, current status. Grounds Claude in your
                project&apos;s reality.
              </BodyText>
            </div>
          }
          right={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Global Level
              </p>
              <p
                className="mb-4"
                style={{
                  fontFamily: 'var(--font-canela)',
                  fontWeight: 100,
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  lineHeight: 1.2,
                }}
              >
                Lives in your home directory
              </p>
              <BodyText>
                Contains your personal preferences and working style — things that are
                true no matter what you&apos;re building. Your baseline expectations.
              </BodyText>
            </div>
          }
        />

        <StandardColumn>
          <CodeBlock
            code={`# Project: MyApp\n\n## Tech Stack\n- Next.js 14 with App Router\n- Tailwind CSS for styling\n- Supabase for backend\n- GSAP for animations\n\n## Rules\n- ALWAYS use the theme config for colors\n- NEVER hardcode color values\n- All new components must be responsive`}
            language="CLAUDE.md (project level)"
            bgColor="#1C3C3D"
            accentColor="#41AAAE"
          />
        </StandardColumn>

        <StandardColumn className="mt-12">
          <BodyText>
            The global file is your baseline. The project file adds specifics on top of
            it. Together, they mean Claude starts every session already knowing who you
            are, how you work, and what you expect.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* ===== 6b: THE THREE CLAUDES ===== */}
      <Reveal
        id="three-claudes-reveal"
        text="The Three Claudes (and When to Use Each)"
      />

      <Section id="three-claudes" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            There are three different ways to work with Claude, and they each have their
            place. Understanding when to use which one is a huge part of working
            effectively.
          </BodyText>
        </StandardColumn>

        <WideArgument
          className="my-12"
          columns={[
            <div key="chat">
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-body)', color: '#41AAAE' }}
              >
                Claude Chat
              </p>
              <BodyText>
                The thinking partner. Use for planning, strategy, writing specs, research,
                brainstorming. Claude Chat is the brain — it&apos;s where you think.
              </BodyText>
            </div>,
            <div key="code">
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-body)', color: '#3500FF' }}
              >
                Claude Code
              </p>
              <BodyText>
                The hands. Runs in your terminal, has direct access to your files. Use for
                building features, debugging, file editing, running commands, executing
                specs.
              </BodyText>
            </div>,
            <div key="chrome">
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: 'var(--font-body)', color: '#00FFC5' }}
              >
                Claude for Chrome
              </p>
              <BodyText>
                The browser automation tool. It can see your screen, click things, type
                things, navigate tabs. Use for repetitive browser tasks and orchestration.
              </BodyText>
            </div>,
          ]}
        />
      </Section>

      {/* TAKEOVER: The distillation */}
      <Takeover
        id="think-build-automate"
        headingLevel="h2"
        displayFont="tusker"
        lines={['Think', 'Build', 'Automate']}
        preset={TOOLS_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#122526"
      />

      <Section id="three-claudes-key" treatment="EDITORIAL">
        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            You plan in Chat, build in Code, and automate repetitive browser work with
            Claude for Chrome. Use the right tool for the right job.
          </p>
        </TheCinematic>
      </Section>

      {/* ===== 6c: MCPs ===== */}
      <Reveal
        id="mcps-reveal"
        text="MCPs (Model Context Protocol)"
      />

      <Section id="mcps" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            <BoldTerm>MCPs</BoldTerm> are how you give Claude superpowers beyond just
            conversation. An MCP is basically a plugin that connects Claude to an external
            tool or service.
          </BodyText>
          <BodyText>
            Without MCPs, Claude can talk to you but can&apos;t do anything in your actual
            tools. With MCPs, Claude can read and write to your Notion, query your
            database, check your GitHub, manage your files — all directly.
          </BodyText>
        </StandardColumn>

        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            Same brain. Way more useful.
          </p>
        </TheCinematic>

        <StandardColumn className="mt-12">
          <BodyText>
            Think of it like this: Claude without MCPs is a really smart person sitting in
            a room with no phone and no computer. Claude with MCPs is that same smart
            person, but now they have access to your filing cabinet, your calendar, your
            project management tool, and your database.
          </BodyText>
          <BodyText>
            You don&apos;t need all of them right away. Start with the ones that match the
            tools you&apos;re already using. Each one you add makes Claude more capable of
            actually helping you in your real workflow rather than just talking about it.
          </BodyText>
        </StandardColumn>
      </Section>
    </>
  )
}
