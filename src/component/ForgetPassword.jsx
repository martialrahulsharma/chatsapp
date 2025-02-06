import { useState, useContext, useEffect } from "react";
import ChangePassword from "./ChangePassword";
// import {useNavigate} from 'react-router-dom'

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [sendOTPerror, setSendOTPError] = useState("");
  const [OTP, setOTP] = useState("");
  const [verifyOTP, setVerifyOTP] = useState({
    error: "",
    message: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  let [timeLeft, setTimeLeft] = useState(0);
  // const navigate = useNavigate();

  const submitHandler = async (event) => {
    event.preventDefault();
    setShowMessage(true);
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
        setSendOTPError(false);
        // setShowMessage(true);
        setSuccessMessage(data.message);
        setTimeLeft(data.timeLeft);
      }
      if (data.error) {
        setSendOTPError(data.error);
        // setShowMessage(true);
        setTimeLeft(data.timeLeft); // remove comment
        // setTimeLeft(5); // in comment
      }
    } catch (error) {
      console.log(error);
    }
  };
  const verifyOTPHandler = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, OTP }),
      });
      const data = await res.json();
      console.log(data);
      if (data) {
        setVerifyOTP({
          error: data.error || "",
          message: data.message || "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowMessage(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTimer) => prevTimer - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <>{!verifyOTP.message ? (
      <div>
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
            disabled={showMessage}
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
        <>
          {/* {showMessage && <p>Resend OTP: {formatTime(timeLeft)}</p>} */}
          <p
            className={`${
              showMessage ? "block" : "hidden"
            } text-red-700 font-bold`}
          >
            {sendOTPerror}
          </p>
        </>
      ) : (
        <>
          {showMessage && <p>Resend OTP: {formatTime(timeLeft)}</p>}
          <p
            className={`${
              showMessage ? "block" : "hidden"
            } text-green-700 font-bold`}
          >
            {successMessage}
          </p>
        </>
      )}
      <div>
        {successMessage && (
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
        )}
        <div>
          {verifyOTP.error ? (
            <p
              className={`${
                showMessage ? "block" : "hidden"
              } text-red-700 font-bold`}
            >
              {verifyOTP.error}
            </p>
          ):(
            <p
              className={`${
                showMessage ? "block" : "hidden"
              } text-green-700 font-bold`}
            >
              {verifyOTP.message}
            </p>
          )} 
        </div>
      </div>
      </div>
    ) : <ChangePassword email={email}/>}
    
    </>
  )
};

export default ForgetPassword;
