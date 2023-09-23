import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Layout from './Layout.tsx'
import { ThemeProvider, createTheme } from '@mui/material';
// import { PartialTheme, ThemeProvider } from '@fluentui/react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ConflictStepper from './ConflictStepper.tsx'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <div style={{ width: "100vw", position: "absolute", left: "0", top: "0" }}><Layout /></div>
      <ThemeProvider theme={darkTheme}>
        <div style={{ position: "absolute", top: "64px", bottom: "0px", width: "100vw", overflow: "scroll" }}>
          <Router>
            <Routes>
                <Route path="ext/merge/:code" element={<ConflictStepper />}></Route>
                <Route path="ext/*" element={<h1>404</h1>}></Route>
            </Routes>
          </Router>
        </div>
      </ThemeProvider>
      <ToastContainer theme="dark" />    
  </React.StrictMode>,
)
