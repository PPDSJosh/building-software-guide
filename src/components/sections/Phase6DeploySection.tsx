'use client'

import { Section } from './Section'
import { Reveal } from './Reveal'
import { StandardColumn, TheSplit, BodyText, BoldTerm } from '@/components/editorial'
import { CodeBlock, Checklist } from '@/components/interactive'

/**
 * Section 13: Phase 6 — Deployment
 *
 * Green family. Frame Mode. Bulevar Poster.
 * Release. Shipping to the real internet.
 *
 * Structure:
 * 1. REVEAL: "Phase 6: Deployment"
 * 2. EDITORIAL: What deployment is, the flow
 * 3. EDITORIAL: First deploy, TypeScript errors, env vars
 * 4. CodeBlock: Environment variables list
 * 5. REVEAL: "Works Locally, Breaks on Vercel"
 * 6. EDITORIAL: Lazy init, custom domains, DNS, webhooks
 * 7. Checklist: The deployment checklist
 */
export function Phase6DeploySection() {
  return (
    <>
      {/* REVEAL: Phase title */}
      <Reveal
        id="phase-6-reveal"
        text="Phase 6: Deployment"
      />

      {/* EDITORIAL: What deployment is */}
      <Section id="phase-6-what" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            You&apos;ve built the thing. You&apos;ve QA&apos;d it. It works on localhost.
            Now it&apos;s time for the moment where your app goes from something only you
            can see to something anyone on the internet can visit.
          </BodyText>
          <BodyText>
            Remember how your app runs on localhost — your computer reading code files and
            showing you the result? Deployment is getting someone else&apos;s computer to do
            that same thing, except their computer is connected to the internet 24/7 and
            has a real URL that anyone can type in.
          </BodyText>
          <BodyText>
            That &ldquo;someone else&apos;s computer&rdquo; is a <BoldTerm>server</BoldTerm>.
            I use <BoldTerm>Vercel</BoldTerm>, and I&apos;d recommend you do too. The flow:
            you make changes locally, push to GitHub, Vercel automatically detects the push,
            builds your app, and deploys it to a live URL. That automatic connection is
            called <BoldTerm>continuous deployment</BoldTerm>.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* EDITORIAL: First deploy */}
      <Section id="phase-6-first-deploy" treatment="EDITORIAL">
        <TheSplit
          left={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                TypeScript errors
              </p>
              <BodyText>
                TypeScript is a strict librarian. When you&apos;re working locally, your dev
                server is forgiving. Vercel is not. If TypeScript finds any error, the build
                fails. Period. The fix: run{' '}
                <BoldTerm>npx tsc --noEmit</BoldTerm> locally before you push.
              </BodyText>
            </div>
          }
          right={
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Environment variables
              </p>
              <BodyText>
                Your .env.local file doesn&apos;t go to Vercel. You have to manually add
                every single environment variable to Vercel&apos;s dashboard. Miss one, and
                your app will work in some contexts but mysteriously fail in others.
              </BodyText>
            </div>
          }
        />

        <StandardColumn className="mt-8">
          <CodeBlock
            code={`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=`}
            language="Environment Variables"
            caption="Typical env vars for a Next.js app with Supabase and Stripe"
            bgColor="#142819"
            accentColor="#78DB89"
          />
        </StandardColumn>
      </Section>

      {/* REVEAL: The universal experience */}
      <Reveal
        id="works-locally-breaks"
        text="&ldquo;Works Locally, Breaks on Vercel.&rdquo;"
      />

      {/* EDITORIAL: Fixes and deeper concepts */}
      <Section id="phase-6-fixes" treatment="EDITORIAL">
        <StandardColumn>
          <BodyText>
            Beyond TypeScript and env vars, the most common cause is{' '}
            <BoldTerm>build-time vs. runtime initialization</BoldTerm>. Your code might
            create a Supabase client at the top of a file — at the module level — which
            means it tries to run when the file first loads. On Vercel during the build
            step, those environment variables might not be available yet.
          </BodyText>
          <BodyText>
            The fix is <BoldTerm>lazy initialization</BoldTerm> — instead of creating the
            client when the file loads, you create it the first time it&apos;s actually
            needed. Tell Claude: &ldquo;Make sure all client initializations use lazy
            initialization so they don&apos;t fail during Vercel builds.&rdquo;
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Custom Domains &amp; DNS
          </p>
          <BodyText>
            <BoldTerm>DNS</BoldTerm> (Domain Name System) is like a phone book for the
            internet. For a subdomain, add a <BoldTerm>CNAME record</BoldTerm> pointing to{' '}
            <BoldTerm>cname.vercel-dns.com</BoldTerm>. For a root domain, add an{' '}
            <BoldTerm>A record</BoldTerm> pointing to <BoldTerm>76.76.21.21</BoldTerm>.
            Then add the domain in Vercel&apos;s dashboard. Vercel automatically provisions
            an SSL certificate.
          </BodyText>
        </StandardColumn>

        <StandardColumn className="mt-12">
          <p
            className="text-xs uppercase tracking-widest mb-6 opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Webhooks
          </p>
          <BodyText>
            A <BoldTerm>webhook</BoldTerm> is like a doorbell — Stripe rings your
            app&apos;s doorbell every time something happens, like a successful payment.
            You create it in Stripe&apos;s dashboard, point it to a URL on your live app,
            and Stripe gives you a signing secret. Webhooks only work with your deployed
            URL — they can&apos;t reach localhost.
          </BodyText>
        </StandardColumn>
      </Section>

      {/* INTERACTIVE: Deployment checklist */}
      <Section id="phase-6-checklist" treatment="EDITORIAL">
        <StandardColumn>
          <Checklist
            title="The Deployment Checklist"
            accentColor="#78DB89"
            items={[
              'Run npx tsc --noEmit locally — catches TypeScript errors before Vercel does',
              'Make sure all environment variables are set in Vercel — same keys as your .env.local',
              'Check that no client initializations happen at module level — use lazy initialization',
              'Commit and push to GitHub — Vercel auto-deploys',
              'Watch the build log — if it fails, the error message tells you what\'s wrong',
              'After successful deploy, test the live version — don\'t assume it works just because it built',
            ]}
          />
        </StandardColumn>
      </Section>
    </>
  )
}
