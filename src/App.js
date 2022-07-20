import './App.css';
import {useEffect, useState} from 'react';
import * as $ from "jquery";
import Player from "./Player";

function App() {

    const CLIENT_ID = "54ac38a2d29b465781457621be29fed1"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const SCOPES = [
        "user-read-currently-playing",
        "user-read-playback-state",
      ];

    const [token, setToken] = useState("")
    const [item, setItem] = useState({
        album: {
            images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
    })
    const [isPlaying, setIsPlaying] = useState(false)
    const [progressMs, setProgressMs] = useState(0)
    const [noData, setNoData] = useState(false)
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token);
        const interval = setInterval(() => {
            if(token) {
                getCurrentlyPlaying(token);
            }
            setSeconds(seconds => seconds + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        }

    }, [])

    const logout = () => {
        setToken("");
        setItem({
            album: {
                images: [{ url: "" }]
            },
            name: "",
            artists: [{ name: "" }],
            duration_ms: 0
        });
        setIsPlaying(false);
        setNoData(false);
        window.localStorage.removeItem("token")
    }

    const getCurrentlyPlaying = (token) => {
        $.ajax({
            url: "https://api.spotify.com/v1/me/player",
            type: "GET",
            beforeSend: xhr => {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.setRequestHeader("Content-Type", "application/json");
            },

            success: data => {
                if(!data) {
                    setNoData(true);
                    return;
                }

                setItem(data.item);
                setIsPlaying(data.is_playing);
                setProgressMs(data.progress_ms);
                setNoData(false);
            }
        });
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>spotify app</h1>
                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`}>login</a>
                    : <button className="button" onClick={logout}>logout</button>
                }
                
                {token && !noData && (
                    <Player
                    item={item}
                    progressMs={progressMs}
                    isPlaying={isPlaying}
                    />
                )}

                {token && noData && (
                    <p>
                    play a song on spotify
                    </p>
                )}

                <p>{seconds} seconds have elapsed since mounting.</p>
            </header>
        </div>
    );
}

export default App;