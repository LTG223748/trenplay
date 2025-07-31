// For Next.js API route (put in /pages/api/sendTournamentEmails.ts)
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Store your key in .env.local

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { playerIds, tournamentId, matchSchedule } = req.body;

    // Get user emails for the given playerIds
    const usersQuery = query(
      collection(db, 'users'),
      where('uid', 'in', playerIds)
    );
    const usersSnap = await getDocs(usersQuery);
    const emails = usersSnap.docs.map(doc => doc.data().email).filter(Boolean);

    // Build your tournament message
    const subject = `Tournament ${tournamentId} Scheduled!`;
    const text = `Bracket is live! Your first match is on ${new Date(matchSchedule[0].date.seconds * 1000).toLocaleString()}. Log in for more info.`;

    // Send an email to every player
    const messages = emails.map((to: string) => ({
      to,
      from: 'your@email.com', // Your verified sender
      subject,
      text,
      // html: '<strong>...</strong>'
    }));

    await sgMail.send(messages);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
}
