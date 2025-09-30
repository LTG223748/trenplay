import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';

import { collection, getDocs } from 'firebase/firestore';

export default function AdminEmailSender() {
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const handleSend = async () => {
    setSending(true);

    // Call your API route (works for Resend or SendGrid)
    await fetch('/api/sendTournamentEmails', {
      method: 'POST',
      body: JSON.stringify({
        playerIds: selected,
        subject,
        text: message
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    setSending(false);
    alert('Emails sent!');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Send Custom Tournament Email</h1>
      <div className="mb-3">
        <label className="block mb-1">Players:</label>
        <select
          multiple
          className="w-full p-2 rounded"
          value={selected}
          onChange={e =>
            setSelected(Array.from(e.target.selectedOptions, o => o.value))
          }
        >
          {users.map(user =>
            user.email ? (
              <option key={user.uid} value={user.uid}>
                {user.email} ({user.uid})
              </option>
            ) : null
          )}
        </select>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Subject:</label>
        <input
          className="w-full p-2 rounded"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Message:</label>
        <textarea
          className="w-full p-2 rounded"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      <button
        disabled={sending || selected.length === 0}
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {sending ? 'Sending...' : 'Send Emails'}
      </button>
    </div>
  );
}
