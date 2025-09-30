"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import {
  subscribeToFriends,
  subscribeToIncoming,
  subscribeToOutgoing,
  acceptFriendRequest,
  rejectFriendRequest,
  fetchUsersMap,
  FriendEdge,
  searchUserByUsername,
} from "../lib/friends";
import AddFriendButton from "../components/AddFriendButton";
import InviteFriendButton from "../components/InviteFriendButton";

export default function FriendsPage() {
  const [user] = useAuthState(auth);
  const [friendsEdges, setFriendsEdges] = useState<FriendEdge[]>([]);
  const [incoming, setIncoming] = useState<FriendEdge[]>([]);
  const [outgoing, setOutgoing] = useState<FriendEdge[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // ✅ Subscriptions
  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToFriends(user.uid, setFriendsEdges);
    const unsub2 = subscribeToIncoming(user.uid, setIncoming);
    const unsub3 = subscribeToOutgoing(user.uid, setOutgoing);
    return () => {
      unsub1?.();
      unsub2?.();
      unsub3?.();
    };
  }, [user]);

  // ✅ Fetch profiles for IDs we need labels for
  useEffect(() => {
    (async () => {
      if (!user) return;
      const ids: string[] = [];
      friendsEdges.forEach((e) =>
        ids.push(e.requesterId === user.uid ? e.receiverId : e.requesterId)
      );
      incoming.forEach((e) => ids.push(e.requesterId));
      outgoing.forEach((e) => ids.push(e.receiverId));
      const map = await fetchUsersMap(ids);
      setProfiles(map);
    })();
  }, [friendsEdges, incoming, outgoing, user]);

  const myFriends = useMemo(() => {
    if (!user) return [];
    return friendsEdges.map((e) =>
      e.requesterId === user.uid ? e.receiverId : e.requesterId
    );
  }, [friendsEdges, user]);

  // ✅ Search
  const onSearch = async () => {
    setLoadingSearch(true);
    const rows = await searchUserByUsername(search.trim());
    setResults(rows);
    setLoadingSearch(false);
  };

  if (!user) return <div className="p-6 text-white">Please log in to view friends.</div>;

  const labelFor = (uid: string) =>
    profiles[uid]?.username || profiles[uid]?.gamertag || uid;

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-extrabold mb-6">Friends</h1>

      {/* ✅ Accepted Friends */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Your Friends</h2>
        {myFriends.length === 0 ? (
          <p className="text-white/70">No friends yet.</p>
        ) : (
          <ul className="space-y-2">
            {myFriends.map((uid) => (
              <li
                key={uid}
                className="bg-[#2a2a40] p-3 rounded flex items-center justify-between"
              >
                <span>{labelFor(uid)}</span>
                <InviteFriendButton friendId={uid} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ✅ Incoming Requests */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Incoming Requests</h2>
        {incoming.length === 0 ? (
          <p className="text-white/70">No incoming requests.</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map((r) => (
              <li
                key={r.id}
                className="bg-[#2a2a40] p-3 rounded flex items-center justify-between"
              >
                <span>{labelFor(r.requesterId)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(r.id)}
                    className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(r.id)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ✅ Outgoing Requests */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Outgoing Requests</h2>
        {outgoing.length === 0 ? (
          <p className="text-white/70">No outgoing requests.</p>
        ) : (
          <ul className="space-y-2">
            {outgoing.map((r) => (
              <li
                key={r.id}
                className="bg-[#2a2a40] p-3 rounded flex items-center justify-between"
              >
                <span>{labelFor(r.receiverId)}</span>
                <span className="bg-white/10 px-2 py-1 rounded text-white/80">
                  Pending
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ✅ Search & Add */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Find Friends</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter exact username"
            className="flex-1 px-3 py-2 rounded bg-[#2a2a40] text-white"
          />
          <button
            onClick={onSearch}
            className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
            disabled={loadingSearch}
          >
            {loadingSearch ? "Searching..." : "Search"}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-4 space-y-2">
            {results.map((u) => (
              <li
                key={u.id}
                className="bg-[#2a2a40] p-3 rounded flex items-center justify-between"
              >
                <span>{u.username || u.gamertag || u.id}</span>
                <AddFriendButton otherUserId={u.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

