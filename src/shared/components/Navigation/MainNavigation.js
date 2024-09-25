import { Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; // Import useNavigate here
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import useGlobalContext from "../../../context/global/useGlobalContext";
import useAuthActions from "../../../context/global/authActions";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function MainNavigation() {
  const state = useGlobalContext();
  const { loggedIn } = state;
  const { login, logout } = useAuthActions();

  const location = useLocation().pathname;
  const navigate = useNavigate(); // Initialize useNavigate here

  var [navigation, setNavigation] = useState([
    { name: "Jobs", href: "/jobs", current: true },
    { name: "Create", href: "/createPost", current: false },
    { name: "Staff", href: "/staff", current: false },
    { name: "Profile", href: "/profile", current: false },
    { name: "Authenticate", href: "/auth", current: false },
  ]);

  useEffect(() => {
    if (loggedIn) {
      setNavigation([
        { name: "Jobs", href: "/jobs", current: true },
        { name: "Create", href: "/createPost", current: false },
        { name: "Staff", href: "/staff", current: false },
        { name: "Profile", href: "/profile", current: false },
        {
          name: "Sign Out",
          href: "/signOut",
          current: false,
          action: () => {
            logout();
            navigate("/"); // Use navigate instead of redirect
          },
        },
      ]);
    } else {
      setNavigation([
        { name: "Jobs", href: "/jobs", current: true },
        { name: "Staff", href: "/staff", current: false },
        {
          name: "Sign In",
          href: "/signIn",
          current: false,
          action: () => {
            login();
            navigate("/"); // Use navigate instead of redirect
          },
        },
      ]);
    }
  }, [loggedIn]);

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
      {({ open }) => (
        <>
          <div className="mainnav sm:px-6 lg:px-8">
            <div className="mainnav-header flex justify-between items-center px-4 py-3">
              <div className="mainnav-title-link text-white font-bold text-xl">
                <Link to="/" className="no-underline">
                  LabConnect
                </Link>
              </div>
              <div className="sm:hidden">
                <Disclosure.Button className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md p-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="hidden sm:flex sm:space-x-4">
                {navigation.map((item) =>
                  !item.action ? (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={`${
                        location === item.href
                          ? "text-white"
                          : "text-gray-200"
                      } hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-300`}
                      aria-current={item.current}
                    >
                      {item.name}
                    </NavLink>
                  ) : (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className={`${
                        location === item.href
                          ? "text-white"
                          : "text-gray-200"
                      } hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-300`}
                      aria-current={item.current}
                    >
                      {item.name}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 bg-white shadow-md rounded-lg">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="block text-gray-800 hover:bg-gray-200 rounded-md px-4 py-2 transition duration-200"
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
