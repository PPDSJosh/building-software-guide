'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { StandardColumn, TheCinematic, BodyText, BoldTerm } from '@/components/editorial'
import { HOW_CODE_LIVES_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE, DRAMATIC_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 4: How Code Actually Lives on Your Computer
 *
 * Blue/Purple (violet end). Frame + Stage. Tusker Grotesk.
 * The longest foundational section — multiple revelations nested inside teaching.
 *
 * Structure:
 * 1. REVEAL: "How Code Actually Lives on Your Computer"
 * 2. TAKEOVER: "Your Codebase Is Just a Folder" (Tusker)
 * 3. EDITORIAL: Folder structure, file types
 * 4. REVEAL: "The GitHub Connection"
 * 5. EDITORIAL: GitHub explanation
 * 6. REVEAL: "Localhost: Your Private Preview"
 * 7. TAKEOVER: "Only You Can See It" (Tusker)
 * 8. EDITORIAL: Dev server explanation
 * 9. REVEAL: "From Localhost to the Real Internet"
 * 10. EDITORIAL: The full journey
 */
const PIPELINE_STAGES = [
  { label: 'Code Files', sublabel: 'Your folder', color: '#1B0C6F' },
  { label: 'Dev Server', sublabel: 'localhost:3000', color: '#3500FF' },
  { label: 'Vercel', sublabel: 'Deploy to the world', color: '#00FFC5' },
  { label: 'GitHub', sublabel: 'Stores everything', color: '#E4C7FC' },
] as const

function DeployPipeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = containerRef.current
    if (!el || prefersReduced) return

    const stages = el.querySelectorAll('[data-pipeline-stage]')
    const arrows = el.querySelectorAll('[data-pipeline-arrow]')

    gsap.fromTo(
      stages,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      },
    )

    gsap.fromTo(
      arrows,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: 0.4,
        duration: 0.5,
        stagger: 0.15,
        delay: 0.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      },
    )

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === el)
        .forEach((st) => st.kill())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="my-16 px-6 md:px-12 lg:px-20"
      style={{ maxWidth: '1200px', margin: '4rem auto' }}
    >
      {/* Horizontal on md+, vertical on mobile */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.label} className="contents">
            <div
              data-pipeline-stage
              className="flex-1 min-w-0 text-center"
            >
              <div
                className="rounded-lg px-5 py-6"
                style={{
                  backgroundColor: 'rgba(9, 13, 16, 0.8)',
                  border: `1px solid ${stage.color}40`,
                  boxShadow: `0 0 20px ${stage.color}15`,
                }}
              >
                <p
                  className="font-medium mb-1"
                  style={{
                    fontFamily: 'var(--font-canela)',
                    fontWeight: 100,
                    fontSize: 'clamp(14px, 2vw, 20px)',
                    color: stage.color,
                  }}
                >
                  {stage.label}
                </p>
                <p
                  className="text-xs opacity-40"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {stage.sublabel}
                </p>
              </div>
            </div>

            {i < PIPELINE_STAGES.length - 1 && (
              <div
                data-pipeline-arrow
                className="flex-shrink-0 w-10 h-[1px] origin-left"
                style={{
                  backgroundColor: `${stage.color}40`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Vertical stack on mobile */}
      <div className="flex md:hidden flex-col items-stretch gap-3">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.label}>
            <div data-pipeline-stage>
              <div
                className="rounded-lg px-4 py-4 flex items-center gap-4"
                style={{
                  backgroundColor: 'rgba(9, 13, 16, 0.8)',
                  border: `1px solid ${stage.color}40`,
                  boxShadow: `0 0 20px ${stage.color}15`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <div>
                  <p
                    className="font-medium"
                    style={{
                      fontFamily: 'var(--font-canela)',
                      fontWeight: 100,
                      fontSize: '18px',
                      color: stage.color,
                    }}
                  >
                    {stage.label}
                  </p>
                  <p
                    className="text-xs opacity-40"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {stage.sublabel}
                  </p>
                </div>
              </div>
            </div>

            {i < PIPELINE_STAGES.length - 1 && (
              <div
                data-pipeline-arrow
                className="w-[1px] h-4 mx-auto origin-top"
                style={{
                  backgroundColor: `${stage.color}40`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function HowCodeLivesSection() {
  return (
    <>
      {/* REVEAL: Section title */}
      <Reveal
        id="how-code-lives-reveal"
        text="How Code Actually Lives on Your Computer"
      />

      {/* TAKEOVER: The revelation */}
      <Takeover
        id="how-code-lives"
        headingLevel="h2"
        displayFont="tusker"
        lines={['Your', 'Codebase Is', 'Just A', 'Folder']}
        subtitle="That's it. That's the secret."
        preset={HOW_CODE_LIVES_GRADIENT}
        animation={DRAMATIC_BREATHE}
        fallbackColor="#150B49"
      />

      {/* EDITORIAL: Folder structure explanation */}
      <Section id="how-code-lives-folders" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            That&apos;s it. That&apos;s the secret. Your entire app — every page, every
            button, every animation, every piece of logic — is just files sitting in a
            folder on your computer. That folder and everything inside it is called your{' '}
            <BoldTerm>codebase</BoldTerm>. Think of it like a filing cabinet for your
            entire app.
          </BodyText>
          <BodyText>
            The same way you might have a folder on your desktop called &ldquo;Tax
            Documents&rdquo; with a bunch of PDFs inside, your codebase is a folder
            called something like &ldquo;my-app&rdquo; with a bunch of code files inside.
          </BodyText>
          <BodyText>
            When you open that folder, you&apos;ll see other folders and files with names
            like <code>src</code>, <code>components</code>, <code>pages</code>,{' '}
            <code>package.json</code>, <code>tailwind.config.js</code>. These are just
            text files with specific file extensions that tell your computer what kind of
            code is inside. A <code>.js</code> file is JavaScript. A <code>.tsx</code>{' '}
            file is TypeScript with React. A <code>.css</code> file is styling. They&apos;re
            just text files.
          </BodyText>
          <BodyText>
            When Claude Code is building your app, all it&apos;s doing is creating and
            editing text files inside that folder. That&apos;s literally it. It&apos;s not
            doing anything magical. It&apos;s not connecting to some secret server
            somewhere. It&apos;s writing words into files that live on your hard drive,
            the same way you&apos;d write a Word document.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* REVEAL: The GitHub Connection */}
      <Reveal
        id="github-connection"
        text="The GitHub Connection"
      />

      {/* EDITORIAL: GitHub explanation */}
      <Section id="how-code-lives-github" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            So your code is in a folder on your computer. Great. But what if your hard
            drive dies? What if you want to work from a different computer? What if you
            make a change that breaks everything and you want to go back to the version
            from yesterday?
          </BodyText>
          <BodyText>
            That&apos;s where <BoldTerm>GitHub</BoldTerm> comes in. GitHub is the most
            popular place to store your code online — think of it as the Dropbox of code.
            When your codebase is stored on GitHub, it&apos;s called a{' '}
            <BoldTerm>repository</BoldTerm> (or <BoldTerm>repo</BoldTerm> for short).
            It&apos;s the same folder, same files — just backed up online with a history
            of every change you&apos;ve ever made.
          </BodyText>
          <BodyText>
            The connection between your folder and GitHub is managed by a tool called{' '}
            <BoldTerm>Git</BoldTerm> — version control software that tracks every change
            you make to your code so you can go back in time if something breaks. You set
            up that connection once (Claude Code can do this for you), and from then on,
            you&apos;re just pushing and pulling changes back and forth.
          </BodyText>
          <BodyText>
            The key thing to understand: GitHub doesn&apos;t run your app. It doesn&apos;t
            do anything with the code. It just stores it and keeps a history of every
            change you&apos;ve made. It&apos;s a backup system with a really good memory.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* REVEAL: Localhost */}
      <Reveal
        id="localhost-reveal"
        text="Localhost: Your Private Preview"
      />

      {/* TAKEOVER: Only You Can See It */}
      <Takeover
        id="only-you-can-see-it"
        headingLevel="h2"
        displayFont="tusker"
        lines={['Only You', 'Can See It']}
        preset={HOW_CODE_LIVES_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#150B49"
      />

      {/* EDITORIAL: Dev server explanation */}
      <Section id="how-code-lives-localhost" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            When you write code, it&apos;s just text in files. To actually see what that
            code produces — the website, the app, the thing with buttons you can click —
            you need something to read those files and turn them into a visual experience.
            That something is called a <BoldTerm>dev server</BoldTerm> (short for
            development server).
          </BodyText>
          <BodyText>
            When you start your dev server (usually by typing something like{' '}
            <code>npm run dev</code> in your <BoldTerm>terminal</BoldTerm> — a text-based
            interface on your computer where you type commands instead of clicking buttons),
            your computer reads all the code files in your folder and spins up a live,
            working version of your app. It then gives you a link:{' '}
            <code>http://localhost:3000</code>
          </BodyText>
          <BodyText>
            That link is your app, running live, right there on your computer. You can
            click it, interact with it, type into forms, click buttons — it&apos;s the
            real thing. But here&apos;s the crucial part: nobody else on the internet can
            visit <code>localhost:3000</code>. It&apos;s not a real website address.
            &ldquo;Localhost&rdquo; literally means &ldquo;this computer&rdquo; — it&apos;s
            your machine talking to itself.
          </BodyText>
        </StandardColumn>

        <TheCinematic>
          <p style={{ fontFamily: 'var(--font-canela)', fontWeight: 100 }}>
            It&apos;s like having a private screening of a movie in your living room. The
            movie is playing, but only the people in your house can see it.
          </p>
        </TheCinematic>

        <StandardColumn className="mt-12">
          <BodyText>
            Your code files are like a recipe. The dev server is like someone in the
            kitchen actually cooking the recipe and putting a plate in front of you.
            Without the dev server, you just have a bunch of recipe cards sitting on the
            counter. With it, you have a living, breathing, clickable version of your app.
          </BodyText>
          <BodyText>
            When you save a change to one of your code files, the dev server notices
            automatically and updates what you see in the browser — usually instantly.
            So the workflow looks like this: Claude Code writes some code, you open{' '}
            <code>localhost:3000</code> in your browser, and you see the result. That
            loop — write code, see the result, make adjustments — is how the entire
            building process works.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* REVEAL: From Localhost to the Real Internet */}
      <Reveal
        id="localhost-to-internet"
        text="From Localhost to the Real Internet"
      />

      {/* EDITORIAL: The full journey */}
      <Section id="how-code-lives-deploy" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            At some point, you&apos;re going to want other people to see your app.
            That&apos;s when you <BoldTerm>deploy</BoldTerm> it — which just means taking
            your code from your computer and putting it on a service that makes it
            available on the internet. I use <BoldTerm>Vercel</BoldTerm>, a hosting
            service built specifically for the kind of apps we&apos;re building.
          </BodyText>
        </StandardColumn>

        <DeployPipeline />

        <StandardColumn className="mt-12">
          <BodyText>
            But the thing to really internalize is that most of the time, you&apos;re
            just working in a folder on your computer and previewing things at localhost.
            That&apos;s the day-to-day. It&apos;s not as intimidating as it sounds. Once
            you&apos;ve done it once, it becomes as natural as saving a Word doc.
          </BodyText>
        </StandardColumn>
      </Section>
    </>
  )
}
