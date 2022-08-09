import React, { useState, useEffect } from 'react';
import WebPlayback from './components/WebPlayback'
import Login from './components/Login'
import './App.css';

function App() {

  const [token, setToken] = useState("");

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

    const logout = () => {
        setToken("");
    }

  return (
    <div className="App">
            <header className="App-header">
                <h1>spotify app</h1>
                {(token === "") ?
                    <Login/>
                    : <div>
                        <button className="button" onClick={logout}>logout</button>
                        <WebPlayback token={token}/>
                    </div>
                }
            </header>
        </div>
  );
}


export default App;
