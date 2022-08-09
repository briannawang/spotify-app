import React from 'react';
import './../App.css';

function Login() {
    return (
        <div className="App">
            <header className="App-header">
                <button className="btn-spotify">
                    <a className="btn-spotify" href="/auth/login" >
                        login
                    </a>
                </button>
            </header>
        </div>
    );
}

export default Login;

