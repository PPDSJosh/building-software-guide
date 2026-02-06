'use client'

import { Section } from './Section'
import { Takeover } from './Takeover'
import { Reveal } from './Reveal'
import { StandardColumn, BodyText, BoldTerm } from '@/components/editorial'
import { CodeBlock, Checklist } from '@/components/interactive'
import { SETUP_GRADIENT } from '@/lib/data/gradientPresets'
import { SUBTLE_BREATHE } from '@/components/gradient/GradientPlane'

/**
 * Section 5: Setting Up Your Workshop
 *
 * Gold family. Frame Mode. BT Super Eighty.
 * The most procedural section. Grounded, practical, tool-oriented.
 *
 * Structure:
 * 1. REVEAL: "Setting Up Your Workshop"
 * 2. EDITORIAL: Account 1: Claude / Account 2: GitHub
 * 3. REVEAL: "Installing the Foundation" (minor)
 * 4. EDITORIAL + TAKEOVER: "Silence Is Success"
 * 5. EDITORIAL + INTERACTIVE: Claude Code installation, Vercel
 * 6. INTERACTIVE: Setup Checklist
 */
export function SetupSection() {
  return (
    <>
      {/* REVEAL: Section title */}
      <Reveal
        id="setup-reveal"
        text="Setting Up Your Workshop"
      />

      {/* EDITORIAL: Account setup */}
      <Section id="setup-accounts" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Before you write a single line of code — or more accurately, before you ask
            Claude to write a single line of code — you need to set up your tools. Think
            of it like a woodworking shop: you need a workbench, some tools, and a place
            to store your materials before you can build anything.
          </BodyText>
          <BodyText>
            I&apos;m going to be very specific here because I remember what it felt like
            to do this for the first time. Terminal commands that produce no output feel
            broken. Installers that ask for your password feel suspicious. Error messages
            that are actually fine feel like you&apos;ve ruined something. I&apos;ll tell
            you what&apos;s normal and what&apos;s actually a problem.
          </BodyText>
          <BodyText>
            First things first: you need a Claude account. I recommend the{' '}
            <BoldTerm>Max plan</BoldTerm> if you&apos;re going to be doing serious
            development work. The Pro plan is fine for casual use, but when you&apos;re
            building software, you will burn through the Pro plan&apos;s usage limits
            fast. One subscription powers both Claude chat and Claude Code.
          </BodyText>
          <BodyText>
            Next, create a <BoldTerm>GitHub</BoldTerm> account. GitHub is where your code
            lives online. When you sign up for Vercel, you&apos;ll sign in with GitHub.
            When you deploy your app, it pulls from GitHub. When you collaborate with
            anyone, it happens through GitHub. Use your real email and pick a username
            you&apos;re comfortable with.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* REVEAL: Installing the Foundation */}
      <Reveal
        id="setup-foundation-reveal"
        text="Installing the Foundation: Homebrew, Git, and Node.js"
      />

      {/* EDITORIAL: Terminal commands */}
      <Section id="setup-terminal" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Now we get into the terminal. Open your Terminal app — on Mac, hit Command +
            Space, type &ldquo;Terminal,&rdquo; and press Enter. You&apos;re going to see
            a blank screen with a blinking cursor, and that&apos;s fine. That&apos;s what
            it&apos;s supposed to look like.
          </BodyText>
          <BodyText>
            <BoldTerm>Homebrew</BoldTerm> is a <BoldTerm>package manager</BoldTerm> for
            Mac — a tool that installs, updates, and manages other tools and software
            libraries. Think of it as an app store that runs in the terminal.
          </BodyText>
        </StandardColumn>

        <StandardColumn>
          <CodeBlock
            code={`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`}
            language="bash"
            bgColor="#592D11"
            accentColor="#DCA14C"
          />
        </StandardColumn>

        <StandardColumn className="mt-8">
          <BodyText>
            It&apos;ll ask for your Mac password. Type it in — you won&apos;t see the
            characters appear as you type. That&apos;s normal security behavior, not a
            glitch.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* TAKEOVER: Silence Is Success */}
      <Takeover
        id="silence-is-success"
        displayFont="bt-super"
        lines={['Silence', 'Is', 'Success']}
        preset={SETUP_GRADIENT}
        animation={SUBTLE_BREATHE}
        fallbackColor="#592D11"
      />

      {/* EDITORIAL: What silence means + remaining installs */}
      <Section id="setup-installs" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            This is one of the most confusing things about the terminal when you&apos;re
            starting out — silence is success. If something goes wrong, the terminal will
            scream at you. If it says nothing and goes back to the blinking cursor,
            you&apos;re good.
          </BodyText>
          <BodyText>
            After Homebrew, install <BoldTerm>Git</BoldTerm> (version control) and{' '}
            <BoldTerm>Node.js</BoldTerm> (the engine that runs JavaScript):
          </BodyText>
        </StandardColumn>

        <StandardColumn>
          <CodeBlock
            code={`brew install git\ngit config --global user.name "YourGitHubUsername"\ngit config --global user.email "your@email.com"\n\nbrew install node`}
            language="bash"
            bgColor="#592D11"
            accentColor="#DCA14C"
          />
        </StandardColumn>

        <StandardColumn className="mt-8">
          <BodyText>
            Then install <BoldTerm>Claude Code</BoldTerm> — the terminal version of
            Claude, specifically optimized for coding:
          </BodyText>
        </StandardColumn>

        <StandardColumn>
          <CodeBlock
            code={`npm install -g @anthropic-ai/claude-code`}
            language="bash"
            bgColor="#592D11"
            accentColor="#DCA14C"
          />
        </StandardColumn>

        <StandardColumn className="mt-8">
          <BodyText>
            Once installed, navigate to any folder and type <code>claude</code>. The first
            time, it&apos;ll walk you through <BoldTerm>authentication</BoldTerm> — the
            process of proving you are who you say you are. Choose to log in with your
            Claude subscription (not API key).
          </BodyText>
          <BodyText>
            Finally, create a <BoldTerm>Vercel</BoldTerm> account at vercel.com and sign
            up with your GitHub account. Vercel is where your app lives on the internet.
            You don&apos;t need to do anything else with it right now — just having the
            account connected to GitHub is enough.
          </BodyText>
        </StandardColumn>

        {/* INTERACTIVE: Setup Checklist */}
        <StandardColumn className="mt-12">
          <Checklist
            items={[
              'Claude account (Max plan recommended for development)',
              'GitHub account',
              'Homebrew installed (brew --version returns a number)',
              'Git installed and configured (git config --global user.name returns your name)',
              'Node.js installed (node -v returns a version)',
              'Claude Code installed (claude opens the tool)',
              'Vercel account (signed up with GitHub)',
            ]}
            accentColor="#F9A223"
          />
        </StandardColumn>
      </Section>
    </>
  )
}
