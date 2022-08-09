import React from 'react';
import './../App.css';

function Login() {
    return (
        <div className="App">
            <header className="App-header">
                <a className="btn-spotify" href="/auth/login" >
                    login to spotify
                </a>
            </header>
        </div>
    );
}

export default Login;

