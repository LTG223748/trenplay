import { useEffect, useState, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";

interface MatchChatProps {
  matchId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  createdAt: any;
}

export default function MatchChat({ matchId }: MatchChatProps) {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [username, setUsername] = useState<string>("Player");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user's username from Firestore
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().username) {
          setUsername(snap.data().username);
        } else {
          setUsername("Player");
        }
      }
    };
    fetchUsername();
  }, [user]);

  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, "matchChats", matchId, "messages"),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[]
      );
    });
    return () => unsubscribe();
  }, [matchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    await addDoc(collection(db, "matchChats", matchId, "messages"), {
      text,
      sender: username, // Always use username from Firestore
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 bg-[#232344] rounded-t-lg" style={{ maxHeight: 350 }}>
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-bold text-yellow-400">{msg.sender}:</span>{" "}
            <span className="text-white">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex bg-[#1a1a2e] p-2 rounded-b-lg">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 rounded bg-[#292947] text-white"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
