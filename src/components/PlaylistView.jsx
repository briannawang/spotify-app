import React, { useState, useEffect } from 'react';
import * as $ from "jquery";
import './PlaylistView.css';

const uPlaylist = {
    items: [{}],
    total: 10
}

const uTrack = {
    id: "",
    name: "",
    tracks: {
        href: ""
    }
}

const escapeUrl = (url) => {
    return encodeURIComponent( url ).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
}

function TrackRow({track}) {
    return (
        <tr>
            <td>{track.name}............{track.id}</td>
        </tr>
    );
}

function PlaylistDisplay({userPlaylist}) {
    var playlistList = [];
    for (var i = 0; i < userPlaylist.items.length; i++) {
        playlistList.push(<TrackRow track={userPlaylist.items[i]}/>);
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
    const [noData, setNoData] = useState(true);

    useEffect(() => {
        if (userId != "") {
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
                <div className="playlist-display">
                    <PlaylistDisplay userPlaylist={userPlaylist}/>
                </div>
            </>
        );
    }
}

export default PlaylistView
