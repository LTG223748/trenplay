import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import useAdminCheck from '../../hooks/useAdminCheck';

const divisions = ["Rookie", "Pro", "Elite", "Legend"];

function isDominating(user: any) {
  if (!user.wins || !user.losses) return false;
  const total = user.wins + user.losses;
  return total >= 10 && user.wins / total >= 0.8;
}

export default function UserDivisionManager() {
  const { isAdmin, loading } = useAdminCheck();

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!isAdmin) return <div className="text-red-500 p-8">Not authorized</div>;

  const [users, setUsers] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTableLoading(false);
    };
    fetchUsers();
  }, []);

  const handleDivisionChange = async (userId: string, newDivision: string) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { division: newDivision });
    setUsers(users => users.map(u => u.id === userId ? { ...u, division: newDivision } : u));
    alert(`Division updated to ${newDivision}`);
  };

  if (tableLoading) return <div className="text-white p-8">Loading users...</div>;

  return (
    <div className="p-6 text-white bg-[#1c1c2e] rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">User Division Manager</h2>
      <table className="w-full mb-8">
        <thead>
          <tr>
            <th className="text-left">Username</th>
            <th className="text-left">Division</th>
            <th className="text-left">ELO</th>
            <th className="text-left">Wins</th>
            <th className="text-left">Losses</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className={isDominating(u) ? "bg-yellow-900" : ""}>
              <td>
                {u.username || u.email}
                {isDominating(u) && (
                  <span className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded font-bold text-xs animate-pulse">
                    DOMINATING!
                  </span>
                )}
              </td>
              <td>{u.division}</td>
              <td>{u.elo}</td>
              <td>{u.wins}</td>
              <td>{u.losses}</td>
              <td>
                <select
                  value={u.division}
                  onChange={e => handleDivisionChange(u.id, e.target.value)}
                  className="rounded p-1"
                >
                  {divisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-yellow-300">Players with a DOMINATING badge have an 80%+ win rate and 10+ games played. Consider promoting them!</p>
    </div>
  );
}


