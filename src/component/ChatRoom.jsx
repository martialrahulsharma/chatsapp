import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";
import ReadMore from "./ReadMore";

function ChatRoom({ friendUsername, showChatArea, chatBoxOff }) {
  const [message, setMessage] = useState({
    message: "",
    sender: "",
  });
  const { user, mySocket, isPopupOpen, setPopupOpen } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [showMessage, setShowMessage] = useState([]);
  const [chatBoxIsOpen, setChatBoxIsOpen] = useState(false);
  const [roomId, setRoomId] = useState(null);
  
  function generateRoomId(user1, user2) {
    // Create a unique room ID based on the user names
    const sortedUsers = [user1, user2].sort();
    return `${sortedUsers[0]}-${sortedUsers[1]}`;
  }

  const sendMessageHandler = async (event) => {
    event.preventDefault();
    // let trimMessage = message.message.trim();
    setMessage(() => ({
      message: message.message.trim(),
      sender: user.username,
    }));
    mySocket.emit("send_message", roomId, message, user2);
    console.log(roomId);
    console.log("send message");      
    setMessage((prev) => ({
      ...prev,
      message: "",
    }));
  };

  // Scroll to the bottom of the container
  const scrollToBottom = () => {
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };

  // join room and socket receive messages 
  useEffect(() => {
    if (!user) {
      setUser1(null);
      setUser2(null);
      navigate("/");
    }

    setChatBoxIsOpen(showChatArea);
    chatBoxOff(showChatArea, roomId)
    setUser1(user.username);
    setUser2(friendUsername);

    let generatedRoomId = generateRoomId(user.username, friendUsername)
    if(generatedRoomId) setRoomId(generatedRoomId)

    const receiveMessageSocketHandler = (message) => {
      console.log(message);
      if (message.length >= showMessage.length) setShowMessage(message);
      else setShowMessage((prevMessage) => [...prevMessage, message]);
    }

    if (mySocket) {
      mySocket.emit("join_room", user.username, friendUsername);
      setMessage({
        message: "",
        sender: user.username,
      });
      mySocket.off("receive_message", receiveMessageSocketHandler);
      mySocket.on("receive_message", receiveMessageSocketHandler);
      if (roomId) mySocket.emit("friendMessageIsRead",roomId, friendUsername)
    }
    return () => {
      mySocket.off("receive_message", receiveMessageSocketHandler);
    };
  }, [roomId]);

  // Use effect to scroll down whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [showMessage]); // Whenever the messages array changes, scroll to the bottom

  return (
    <div>
      <div
        id="messageContainer"
        className="flex flex-col border-2 m-1 h-96 p-0 overflow-y-auto hide-scrollbar"
      >
        <span
          className="sticky top-0 text-right font-extrabold px-3 text-lg text-red-600 cursor-pointer bg-slate-400"
          onClick={() => {
            setPopupOpen(true)
            setChatBoxIsOpen(false);
            chatBoxOff(false, roomId);
          }}
        >
          X
        </span>
        {showMessage.map((msg, index) => {
          return (
            <div
              key={index}
              className={`m-1 p-1 rounded w-3/4 text-start max-w-max overflow-hidden break-words min-h-max ${
                user.username == msg.sender
                  ? "ml-auto bg-green-200"
                  : "mr-auto bg-white"
              }`}
            >
              <ReadMore text={msg.message} maxLength={100} />
              <div className="flex float-end text-xs text-slate-600">
                <p>{`${String(new Date(msg.timestamp).getHours()).padStart(
                  2,
                  0
                )}:${String(new Date(msg.timestamp).getMinutes()).padStart(
                  2,
                  0
                )}`}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <form onSubmit={sendMessageHandler} className="flex justify-around">
          <input
            type="text"
            autoFocus="on"
            value={message.message}
            placeholder="Message"
            className="rounded-lg h-9 px-2"
            required
            onChange={(event) => {
              let value = event.target.value;
              setMessage(() => ({
                message: value,
                sender: user.username,
              }));
            }}
          />
          <button
            type="submit"
            className="rounded-lg h-9 w-12 cursor-pointer bg-blue-800"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;
