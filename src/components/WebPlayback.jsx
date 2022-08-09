import React, { useState, useEffect, useRef } from 'react';
import './Player.css';
import * as $ from "jquery";

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ],
    duration_ms: 0
}

function WebPlayback({token}) {
    const is_pausedRef = useRef(true);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);
    const [progress_ms, setProgress] = useState(0);
    const [duration_ms, setDuration] = useState(0);

    const progressBarStyles = {
        width: (progress_ms * 100 / duration_ms) + '%'
    };

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'spotify app',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ( state => {
                if (!state) {
                    return;
                }

                setProgress(state.position);
                setTrack(state.track_window.current_track);
                is_pausedRef.current = state.paused;

                $.ajax({
                    url: "https://api.spotify.com/v1/me/player",
                    type: "GET",
                    beforeSend: xhr => {
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    },
        
                    success: data => {
                        if(data) {
                            setDuration(data.item.duration_ms);
                        }
                    }
                });

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            player.connect();
        }

        const interval = setInterval(() => {
            if (!is_pausedRef.current) {
                setProgress(p => p + 100);
            }
        }, 100, !is_pausedRef.current);

        return () => {
            clearInterval(interval);
        }
    }, []);

    if (!is_active) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> instance not active. transfer playback device on spotify </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                { is_pausedRef.current ? "play" : "pause" }
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>
                            <p>progress: {progress_ms}</p>
                            <p>duration: {duration_ms}</p>
                            <div className="progress">
                            <div
                            className="progress__bar"
                            style={progressBarStyles}
                            />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback
