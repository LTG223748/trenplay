'use client';

import { useState } from 'react';
import InviteFriendModal from './InviteFriendModal';

interface InviteFriendButtonProps {
  friendId: string;
}

export default function InviteFriendButton({ friendId }: InviteFriendButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
      >
        Invite Friend
      </button>

      {open && (
        <InviteFriendModal
          friendId={friendId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}



