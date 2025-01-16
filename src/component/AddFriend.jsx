import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

function AddFriend() {
  const [username, setUsername] = useState("");
  const [friends, setFriend] = useState([]);
  const [usernameOfNotificationList, setUsernameOfNotificationList] = useState(
    []
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState({
    error: "",
    success: "",
  });
  const { user, mySocket } = useContext(AuthContext);
  const navigate = useNavigate();

  const findFriends = async (event) => {
    event.preventDefault();

    setError("");
    message.error = "";
    message.success = "";
    const res = await fetch("http://localhost:3000/findFriend", {
      method: "POST",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, user }),
    });
    const friendData = await res.json();
    console.log(friendData);
    try {
      setUsernameOfNotificationList(
        friendData.usernmeOfNotificationList.notificationList
      );
      setFriend(friendData.filteredFriend);
    } catch (error) {
      if (friendData.error) {
        setError(friendData.error);
      } else {
        setFriend(friendData.filteredFriend);
      }
    }
  };

  const requestFriendHandler = async (event, dataOfFriend) => {
    event.preventDefault();
    if (mySocket)
      mySocket.emit("notificationSocketHandler", dataOfFriend, user);
  };

  const acceptFriendHandler = async (event, dataOfFriend) => {
    event.preventDefault();
    if (mySocket) {
      mySocket.emit("addFriendRequest", dataOfFriend, user.userId, user.username);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [friends]);

  return (
    <div>
      <div className="grid place-content-center">
        <h2 className="m-auto text-xl font-bold">Add Friend</h2>
      </div>
      <div className="mt-5 mb-0">
        <form className="flex justify-around" onSubmit={findFriends}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Search Friend"
            required
            className="rounded-lg h-9 pl-4"
          />
          <button className="rounded-lg h-9 w-12 cursor-pointer bg-blue-800">
            Find
          </button>
        </form>
        {message.error ? (
          <p className="text-red-700">{message.error}</p>
        ) : (
          <p className="text-green-700">{message.success}</p>
        )}
      </div>
      <div className="grid gap-y-3 mt-3">
        {error ? (
          <div className="flex h-7 m-auto rounded-md font-bold text-red-600">
            {error}
          </div>
        ) : (
          friends.map((item, index) => (
            <div
              key={index}
              className="flex h-7 mr-3 ml-3 rounded-md font-medium bg-slate-300 pl-4 pr-4 justify-between items-center"
            >
              <label>{item.username}</label>
              {usernameOfNotificationList.some(
                (array) => array.username == item.username
              ) ? (
                <button
                  onClick={(event) => acceptFriendHandler(event, item)}
                  className="rounded-md h-6 px-1 cursor-pointer text-red-700"
                >
                  Accept
                </button>
              ) : (
                <button
                  onClick={(event) =>
                    requestFriendHandler(event, item)
                  }
                  className="rounded-md h-6 px-1 cursor-pointer text-blue-800"
                >
                  Request
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AddFriend;
