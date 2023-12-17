import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, Stack, TextField } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import "./Login.css"
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { debounce } from "lodash";
import { getUserAvailable, postLogin, postRegister } from "../services/UserService"
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import httpService from "../shared/HttpService";
import { testToken } from "../services/UserService";

interface loginProps {
  onAuthSuccess:()=>void;
}

const Login = ({onAuthSuccess}:loginProps) => {
  const [ searchParams ] = useSearchParams();
  const isRegister = Boolean(searchParams.get("register"))

  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [remember, setRemember] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordAgainError, setPasswordAgainError] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [passwordAgainErrorText, setPasswordAgainErrorText] = useState("");
  const [usernameErrorText, setUsernameErrorText] = useState("");

  const clearErrors = () => {
    setUsername("");
    setPassword("");
    setPasswordAgain("");
    setUsernameError(false);
    setPasswordError(false);
    setPasswordAgainError(false);
    setPasswordErrorText("");
    setPasswordAgainErrorText("");
    setUsernameErrorText("");
  }

  // Only run with debounce... otherwise api server sad...
  const checkUsername = async (name: string) => {
    return await getUserAvailable(name);
  }
  
  const debouncedCheck = useRef(
    debounce(async (name) => {
      const res = await checkUsername(name)
      setUsernameError(res);
      setUsernameErrorText(res?"Username is not available.":"");
      console.log("setText");
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      debouncedCheck.cancel();
    };
  }, [debouncedCheck]);

  // redirect to main page, if loged in but tried to access the login page
  useEffect(() => {
    if(httpService.isTokenSet()){
      navigate("/access/");
    }
  })

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault()

    let usernameValid
    if(isRegister) usernameValid = await checkUsername(username);
    
    setUsernameError(false);
    setPasswordError(false);
    setPasswordAgainError(false);

    let checksFailed = false;

    if (username == '') {
      setUsernameError(true);
      checksFailed = true;
    }
    if (password == '') {
      setPasswordError(true);
      checksFailed = true;
    }
    
    if(isRegister){
      if (passwordAgain == '') {
        setPasswordAgainError(true);
        checksFailed = true;
      }

      if (usernameValid){
        console.log(usernameValid)
        checksFailed = true;
        setUsernameError(true);
        setUsernameErrorText("Username is not available.");
      }
      console.log(checksFailed)
      console.log("Passcheck: ",validatePassword(password, passwordAgain))
      if (validatePassword(password, passwordAgain)) checksFailed = true;
      console.log(checksFailed)
    }
    
    if (checksFailed){
      return;
    }

    // Is only reached, if form is valid
    if (isRegister) {
      registerUser();    
    } else{
      loginUser();
    }
  }

  const registerUser = async () => {
    try{
      const res = await postRegister(username, password);
      console.log(res);
      toast.success(res, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
      });
      navigate("/access/login");
    } catch (err) {
      const text = (err as AxiosError).request.response;
      toast.error(text, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  }

  const loginUser = async () =>  {
    try{
      const res = await postLogin(username, password);
      if (res != "") {
        onLoginSuccess(res);
      }
    } catch (err) {
      const text = (err as AxiosError).request.response;
      const code = (err as AxiosError).request.status;
      setPasswordErrorText("Wrong username or password!");
      setUsernameError(true);
      setPasswordError(true);
      toast.error(code==401?text:"API access went wrong!", {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  }

  const onLoginSuccess = async (token: string) => {
    // Clear old tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Set token to only now or remember for a bit
    if(remember){
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    httpService.setToken(token);
    await testToken(token);
    onAuthSuccess();
    navigate("/access/");
  }

  const validatePassword = (passwordVal:string, passwordAgainVal:string) => {
      setPasswordAgainError(passwordVal != passwordAgainVal && passwordAgainVal != "")
      setPasswordAgainErrorText((passwordVal != passwordAgainVal) ? ((passwordAgainVal == "")?"":"Passwords are different!"):"");
      return passwordVal != passwordAgainVal;
  }

  const styles = {
    paperContainer: {
      backgroundImage : `radial-gradient(ellipse at center,rgba(0, 0, 0, 0) 80%,rgba(0, 0, 0, 0.8) 100%),url(https://images.pexels.com/photos/2080963/pexels-photo-2080963.jpeg?auto=compress&cs=tinysrgb&h=${Math.max(window.innerHeight, 1080)})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      height: "100%"
    }
};

      return (
          <Box style={styles.paperContainer}>
            <Grid
              container
              spacing={0}
              alignItems="center"
              justifyContent="center"
              sx={{ height: "100%", overflow:"scroll" }}
            >
              <Grid xs="auto">
                <div className="loginPane">
                  <Stack direction={"column"} spacing={4}>
                    <h1 className="">Login</h1>
                    <Divider variant="fullWidth"></Divider>
                    <form onSubmit={handleSubmit}>
                      <FormControl>
                        <TextField
                          required
                          id="username"
                          label="Username"
                          type="username"
                          autoComplete="current-user"
                          onChange={e => {
                            setUsername(e.target.value);
                            if (isRegister) {
                              debouncedCheck(e.target.value);
                            }
                          }}
                          value={username}
                          helperText={usernameErrorText}
                          error={usernameError}
                          sx={{mb: 3}}
                        />
                        <TextField
                          required
                          id="password"
                          label="Password"
                          type="password"
                          onChange={e => {setPassword(e.target.value); validatePassword(e.target.value, passwordAgain);}}
                          value={password}
                          error={passwordError}
                          helperText={passwordErrorText}
                          autoComplete="current-password"
                          sx={{mb: 3}}
                        />
                        {
                          isRegister?
                          <>
                            <TextField
                              required
                              id="password_repeat"
                              label="Repeat Password"
                              type="password"
                              onChange={e => {setPasswordAgain(e.target.value); validatePassword(password, e.target.value);}}
                              value={passwordAgain}
                              error={passwordAgainError}
                              helperText={passwordAgainErrorText}
                              autoComplete="current-password"
                              sx={{mb: 1}}
                            />
                          </>
                          :<></>
                        }

                        {!isRegister ? <FormControlLabel control={<Checkbox onChange={(_, val) => setRemember(val)}/>} label="Remember Me" />:<></>}
                        <Divider sx={{mb: 3, mt: isRegister?2:1}}/>

                        <Button sx={{margin: "auto", width: "80%"}} type={"submit"} variant="contained" >{isRegister?"Register":"Login"}</Button>
                        
                      </FormControl>
                    </form>
                    {isRegister?
                    <>
                      <small>You have a account? <Link onClick={clearErrors} to="/access/login">Login here</Link></small>
                    </>
                    :
                    <>
                      <small>Need an account? <Link onClick={clearErrors} to="/access/login?register=true">Register here</Link></small>
                    </>}
                  </Stack>
                  </div>
              </Grid>
            </Grid>
          </Box>
      )
    }
    
  export default Login;