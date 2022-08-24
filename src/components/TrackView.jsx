import React, { useState, useEffect } from 'react';
import * as $ from "jquery";
import './PlaylistView.css';

const playlistItems = {
    items: [{
        track: {
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
    }],
    total: 0
}

const handleClickTrack = (uri, token, context_uri) => {
    let data = '{"context_uri": "' + context_uri + '", "offset": {"uri": "' + uri + '"}}';

    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play",
        type: "PUT",
        data: data,
        beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        },

        success: data => {
            console.log("changed song to: " + uri);
        }
    });
}

function TrackRow({track, token, context_uri}) {
    return (
        <tr className="list_row" onClick={() => {handleClickTrack(track.uri, token, context_uri)}}>
            <td><img src={track.album.images[0].url} className="small_cover" alt=""/></td>
            <td><p className="list_item" id="track_top_text">{track.name}</p>
                <p className="list_item" id="track_bottom_text">{track.artists[0].name}{track.artists[1] && ", " + track.artists[1].name}</p>
            </td>
        </tr>
    );
}

function TrackDisplay({playlist, title, token, context_uri}) {
    var playlistList = [];
    for (var i = playlist.items.length - 1; i >= 0; i--) {
        playlistList.push(<TrackRow track={playlist.items[i].track} token={token} context_uri={context_uri}/>);
    }

    return (
        <div className="playlist-container">
            <p>{title}</p>
            <div className="playlist_list">
                <table className="list_table">
                    {playlistList}
                </table>
            </div>
        </div>
    );
}

function TrackView({token, url, title, context_uri, offset}) {
    const [playlist, setPlaylist] = useState(playlistItems);
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
                }
            });
        }
      
    }, [url]);

    if (noData) { 
        return (
            <><div className="playlist-display"></div>
            </>)
    } else {
        return (
            <>
                <div className="playlist-display">
                    <TrackDisplay playlist={playlist} title={title} token={token} context_uri={context_uri}/>
                </div>
            </>
        );
    }
}

export default TrackView
