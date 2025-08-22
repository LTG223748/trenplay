import { useEffect, useMemo, useRef, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

interface MatchChatProps {
  matchId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  createdAt: any;
}

type MatchDoc = {
  id?: string;
  creatorUserId: string;
  joinerUserId?: string | null;
  status?: string;
};

type PlayerCard = {
  team?: string;
  gamertag?: string;
  updatedAt?: any;
  confirmed?: boolean;
  confirmedAt?: any;
  selectionLocked?: boolean; // NEW
};

export default function MatchChat({ matchId }: MatchChatProps) {
  const [user] = useAuthState(auth);
  const myUid = user?.uid ?? null;

  // --- chat state ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text,   setText] = useState("");
  const [username, setUsername] = useState<string>("Player");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- match + players state ---
  const [match, setMatch] = useState<MatchDoc | null>(null);
  const [me,    setMe]    = useState<PlayerCard>({});
  const [opp,   setOpp]   = useState<PlayerCard>({});
  const [myTeam, setMyTeam] = useState("");
  const [myTag,  setMyTag]  = useState("");
  const [profileTag, setProfileTag] = useState(""); // from users/{uid}
  const [confirming, setConfirming] = useState(false);

  // autosave state
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefilledOnceRef = useRef(false);

  // ===== Helpers =====
  const opponentUid = useMemo(() => {
    if (!myUid || !match) return null;
    if (match.creatorUserId === myUid) return match.joinerUserId ?? null;
    if (match.joinerUserId === myUid)  return match.creatorUserId ?? null;
    return null;
  }, [myUid, match]);

  const locked = !!(me.selectionLocked ?? me.confirmed); // treat confirmed as locked too

  // ✅ You can confirm if you have values and you're not locked
  const canConfirm = useMemo(() => {
    return !locked && Boolean(myTeam.trim() && myTag.trim());
  }, [locked, myTeam, myTag]);

  const bothConfirmed = Boolean(me.confirmed && opp.confirmed);

  // (Info-only) Opp updated after my confirm — no reconfirm required anymore
  const oppChangedAfterMyConfirm = useMemo(() => {
    if (!me.confirmed || !me.confirmedAt || !opp.updatedAt) return false;
    try {
      const myC  = me.confirmedAt.toMillis ? me.confirmedAt.toMillis() : new Date(me.confirmedAt).valueOf();
      const oppU = opp.updatedAt.toMillis ? opp.updatedAt.toMillis() : new Date(opp.updatedAt).valueOf();
      return oppU > myC;
    } catch {
      return false;
    }
  }, [me.confirmed, me.confirmedAt, opp.updatedAt]);

  // ===== Username (sender label) =====
  useEffect(() => {
    const fetchUsername = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const data: any = snap.exists() ? snap.data() : null;
      if (data?.username) setUsername(data.username);
    };
    fetchUsername();
  }, [user]);

  // ===== Load match doc =====
  useEffect(() => {
    if (!matchId) return;
    const ref = doc(db, "matches", matchId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as MatchDoc | undefined;
      if (data) setMatch({ id: snap.id, ...data });
    });
    return () => unsub();
  }, [matchId]);

  // ===== Subscribe to my player card =====
  useEffect(() => {
    if (!myUid || !matchId) return;
    const ref = doc(db, "matches", matchId, "players", myUid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = (snap.data() as PlayerCard) || {};
      setMe(data);
      if (data.team      !== undefined) setMyTeam(data.team || "");
      if (data.gamertag  !== undefined) setMyTag(data.gamertag || "");
    });
    return () => unsub();
  }, [myUid, matchId]);

  // ===== Pull profile gamertag and prefill once if empty =====
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      const data: any = snap.exists() ? snap.data() : null;
      const tag =
        (data?.gamertag && String(data.gamertag).trim()) ||
        (data?.linkedAccount && String(data.linkedAccount).trim()) ||
        "";
      setProfileTag(tag);

      if (!prefilledOnceRef.current && !me.gamertag?.trim() && !myTag.trim() && tag) {
        setMyTag(tag);
        prefilledOnceRef.current = true;
      }
    });
    return () => unsub();
  }, [user, me.gamertag, myTag]);

  // ===== Subscribe to opponent card =====
  useEffect(() => {
    if (!opponentUid || !matchId) {
      setOpp({});
      return;
    }
    const ref = doc(db, "matches", matchId, "players", opponentUid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = (snap.data() as PlayerCard) || {};
      setOpp(data);
    });
    return () => unsub();
  }, [opponentUid, matchId]);

  // ===== Chat messages =====
  useEffect(() => {
    if (!matchId) return;
    const q = query(collection(db, "matchChats", matchId, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChatMessage[]
      );
    });
    return () => unsubscribe();
  }, [matchId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== Auto-save (debounced) — NO edits after locked =====
  useEffect(() => {
    if (!myUid || !matchId) return;
    if (locked) return; // 🚫 do nothing once locked

    const t = myTeam.trim();
    const g = myTag.trim();
    const sameAsStored = (me.team ?? "") === t && (me.gamertag ?? "") === g;
    if (sameAsStored) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setAutoSaving(true);

        const payload: any = {
          team: t,
          gamertag: g,
          updatedAt: serverTimestamp(),
          // NOTE: no more auto-unconfirm logic — you’re not locked yet
        };

        const ref = doc(db, "matches", matchId, "players", myUid);
        await setDoc(ref, payload, { merge: true });

        setLastSavedAt(Date.now());
      } finally {
        setAutoSaving(false);
      }
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [myTeam, myTag, myUid, matchId, me.team, me.gamertag, locked]);

  // ===== System message helper =====
  const postSystemMessage = async (msg: string) => {
    await addDoc(collection(db, "matchChats", matchId, "messages"), {
      text: msg,
      sender: "[system]",
      createdAt: serverTimestamp(),
    });
  };

  // ===== Actions =====
  const confirmMine = async () => {
    if (!myUid || !matchId) return;
    if (!canConfirm) return;
    setConfirming(true);
    try {
      const ref = doc(db, "matches", matchId, "players", myUid);
      await setDoc(
        ref,
        {
          team: myTeam.trim(),
          gamertag: myTag.trim(),
          updatedAt: serverTimestamp(),
          confirmed: true,
          selectionLocked: true,       // 🔒 permanent
          confirmedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await postSystemMessage(`${username} locked their team & gamertag.`);
    } finally {
      setConfirming(false);
    }
  };

  const nudgeOpponent = async () => {
    await postSystemMessage(`${username} nudged opponent to add team & gamertag.`);
  };

  // ===== UI =====
  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* Chat */}
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-[#232344] rounded-t-lg" style={{ maxHeight: 350 }}>
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <span className={`font-bold ${msg.sender === "[system]" ? "text-gray-400" : "text-yellow-400"}`}>
                {msg.sender}:
              </span>{" "}
              <span className={`${msg.sender === "[system]" ? "text-gray-300 italic" : "text-white"}`}>
                {msg.text}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!user || !text.trim()) return;
            addDoc(collection(db, "matchChats", matchId, "messages"), {
              text,
              sender: username,
              createdAt: serverTimestamp(),
            });
            setText("");
          }}
          className="flex bg-[#1a1a2e] p-2 rounded-b-lg"
        >
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

      {/* Pre-game cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* My card (editable until locked) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-semibold text-white mb-1">Your Info</h3>

          {/* Autosave status */}
          <div className="text-xs text-gray-400 mb-3">
            {locked ? "Locked — no further edits" : (autoSaving ? "Saving…" : lastSavedAt ? "Auto-saved" : "Auto-save ready")}
          </div>

          <label className="block text-sm text-gray-300 mb-1">Team</label>
          <input
            className="w-full mb-3 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
            placeholder="e.g., Lakers / Real Madrid / Ravens"
            value={myTeam}
            onChange={(e) => setMyTeam(e.target.value)}
            disabled={locked}
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">Gamertag</label>
              <input
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                placeholder="Your PSN/Xbox tag"
                value={myTag}
                onChange={(e) => setMyTag(e.target.value)}
                disabled={locked}
              />
              {profileTag && myTag !== profileTag && !locked && (
                <button
                  type="button"
                  onClick={() => setMyTag(profileTag)}
                  className="mt-1 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
                  title="Use the gamertag from your profile"
                >
                  Use profile gamertag (“{profileTag}”)
                </button>
              )}
              {!me.gamertag && profileTag && myTag === profileTag && !locked && (
                <p className="mt-1 text-xs text-gray-400">Prefilled from your profile.</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={confirmMine}
              disabled={!canConfirm || confirming}
              className="bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow hover:bg-green-400 transition disabled:opacity-50"
              title={
                locked
                  ? "Selection locked"
                  : !canConfirm
                  ? "Fill your team & gamertag to confirm"
                  : "Confirm (locks your selection)"
              }
            >
              {locked ? "Locked ✅" : confirming ? "Confirming…" : "Confirm (Lock)"}
            </button>

            {(!opp.team || !opp.gamertag) && (
              <button
                type="button"
                onClick={nudgeOpponent}
                className="ml-auto bg-white/10 text-white px-3 py-2 rounded-xl hover:bg-white/20"
                disabled={false}
              >
                Nudge opponent
              </button>
            )}
          </div>

          {me.updatedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {new Date(me.updatedAt.toMillis?.() ?? me.updatedAt).toLocaleString()}
            </p>
          )}
          {me.confirmed && (
            <p className="text-xs text-green-300 mt-1">You’re locked in.</p>
          )}
          {oppChangedAfterMyConfirm && (
            <p className="text-xs text-amber-300 mt-1">
              Opponent updated their info after you locked — review before starting.
            </p>
          )}
        </div>

        {/* Opponent card (read-only) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Opponent Info</h3>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <div className="text-sm text-gray-300 mb-1">Team</div>
              <div className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white min-h-[42px]">
                {opp.team?.trim() || <span className="text-gray-400">Not set yet</span>}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-300 mb-1">Gamertag</div>
              <div className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white min-h-[42px]">
                {opp.gamertag?.trim() || <span className="text-gray-400">Not set yet</span>}
              </div>
            </div>

            {opp.updatedAt && (
              <p className="text-xs text-gray-400">
                Last updated: {new Date(opp.updatedAt.toMillis?.() ?? opp.updatedAt).toLocaleString()}
              </p>
            )}
            {opp.confirmed && (
              <div className="text-xs text-green-300">Opponent is confirmed.</div>
            )}
          </div>
        </div>
      </section>

      {/* Both confirmed banner */}
      {bothConfirmed && !oppChangedAfterMyConfirm && (
        <div className="rounded-xl bg-green-600/20 border border-green-500/30 text-green-200 px-4 py-2">
          ✅ Both players confirmed. You’re good to start.
        </div>
      )}

      {oppChangedAfterMyConfirm && (
        <div className="rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-200 px-4 py-2">
          ⚠️ Opponent changed info after you locked — just double-check details.
        </div>
      )}
    </div>
  );
}
