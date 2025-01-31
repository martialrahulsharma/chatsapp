import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchApi } from "./fetchApi";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [sendOTPerror, setOTPError] = useState("");
  const [OTP, setOTP] = useState("");
  const [verifyOTPerror, setVeryfyOTPerror] = useState("");
  const [successMessage, setSuccessMessage] = useState("")

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/sendotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      console.log(data);
      if (data.status == "success") {
        setShowMessage(true);
        setSuccessMessage(data.message)
      }
    } catch (error) {
      console.log(error);
    }
  };
  const verifyOTPHandler = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/sendotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      console.log(data);
      if (data.status == "success") console.log(data.status);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <form
          onSubmit={submitHandler}
          className="flex flex-col mt-5 items-center gap-y-4"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            className="rounded-lg h-9 pl-4"
          />
          <button
  type="submit"
  className="rounded-lg h-9 w-auto text-white px-2 bg-blue-800 
             disabled:bg-gray-400 disabled:cursor-not-allowed"
  disabled={showMessage}
>
  Send OTP
</button>
        </form>
      </div>
      {sendOTPerror ? (
        <p
          className={`${
            showMessage ? "block" : "hidden"
          } text-red-700 font-bold`}
        >
          {sendOTPerror}
        </p>
      ) : (
        <p
          className={`${
            showMessage ? "block" : "hidden"
          } text-red-700 font-bold`}
        >
          {successMessage}
        </p>
      )}
        <div>
        <form
          onSubmit={verifyOTPHandler}
          className="flex flex-col mt-5 items-center gap-y-4"
        >
          <input
            type="text"
            value={OTP}
            onChange={(event) => setOTP(event.target.value)}
            placeholder="OTP"
            required
            className="rounded-lg h-9 pl-4"
          />
          <button
            type="submit"
            className="rounded-lg h-9 w-auto text-white px-2 cursor-pointer bg-blue-800"
          >
            Verify OTP
          </button>
        </form>
        <div>
        {
          verifyOTPerror && (
            <p className={`${
              showMessage ? "block" : "hidden"
            } text-red-700 font-bold`}>{verifyOTPerror}</p>
          )
        }
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
