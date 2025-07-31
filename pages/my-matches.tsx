import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import MatchResultForm from '../components/MatchResultForm';
import useAdminCheck from '../hooks/useAdminCheck'; // ADDED

interface Match {
  id: string;
  game: string;
  platform: string;
  entryFee: number;
  status: string;
  creatorUserId: string;
  joinerUserId?: string;
  division?: string;
}

export default function MyMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userDivision, setUserDivision] = useState<string>('Rookie');
  const [loading, setLoading] = useState(true);
  const [divisionFilter, setDivisionFilter] = useState<string>('All');
  const [userFilter, setUserFilter] = useState<string>('All');
  const { isAdmin, loading: adminLoading } = useAdminCheck();

  useEffect(() => {
    const fetchMatches = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMatches([]);
        setLoading(false);
        return;
      }
      setUser(currentUser);

      // Get user division (for non-admins, for display)
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      setUserDivision(userSnap.data()?.division || 'Rookie');

      // Fetch all matches for admins, or user matches for normal users
      const matchesRef = collection(db, 'matches');
      const snapshot = await getDocs(matchesRef);
      const allMatches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];

      let displayMatches = allMatches;

      if (!isAdmin) {
        displayMatches = allMatches.filter(
          match =>
            match.creatorUserId === currentUser.uid ||
            match.joinerUserId === currentUser.uid
        );
      }

      setMatches(displayMatches);
      setLoading(false);
    };

    fetchMatches();
  }, [isAdmin]);

  // --- Filters for admin ---
  const divisions = ['Rookie', 'Pro', 'Elite', 'Legend'];

  const filteredMatches = matches.filter(match => {
    const divisionOk = divisionFilter === 'All' || match.division === divisionFilter;
    const userOk =
      userFilter === 'All' ||
      match.creatorUserId === userFilter ||
      match.joinerUserId === userFilter;
    return divisionOk && userOk;
  });

  // Collect all users for admin user filter
  const allUsers = Array.from(
    new Set(matches.flatMap(m => [m.creatorUserId, m.joinerUserId]).filter(Boolean))
  );

  const getResultBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="text-green-400 font-bold">Complete ✅</span>;
      case 'disputed':
        return <span className="text-red-400 font-bold">Disputed ⚠️</span>;
      case 'awaiting-results':
        return <span className="text-yellow-300 font-bold">Awaiting ⚔️</span>;
      case 'active':
        return <span className="text-blue-300 font-bold">In Progress 🎮</span>;
      default:
        return <span className="text-yellow-400">Pending ⏳</span>;
    }
  };

  if (adminLoading || loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">
        {user ? `Your Matches (${user.email})` : 'Your Matches'}
      </h1>
      {!isAdmin && (
        <p className="mb-6 text-sm text-gray-400">
          <strong>Your Division:</strong> {userDivision}
        </p>
      )}

      {isAdmin && (
        <div className="flex gap-4 mb-8">
          <div>
            <label className="font-bold mr-2">Filter by Division:</label>
            <select
              value={divisionFilter}
              onChange={e => setDivisionFilter(e.target.value)}
              className="bg-[#222] text-white rounded px-2 py-1"
            >
              <option value="All">All</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold mr-2">Filter by User:</label>
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              className="bg-[#222] text-white rounded px-2 py-1"
            >
              <option value="All">All</option>
              {allUsers.map(uid => (
                <option key={uid} value={uid}>{uid}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <div className="grid gap-6">
          {filteredMatches.map((match) => {
            const isCreator = match.creatorUserId === user?.uid;
            const isJoiner = match.joinerUserId === user?.uid;
            const userRole = isCreator ? 'creator' : isJoiner ? 'joiner' : null;

            return (
              <div
                key={match.id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-yellow-400">{match.game}</h2>
                  {getResultBadge(match.status)}
                </div>
                <p><strong>Platform:</strong> {match.platform}</p>
                <p><strong>Wager:</strong> {match.entryFee} TC</p>
                <p><strong>Status:</strong> {match.status}</p>
                <p><strong>Division:</strong> {match.division || "N/A"}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Match ID: <span className="italic">{match.id}</span>
                </p>
                {userRole && (
                  <div className="mt-4">
                    <MatchResultForm matchId={match.id} userRole={userRole} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


