import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import useAdminCheck from "../../hooks/useAdminCheck";
import { updateDivisionAndEloByAdmin, getEloForDivision } from "../../utils/eloDivision";

type Division = "Rookie" | "Pro" | "Elite" | "Legend";

type User = {
  id: string;
  username: string;
  division: Division;
  elo: number;
  wins: number;
  losses: number;
  role?: string;
};

const DIVISIONS: Division[] = ["Rookie", "Pro", "Elite", "Legend"];

function getWinRate(user: User) {
  const games = user.wins + user.losses;
  if (games === 0) return 0;
  return user.wins / games;
}

export default function UserDivisionManager() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [divisionFilter, setDivisionFilter] = useState<string>("All");
  const [changing, setChanging] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "users"));
      setUsers(
        snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          username: doc.data().username,
          division: doc.data().division || "Rookie",
          elo: doc.data().elo ?? 500,
          wins: doc.data().wins || 0,
          losses: doc.data().losses || 0,
          role: doc.data().role,
        }))
      );
      setLoading(false);
    };
    fetchUsers();
  }, [isAdmin]);

  const handleDivisionChange = async (user: User, division: Division) => {
    setChanging(user.id);
    try {
      await updateDivisionAndEloByAdmin(user.id, division);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, division, elo: getEloForDivision(division) }
            : u
        )
      );
    } catch (err) {
      alert("Failed to update division. (Are Firestore rules correct?)");
      console.error(err);
    } finally {
      setChanging(null);
    }
  };

  if (adminLoading || loading)
    return <div className="text-white p-6">Loading User Division Manager...</div>;
  if (!isAdmin)
    return <div className="text-red-400 p-6">Not authorized to view User Division Manager.</div>;

  // Apply filter
  const filteredUsers =
    divisionFilter === "All"
      ? users
      : users.filter((u) => u.division === divisionFilter);

  return (
    <div className="bg-[#171726] p-6 rounded-xl mb-10 shadow-lg">
      <h2 className="text-yellow-400 text-2xl font-bold mb-4">
        User Division Manager
      </h2>
      <div className="mb-4">
        <label className="font-bold mr-2">Filter by Division:</label>
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="bg-[#222] text-white rounded px-2 py-1"
        >
          <option value="All">All</option>
          {DIVISIONS.map((div) => (
            <option key={div} value={div}>
              {div}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-left">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="px-2 py-2">Username</th>
              <th className="px-2 py-2">Division</th>
              <th className="px-2 py-2">ELO</th>
              <th className="px-2 py-2">Wins</th>
              <th className="px-2 py-2">Losses</th>
              <th className="px-2 py-2">Win %</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const winRate = getWinRate(user);
              const dominating =
                winRate >= 0.8 && user.wins + user.losses >= 10;
              return (
                <tr
                  key={user.id}
                  className="border-b border-[#232344] hover:bg-[#21213c]"
                >
                  <td className="px-2 py-2 font-bold">
                    {user.username}
                    {dominating && (
                      <span className="ml-2 text-orange-400 font-bold text-xs bg-yellow-900 rounded px-2 py-1">
                        DOMINATING
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2">{user.division}</td>
                  <td className="px-2 py-2">{user.elo}</td>
                  <td className="px-2 py-2">{user.wins}</td>
                  <td className="px-2 py-2">{user.losses}</td>
                  <td className="px-2 py-2">
                    {(winRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={user.division}
                      onChange={(e) =>
                        handleDivisionChange(user, e.target.value as Division)
                      }
                      disabled={changing === user.id}
                      className="bg-[#2c2c49] text-white rounded px-2 py-1"
                    >
                      {DIVISIONS.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-4 text-gray-400">No users in this division.</div>
        )}
      </div>
      <div className="text-yellow-300 text-sm mt-4">
        Players with a <span className="font-bold">DOMINATING</span> badge have
        an 80%+ win rate and 10+ games played. Consider promoting them!
      </div>
    </div>
  );
}



