import React, { useState, useEffect, useRef } from 'react';
import './AudioInfo.css';
import './../App.css';
import * as $ from "jquery";

const audioFeature = {
    acousticness: 0.0,
    danceability: 0.0,
    energy: 0.0,
    instrumentalness: 0.0,
    liveness: 0.0,
    loudness: 0.0,
    speechiness: 0.0,
    tempo: 0.0,
    valence: 0.0,
}

function FeatureKeys({featureText}) {
    return (
        <p className="feature_key">{featureText}</p>
    );
}

function FeatureValues({featureText}) {
    return (
        <p className="feature_value">{featureText}</p>
    );
}

function FeatureTextList({audioFeatures}) {
    var featureTextKeys = Object.keys(audioFeature);
    var featureListKeys = [];
    var featureListValues = [];
    for (var i = 0; i < featureTextKeys.length; i++) {
        featureListKeys.push(<FeatureKeys featureText={featureTextKeys[i]}/>);
        featureListValues.push(<FeatureValues featureText={audioFeatures[featureTextKeys[i]]}/>);
    }
    return (
        <div className="feature_list">
            <div className="feature_keys">{featureListKeys}</div>
            <div className="feature_values">{featureListValues}</div>
        </div>
    );
}

function TrackAudioInfo({token, current_track}) {
    const [audioFeatures, setAudioFeatures] = useState(audioFeature); // not needed currently
    const [noData, setNoData] = useState(true);

    const trackId = current_track.id;

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
      
    }, [current_track]);

    if (noData) { 
        return (
            <>
                <p>no data</p>
            </>)
    } else {
        return (
            <>
                <div className="TrackAudioInfo">
                    <FeatureTextList audioFeatures={audioFeatures}/>
                </div>
            </>
        );
    }
}

export default TrackAudioInfo
