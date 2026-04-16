import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Layout from "./Layout.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ConflictStepper from "./components/ConflictParts/ConflictStepper.tsx";
import ProjectView from "./ProjectView.tsx";
import ProjectStatsPage from "./ProjectStatsPage.tsx";
import TeacherView from "./TeacherView.tsx";
import TutorialView from "./TutorialView.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "react-toastify/dist/ReactToastify.css";
import "./shared/i18n.ts";

import HomePage from "./public/HomePage.tsx";
import HowToPage from "./public/HowToPage.tsx";
import ImpressumPage from "./public/ImpressumPage.tsx";
import OpenProjectPage from "./public/OpenProjectPage.tsx";
import CreateProjectPage from "./public/CreateProjectPage.tsx";
import RestoreInfoPage from "./public/RestoreInfoPage.tsx";
import ResetPasswordPage from "./public/ResetPasswordPage.tsx";
import NotFoundPage from "./public/NotFoundPage.tsx";
import { ThemeProvider, createTheme } from "@mui/material";
import CsfrMissing from "./CsfrMissing.tsx";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <Router>
        <div
          style={{ width: "100vw", position: "absolute", left: "0", top: "0" }}
        >
          <Layout />
        </div>
        <div
          style={{
            position: "absolute",
            top: "64px",
            bottom: "0px",
            width: "100vw",
            background: "#2d2d2d",
            overflow: "scroll",
          }}
        >
          <QueryClientProvider client={queryClient}>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}

            <Routes>
              {/* Public pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/howto" element={<HowToPage />} />
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/open" element={<OpenProjectPage />} />
              <Route path="/create" element={<CreateProjectPage />} />
              <Route path="/restore_info" element={<RestoreInfoPage />} />
              <Route path="/reset_password/:token" element={<ResetPasswordPage />} />

              <Route path="/tutorial" element={<TutorialView />} />

              <Route path="ext/open_project" element={<OpenProjectPage />} />
              <Route path="open_project" element={<OpenProjectPage />} />

              <Route path="ext/create_project" element={<CreateProjectPage />} />
              <Route path="create_project" element={<CreateProjectPage />} />

              <Route path="ext/project_view/:projectId" element={<ProjectView />}/>
              <Route path="project_view/:projectId" element={<ProjectView />}/>

              <Route path="ext/project_stats/:projectId" element={<ProjectStatsPage />}/>
              <Route path="project_stats/:projectId" element={<ProjectStatsPage />}/>

              <Route path="ext/teacher_login" element={<SignIn/>}/>
              <Route path="teacher_login" element={<SignIn/>}/>

              <Route path="teacher_signup" element={<SignUp/>}/>
              <Route path="ext/teacher_signup" element={<SignUp/>}/>

              <Route path="ext/teacher_view" element={<TeacherView />}/>
              <Route path="teacher_view" element={<TeacherView />}/>

              <Route path="ext/merge/:code" element={<ConflictStepper />}/>
              <Route path="merge/:code" element={<ConflictStepper />}/>

              <Route path="ext/csfr_missing/:projectId" element={<CsfrMissing />}/>
              <Route path="csfr_missing/:projectId" element={<CsfrMissing />}/>
              <Route path="ext/csfr_missing/:projectId" element={<CsfrMissing />}/>
              <Route path="csfr_missing/" element={<CsfrMissing />} />

              <Route path="ext/*" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </QueryClientProvider>
        </div>
      </Router>
    </ThemeProvider>
    <ToastContainer theme="dark" />
  </React.StrictMode>
);
