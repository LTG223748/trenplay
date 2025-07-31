import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

export default function MatchChat() {
  const router = useRouter();
  const { matchId } = router.query;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    if (!matchId) return;

    const messagesRef = collection(db, 'matches', matchId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    const messagesRef = collection(db, 'matches', matchId, 'messages');
    await addDoc(messagesRef, {
      sender: user.email,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });

    setText('');
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">💬 Match Chat</h1>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 bg-gray-800 p-4 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded max-w-md ${
              msg.sender === auth.currentUser?.email
                ? 'bg-yellow-400 text-black self-end ml-auto'
                : 'bg-gray-700'
            }`}
          >
            <p className="text-sm font-semibold mb-1">{msg.sender}</p>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          className="flex-1 px-4 py-2 rounded bg-gray-700 text-white"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}