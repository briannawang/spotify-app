import React, { useState, useEffect, useRef } from 'react';
import './AudioInfo.css';
import './../App.css';
import * as $ from "jquery";

const audioFeature = {
    acousticness: "",
    analysis_url: "",
    danceability: 0,
    duration_ms: 0,
    energy: 0,
    id: "",
    instrumentalness: 0,
    key: 0,
    liveness: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    tempo: 0,
    time_signature: 0,
    track_href: "",
    type: "",
    uri: "",
    valence: 0
}


function TrackAudioInfo({token, trackId}) {
    const [audioFeatures, setAudioFeatures] = useState(audioFeature);
    const [noData, setNoData] = useState(false)

    useEffect(() => {
        $.ajax({
            url: "https://api.spotify.com/v1/audio-features/" + trackId,
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

                setAudioFeatures(data);
                setNoData(false);
            }
        });
        
    }, [trackId]);

    if (noData) { 
        return (
            <>
                <p>no data</p>
            </>)
    } else {
        return (
            <>
                <div>
                    <p>acousticness: {audioFeatures.acousticness}</p>
                </div>
            </>
        );
    }
}

export default TrackAudioInfo
