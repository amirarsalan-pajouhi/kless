import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  option: string;
  time: string;
  status: boolean;
  admin?: string;
}

interface GroupedUsers {
  [key: string]: User[];
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [groupedUsers, setGroupedUsers] = useState<GroupedUsers>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const userCollection = collection(db, "users");
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const groupUsersByOption = () => {
      const grouped = users.reduce((ops: GroupedUsers, user) => {
        if (!ops[user.option]) {
          ops[user.option] = [];
        }
        ops[user.option].push(user);
        return ops;
      }, {});
      setGroupedUsers(grouped);
    };

    groupUsersByOption();
  }, [users]);

  const handleAccept = async (id: string) => {
    const userDoc = doc(db, "users", id);
    await updateDoc(userDoc, { status: true, admin: auth.currentUser?.uid });

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? { ...user, status: true, admin: auth.currentUser?.uid }
          : user
      )
    );
  };

  const handleDelete = async (id: string) => {
    const userDoc = doc(db, "users", id);
    await deleteDoc(userDoc);

    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl dark:text-white mb-4">
          Admin Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(groupedUsers).map((option) => (
            <div
              key={option}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {option}
              </h2>
              {groupedUsers[option].map((user) => (
                <div
                  key={user.id}
                  className={`p-4 border rounded mb-4 ${
                    user.status
                      ? "bg-yellow-300 dark:bg-yellow-600"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {user.time}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    {!user.status && (
                      <button
                        onClick={() => handleAccept(user.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={
                        user.status && auth.currentUser?.uid !== user.admin
                          ? "hidden"
                          : "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="absolute bottom-4 left-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
    </section>
  );
}
