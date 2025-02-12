import { useState, useEffect, createContext } from "react";
import { jwtDecode } from "jwt-decode";
import { connectSocket, disconnectSocket } from "../../socket.js";
import config from "../../config.js";

export const AuthContext = createContext();

let socket;
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log(jwtDecode(token));
      return jwtDecode(token);
    }
    return null;
  });
  const [navbarAvatar, setNavbarAvatar] = useState(null);
  const [mySocket, setSocket] = useState(() => {
    return (socket = connectSocket());
  });
  const [isPopupOpen, setPopupOpen] = useState(true);

  const getUserProfileData = async () => {
    const res = await fetch(`${config.VARTA_APP_URL}getProfileImage`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    // Profile image
    if (res.status == "404") {
      const data = await res.json();
      console.log(data.error);
    } else
      res
        .blob()
        .then((blob) => {
          console.log(blob);
          const imageUrl = URL.createObjectURL(blob);
          setNavbarAvatar(imageUrl);
        })
        .catch((error) => {
          console.log(error);
        });
  }

  useEffect(() => {
    console.log("context");
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const tokenExpiratioTime = decoded.exp * 1000;
      if (Date.now() >= tokenExpiratioTime) {  
        console.log("Token has expired");
        logout();
      } else {
        getUserProfileData();
        console.log("Token is still valid");
        const socket = connectSocket();
        socket.emit("login", token);
        socket.emit("myRoom", user.username);
        if (socket) {
          // socket.off("connect");
          // Set up event listeners after socket is connected
          socket.on("connect", () => {
            
            console.log("Socket connected:", socket.connected);
            setSocket(socket);
            // socket.emit("login", token); // Emit login event after connecting
          });
        }
        socket.off("connect")
        setUser(decoded);
      }
    }
    return () =>{
      socket.off("connect");
    }
  }, []);

  const login = async (token) => {
    const socket = await connectSocket();
    console.log(socket);
    if (socket) {
      socket.off("connect");
      // socket.off("hello");
      socket.emit("login", token);
      const decoded = jwtDecode(token);
      socket.emit("myRoom", decoded.username);
      // Set up event listeners after socket is connected
      socket.on("connect", () => {
        console.log("Socket connected:", socket.connected);
        setSocket(socket);
        // socket.emit("login", token); // Emit login event after connecting
      });
    }

    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser(decoded);
    getUserProfileData();
  };

  const logout = async () => {
    mySocket.emit("logout");
    localStorage.removeItem("token");
    // sessionStorage.removeItem("isRefreshing")
    setUser(null);
    disconnectSocket();
    setSocket(null);
    setNavbarAvatar(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, mySocket, isPopupOpen, setPopupOpen, navbarAvatar }}
    >
      {children}
    </AuthContext.Provider>
  );
};
