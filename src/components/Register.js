import * as React from 'react';
import { useNavigate } from "react-router-dom";
import {useState} from 'react'
import axios from "axios";
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function SignUp(props) {
    const [Username,setUsername ] = useState('');
    const [Password,setPassword ] = useState('');
    const [Email   ,setEmail    ] = useState('');
    const [Errors  ,setErrors   ] = useState([]);

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        var error_lis = []
        setErrors([])
        if(Username.length>30) error_lis.push('Username is too long.')
        if(Username.length===0) error_lis.push("Username can't be blank.")
        var pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
        if(Email.length===0) error_lis.push("Email Address can't be blank.")
        else if(!pattern.test(Email) || Email.length>60) error_lis.push('Please use a valid email address.')
        if(Password.length===0) error_lis.push("Password can't be blank.")
        if(error_lis.length){
            setErrors(error_lis)
            return
        }
        axios({
            method: "POST",
            url:"/api/register",
            data:{
                username: Username,
                email   : Email,
                password: Password,
             }
          })
          .then((response) => {
            console.log(response.data.access_token)
            console.log('aaaaaa')
            response.data.access_token && props.setToken(response.data.access_token, Username)
            error_lis = response.data.map((d)=>(d.err))
            console.log(error_lis.length)
            if(error_lis.length){
                setErrors(error_lis)
                console.log('bbbbbb')
                return
            }
            console.log('aaaaaa')

          }).catch((error) => {
            if(error.response) {
                console.log(error.response)
                console.log(error.response.status)
                console.log(error.response.headers)
            }
          })
      };
  
  const errors = (
   <Stack sx={{ width: '100%', mt: 1}} spacing={1}>
        {Errors.map((error, index) => (<Alert severity="error" key={index}>{error}</Alert>))}
    </Stack> );

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="name"
                  name="User Name"
                  required
                  fullWidth
                  id="Username"
                  label="Username"
                  value={Username}
                  onChange={(e) => {
                     setUsername(e.target.value)
                  }}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={Email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={Password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                />
              </Grid>
            </Grid>
            <Box>{errors}</Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link onClick={() => {navigate('/login');}} variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
}