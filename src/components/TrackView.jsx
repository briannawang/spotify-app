import React, { useState, useEffect } from 'react';
import * as $ from "jquery";
import './PlaylistView.css';

const playlistItems = {
    items: [{
        track: {
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
    }],
    total: 0
}

function TrackRow({track}) {
    return (
        <tr>
            <td>{track.name} .......... {track.id}</td>
        </tr>
    );
}

function TrackDisplay({playlist, title}) {
    var playlistList = [];
    for (var i = playlist.items.length - 1; i >= 0; i--) {
        playlistList.push(<TrackRow track={playlist.items[i].track}/>);
    }

    return (
        <div className="playlist-container">
            <p>{title}</p>
            <div className="playlist_list">
                <table>
                    {playlistList}
                </table>
            </div>
        </div>
    );
}

function TrackView({token, url, title}) {
    const [playlist, setPlaylist] = useState(playlistItems);
    const [offset, setOffset] = useState(0);
    const [checkTotal, setCheckTotal] = useState(true);
    const [noData, setNoData] = useState(true);

    useEffect(() => {
        if (url !== "") {
            $.ajax({
                url: url,
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

                    setPlaylist(data);
                    setNoData(false);
                    setOffset(0);
                }
            });
        }
      
    }, [url, checkTotal]);

    if (noData) { 
        return (
            <><div className="playlist-display"></div>
            </>)
    } else {
        return (
            <>
                <div className="playlist-display">
                    <TrackDisplay playlist={playlist} title={title}/>
                </div>
            </>
        );
    }
}

export default TrackView
