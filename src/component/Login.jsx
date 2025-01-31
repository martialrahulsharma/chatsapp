import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

function Login() {
  const [username, setUsername] = useState("rahul");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(true);
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      if (data.accessToken.token) login(data.accessToken.token);
      if (data.status == "success") navigate("/myFriend");
      setShowMessage(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user && !token) {
      navigate("/");
    } else {
      navigate("/myFriend");
    }
  }, []);

  return (
    <>
      <div>
        <form
          onSubmit={submitHandler}
          className="flex flex-col mt-5 items-center gap-y-4"
        >
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="UserName"
            required
            className="rounded-lg h-9 pl-4"
          />
          <input
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
            className="rounded-lg h-9 pl-4"
          />
          <button
            type="submit"
            className="rounded-lg h-9 w-12 cursor-pointer bg-blue-800"
          >
            Login
          </button>
        </form>
      </div>
      <p
        className={`${showMessage ? "block" : "hidden"} text-red-700 font-bold`}
      >
        {error}
      </p>
      <div className="flex justify-center gap-12">
        <Link to={"/signup"} className="text-blue-700 font-bold">
          Create an account
        </Link>
        <Link to={"/forgetPassword"} className="text-blue-700 font-bold">
          Forget Password
        </Link>
      </div>
    </>
  );
}

export default Login;
