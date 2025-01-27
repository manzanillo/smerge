import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material';
import * as TeacherAuthService from './services/TeacherAuthService';
import { toast } from 'react-toastify';

//let navigate: NavigateFunction = useNavigate();

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
      'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
      width: '450px',
    },
    ...theme.applyStyles('dark', {
      boxShadow:
        'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
  }));
  
  const SignUpContainer = styled(Stack)(({ theme }) => ({
    height: '100%',
    padding: 4,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  }));
  
export default function SignUp() {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [gdprError, setGdprError] = React.useState(false);
  const [gdprErrorMessage, setGdprErrorMessage] = React.useState('');
  // This code only runs on the client side, to determine the system color preference

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const gdpr = document.getElementById('gdpr') as HTMLInputElement;
    const name = document.getElementById('username') as HTMLInputElement;

    let isValid = true;

    if (!gdpr.checked) {
      setGdprError(true);
      setGdprErrorMessage('Accepting this field is required.');
      isValid = false;
    } else {
      setGdprError(false);
      setGdprErrorMessage('');
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }
    
    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const email = data.get('email');
    const password = data.get('password');
    console.log({
      name: data.get('username'),
      email: data.get('email'),
      password: data.get('password'),
    });
    TeacherAuthService.register(String(username), String(email), String(password)).then(
     () => {
      //navigate("ext/teacher_login");
      location.href = "/ext/teacher_login/";
     },
     (error) => {
        console.log(error);
        toast.error(error, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
      }
    )
  };

  return (
      <SignUpContainer direction="column" justifyContent="space-between">
        <Stack
          sx={{
            justifyContent: 'center',
            height: '100dvh',
            p: 2,
          }}
        >
          <Card variant="outlined">
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
              Sign up
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl>
                <FormLabel htmlFor="username">Username</FormLabel>
                <TextField
                  autoComplete="username"
                  name="username"
                  required
                  fullWidth
                  id="username"
                  placeholder="someusername"
                  error={nameError}
                  helperText={nameErrorMessage}
                  color={nameError ? 'error' : 'primary'}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder="your@email.com"
                  name="email"
                  autoComplete="email"
                  variant="outlined"
                  error={emailError}
                  helperText={emailErrorMessage}
                  color={passwordError ? 'error' : 'primary'}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  color={passwordError ? 'error' : 'primary'}
                />
              </FormControl>
              <FormControl error={gdprError}>
                <FormControlLabel
                  required control={<Checkbox color={gdprError ? 'error' : 'primary'} id="gdpr" />}
                  label="I agree that my data is stored in accordance to the GDPR"
                />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={validateInputs}
              >
                Sign up
              </Button>
              <Typography sx={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <span>
                  <Link
                    href="/ext/teacher_login/"
                    variant="body2"
                    sx={{ alignSelf: 'center' }}
                  >
                    Sign in
                  </Link>
                </span>
              </Typography>
            </Box>
          </Card>
        </Stack>
      </SignUpContainer>
  );
}