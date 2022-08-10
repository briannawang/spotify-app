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

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
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

            var player = new window.Spotify.Player({
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

                if (current_track !== state.track_window.current_track) {
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

                    setTrack(state.track_window.current_track);
                }

                setProgress(state.position);
                is_pausedRef.current = state.paused;

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
                        <p> transfer playback device </p>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__img" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>
                            
                            <div className="control-btns">
                                <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                    ◄⏽
                                </button>

                                <button className="btn-spotify" id="toggle-play" onClick={() => { player.togglePlay(); setProgress(0); }} >
                                    { is_pausedRef.current ? "play" : "pause" }
                                </button>

                                <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                    ⏽►
                                </button>
                            </div>

                            <div className="song-timeinfo">
                                <div className="progress-background">
                                <div className="progress">
                                    <div
                                    className="progress__bar"
                                    style={progressBarStyles}
                                    />
                                </div>
                                </div>
                                <div className="song-progress">
                                    <p className="song-progress__position">{millisToMinutesAndSeconds(progress_ms)}</p>
                                    <p className="song-progress__duration">{millisToMinutesAndSeconds(duration_ms)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback
