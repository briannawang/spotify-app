import React, { useState, useEffect } from 'react';
import WebPlayback from './components/WebPlayback'
import Login from './components/Login'
import './App.css';
import * as $ from "jquery";

const profile = {
  display_name: "",
  id: "",
  images: [
      { url: "" }
  ]
}

function App() {
  const [token, setToken] = useState("");
  const [userProfile, setUserProfile] = useState(profile);

  useEffect(() => {
    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);

      $.ajax({
        url: "https://api.spotify.com/v1/me",
        type: "GET",
        beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + json.access_token);
        xhr.setRequestHeader("Content-Type", "application/json");
        },
  
        success: data => {
          if(!data) {
            return;
          }

          setUserProfile(data);
        }
      });
    }

    getToken();

  }, []);

  const logout = () => {
      setToken("");
  }

  return (
    <div className="App">
        <header className="App-header">
            <h1 className="app-name">⌜spotify app⌟</h1>
            {(token === "") ?
                <Login/>
                : <button className="login-button" onClick={logout}>logout</button>   
            }
        </header>
          {(token === "") ?
            <div></div>
            : <div className="playback-window">
                <WebPlayback token={token} userProfile={userProfile}/>
            </div>
        }
    </div>
  );
}


export default App;
