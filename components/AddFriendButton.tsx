"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import {
  sendFriendRequest,
  subscribeFriendStatus,
  acceptFriendRequest,
  cancelOutgoingRequest,
  rejectFriendRequest,
  FriendStatus,
  FriendEdge,
} from "../lib/friends";

export default function AddFriendButton({ otherUserId }: { otherUserId: string }) {
  const [user] = useAuthState(auth);
  const [status, setStatus] = useState<FriendStatus>("none");
  const [edge, setEdge] = useState<FriendEdge | undefined>(undefined);

  useEffect(() => {
    if (!user || !otherUserId) return;
    const unsub = subscribeFriendStatus(user.uid, otherUserId, (s, e) => {
      setStatus(s);
      setEdge(e);
    });
    return () => unsub();
  }, [user, otherUserId]);

  if (!user) return null;
  if (user.uid === otherUserId) return null;

  const onAdd = async () => {
    const res = await sendFriendRequest(user.uid, otherUserId);
    if (!res.success && res.error === "already_pending") alert("Request already sent.");
    if (!res.success && res.error === "already_friends") alert("You’re already friends.");
  };

  const onCancel = async () => {
    await cancelOutgoingRequest(user.uid, otherUserId);
  };

  const onAccept = async () => {
    if (edge) await acceptFriendRequest(edge.id);
  };

  const onDecline = async () => {
    if (edge) await rejectFriendRequest(edge.id);
  };

  // UI by status
  if (status === "accepted") {
    return (
      <button className="bg-green-600 text-white px-3 py-1 rounded cursor-default">
        Friends ✓
      </button>
    );
  }

  if (status === "outgoing") {
    return (
      <div className="flex gap-2">
        <span className="px-3 py-1 rounded bg-white/10 text-white">Requested</span>
        <button onClick={onCancel} className="px-3 py-1 rounded bg-red-600 hover:bg-red-500">
          Cancel
        </button>
      </div>
    );
  }

  if (status === "incoming") {
    return (
      <div className="flex gap-2">
        <button onClick={onAccept} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500">
          Accept
        </button>
        <button onClick={onDecline} className="px-3 py-1 rounded bg-red-600 hover:bg-red-500">
          Decline
        </button>
      </div>
    );
  }

  // status === "none"
  return (
    <button
      onClick={onAdd}
      className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
    >
      Add Friend
    </button>
  );
}

