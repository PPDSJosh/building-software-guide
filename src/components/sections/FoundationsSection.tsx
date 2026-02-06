'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, TheSplit, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { FOUNDATIONS_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 2: What Is Software, Actually?
 *
 * Blue/Purple family. Frame Mode. Tusker Grotesk.
 * The conceptual foundation — demystifying what software is.
 *
 * Structure:
 * 1. REVEAL: "What Is Software, Actually?" (Canela Thin section title)
 * 2. TAKEOVER: "Code + Database" (Tusker — forceful demystification)
 * 3. EDITORIAL: The two-things explanation
 * 4. REVEAL: Frontend/backend distinction
 * 5. EDITORIAL: APIs explanation
 */
export function FoundationsSection() {
  return (
    <>
      {/* REVEAL: Section title */}
      <Reveal
        id="foundations-reveal"
        text="What Is Software, Actually?"
      />

      {/* TAKEOVER: The core demystification */}
      <Takeover
        id="foundations"
        displayFont="tusker"
        lines={['Software Is', 'Code +', 'Database']}
        preset={FOUNDATIONS_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#150B49"
      />

      {/* EDITORIAL: The core explanation */}
      <Section id="foundations-core" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Before we get into anything, let&apos;s demystify what software actually is,
            because it&apos;s simpler than people think.
          </BodyText>
          <BodyText>
            Software is really just two things working together:
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
                Thing One
              </p>
              <p
                className="mb-4"
                style={{
                  fontFamily: 'var(--font-canela)',
                  fontWeight: 100,
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  lineHeight: 1.15,
                }}
              >
                Code
              </p>
              <BodyText>
                Instructions written in a programming language that tell a computer what to do.
                &ldquo;When someone clicks this button, show them this screen.&rdquo;
                &ldquo;When someone types in their email and hits submit, save that email
                somewhere.&rdquo; That&apos;s what code does. It&apos;s a set of instructions.
              </BodyText>
            </div>
          }
          right={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Thing Two
              </p>
              <p
                className="mb-4"
                style={{
                  fontFamily: 'var(--font-canela)',
                  fontWeight: 100,
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  lineHeight: 1.15,
                }}
              >
                A Database
              </p>
              <BodyText>
                A collection of tables that store information. Think of it like a really
                organized spreadsheet. You&apos;ve got a table for users (their names, emails,
                passwords). A table for invoices (amounts, dates, who it&apos;s for). Every row
                is a record. Every column is a piece of information about that record.
              </BodyText>
            </div>
          }
        />

        {/* The "that's it" moment */}
        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            That&apos;s it. Code talks to tables. Tables store and return information.
          </p>
        </TheCinematic>

        {/* Detailed explanation */}
        <StandardColumn className="mt-12">
          <BodyText>
            Code presents that information to the person using the app. When you sign into an
            app and see your name in the top right corner, that&apos;s code pulling your name
            from a table and displaying it. When you save a document, that&apos;s code writing
            information into a table.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* REVEAL: Frontend/Backend distinction */}
      <Reveal
        id="frontend-backend-reveal"
        text="Frontend &amp; Backend"
      />

      <Section id="foundations-frontback" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Every piece of software has two sides. The <BoldTerm>frontend</BoldTerm> is the part people
            see and interact with — buttons, layouts, animations, text, images. When you&apos;re
            looking at a website, you&apos;re looking at the frontend. The <BoldTerm>backend</BoldTerm> is
            everything happening behind the scenes — the database, the logic that processes
            payments, the code that sends emails, the security rules. You&apos;ll hear these terms
            constantly, and they just mean &ldquo;the visible part&rdquo; and &ldquo;the invisible part.&rdquo;
          </BodyText>
          <BodyText>
            It can get complex — there are layers, security rules, real-time updates,{' '}
            <BoldTerm>APIs</BoldTerm> (Application Programming Interfaces — ways for different pieces
            of software to talk to each other, like a waiter taking your order to the kitchen
            and bringing back your food) that let different systems communicate — but at its
            core, all software is instructions communicating with organized information. Once
            you understand that, everything else is just detail.
          </BodyText>
        </StandardColumn>
      </Section>
    </>
  )
}
