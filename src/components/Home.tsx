import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Button, Input } from "@material-tailwind/react";
import React from "react";

interface User {
  name: string;
  option: string;
  time: string;
  status: boolean;
  id: string;
}

const Home: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("new");
  const [queueCounts, setQueueCounts] = useState<{ [key: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
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

        // Initialize queue counts
        const counts: { [key: string]: number } = {};
        allOptions.forEach((option) => {
          counts[option] = 0;
        });
        setQueueCounts(counts);
      } catch (error) {
        console.error("Error fetching documents: ", error);
        toast.error("Failed to load options.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      const updateQueueCounts = async () => {
        try {
          const q = query(
            collection(db, "users"),
            where("status", "==", false)
          );
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const counts: { [key: string]: number } = {};
            snapshot.forEach((doc) => {
              const data = doc.data() as User;
              if (data.option) {
                if (!counts[data.option]) {
                  counts[data.option] = 0;
                }
                counts[data.option]++;
              }
            });
            setQueueCounts(counts);
          });

          return () => unsubscribe(); // Cleanup the listener on unmount
        } catch (error) {
          console.error("Error updating queue counts: ", error);
        }
      };

      updateQueueCounts();
    }
  }, [isSubmitted]);

  useEffect(() => {
    if (userId !== "new") {
      const userDoc = doc(db, "users", userId);
      const unsubscribe = onSnapshot(userDoc, (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as User;
          setStatus(userData.status);
        }
      });

      return () => unsubscribe(); // Cleanup the listener on unmount or when userId changes
    }
  }, [userId]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please enter your name.");
      return;
    }
    if (!selectedOption) {
      toast.error("Please select an option.");
      return;
    }
    const id = idGenerator();
    const timestamp = new Date().toLocaleTimeString();

    try {
      await setDoc(doc(db, "users", id), {
        name,
        option: selectedOption,
        time: timestamp,
        status: false,
        id,
      });
      setUserId(id); // Update userId to listen for status changes
      setIsSubmitted(true); // Set submission state to true

      // Debugging logs
      console.log("Selected option after submit:", selectedOption);
      console.log("Queue counts:", queueCounts);

      toast.success("Submission successful!");
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error("Failed to submit data.");
    }
  };

  const idGenerator = () => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 7) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  return (
    <section className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">

      <div className="absolute top-4 right-4">
        <Link
          to="/login"
          className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Login
        </Link>
      </div>
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="p-6 space-y-4">
            <h1 className="text-3xl font-extrabold text-white mb-4 ">
              - Queue App -
      
            </h1>
            {isSubmitted ? (
              <div className="mb-4 text-white text-xl ">
                Name: ( {name} )
              </div>
            ) : (
              <div className="mb-4">
                <Input
                    label="Name"
                    value={name}
                    labelProps={{ color: "black" }}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                    color="white" onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined}                />
              </div>
            )}
            {!isSubmitted && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Options:
                </h3>
                {loading ? (
                  <div className="text-center text-white">Loading...</div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    {options.map((option, index) => (
                      <Button 
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        color={selectedOption === option ? "white" : "black"}
                        className={selectedOption === option
                          ? "text-gray-900 focus:outline-none focus:ring-2"
                          : "text-white focus:outline-none focus:ring-2"}  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!isSubmitted && (
              <Button
                onClick={handleSubmit}
                color="white"
                className="text-gray-900"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}              >
                Submit
              </Button>
            )}
            <div
              className={`mt-4 w-full h-20 rounded-md ${
                status ? "bg-green-600" : "bg-yellow-600"
              } transition-colors duration-300 flex justify-center items-center`}
            >
              <div className=" text-gray-900 font-bold text-xl ">
                {status
                  ? "Your turn!"
                  : isSubmitted
                  ? queueCounts[selectedOption!] !== undefined
                    ? `Current position: ${queueCounts[selectedOption!]}`
                    : "Loading..."
                  : "Please submit"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Home;
