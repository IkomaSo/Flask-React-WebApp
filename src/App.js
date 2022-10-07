import PrimarySearchAppBar from './components/Header.js'
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Home from './components/Home.js';
import Explore from './components/Explore.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Search from './components/Search.js';
import Profile from './components/Profile.js';
import useToken from './components/useToken.js';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { indigo, grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: indigo[900],
    },
  },
});

function App() {
  const { token, removeToken, setToken } = useToken();
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <div className="App">
          <PrimarySearchAppBar removeToken={removeToken} token={token} isNOTLoggedin={!token && token!=="" &&token!== undefined}/>
          <div className='main'>
            {!token && token!=="" &&token!== undefined?  
            <>
              <Routes>
                <Route exact path="/login" element={<Login setToken={setToken} />}></Route>
                <Route exact path="/register" element={<Register setToken={setToken} />}></Route>
                <Route path='*' element={<Navigate to='/login' />}></Route>
              </Routes>
            </>
            :(
              <>
                <Routes>
                  <Route exact path="/home" element={<Home token={token} setToken={setToken} removeToken={removeToken} />}></Route>
                  <Route exact path="/explore" element={<Explore token={token} setToken={setToken} removeToken={removeToken} />}></Route>
                  <Route exact path="/user/:username" element={<Profile token={token} setToken={setToken} removeToken={removeToken} />}></Route>
                  <Route exact path="/search/:searchText" element={<Search token={token} setToken={setToken} removeToken={removeToken} />}></Route>
                  <Route path="*" element={<Navigate to='/home' />}></Route>
                </Routes>
              </>
            )}
          </div>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}
export default App;
