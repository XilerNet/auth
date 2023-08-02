'use client'
import "./global.css";
import { BitCheckProvider, useAuth } from '@bitcheck/auth-react';

// TODO: Further question after auth requesting email if none is found
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
  // Maybe stolen from the bitcheck demo app 0-0
  const clientId = "8547ab9f-f851-4182-995f-0614fc1f90b2";

  return (
    <BitCheckProvider clientID={clientId}>
      <BitcheckAuthentication />
    </BitCheckProvider>
  );
}


export default App;
