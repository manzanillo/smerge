import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Layout from './Layout.tsx'
import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ConflictStepper from './ConflictStepper.tsx';
import ProjectView from './ProjectView.tsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import 'react-toastify/dist/ReactToastify.css';
import EventTest from './EventTest.tsx';


// const lightTheme: PartialTheme = {
//   semanticColors: {
//     bodyBackground: 'white',
//     bodyText: 'black',
//   },
// };

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
      <div style={{ width: "100vw", position: "absolute", left: "0", top: "0" }}><Layout /></div>
        <div style={{ position: "absolute", top: "64px", bottom: "0px", width: "100vw", overflow: "scroll" }}>
            <QueryClientProvider client={queryClient}>
                 <ReactQueryDevtools initialIsOpen={false} />
              <Router>
                <Routes>
                    <Route path="ext/project_view/:projectId" element={<ProjectView />}></Route>
                    {/* <Route path="ext/project_view_test/:projectId" element={<ProjectViewTest />}></Route> */}
                    <Route path="ext/merge/:code" element={<ConflictStepper />}></Route>
                    <Route path="ext/eventTest" element={<EventTest />}></Route>
                    <Route path="ext/*" element={<h1>404</h1>}></Route>
                </Routes>
              </Router>
            </QueryClientProvider>
        </div>
      </ThemeProvider>
      <ToastContainer theme="dark" /> 
  </React.StrictMode>,
)
