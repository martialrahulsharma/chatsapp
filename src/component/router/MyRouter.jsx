import React, {useEffect, useState, useContext} from 'react'
// import "./App.css";
import SignupUser from "../Signup";
import Login from '../Login'
import AddFriend from "../AddFriend";
import UserProfile from "../UserProfile";
import MyFriends from "../MyFriends";
import ChatRoom from "../ChatRoom";
import Navbar from "../Navbar";
import Notification from '../Notification';
import ForgetPassword from '../ForgetPassword';
import { AuthProvider } from "../authContext/AuthContext";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

function MyRouter() {
  const [title, setTitle] = useState("");
    const [navBarHidden, setNavBarHidden] = useState(false);
    const location = useLocation();

    useEffect(() => {
      console.log(onclick);
      console.log(location.pathname);
      switch (location.pathname) {
        case "/notification":
          setTitle("Notification");
          break;
        case "/profile":
            setTitle("Profile");
            break;
        case "/myFriend":
          setTitle("My Friend");
          break;
        case "/addFriend":
          setTitle("Add Friend");
          break;
        case "/":
          setTitle("Login");
          break;
        case "/signup":
          setTitle("Signup");
          break;
        case "/forgetPassword":
          setTitle("Forget Password");
          break;
        default:
          setTitle("Default Title");
      }
    }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="flex flex-col gap-y-2 w-1/2 m-auto p-2 h-screen border border-[#4deeea] bg-transparent text-black rounded-xl shadow-custom-deep">
      <div className="bg-gradient-to-r from-[#dbdde0] via-[#5A8AA6] to-[#dbdde0] font-bold rounded-xl">
        <h2>Varta App</h2>
      </div>
      {/* <Router> */}
        <Navbar navBarHidden={navBarHidden} title={title}/>
      <div className="flex">
        <div className="flex-grow w-2/4">
          <Routes>
            <Route path="/" element={<Login/>} />
            <Route path="/signup" element={<SignupUser />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/myFriend" element={<MyFriends/>} />
            <Route path="/addFriend" element={<AddFriend />} />
            <Route path="/chatRoom" element={<ChatRoom />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
          </Routes>
        </div>
      </div>
    {/* </Router> */}
      </div>
    </AuthProvider>
  )
}

export default MyRouter;