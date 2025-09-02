// pages/help.tsx
import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/Layout";

export default function HelpPage() {
  return (
    <>
      {/* MOBILE: render content directly (no Layout) to avoid double header */}
      <div className="md:hidden">
        <Head>
          <title>Help Center • TrenPlay</title>
          <meta
            name="description"
            content="Help Center for TrenPlay: wallets, Tren Coin (TC), divisions, disputes, proof uploads, subscriptions, and safety policies."
          />
        </Head>
        <Content />
      </div>

      {/* DESKTOP: wrap with Layout exactly as before */}
      <div className="hidden md:block">
        <Layout>
          <Head>
            <title>Help Center • TrenPlay</title>
            <meta
              name="description"
              content="Help Center for TrenPlay: wallets, Tren Coin (TC), divisions, disputes, proof uploads, subscriptions, and safety policies."
            />
          </Head>
          <Content />
        </Layout>
      </div>
    </>
  );
}

/** Extracted page body so we can reuse it in both mobile & desktop branches */
function Content() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-white">
      <h1 className="text-4xl font-extrabold mb-8">
        <span className="text-yellow-400">?</span> Help Center
      </h1>

      {/* What is TrenPlay */}
      <Section title="What is TrenPlay?">
        <p className="text-white/80">
          TrenPlay is a skill-based console gaming platform for titles like NBA 2K, FC (FIFA),
          Madden, UFC, and more. Players stake <strong>Tren Coin (TC)</strong> in head-to-head
          matches and tournaments. Funds are held in our <strong>Safety Contract escrow</strong> and
          released automatically when a winner is confirmed.
        </p>
      </Section>

      {/* Getting Started */}
      <Section title="How do I get started?">
        <ol className="list-decimal pl-6 space-y-2 text-white/80">
          <li>
            Create your account on{" "}
            <Link className="underline text-yellow-300" href="/signup">
              /signup
            </Link>{" "}
            and log in.
          </li>
          <li>Connect your Solana wallet (Phantom/Solflare) so you can hold TC.</li>
          <li>
            Pick a lobby on{" "}
            <Link className="underline text-yellow-300" href="/matches">
              /matches
            </Link>{" "}
            or join a bracket on{" "}
            <Link className="underline text-yellow-300" href="/tournaments">
              /tournaments
            </Link>
            .
          </li>
          <li>
            Play your match. Afterward, submit the score and upload proof on the results screen.
          </li>
          <li>
            Once both sides confirm (or an admin resolves a dispute), escrow releases TC to the
            winner.
          </li>
        </ol>
      </Section>

      {/* Tren Coin */}
      <Section title="How does Tren Coin (TC) work?">
        <p className="text-white/80">
          TC is used for entry fees and prizes. Your TC stays in your wallet; the Safety Contract
          escrow locks wagered amounts during a match. TrenPlay takes a small platform fee on
          completed matches. TC is for gameplay, rewards, and ecosystem perks.
        </p>
      </Section>

      {/* Divisions */}
      <Section title="Divisions & Points">
        <p className="text-white/80">You’ll be placed into a division based on recent performance:</p>
        <ul className="grid sm:grid-cols-2 gap-2 mt-3 text-white/90">
          <li>
            <b>Rookie</b> — entry tier (starts at ~500 pts)
          </li>
          <li>
            <b>Pro</b>
          </li>
          <li>
            <b>Elite</b>
          </li>
          <li>
            <b>Legend</b>
          </li>
        </ul>
        <p className="text-white/80 mt-2">
          Wins push you up; losses can move you down so your matches stay competitive. Higher tiers
          unlock bigger-stake lobbies and events.
        </p>
      </Section>

      {/* Avatars & Profiles */}
      <Section title="Avatars & Profiles">
        <p className="text-white/80">
          Choose an avatar in your profile. Your selection is saved and persists across
          refresh/login. You can change it anytime in{" "}
          <Link href="/profile" className="underline text-yellow-300">
            /profile
          </Link>
          .
        </p>
      </Section>

      {/* Subscriptions & Referrals */}
      <Section title="Subscriptions & Referrals">
        <p className="text-white/80">
          Optional subscriptions unlock perks (priority review, cosmetics, and more). Share your
          referral link to earn bonus TC or discounts when friends play.
        </p>
      </Section>

      {/* Proof & Disputes */}
      <Section title="Results, Proof & Disputes">
        <ul className="list-disc pl-6 space-y-2 text-white/80">
          <li>
            <b>Submit Results:</b> After a match, both players submit scores on the results page and
            upload proof (screenshots/video).
          </li>
          <li>
            <b>Auto-Release:</b> If both sides agree, escrow releases TC immediately.
          </li>
          <li>
            <b>Dispute Flow:</b> If there’s a conflict, the match goes to <i>Admin Review</i>.
            Provide clear proof. Repeated abuse = penalties or bans.
          </li>
        </ul>
        <p className="text-white/70 mt-2">
          Tip: capture the final scoreboard and gamertags in one frame whenever possible.
        </p>
      </Section>

      {/* Fair Play & Security */}
      <Section title="Fair Play & Security">
        <p className="text-white/80">
          No cheating, account sharing, or falsified proof. Do not wager outside the platform. Abuse
          of disputes, spam, or harassment can lead to suspensions or permanent bans.
        </p>
      </Section>

      {/* Troubleshooting */}
      <Section title="Quick Troubleshooting">
        <ul className="list-disc pl-6 space-y-2 text-white/80">
          <li>
            Can’t connect wallet? Refresh and reconnect Phantom/Solflare; ensure you’re on the right
            network.
          </li>
          <li>Upload stuck? Check your connection and try a smaller file. (Use the results page again.)</li>
          <li>Email not arriving? Check spam and verify that your account email is correct.</li>
        </ul>
      </Section>

      {/* Contact / Support */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mt-10">
        <h2 className="text-2xl font-bold mb-2">Need help from a human?</h2>
        <p className="text-white/80">
          Email our support team at{" "}
          <a href="mailto:support@trenplay.net" className="text-yellow-300 underline">
            support@trenplay.net
          </a>
          . Include your username, match ID, and a short summary. We’ll get back to you quickly.
        </p>
        <p className="text-white/60 mt-2">
          For account creation or login issues, head to{" "}
          <Link href="/help" className="underline">
            this page
          </Link>{" "}
          and follow the “Getting Started” section above.
        </p>
      </div>
    </main>
  );
}

/** Simple section wrapper */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-purple-300 mb-2">{title}</h2>
      <div className="text-sm sm:text-base">{children}</div>
    </section>
  );
}
