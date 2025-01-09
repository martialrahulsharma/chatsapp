import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

function Notification() {
  const [notification, setNotification] = useState(["rahul"]);
  const { user, logout, mySocket, isPopupOpen, setPopupOpen } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchNotificationHandler = async (username) =>{
    const res = await fetch("http://localhost:3000/getNotification", {
      method: "POST",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const friendData = await res.json();
    console.log(friendData);
  }

  useEffect(() => {
    if (!user) {
      logout();
      navigate("/");
    }
    fetchNotificationHandler();

    const emitNotificationHandler = (listOfNotifications) =>{
      console.log(listOfNotifications);
    }
    console.log(user);
    if(mySocket){
      mySocket.off("emitNotification", emitNotificationHandler);
      mySocket.on("emitNotification", emitNotificationHandler);
    }
    return () =>{
      mySocket.off("emitNotification", emitNotificationHandler);
    }
  }, []);

  const acceptHandler = () => {};
  return (
    <>
      {notification.length !== 0 ? (
        <>
          <div className="">
            <h2 className="m-auto text-xl font-bold">Notification</h2>
          </div>

          {notification.map((notification, index) => (
            <div
              className="bg-slate-300 m-5 p-1 font-bold rounded-lg flex items-center justify-between"
              key={index}
            >
              <span>{notification}</span>
              <span
                className="text-blue-800 cursor-pointer"
                onClick={(event) => acceptHandler(index)}
              >
                Accept
              </span>
            </div>
          ))}
        </>
      ) : (
        <div>
          <h2>No any notification</h2>
        </div>
      )}
    </>
  );
}

export default Notification;
