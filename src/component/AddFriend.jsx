import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

function AddFriend() {
  const [username, setUsername] = useState("");
  const [friends, setFriend] = useState([]);
  const [myFriend, setMyFriend] = useState([]);
  const [requestList, setRequestList] = useState([]);
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
      setRequestList(friendData.requestedFriendList);
      setMyFriend([...friendData.myFriendList, user.userId]);
      console.log([...friendData.myFriendList, user.userId]);
    } catch (error) {
      if (friendData.error) {
        setError(friendData.error);
      } else {
        setFriend(friendData.filteredFriend);
        setMyFriend([...friendData.myFriendList, user.userId]);
        setRequestList(friendData.requestedFriendList);
      }
    }
  };

  const requestFriendHandler = async (event, dataOfFriend) => {
    event.preventDefault();
    if (mySocket)
      mySocket.emit(
        "notificationSocketHandler",
        dataOfFriend,
        user,
        (response) => {
          console.log(response);
          setRequestList(response);
        }
      );
  };

  const acceptFriendHandler = async (event, dataOfFriend) => {
    event.preventDefault();
    if (mySocket) {
      mySocket.emit(
        "addFriendRequest",
        dataOfFriend,
        user.userId,
        user.username,
        (response) => {
          console.log(response);
          setMyFriend([...response.friendList, user.userId]);
          setUsernameOfNotificationList(response.notificationList);
        }
      );
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [friends, requestList, myFriend]);

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
              key={item.userId}
              className="flex h-7 mr-3 ml-3 rounded-md font-medium bg-slate-300 pl-4 pr-4 justify-between items-center"
            >{console.log(usernameOfNotificationList)}
              <label>{item.username}</label>
              {usernameOfNotificationList.some(
                (array) => array.username === item.username
              ) ? (
                <button
                  onClick={(event) => acceptFriendHandler(event, item)}
                  className="rounded-md h-6 px-1 cursor-pointer text-red-700"
                >
                  Accept
                </button>
              ) : !myFriend.some((dost) => dost == item.userId) ? (
                requestList && requestList.some((entry) => item.username == entry.username) ? (
                  <label className="rounded-md h-6 px-1 text-blue-800 opacity-75">
                    Requested
                  </label>
                ) : (
                  <button
                    onClick={(event) => requestFriendHandler(event, item)}
                    className="rounded-md h-6 px-1 cursor-pointer text-blue-800"
                  >
                    Send Request
                  </button>
                )
              ) : (
                ""
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AddFriend;
