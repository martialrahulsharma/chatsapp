import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext/AuthContext";
import { useNavigate } from "react-router-dom";
import config from "../config";

function UserProfile() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(URL.createObjectURL(event.target.files[0]));
      setProfileImage(event.target.files[0]);
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const formData = new FormData();
    formData.append("image", profileImage);
    formData.append("name", name);
    formData.append("user", user.userId);
    const res = await fetch(`${config.VARTA_APP_URL}saveProfile`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (data.message) setMessage(data.message);
    if (data.error) setError(data.error);
    setShowMessage(true);
  };

  const getUserProfileData = async () => {
    const res = await fetch(`${config.VARTA_APP_URL}getProfileImage`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    const resData = await fetch(`${config.VARTA_APP_URL}getProfileData`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
    });

    const profileData = await resData.json();
    if (resData.status == 404) {
      // const profileData = await resData.json();
      setError(profileData.error);
    } else {
      setName(profileData.name);
    }

    // Profile image
    if (res.status == "404") {
      const data = await res.json();
      setError(data.error);
    } else
      res
        .blob()
        .then((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          console.log(imageUrl);
          setSelectedImage(imageUrl);
        })
        .catch((error) => {
          console.log(error);
        });
  };
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
    getUserProfileData();
  }, []);

  return (
    <div>
      <form
        onSubmit={submitHandler}
        className="flex flex-col mt-5 items-center gap-y-4"
      >
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your Name"
          className="rounded-lg h-9 pl-4"
        />
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={selectedImage || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-2 border-gray-300"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute bottom-0 right-0 opacity-0 w-full h-full cursor-pointer"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <button className="rounded-lg h-9 w-12 cursor-pointer bg-blue-800">
          Save
        </button>
      </form>
      <p
        className={`${
          showMessage ? "block" : "hidden"
        } text-green-700 font-bold`}
      >
        {message}
      </p>
      <p
        className={`${showMessage ? "block" : "hidden"} text-red-700 font-bold`}
      >
        {error}
      </p>
    </div>
  );
}

export default UserProfile;
