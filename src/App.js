import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { lazy } from "react";
import "./App.css";

import Home from "./shared/pages/Home";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import StickyFooter from "./shared/components/Navigation/StickyFooter.js";
import IndividualPost from "./opportunities/pages/IndividualPost";
import SignIn from "./shared/pages/SignIn";
import { GlobalContextProvider } from "./context/global/GlobalContextProvider.js";

const PageNotFound = lazy(() => import("./shared/pages/404.js"));
const Jobs = lazy(() => import("./opportunities/pages/Jobs.js"));
const Browse = lazy(() => import("./staff/pages/Browse"));
const Profile = lazy(() => import("./staff/pages/Profile"));
const Center = lazy(() => import("./staff/pages/Center"));
const CreatePost = lazy(() => import("./staff/pages/CreatePost"));
const ProfilePage = lazy(() => import("./shared/pages/Profile.js"));

function App() {
  return (
    <GlobalContextProvider>
      <section>
        <MainNavigation />
        <main className=" container-xl ">
          <Suspense fallback={<div>Loading ...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/staff" element={<Browse />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/center/:centerName" element={<Center />} />
              <Route path="/staff/:staffId" element={<Profile />} />
              <Route path="/createPost" element={<CreatePost />} />
              <Route
                path="/editPost/:postID"
                element={<CreatePost edit={true} />}
              />
              <Route path="/post/:postID" element={<IndividualPost />} />
              <Route path="/signInTemporary" element={<SignIn />} />
              <Route path="/signOut" element={<Home signOut={true} />} />
              <Route path="/signIn" element={<Home signIn={true} />} />

              <Route path="/*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </main>
        <StickyFooter />
      </section>
    </GlobalContextProvider>
  );
}

export default App;
