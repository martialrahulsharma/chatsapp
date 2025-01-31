import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

function Notification() {
  const [notification, setNotification] = useState([]);
  const [notificationError, setNotificationError] = useState("");
  const { user, logout, mySocket } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchNotificationHandler = async (username) => {
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
    if (data.error) setNotificationError(data.error);
    if (data.data) setNotification(data.data);
    console.log(data.data);
  };

  useEffect(() => {
    if (!user) {
      logout();
      navigate("/");
    }
    fetchNotificationHandler(user.username);

    const emitNotificationHandler = (listOfNotifications) => {
      setNotification(listOfNotifications);
    };
    console.log(user);
    if (mySocket) {
      mySocket.off("emitNotification", emitNotificationHandler);
      mySocket.on("emitNotification", emitNotificationHandler);
    }
    return () => {
      mySocket.off("emitNotification", emitNotificationHandler);
    };
  }, []);

  const acceptFriendHandler = async (event, dataOfFriend) => {
    event.preventDefault();
    if (mySocket) {
      mySocket.emit(
        "addFriendRequest",
        dataOfFriend,
        user.userId,
        user.username,
        (response) => {
          setNotification(response.notificationList);
          if (response.notificationList.length === 0)
            setNotificationError("No any notifications");
        }
      );
    }
  };

  const declineFriendRequestHandler = async (event, dataOfFriend) => {
    event.preventDefault();
    if (mySocket) {
      mySocket.emit(
        "declineFriendRequest",
        dataOfFriend,
        user.userId,
        user.username,
        (response) => {
          setNotification(response.notificationList);
          if (response.notificationList.length === 0)
            setNotificationError("No any notifications");
        }
      );
    }
  };
  return (
    <>
      
      {notification.length !== 0 ? (
        <>
          {notification.map((notification, index) => (
            <div
              className="bg-gradient-to-r from-[#344563] to-[#5A8AA6] m-5 p-1 font-bold rounded-lg flex items-center justify-between"
              key={index}
            >
              <span>{notification.username}</span>
              <div className="flex gap-x-2">
                <span
                  className="rounded-md h-6 px-1 cursor-pointer bg-red-600 hover:bg-red-800 text-white"
                  onClick={(event) =>
                    declineFriendRequestHandler(event, notification)
                  }
                >
                  Decline
                </span>
                <span
                  className="rounded-md h-6 px-1 cursor-pointer bg-blue-600 hover:bg-blue-800 text-white"
                  onClick={(event) => acceptFriendHandler(event, notification)}
                >
                  Accept
                </span>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div>
          <h2>{notificationError}</h2>
        </div>
      )}
    </>
  );
}

export default Notification;
