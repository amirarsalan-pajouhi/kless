import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  Input,
  Button,
  Typography,
  Checkbox,
} from "@material-tailwind/react";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const email = username + "@gmail.com";

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        navigate(`/admin/${username}`);
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Wrong username or password!");
    }
  };

  return (
    <section className="bg-gray-50 bg-gray-900 min-h-screen flex items-center justify-center p-8">
      <ToastContainer theme="dark" autoClose={2000} />
      <Card
        color="transparent"
        shadow={false}
        className="w-full max-w-md p-8 bg-gray-800 border border-gray-700 flex items-center justify-center"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <Typography
          variant="h4"
          color="white"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Sign in
        </Typography>
        <form
          className="mt-8 mb-2 w-80 max-w-screen-lg"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <Typography
              variant="h6"
              color="white"
              className="mb-2"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Username
            </Typography>
            <Input
              type="text"
              name="username"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 bg-white"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              style={{ color: "black" }}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
          <div className="mb-4">
            <Typography
              variant="h6"
              color="white"
              className="mb-2"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Password
            </Typography>
            <Input
              type="password"
              name="password"
            
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 bg-white"
              style={{ color: "black",  }}
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Checkbox
                id="remember"
               
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
              <Typography
                variant="small"
                color="gray"
                className="font-normal"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                style={{ color: "#E1D9D1" }}
              >
                Remember me
              </Typography>
            </div>
            <a
              href="#"
              className="text-sm font-medium text-primary-600 hover:underline text-primary-500"
              style={{ color: "#E1D9D1" }}
            >
              Forgot password?
            </a>
          </div>
          <Button
            type="submit"
            className="w-full mt-4"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Sign in
          </Button>
         
        </form>
      </Card>
    </section>
  );
}
