import { useState } from 'react';

function useToken() {

  function getToken() {
    const userToken = localStorage.getItem('token');
    return userToken && userToken
  }

  function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user && user
  }

  const [token, setToken] = useState(getToken());

  function saveToken(userToken, username) {
    localStorage.setItem('token', userToken);
    localStorage.setItem('currentUser', username);
    setToken(userToken);
  };

  function removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setToken(null);
  }

  return {
    setToken: saveToken,
    token,
    removeToken,
    getCurrentUser
  }

}

export default useToken;