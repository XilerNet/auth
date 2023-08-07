'use client'
import "./global.css";
import {BitCheckProvider, useAuth} from '@bitcheck/auth-react';
import {useEffect, useRef, useState} from "react";
import {ScaleLoader} from "react-spinners";

// env based on dev or prod
const BITCHECK_TOKEN_LOCATION = "bitcheck-auth-token";
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment ? 'http://localhost:8000' : 'https://auth-api.xiler.net';
const CALLBACK_URL = isDevelopment ? 'http://localhost:8001/#/auth' : 'https://xiler.net/#/auth';

const endpoint = (endpoint: string) => `${API_BASE_URL}/${endpoint}`;

const fetchXiler = async (url: string, method: string, body: Object) => {
    try {
        return await fetch(endpoint(url), {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(body)
        });
    } catch (e) {
        console.error(e);
        if (confirm("Failed to connect to Xiler, retry?")) {
            window.location.reload();
        }

        return null;
    }
}

const XilerAuthLogin = async (setEmailToken: (token: string | null) => void) => {
    const token = localStorage.getItem(BITCHECK_TOKEN_LOCATION);
    const res = await fetchXiler("login", "POST", {token});

    if (res == null) {
        return;
    }

    if (res.status !== 200) {
        alert("Error logging in, please retry or contact support!");
        console.error(await res.json());
    }
    let data = await res.json();

    if (data?.next_action != undefined) {
        switch (data.next_action) {
            case "set_email": {
                setEmailToken(data.token);
            }
                break;
        }
        return;
    }

    window.location.href = `${CALLBACK_URL}?refresh=${data.token}`;
}

const XilerAuthSetEmail = async (email: string, token: string, setEmailToken: (token: string | null) => void) => {
    const res = await fetchXiler("email", "POST", {token, email});

    if (res == null) {
        return;
    }

    if (res.status !== 200) {
        alert("Error setting email, please retry or contact support!");
        console.error(await res.json());
    }
    let data = await res.json();

    if (data?.next_action != undefined) {
        switch (data.next_action) {
            case "login": {
                setEmailToken(null);
            }
                break;
        }
        return;
    }
}

// TODO: Further question after auth requesting email if none is found
const BitCheckAuthentication = () => {
    const {user, login, logout} = useAuth();
    const [emailToken, setEmailToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const emailRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.clear();
        login();
    }, [login]);

    useEffect(() => {
        const performLogin = async () => {
            if (user && !emailToken) {
                await XilerAuthLogin((token) => setEmailToken(token));
            }

            if (emailToken) {
                emailRef.current?.focus();
                emailRef.current?.select();
            }
        }

        performLogin().then();
    }, [user, emailToken]);

    return (<div className="auth">
        {emailToken ? (<>
            <p className="xiler-text">Please enter your email to continue:</p>
            <input className="xiler-input" ref={emailRef} type="email" placeholder="Email"
                   onChange={(e) => setEmail(e.target.value)}/>
            <button className="xiler-button"
                    onClick={() => XilerAuthSetEmail(email!, emailToken!, (token) => setEmailToken(token))}>Continue
            </button>
        </>) : user ? (<>
            <button className="xiler-button" onClick={() => logout()}>Logout</button>
        </>) : (<>
            <ScaleLoader color="#ffffff"/>
            <button className="xiler-button" onClick={() => login()}>Login</button>
        </>)}
    </div>);
};

const App = () => {
    const clientId = "845ff7e5-fc75-4824-82ce-cd3fcc9059b0";

    return (<BitCheckProvider clientID={clientId}>
        <BitCheckAuthentication/>
    </BitCheckProvider>);
}


export default App;
