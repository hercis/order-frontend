import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";
import App from './App.jsx'

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY || 'https://cognito-idp.mx-central-1.amazonaws.com/mx-central-1_tjFX5KvVh',
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID || 'gufujh45flp7jo0c58lqvp78s',
  redirect_uri: import.meta.env.VITE_CALLBACK_URL || 'http://localhost:5173',
  response_type: "code",
  scope: "email openid profile",
  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    )
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)