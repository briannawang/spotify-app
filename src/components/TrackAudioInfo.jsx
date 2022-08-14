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
    speechiness: 0.0,
    valence: 0.0,
}

const analyzedAudioFeature = {
    acousticness: "",
    danceability: "",
    energy: "",
    instrumentalness: "",
    liveness: "",
    speechiness: "",
    valence: "",
}

const analyzeAudioFeature = (audioFeature, setAnalyzedAudioFeatures) => {
    analyzedAudioFeature.acousticness = (
        audioFeature.acousticness > 0.85 ? "very_high" :
        audioFeature.acousticness > 0.65 ? "high" :
        audioFeature.acousticness > 0.15 ? "low" :
        "not"
    );
    analyzedAudioFeature.danceability = (
        audioFeature.danceability > 0.75 ? "very_high" :
        audioFeature.danceability > 0.5 ? "high" :
        audioFeature.danceability > 0.15 ? "low" :
        "not"
    );
    analyzedAudioFeature.energy = (
        audioFeature.energy > 0.75 ? "very_high" :
        audioFeature.energy > 0.5 ? "high" :
        audioFeature.energy > 0.15 ? "low" :
        "not"
    );
    analyzedAudioFeature.instrumentalness = (
        audioFeature.instrumentalness > 0.65 ? "very_high" :
        audioFeature.instrumentalness > 0.5 ? "high" :
        audioFeature.instrumentalness > 0.35 ? "low" :
        "not"
    );
    analyzedAudioFeature.liveness = (
        audioFeature.liveness > 0.9 ? "very_high" :
        audioFeature.liveness > 0.8 ? "high" :
        audioFeature.liveness > 0.6 ? "low" :
        "not"
    );
    analyzedAudioFeature.speechiness = (
        audioFeature.speechiness > 0.66 ? "very_high" :
        audioFeature.speechiness > 0.47 ? "high" :
        audioFeature.speechiness > 0.33 ? "low" :
        "not"
    );
    analyzedAudioFeature.valence = (
        audioFeature.valence > 0.75 ? "very_high" :
        audioFeature.valence > 0.5 ? "high" :
        audioFeature.valence > 0.25 ? "low" :
        "not"
    );

    setAnalyzedAudioFeatures(analyzedAudioFeature)
}

function FeatureRow({featureKey, featureValue, analyzedFeatureValue}) {
    return (
        <tr>
            <td className="feature_key">{featureKey}</td>
            <td className="feature_value" id={analyzedFeatureValue}>{featureValue}</td>
        </tr>
    );
}

function FeatureTextList({audioFeatures, analyzedAudioFeatures}) {
    var featureTextKeys = Object.keys(audioFeature);
    var featureList = [];
    for (var i = 0; i < featureTextKeys.length; i++) {
        featureList.push(<FeatureRow featureKey={featureTextKeys[i]} featureValue={audioFeatures[featureTextKeys[i]]} analyzedFeatureValue={analyzedAudioFeatures[featureTextKeys[i]]}/>);
    }
    return (
        <table className="feature_list">
            {featureList}
        </table>
    );
}

function TrackAudioInfo({token, current_track}) {
    const [audioFeatures, setAudioFeatures] = useState(audioFeature);
    const [analyzedAudioFeatures, setAnalyzedAudioFeatures] = useState(analyzedAudioFeature);
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
                analyzeAudioFeature(data, setAnalyzedAudioFeatures);
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
                    <FeatureTextList audioFeatures={audioFeatures} analyzedAudioFeatures={analyzedAudioFeatures}/>
                </div>
            </>
        );
    }
}

export default TrackAudioInfo
