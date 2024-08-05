import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  QuerySnapshot,
  DocumentData,
  addDoc,
} from "firebase/firestore";
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
    // Set up Firestore listener
    const userCollection = collection(db, "users");
    const q = query(userCollection, orderBy("time")); // Order by the 'time' field

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const userList = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...(doc.data() as Omit<User, "id">), // Cast data to User type, excluding 'id'
        })) as User[];
        setUsers(userList);
      }
    );

    // Clean up the listener on component unmount
    return () => unsubscribe();
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
    try {
      await updateDoc(userDoc, { status: true, admin: auth.currentUser?.uid });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (user: User) => {
    const userDoc = doc(db, "users", user.id);
    try {
      console.log(user)
      await deleteDoc(userDoc);
      await addDoc(collection(db, "history"), {
        name: user.name,
        option: user.option,
        time: user.time,
      });
    } catch (error) {
      console.log(error);
    }
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
    <section className="bg-gray-900 min-h-screen flex flex-col items-center p-6">
      <div className="container mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl mb-8">
          Admin Page
        </h1>

        <div className="flex-grow flex justify-center items-center">
          {Object.keys(groupedUsers).length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {Object.keys(groupedUsers).map((option) => (
                <div key={option} className="bg-gray-800 rounded-lg shadow p-4">
                  <h2 className="text-xl font-semibold mb-2 text-white">
                    {option}
                  </h2>
                  {groupedUsers[option].map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 border rounded mb-4 ${
                        user.status ? "bg-yellow-600" : "bg-gray-700"
                      }`}
                    >
                      <p className="text-lg font-semibold text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-300">{user.time}</p>
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
                          onClick={() => handleDelete(user)}
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
          ) : (
            <div className="text-white text-3xl text-center">
              There is no one in the queue
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
    </section>
  );
}
