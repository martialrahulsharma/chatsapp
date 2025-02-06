import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ChangePassword({ email }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({
    error: "",
    message: "",
  });
  const navigate = useNavigate();

  const passwordSubmitHandler = async (event) => {
    event.preventDefault();
    if (!email || !newPassword) {
      setMessage({
        error: !email ? "Email is required" : "Password required",
        message: "",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({
        error: "Password did not match",
        message: "",
      });
      return;
    }
    const res = await fetch("http://localhost:3000/changePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    if (data) {
      setMessage({
        error: data.error || "",
        message: data.message || "",
      });
      data.message && setTimeout(()=>{
        navigate('/');
      }, 5000)
    }
  };
  return (
    <div>
      <form
        onSubmit={passwordSubmitHandler}
        className="flex flex-col mt-5 items-center gap-y-4"
      >
        <input
          type="text"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="New Password"
          required
          className="rounded-lg h-9 pl-4"
        />
        <input
          type="text"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm Password"
          required
          className="rounded-lg h-9 pl-4"
        />
        <button
          type="submit"
          className="rounded-lg h-9 w-auto text-white px-2 bg-blue-800 
             disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Change
        </button>
      </form>
      {message.error ? (
        <p className="text-red-600 font-bold">{message.error}</p>
      ) : (
        <p className="text-green-600 font-bold">{message.message}</p>
      )}
    </div>
  );
}

export default ChangePassword;
