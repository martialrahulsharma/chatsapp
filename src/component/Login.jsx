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
    <div className="flex flex-col items-center gap-2">
      <div >
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
            className="rounded-lg h-9 w-12 cursor-pointer bg-blue-800 text-white"
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
      <div className="flex justify-center w-fit gap-12 px-2 rounded-md bg-[#344563] text-blue-200">
        <Link to={"/forgetPassword"}>
          Forget Password
        </Link>
        <Link to={"/signup"} >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default Login;
