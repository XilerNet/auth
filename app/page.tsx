'use client'
import "./global.css";
import { BitCheckProvider, useAuth } from '@bitcheck/auth-react';
import {useEffect, useState} from "react";

// env based on dev or prod
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : 'https://auth.xiler.net/api';
const BITCHECK_TOKEN_LOCATION = "bitcheck-auth-token";
const CALLBACK_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/auth' : 'https://xiler.net/auth';

const endpoint = (endpoint: string) => `${API_BASE_URL}/${endpoint}`;

const fetchXiler = async (url: string, method: string, body: Object) => {
    try {
        return await fetch(endpoint(url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
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
    const res = await fetchXiler("login", "POST", { token });

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
    const res = await fetchXiler("set_email", "POST", { token, email });

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
  const { user, login, logout } = useAuth();
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
      localStorage.clear();
  }, []);

  useEffect(() => {
      const performLogin = async () => {
          if (user && !emailToken) {
              await XilerAuthLogin((token) => setEmailToken(token));
          }
      }

        performLogin().then();
  }, [user, emailToken]);

  return (
    <div>
        {
            emailToken ? (
                <>
                    <p>Please enter your email to continue</p>
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                    <button onClick={() => XilerAuthSetEmail(email!, emailToken!, (token) => setEmailToken(token))}>Submit</button>
                </>
            ) : user ? (
                <>
                    <p>loading...</p>
                    <button onClick={() => logout()}>Logout</button>
                </>
            ) : (
                <>
                    <p>Please login to xiler.</p>
                    <button onClick={() => login()}>Login</button>
                </>
            )
        }
      </div>
  );
};

const App = () => {
  const clientId = "845ff7e5-fc75-4824-82ce-cd3fcc9059b0";

  return (
    <BitCheckProvider clientID={clientId}>
      <BitCheckAuthentication />
    </BitCheckProvider>
  );
}


export default App;
