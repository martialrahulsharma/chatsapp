import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

function Notification() {
  const [notification, setNotification] = useState([]);
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
    const data = await res.json();
    console.log(data);
    setNotification(data.data);
  }

  useEffect(() => {
    if (!user) {
      logout();
      navigate("/");
    }
    fetchNotificationHandler(user.username);

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

  const acceptHandler = (friendRequesterUsername) => {
console.log(friendRequesterUsername);
  };
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
              <span>{notification.username}</span>
              <span
                className="text-blue-800 cursor-pointer"
                onClick={(event) => acceptHandler(notification.username)}
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
