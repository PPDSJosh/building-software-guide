'use client'

import { Section } from './Section'
import { Reveal } from './Reveal'
import { StandardColumn, BodyText, BoldTerm } from '@/components/editorial'

/**
 * Section 9: Phase 2 — Research
 *
 * Teal family. Mix shapes. Bulevar Poster.
 * Exploration. Breadth before depth.
 *
 * Structure:
 * 1. REVEAL: "Phase 2: Research"
 * 2. EDITORIAL + INTERACTIVE: Research flow
 */
export function Phase2ResearchSection() {
  return (
    <>
      {/* REVEAL: Phase title */}
      <Reveal
        id="phase-2-reveal"
        text="Phase 2: Research"
      />

      <Section id="phase-2" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            This is where a lot of people skip a step, and it&apos;s a mistake. Claude
            can sometimes default to not going on the internet and doing research. You
            need to push it to do this.
          </BodyText>
          <BodyText>
            Most ideas that you&apos;ll have — there&apos;s a version of it that exists
            already, or components of it that exist already, that you can draw from. Best
            practices, UI patterns, how other people solved the same problem. This is the
            part of the process where research is key.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-8">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            The Research Flow
          </p>
          <ol
            className="space-y-4"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(18px, 2vw, 20px)',
              lineHeight: 1.7,
              counterReset: 'steps',
              listStyle: 'none',
              padding: 0,
            }}
          >
            {[
              'Share your idea statement',
              'Do your questionnaire to gather more information',
              'Have Claude research what\'s already out there — existing products, approaches, patterns',
              'Use that research to add to and refine the information from the questionnaire',
              'Then you\'re ready to build the spec',
            ].map((step, i) => (
              <li
                key={i}
                className="flex gap-4"
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: 'rgba(65, 170, 174, 0.15)',
                    color: '#73CBC4',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                  }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </StandardColumn>
      </Section>
    </>
  )
}
