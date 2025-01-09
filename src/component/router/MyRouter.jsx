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
import { AuthProvider } from "../authContext/AuthContext";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function MyRouter() {
    const [navBarHidden, setNavBarHidden] = useState(false);
  return (
    <AuthProvider>
      <div className="p-0 w-full h-screen border-2 bg-slate-400 rounded-xl">
      <div className="bg-slate-300 m-5 font-bold rounded-xl">
        <h2>Varta App</h2>
      </div>
      <Router>
      <div className="flex">
        <Navbar navBarHidden={navBarHidden} />
        <div className="flex-grow w-2/4">
          <Routes>
            <Route path="/" element={<Login/>} />
            <Route path="/signup" element={<SignupUser />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/myFriend" element={<MyFriends />} />
            <Route path="/addFriend" element={<AddFriend />} />
            <Route path="/chatRoom" element={<ChatRoom />} />
            <Route path="/notification" element={<Notification />} />
          </Routes>
        </div>
      </div>
    </Router>
      </div>
    </AuthProvider>
  )
}

export default MyRouter;