import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

const Navbar = ({ navBarHidden }) => {
  const [showSidebar, setShowSidebar] = useState(navBarHidden);
  const { user, logout, mySocket } = useContext(AuthContext);
  return (
    <>
      <div className="flex absolute">
        {showSidebar ? (
          <button
            className="flex text-4xl flex-col text-black items-center cursor-pointer z-30 px-2"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            X
          </button>
        ) : (
          <svg
            onClick={() => setShowSidebar(!showSidebar)}
            className="z-30 flex items-center cursor-pointer px-1"
            fill="#00000"
            viewBox="0 0 100 80"
            width="40"
            height="40"
          >
            <rect width="100" height="7"></rect>
            <rect y="30" width="100" height="7"></rect>
            <rect y="60" width="100" height="7"></rect>
          </svg>
        )}
        <div
          className={`flex flex-col bg-slate-300 w-auto text-black font-bold h-auto z-40 transition ease-in-out duration-300 ${
            showSidebar ? "translate-x-0" : "translate-x-full hidden"
          }`}
        >
          {user ? (
            <>
              <NavLink
                to="/profile"
                className="p-4 hover:bg-gray-700 hover:text-white"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                Profile
              </NavLink>
              <NavLink
                to="/myFriend"
                className="p-4 hover:bg-gray-700 hover:text-white"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                My Friend
              </NavLink>
              <NavLink
                to="/addFriend"
                className="p-4 hover:bg-gray-700 hover:text-white"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                Add Friend
              </NavLink>
              <NavLink
                to="/"
                className="p-4 hover:bg-gray-700 hover:text-white"
                onClick={() => {
                  setShowSidebar(!showSidebar);
                  // mySocket.emit("logout");
                  // mySocket.disconnect();
                  // console.log("before logout");
                  logout();
                  // console.log("after logout");
                }}
              >
                Logout
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/"
              className="p-4 hover:bg-gray-700 hover:text-white"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
