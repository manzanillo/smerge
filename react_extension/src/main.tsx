import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Layout from "./Layout.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ConflictStepper from "./components/ConflictParts/ConflictStepper.tsx";
import ProjectView from "./ProjectView.tsx";
import TeacherView from "./TeacherView.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "react-toastify/dist/ReactToastify.css";
import "./shared/i18n.ts";

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
              <Route
                path="ext/project_view/:projectId"
                element={<ProjectView />}
              ></Route>
              <Route
                path="ext/teacher_login"
                element={<SignIn/>}>
              </Route>
              <Route
                path="ext/teacher_signup"
                element={<SignUp/>}>
              </Route>
              <Route
                path="ext/teacher_view"
                element={<TeacherView />}
              ></Route>
              <Route
                path="ext/merge/:code"
                element={<ConflictStepper />}
              ></Route>
              <Route
                path="ext/csfr_missing/:projectId"
                element={<CsfrMissing />}
              ></Route>
              <Route path="ext/csfr_missing/" element={<CsfrMissing />}></Route>
              <Route path="ext/*" element={<h1>404</h1>}></Route>
            </Routes>
          </QueryClientProvider>
        </div>
      </Router>
    </ThemeProvider>
    <ToastContainer theme="dark" />
  </React.StrictMode>
);
