import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";
import ChatRoom from "./ChatRoom";
import { Socket } from "socket.io-client";
// import io from "socket.io-client";
// import {connectSocket} from "../socket.js"

function MyFriends() {
  const [friendList, setFriendList] = useState([]);
  const [error, setError] = useState(null);
  const [showChatArea, setShowChatArea] = useState(false);
  const [namePlate, setNamePlate] = useState("My Friend");
  const [friendUsername, setFriendUsername] = useState("");
  const { user, logout, mySocket, isPopupOpen, setPopupOpen } =
    useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState({ chatIsOpen: false, refresh: true });
  const [MesageBadge, setMessageBadge] = useState([]);
  const [unreadMessages, setUnreadMessage] = useState([]);
  const [isUserJoinRoom, setIsUserJoinRoom] = useState(true);

  const navigate = useNavigate();

  const getFriendListData = async () => {
    setError("");
    setShowChatArea(false);
    try {
      const res = await fetch("http://localhost:3000/myfriends", {
        method: "GET",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log(data);
      if (data.error) setError(data.error);
      else setFriendList(data);
    } catch (error) {
      alert(error);
    }
  };

  const openChatRoomHandler = (event, friendName, friendUsername) => {
    setNamePlate(friendName);
    setShowChatArea(true);
    setFriendUsername(friendUsername);
  };

  function chatBoxOff(offOn, roomId) {
    if (offOn == false) {
      if (user && roomId) {
        // Ensure both user and roomId are defined
        mySocket.emit("leaveRoom", { username: user.username, roomId });

        // Find the first unread message by a specific sender (if needed)
        const unreadUserMessage = unreadMessages.find(
          (message) => message.sender === friendUsername
        );
        if (unreadUserMessage) {
          const unreadMessageIndex = unreadMessages.findIndex(
            (user) => user.sender == unreadUserMessage.sender
          );
          unreadMessages[unreadMessageIndex].message = 0;
        } else {
          console.log("No unread messages from the user.");
        }
      } else {
        console.error("User or roomId is undefined.");
      }
    }
    if (!offOn) setNamePlate("My Friend");
    setShowChatArea(offOn);
    isOpen.chatIsOpen = offOn;
    if (!offOn) isOpen.refresh = false;
  }

  function updateFriendList(isLoggedInUserData) {
    setFriendList((prevFriendList) =>
      prevFriendList.map((friend) => {
        return friend.username == isLoggedInUserData.username
          ? { ...friend, isLoggedIn: isLoggedInUserData.isLoggedIn }
          : friend;
      })
    );
  }

  // Compute the message count for each user
  const messageCounts = friendList.map((username) => {
    // Find the user in the second array
    const user = unreadMessages.find(
      (message) => message.sender === username.username
    );
    // Return the length of the messages if the user exists, otherwise 0
    return user ? user.message : 0;
  });
  console.log(messageCounts);

  useEffect(() => {
    console.log("my friend page");
    console.log(mySocket);
    if (!user) {
      logout();
      navigate("/");
    }
    const isLoggedInUserDataHandler = (isLoggedInUserData) =>{
      console.log({ isLoggedInUserData });
        if (isLoggedInUserData.isLoggedIn) {
          if (isOpen.chatIsOpen) {
            setIsLoggedIn(true);
            updateFriendList(isLoggedInUserData);
          } else updateFriendList(isLoggedInUserData);
        } else {
          if (isOpen.chatIsOpen) {
            setIsLoggedIn(false);
            updateFriendList(isLoggedInUserData);
          } else updateFriendList(isLoggedInUserData);
        }
    }

    const myFriendJoinRoom = (arrayOfUnreadMessages) => {
      console.log(arrayOfUnreadMessages);
    }

    const unreadMessageSocketHandler = (unreadSenderMessage) => {
      console.log(unreadSenderMessage);
      setUnreadMessage(unreadSenderMessage);
    }

    if (mySocket) {
      setTimeout(() => {
        if (mySocket.connected && user.username)
          mySocket.emit("myRoom", user.username);
          // setIsUserJoinRoom(false)
          console.log("123456789");
      }, 1000);
      getFriendListData();
      // Remove existing listener to avoid duplicates
      mySocket.off("isLoggedIn", isLoggedInUserDataHandler);
      mySocket.off("myRoom", unreadMessageSocketHandler);
      mySocket.off("myFriendJoinRoom", myFriendJoinRoom);
      // add listener
      mySocket.on("isLoggedIn", isLoggedInUserDataHandler);
      mySocket.on("myRoom", unreadMessageSocketHandler);
      mySocket.on("myFriendJoinRoom", myFriendJoinRoom);
    }

    // mySocket.off("myRomm");
    
    return () => {
      if (mySocket) {
        mySocket.off("isLoggedIn", isLoggedInUserDataHandler);
        mySocket.off("myRoom", unreadMessageSocketHandler);
        mySocket.off("myFriendJoinRoom", myFriendJoinRoom);
      }
    };
  }, [mySocket]);

  return (
    <div>
      <div className="grid place-content-center">
        <h2 className="m-auto text-xl font-bold">{namePlate}</h2>
      </div>
      {isPopupOpen ? (
        <div className="grid gap-y-3 mt-7">
          {error ? (
            <p className="text-red-700">{error}</p>
          ) : (
            friendList.map((myFriendsData, index) => (
              <div
                key={index}
                className="flex h-7 mr-3 ml-3 rounded-md font-medium bg-slate-300 pl-4 pr-4 justify-between items-center cursor-pointer"
                onClick={(event) => {
                  setPopupOpen(false);
                  openChatRoomHandler(
                    event,
                    myFriendsData.name,
                    myFriendsData.username
                  );
                }}
              >
                <label className="cursor-pointer">{myFriendsData.name}</label>
                <div className="flex items-center space-x-2">
                  {myFriendsData.isLoggedIn ? (
                    <>
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>
                        {messageCounts[index] !== 0 ? messageCounts[index] : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                      <span>
                        {messageCounts[index] !== 0 ? messageCounts[index] : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <ChatRoom
          friendUsername={friendUsername}
          showChatArea={showChatArea}
          chatBoxOff={chatBoxOff}
        />
      )}
    </div>
  );
}

export default MyFriends;
