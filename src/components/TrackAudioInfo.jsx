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

const audioStructure = {
    tempo: 0.0,
    key: 0,
    mode: 0,
    time_signature: 0,
    loudness: 0.0,
    uri: ""
}

const analyzedAudioStructure = {
    tempo: 0, // 0 decimal places
    key: "", // https://en.wikipedia.org/wiki/Pitch_class
    mode: "", // major = 1, minor = 0
    time_signature: "", // x/4
    loudness: 0.0, // 1 decimal place
    uri: ""
}

const analyzeAudioFeature = (audioFeature, setAnalyzedAudioFeatures) => {
    analyzedAudioFeature.acousticness = (
        audioFeature.acousticness > 0.8 ? "very_high" :
        audioFeature.acousticness > 0.6 ? "high" :
        audioFeature.acousticness > 0.2 ? "low" :
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
            <td className="feature_key">{featureKey.replace("_", " ")}</td>
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

const analyzeAudioStructure = (audioStructure, setAnalyzedAudioStructures) => {
    analyzedAudioStructure.tempo = Math.round(audioStructure.tempo);
    analyzedAudioStructure.mode = audioStructure.mode == 1 ? "major" : "minor";
    analyzedAudioStructure.time_signature = audioStructure.time_signature + "/4";
    analyzedAudioStructure.loudness = Math.round(audioStructure.tempo * 10) / 10 + " dB";

    switch(audioStructure.key) {
        case -1: analyzedAudioStructure.key = "n/a"; 
            break;
        case 0: analyzedAudioStructure.key = "C"; 
            break;
        case 1: analyzedAudioStructure.key = "C♯/D♭"; 
            break;
        case 2: analyzedAudioStructure.key = "D"; 
            break;
        case 3: analyzedAudioStructure.key = "D♯/E♭"; 
            break;
        case 4: analyzedAudioStructure.key = "E"; 
            break;
        case 5: analyzedAudioStructure.key = "F"; 
            break;
        case 6: analyzedAudioStructure.key = "F♯/G♭"; 
            break;
        case 7: analyzedAudioStructure.key = "G"; 
            break;
        case 8: analyzedAudioStructure.key = "G♯/A♭"; 
            break;
        case 9: analyzedAudioStructure.key = "A"; 
            break;
        case 10: analyzedAudioStructure.key = "A♯/B♭"; 
            break;
        case 11: analyzedAudioStructure.key = "B"; 
            break;
    }

    setAnalyzedAudioStructures(analyzedAudioStructure)
}

function StructureDisplay({analyzedAudioStructures}) {
    var structureTextKeys = Object.keys(audioStructure);
    var structureList = [];
    for (var i = 1; i < 5; i++) {
        structureList.push(<FeatureRow featureKey={structureTextKeys[i]} featureValue={analyzedAudioStructures[structureTextKeys[i]]} analyzedFeatureValue="audio-structure"/>);
    }
    
    return (
        <div className="structure-display">
            <table className="structure-vertical">
                <tr><td className="tempo-td">tempo</td></tr>
                <tr><td className="tempo-value">{analyzedAudioStructures.tempo}<mark className="bpm-td">bpm</mark></td></tr>
            </table>
            <table className="structure_list">
                {structureList}
            </table>
        </div>
    );
}

function TrackAudioInfo({token, current_track, is_pausedRef}) {
    const [audioFeatures, setAudioFeatures] = useState(audioFeature);
    const [analyzedAudioFeatures, setAnalyzedAudioFeatures] = useState(analyzedAudioFeature);
    const [audioStructures, setAudioStructures] = useState(audioStructure);
    const [analyzedAudioStructures, setAnalyzedAudioStructures] = useState(audioStructure);
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
                setAudioStructures(data);
                analyzeAudioStructure(data, setAnalyzedAudioStructures);
                setNoData(false);

                if (!is_pausedRef) {
                    document.querySelector(':root').style.setProperty('--tempo', (60 / data.tempo) * data.time_signature + 's');
                }
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
                    <StructureDisplay analyzedAudioStructures={analyzedAudioStructures}/>
                    <a className="track-uri" href={audioStructures.uri}>{audioStructures.uri}</a>
                </div>
            </>
        );
    }
}

export default TrackAudioInfo
