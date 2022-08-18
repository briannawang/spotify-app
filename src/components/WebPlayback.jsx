import React, { useState, useEffect, useRef } from 'react';
import './Player.css';
import './../App.css';
import { prominent } from 'color.js'
import TrackAudioInfo from './TrackAudioInfo'
import * as $ from "jquery";

const track = {
    uri: "",
    id: "",
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

function hslToHex([h, s, l]) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

const rgbToHsl = ([r, g, b]) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
      : 0;
    return [
      60 * h < 0 ? 60 * h + 360 : 60 * h,
      100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      (100 * (2 * l - s)) / 2,
    ];
};

function darkenSwatch ([h, s, l]) {
    return [ h, s * (0.45 + s/200), l * (0.4 + l/200) ];
}

function swatchColours(track) {
    var swatch = [0, 0, 0];

    prominent(track.album.images[0].url, { amount: 10 }).then(colors => {
        for (let i = 0; i < colors.length; i++) {
            var hslcolor = rgbToHsl(colors[i]);

            if (hslcolor[1] > swatch[1]) {
                swatch = hslcolor;

                if ((swatch[1] + swatch[2]) > 80 && (swatch[1] > 30 || swatch[2] > 30)) {
                    if (swatch[1] < 45) {
                        swatch[1] = 45;
                    }
                
                    if (swatch[2] < 55) {
                        swatch[2] = 55;
                    }

                    document.documentElement.style.setProperty('--swatch', hslToHex(swatch));
                    document.documentElement.style.setProperty('--dark_swatch', hslToHex(darkenSwatch(swatch)));

                    break;
                }
            }
        }

        if (swatch[2] < 20) {
            document.documentElement.style.setProperty('--swatch', '#FFFFFF');
            document.documentElement.style.setProperty('--dark_swatch', '#B9BBC7');
        }
    })
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
                getOAuthToken: cb => { 
                    // const response = fetch('/auth/token');
                    // const json = response.json();
                    // cb(json.access_token);
                    console.log("token got " + token)
                    cb(token)
                 },
                volume: 0.2
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
                    swatchColours(state.track_window.current_track);
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
                    {/* <p>{token}</p> */}
                        <p className="background-text-color"> transfer playback device </p>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    {/* <p>{token}</p> */}
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__img" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>
                            
                            <div className="control-btns">
                                <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                    ◄⏽
                                </button>

                                <button className="btn-spotify" id="toggle-play" onClick={() => { console.log("player is " + player); player.togglePlay() }} >
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
                    <div className="TrackAudioInfo">
                        <TrackAudioInfo token={token} current_track={current_track} is_pausedRef={is_pausedRef.current}/>
                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback
