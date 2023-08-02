'use client'
import "./global.css";
import { BitCheckProvider, useAuth } from '@bitcheck/auth-react';

const BitcheckAuthentication = () => {
  const { user, login, logout } = useAuth();

  return (
    <div>
        {user ? (
          <>
            <p>Welcome, your connected addresses are:</p>
            <ul>
              {user.addresses.map(
                (address: string) => (<li key={address}>{address}</li>)
              )}
            </ul>
            <button onClick={() => logout()}>Logout</button>
          </>
        ) : (
          <>
            <p>Please login to access the content.</p>
            <button onClick={() => login()}>Login</button>
          </>
        )}
      </div>
  );
};

const App = () => {
  const clientId = "xiler-net";

  return (
    <BitCheckProvider clientID={clientId}>
      <BitcheckAuthentication />
    </BitCheckProvider>
  );
}


export default App;
