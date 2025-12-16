"use client";
import useSocket from "@/hooks/useSocket";
import { getResponse, postResponse } from "@/lib/response";
import { incrementUnreadCount, setUnreadCount } from "@/store/slices/notificationSlice";
import { openLocationModal, setLocation } from "@/store/slices/userSlice";
import {
  clearCurrentUserCookie,
  getCookieItem,
  getCurrentUserCookie,
  setCookieItem,
} from "@/utils/cookieUtils";
import axios from "axios";
import { Bell, ChevronDown, MapPin, Menu, Shield, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Ahmedabad from "../../assets/locations/Ahmedabad.png";
import Bengaluru from "../../assets/locations/Bengaluru.png";
import Chandigarh from "../../assets/locations/Chandigarh.png";
import Chennai from "../../assets/locations/Chennai.png";
import Delhi from "../../assets/locations/Delhi.png";
import Hyderabad from "../../assets/locations/Hyderabad.png";
import Kochi from "../../assets/locations/Kochi.png";
import Kolkata from "../../assets/locations/Kolkata.png";
import Mumbai from "../../assets/locations/Mumbai.png";
import Pune from "../../assets/locations/Pune.png";
import logo from "../../assets/logo.png";
import AddressAutocomplete from "../addressAutocomplete";
import Button from "../button";
import Input from "../input";
import Modal from "../modal";
import NotificationDrawer from "../NotificationDrawer";

const Header = () => {

  const socket = useSocket()
  const user_location_data = getCookieItem("user_location")
  const [openMenu, setOpenMenu] = useState(false);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [selectedCityData, setSelectedCityData] = useState({
    city: user_location_data?.city || ""
  })
  const [apiCities, setApiCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const openModel = useSelector(((state) => state.user.isOpenLocationModal));
  const dispatch = useDispatch()

  const router = useRouter();
  const profileMenuRef = useRef(null);
  const drawerOpenRef = useRef(openNotificationDrawer);


  const pathname = usePathname();
  const user = getCurrentUserCookie() || {};
  const is_logged_in_user = Object.keys(user).length > 0
  const firstLetter = user?.first_name?.charAt(0)?.toUpperCase() || "U";
  const userLocation = useSelector((state) => state.user.location);


  // Logout function
  const handleLogout = async () => {
    try {
      await postResponse({
        apiEndPoint: "auth/logout",
        payload: {},
      });
      // Remove user cookie
      clearCurrentUserCookie();
      // Navigate to login page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigation JSON - Business Owner routes
  const businessOwnerNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Promotions", path: "/promotions" },
    { label: "Offers", path: "/offers" },
    { label: "Branch", path: "/branches" },
  ];

  // Navigation JSON - Admin routes
  const adminNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Promotions", path: "/promotions" },
    { label: "Offers", path: "/offers" },
    { label: "Branch", path: "/branches" },
    // {
    //   label: "Admin Panel",
    //   path: "/admin/dashboard",
    //   icon: <Shield className="w-4 h-4" />,
    //   badge: "ADMIN",
    // },
  ];


  const userNavItems = [
    {
      label: "Home",
      path: "/"
    },
    {
      label: "About Us",
      path: "/about-us"
    },
    {
      label: "Contact Us",
      path: "/contact-us"
    }
  ]

  // Use appropriate navigation based on user role

  let navItems;
  if (user.role === "user" || Object.keys(user).length === 0) {
    navItems = userNavItems
  } else if (user.role === "admin") {
    navItems = adminNavItems
  } else {
    navItems = businessOwnerNavItems
  }




  // keep ref updated when state changes
  useEffect(() => {
    drawerOpenRef.current = openNotificationDrawer;
  }, [openNotificationDrawer]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true);
        const response = await getResponse({ apiEndPoint: "/business/city" });
        if (response.successType && response.response.data) {
          const cities = response.response.data.map(city => ({ value: city, label: city }));
          setApiCities(cities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setCitiesLoading(false);
      }
    };
    if (openModel) {
      fetchCities();
    }
  }, [openModel]);


  const handleClose = () => {
    if (user_location_data) {
      dispatch(openLocationModal(false))
    }
  }

  const onCitySelect = (selected) => {
    const city = selected?.value || ""
    setSelectedCityData({ city })
    const locationData = { city }
    setCookieItem("user_location", locationData)
    dispatch(setLocation(locationData))
    dispatch(openLocationModal(false))
  }

  // Handle popular city selection
  const handleCitySelect = (loc_item) => {

    const city = loc_item.label
    setSelectedCityData({ city })
    const locationData = { city }
    setCookieItem("user_location", locationData)
    dispatch(setLocation(locationData))
    dispatch(openLocationModal(false))
  }



  // get user location name using lat, log

  const getUserLocationName = async (lat, lon) => {
    // const res = await fetch(
    //     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
    // );

    // ============================ not getting excect location need to change API ==============================
    const res = await axios.get(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
    );
    const data = res.data.features?.[0]?.properties?.address_line2;
    return data
  }

  // ditect user location 
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;


        const formatted = await getUserLocationName(lat, lon)
        const data = {
          lat,
          lon,
          formatted: formatted
        }
        // Store in cookies
        setCookieItem("user_location", data);
        dispatch(setLocation(data))

        alert("Location permission granted!");
        dispatch(openLocationModal(false))
      },
      (error) => {
        console.error(error);
        alert("User denied location or an error occurred.");
      }
    );
  }


  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getResponse({ apiEndPoint: "/notification/unread-count" });
        if (response?.successType && response?.response?.data !== undefined) {
          dispatch(setUnreadCount(response.response.data));
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
        dispatch(setUnreadCount(0));
      }
    };
    if (is_logged_in_user) {
      fetchUnreadCount();
    }
  }, [dispatch]);


  useEffect(() => {
    socket.on("receive-user-notification", (data) => {
      if (data.role.includes(user.role) && !drawerOpenRef.current) {
        const new_data = data.data.find((item) => item.user_id === user.id)

        if (new_data) {
          dispatch(incrementUnreadCount());
        }
      }
    });
  }, [dispatch])

  // Placeholder locations - replace with actual images from assets/location
  const locations = apiCities.slice(0, 10);


  const images = [Ahmedabad, Bengaluru, Chandigarh, Hyderabad, Ahmedabad, Bengaluru, Chandigarh, Hyderabad, Ahmedabad, Bengaluru,]


  return (
    <header className="w-full bg-gradient-to-r from-[#DAF1ED] via-[#F1FAF8] to-[#F1FAF6] ">
      <div className="flex items-center justify-between px-4 md:px-4 lg:px-6 py-4 md:py-5">
        {/* LEFT: Logo */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Icon */}
          <button className="md:hidden" onClick={() => setOpenMobileNav(true)}>
            <Menu className="w-5 h-5 text-[var(--color-text-primary)]" />
          </button>

          {/* Clickable Logo */}
          <Link
            href={user.role === "user" || Object.keys(user).length === 0 ? "/" : "/dashboard"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image src={logo} width={140} height={40} alt="logo" className="w-20 h-7 md:w-36 md:h-10" />
          </Link>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex space-x-4 lg:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`
                py-2 text-sm md:text-sm lg:text-lg transition flex items-center space-x-1
                ${pathname === item.path
                  ? "text-[var(--color-secondary)] font-semibold border-b-2 border-[var(--color-secondary)]"
                  : "text-[var(--color-text-primary)] hover:text-[var(--color-secondary)]"
                }
              `}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-6">
          {/* Location Display */}
          {userLocation && (user.role === "user" || Object.keys(user).length === 0) && (
            <div className="flex items-center space-x-2 text-[var(--color-text-primary)]">
              <div className="p-2 md:p-2 lg:p-3 cursor-pointer rounded-[10px] flex items-center justify-center" onClick={() => dispatch(openLocationModal(true))} style={{ backgroundColor: 'var(--color-primary)' }}>
                <MapPin className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-[var(--color-secondary)]" />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs md:text-xs lg:text-sm text-[var(--color-text-muted)]">Location</span>
                <span className="text-xs md:text-sm font-medium">{`${userLocation.city.at(0).toUpperCase()}${userLocation.city.slice(1)}`}</span>
              </div>
            </div>
          )}

          {/* Admin Badge for non-admin routes */}
          {/* {user.role === "admin" && !pathname.startsWith("/admin/") && (
            <Link
              href="/admin/dashboard"
              className="hidden md:flex items-center space-x-1 px-2 py-1 md:px-3 md:py-1 bg-red-100 text-red-700 rounded-full text-xs md:text-sm font-medium hover:bg-red-200 transition"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )} */}

          {/* Notification */}
          {is_logged_in_user && <div className="relative cursor-pointer" onClick={() => setOpenNotificationDrawer(!openNotificationDrawer)}>
            <Bell className="w-6 h-6 text-gray-600 hover:text-[var(--color-secondary)] transition" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>}

          {/* Profile or Login Button */}
          {is_logged_in_user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold border-2 ${user.role === "admin"
                    ? "bg-red-200 text-red-700 border-red-300"
                    : "bg-pink-200 text-pink-700 border-pink-300"
                    }`}
                >
                  {firstLetter || ""}
                </div>

                <span className="hidden md:block text-sm md:text-sm lg:text-base text-[var(--color-text-primary)] font-medium">
                  {user.first_name} {user.last_name}
                </span>

                <ChevronDown
                  className={`hidden md:block w-4 h-4 text-[var(--color-text-primary)] transition ${openMenu ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* DROPDOWN */}
              <div
                className={`
                  absolute right-0 w-48 bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden z-50
                  transition-all duration-200 origin-top
                  ${openMenu
                    ? "opacity-100 scale-100 translate-y-2"
                    : "opacity-0 scale-95 pointer-events-none"
                  }
                `}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role === "admin" ? "Administrator" : user.role === "business_owner" ? "Business Owner" : "User"}
                  </p>
                </div>

                <button
                  onClick={() => router.push("/profile")}
                  className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-50 text-[var(--color-text-primary)] font-medium"
                >
                  Profile
                </button>

                {/* {user.role === "admin" && (
                  <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )} */}

                <button
                  onClick={handleLogout}
                  className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-50 text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            /* Login Buttons for non-logged in users */
            /* Login Buttons for non-logged in users (Desktop) */
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                href="/login"
                className="px-3 py-1.5 md:px-4 md:py-2 bg-[var(--color-secondary)] text-white font-medium rounded-lg hover:bg-opacity-90 transition text-xs md:text-sm"
              >
                Login
              </Link>
              {/* <Link
                href="/login?role=business_owner"
                className="px-3 py-1.5 md:px-4 md:py-2 bg-[var(--color-primary)] text-[var(--color-secondary)] font-medium rounded-lg hover:bg-opacity-90 transition text-xs md:text-sm border border-[var(--color-secondary)]"
              >
                Login Business Owner
              </Link> */}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE LOGIN BUTTONS ROW */}
      {!is_logged_in_user && (
        <div className="lg:hidden flex items-center justify-end space-x-3 pb-4 px-4 md:px-6">
          <Link
            href="/login"
            className="px-4 py-2 bg-[var(--color-secondary)] text-white font-medium rounded-lg text-center hover:bg-opacity-90 transition text-sm"
          >
            Login
          </Link>
          {/* <Link
            href="/login?role=business_owner"
            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-secondary)] font-medium rounded-lg text-center hover:bg-opacity-90 transition text-sm border border-[var(--color-secondary)]"
          >
            Login Business Owner
          </Link> */}
        </div>
      )}

      <Modal open={openModel} closeModal={handleClose} title="Select Your Location" width="w-full md:w-[900px]">

        {/* @todo =================== after get API using lat-log get city, country, stae===============*/}
        {/* <div className="p-3 rounded-xl bg-[var(--color-primary)]">
          <span className="flex items-center text-[20px] font-[600] text-[var(--color-secondary)]">
            <LocateFixed className="cursor-pointer" onClick={handleGetLocation} />
            <span className="ml-4">Detect My Location</span>
          </span>
        </div> */}

        <div className="py-4">
          <Input
            label="Select City"
            isSelect
            selectProps={{
              options: apiCities,
              placeholder: citiesLoading ? "Loading cities..." : "Select a city",
              value: apiCities.find(o => o.value === selectedCityData.city),
              onChange: onCitySelect
            }}
          />
        </div>

        <div className="h-[1px] bg-[var(--divider-line)]" />

        <div className="mt-4">
          <h2 className="text-center text-[22px] font-[500] mb-4">
            Popular Cities
          </h2>

          <div className="flex items-center justify-center">

            <div
              className="flex overflow-x-auto space-x-4 md:space-x-7 px-4 md:px-8 py-4 scrollbar-hide"
            >
              {
                locations.map(({ label }, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleCitySelect({ label })}
                  >
                    <Image
                      src={images[i]}
                      alt={label}
                      className="h-[60px] w-[60px] object-cover rounded-lg"
                    />
                    <span className="font-[500] text-[12px] mt-1">{label}</span>
                  </div>
                ))
              }
            </div >

          </div >
        </div >
      </Modal >

      {/* MOBILE SIDE MENU */}
      {
        openMobileNav && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-40 md:hidden 
          transition-opacity duration-300 opacity-100"
          >
            {/* Sidebar */}
            <div
              className={`
              absolute left-0 top-0 w-64 h-full bg-white shadow-lg p-6 
              transform transition-transform duration-300 
              ${openMobileNav ? "translate-x-0" : "-translate-x-full"}
            `}
            >
              {/* Close Button */}
              <div
                onClick={() => setOpenMobileNav(false)}
                className="mb-4 flex justify-between items-center"
              >
                {/* Clickable Logo in Mobile Menu */}
                <Link
                  href={user.role === "user" || Object.keys(user).length === 0 ? "/" : "/dashboard"}
                  onClick={() => setOpenMobileNav(false)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Image src={logo} width={140} height={40} alt="logo" className="w-20 h-7 md:w-36 md:h-10" />
                </Link>
                <X className="w-5 h-5 text-[var(--color-text-primary)]" />
              </div>

              {/* Mobile User Profile Section */}
              {is_logged_in_user && (
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold border-2 ${user.role === "admin"
                        ? "bg-red-200 text-red-700 border-red-300"
                        : "bg-pink-200 text-pink-700 border-pink-300"
                        }`}
                    >
                      {firstLetter || ""}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role === "admin" ? "Administrator" : user.role === "business_owner" ? "Business Owner" : "User"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Nav */}
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setOpenMobileNav(false)}
                    className={`
                    flex items-center space-x-2
                    ${pathname === item.path
                        ? "text-[var(--color-secondary)] font-semibold"
                        : "text-[var(--color-text-primary)] font-medium"
                      }
                  `}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}

                {/* Mobile Location */}
                {userLocation && (user.role === "user" || Object.keys(user).length === 0) && (
                  <div
                    className="flex items-center space-x-2 py-2 text-[var(--color-text-primary)] cursor-pointer"
                    onClick={() => {
                      setOpenMobileNav(false);
                      dispatch(openLocationModal(true));
                    }}
                  >
                    <MapPin className="w-5 h-5 text-[var(--color-secondary)]" />
                    <span className="font-medium">
                      {userLocation.city || "Select Location"}
                    </span>
                  </div>
                )}

                {/* Mobile Profile Actions */}
                {is_logged_in_user && (
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <button
                      onClick={() => {
                        setOpenMobileNav(false);
                        router.push("/profile");
                      }}
                      className="flex items-center space-x-2 text-[var(--color-text-primary)] font-medium w-full text-left"
                    >
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setOpenMobileNav(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2 text-red-600 font-medium w-full text-left"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                )}


              </nav>

              {/* Mobile Admin Badge */}
              {/* {user.role === "admin" && !pathname.startsWith("/admin/") && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setOpenMobileNav(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                </div>
              )} */}
            </div>
          </div >
        )
      }

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={openNotificationDrawer}
        onClose={() => setOpenNotificationDrawer(false)}
      />
    </header >
  );
};

export default Header;
