import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

function AddFriend() {
  const [username, setUsername] = useState("");
  const [friends, setFriend] = useState([]);
  const [addFriend, setAddFriend] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState({
    error: "",
    success: "",
  });
  const { user } = useContext(AuthContext);
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
      body: JSON.stringify({ username }),
    });
    const friendData = await res.json();
    console.log(friendData);
    if (friendData.error) {
      setError(friendData.error);
    } else {
      setFriend(friendData);
    }
  };

  const addFriendHandler = async (event, usernameOfFriend) => {
    event.preventDefault();
    const res = await fetch("http://localhost:3000/addFriendInList", {
      method: "POST",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usernameOfFriend }),
    });

    const addFriendResponse = await res.json();
    if (addFriendResponse.error) {
      setMessage((prev)=>({
        ...prev,
        error: message.error = addFriendResponse.error,
      }));
    }else{
      setMessage((prev)=>({
        ...prev,
        success: message.success = addFriendResponse.message,
      }));
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
        {
          message.error ? <p className="text-red-700">{message.error}</p> : <p className="text-green-700">{message.success}</p>
        }
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
              <label>{item}</label>
              <button
                onClick={() => addFriendHandler(event, item)}
                className="rounded-lg h-6 w-12 cursor-pointer bg-blue-800"
              >
                Add
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AddFriend;
