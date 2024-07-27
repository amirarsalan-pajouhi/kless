import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

interface User {
  name: string;
  option: string;
  time: string;
  status: boolean;
}

const Home: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Queue"));
        const allOptions: string[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.options && Array.isArray(data.options)) {
            allOptions.push(...data.options);
          }
        });
        setOptions(allOptions);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (name) {
      const userDoc = doc(db, "users", name);
      const unsubscribe = onSnapshot(userDoc, (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as User;
          setStatus(userData.status);
        }
      });

      return () => unsubscribe(); // Cleanup the listener on unmount or when name changes
    }
  }, [name]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setError("");
  };

  const handleSubmit = async () => {
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (!selectedOption) {
      setError("Please select an option.");
      return;
    }

    const timestamp = new Date().toLocaleString();

    try {
      await setDoc(doc(db, "users", name), {
        name: name,
        option: selectedOption,
        time: timestamp,
        status: false,
      });
      setSelectedOption(null);
      setError("");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="container mx-auto p-6">
        <div className="w-full bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl dark:text-white">
              Queue App
            </h1>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border ${
                  error.includes("name") ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              />
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold dark:text-white mb-3">Options:</h3>
              <div className="flex flex-col space-y-2">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`px-4 py-2 ${
                      selectedOption === option ? "bg-green-500" : "bg-blue-500"
                    } text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Submit
            </button>
            <div
              className={`mt-4 w-full h-20 ${
                status ? "bg-green-500" : "bg-yellow-500"
              } rounded-md`}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
