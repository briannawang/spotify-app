import React, { useState, useEffect } from 'react';
import * as $ from "jquery";
import './PlaylistView.css';
import TrackView from './TrackView'

const cPlaylist = {
    uri: "",
    name: "",
    id: "",
    tracks: {
        href: "",
        total: 0
    },
    offset: 0
}

const uPlaylist = {
    items: [{
        uri: "",
        name: "",
        id: "",
        tracks: {
            href: "",
            total: 0
        }
    }],
    total: 0
}

const escapeUrl = (url) => {
    return encodeURIComponent(url).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
}

const handleGoBack = (setShowTracks) => {
    setShowTracks(false);
}

const handleClickPlaylist = (playlist, setShowTracks, setUrl, setClickedPlaylist) => {
    let offset = (playlist.tracks.total > 50) ? playlist.tracks.total - 50 : 0;
            
    setUrl(playlist.tracks.href + "?offset=" + offset + "&limit=50&fields=total,items(track(id,name,album(images(url)),artists(name),duration_ms, uri))");
    playlist.offset = offset;
    setClickedPlaylist(playlist);
    setShowTracks(true);
}

function PlaylistRow({playlist, setShowTracks, setUrl, setClickedPlaylist}) {
    return (
        <tr>
            <td onClick={() => {handleClickPlaylist(playlist, setShowTracks, setUrl, setClickedPlaylist)}}>
                {playlist.name} ............ {playlist.id}</td>
        </tr>
    );
}

function PlaylistDisplay({userPlaylist, setShowTracks, setUrl, setClickedPlaylist}) {
    var playlistList = [];
    for (var i = 0; i < userPlaylist.items.length; i++) {
        playlistList.push(<PlaylistRow playlist={userPlaylist.items[i]} setShowTracks={setShowTracks} setUrl={setUrl} setClickedPlaylist={setClickedPlaylist}/>);
    }
    return (
        <div className="playlist-container">
            <p>playlist</p>
            <div className="playlist_list">
                <table>
                    {playlistList}
                </table>
            </div>
        </div>
    );
}

function PlaylistView({token, userId}) {
    const [userPlaylist, setUserPlaylist] = useState(uPlaylist);
    const [isShowTracks, setShowTracks] = useState(false);
    const [clickedPlaylist, setClickedPlaylist] = useState(cPlaylist);
    const [url, setUrl] = useState("");
    const [noData, setNoData] = useState(true);

    useEffect(() => {
        if (userId !== "") {
            $.ajax({
                url: "https://api.spotify.com/v1/users/" + escapeUrl(userId) + "/playlists?offset=0&limit=50",
                type: "GET",
                beforeSend: xhr => {
                xhr.setRequestHeader("Authorization", "Bearer " + token);
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
                },
    
                success: data => {
                    if(!data) {
                        setNoData(true);
                        return;
                    }
    
                    setUserPlaylist(data);
                    setNoData(false);
                }
            });
        }
      
    }, [userId]);

    if (noData) { 
        return (
            <><div className="playlist-display"></div>
            </>)
    } else {
        return (
            <>
                <button onClick={() => {handleGoBack(setShowTracks)}}>⌜</button>
                {!isShowTracks ? 
                    <div className="playlist-display">
                        <PlaylistDisplay userPlaylist={userPlaylist} setShowTracks={setShowTracks} setUrl={setUrl} setClickedPlaylist={setClickedPlaylist}/>
                    </div>
                    :
                    <TrackView token={token} url={url} title={clickedPlaylist.name} context_uri={clickedPlaylist.uri} offset={clickedPlaylist.offset}/>
                }
            </>
        );
    }
}

export default PlaylistView
