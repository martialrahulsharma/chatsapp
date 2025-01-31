import { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "./authContext/AuthContext";

const Navbar = ({ navBarHidden, title }) => {
  const [showSidebar, setShowSidebar] = useState(navBarHidden);
  // const [isVisible, setIsVisible] = useState(showSidebar);
  // const [title, setTitle] = useState("");
  const [activeNavbar, setActiveNavbar] = useState("myFriend")
  const { user, logout, navbarAvatar } = useContext(AuthContext);
  console.log(user);

  return (
    <div className="relative">
      <div className="flex text-slate-300">
        <div>
          {showSidebar ? (
            user ? (
              <div
                className="items-center gap-4"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {navbarAvatar ? (
                  <img
                    src={navbarAvatar}
                    alt="avatar"
                    className="inline-block relative object-cover object-center !rounded-full w-12 h-12"
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name
                      .split(" ")
                      .join("+")}`}
                    alt="avatar"
                    className="inline-block relative object-cover object-center !rounded-full w-12 h-12"
                  />
                )}
              </div>
            ) : (
              <button
                className="flex text-4xl flex-col text-black items-center cursor-pointer z-30 px-2"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                X
              </button>
            )
          ) : user ? (
            <div className="" onClick={() => setShowSidebar(!showSidebar)}>
              {navbarAvatar ? (
                <img
                  src={navbarAvatar}
                  alt="avatar"
                  className="inline-block relative object-cover object-center !rounded-full w-12 h-12"
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name
                    .split(" ")
                    .join("+")}`}
                  alt="avatar"
                  className="inline-block relative object-cover object-center !rounded-full w-12 h-12"
                />
              )}
            </div>
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
        </div>
        <div className="flex flex-1 text-xl font-bold justify-center items-center">
          <span>{title}</span>
        </div>
      </div>
      <div
  className={`flex flex-col absolute text-slate-300 bg-gradient-to-r from-[#344563] to-[#5A8AA6] font-bold z-40 
    transition-all duration-300 ease-in-out 
    ${showSidebar ? "translate-y-0 opacity-100 scale-100" : "translate-y-[-20px] opacity-0 scale-95 collapse"}
  `}
>
        {user ? (
          <>
            <div>
              <h6 className="text-slate-300 font-semibold border-b-2">
                {user.name}
              </h6>
            </div>
            <NavLink
              to="/notification"
              className={`p-2 hover:text-white ${activeNavbar === "notification" ? "bg-[#344563]" : "hover:bg-gray-700"}`}
              onClick={() => {
                setShowSidebar(!showSidebar);
                setActiveNavbar("notification");
              }}
            >
              Notification
            </NavLink>
            <NavLink
              to="/profile"
              className={`p-2 hover:text-white ${activeNavbar === "profile" ? "bg-[#344563]" : "hover:bg-gray-700"}`}
              onClick={() => {
                setShowSidebar(!showSidebar);
                setActiveNavbar("profile");
              }}
            >
              Profile
            </NavLink>
            <NavLink
              to="/myFriend"
              className={`p-2 hover:text-white ${activeNavbar === "myFriend" ? "bg-[#344563]" : "hover:bg-gray-700"}`}
              onClick={() => {
                setShowSidebar(!showSidebar);
                setActiveNavbar("myFriend");
              }}
            >
              My Friend
            </NavLink>
            <NavLink
              to="/addFriend"
              className={`p-2 hover:text-white ${activeNavbar === "addFriend" ? "bg-[#344563]" : "hover:bg-gray-700"}`}
              onClick={() => {
                setShowSidebar(!showSidebar);
                setActiveNavbar("addFriend");
              }}
            >
              Add Friend
            </NavLink>
            <NavLink
              to="/"
              className="p-2 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                setShowSidebar(!showSidebar);
                logout();
              }}
            >
              Logout
            </NavLink>
          </>
        ) : (
          <NavLink
            to="/"
            className="p-2 hover:bg-gray-700 hover:text-white"
            onClick={() => {
              setShowSidebar(!showSidebar);
            }}
          >
            Login
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Navbar;
