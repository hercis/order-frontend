import { useAuth, withAuth } from "react-oidc-context";
import OrderForm from "./OrderForm.jsx";
import './App.css';

export default function App() {
  const auth = useAuth();

  const signOutRedirect = async () => {
    await auth.removeUser();
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN || "https://orderapi-dev-auth.auth.mx-central-1.amazoncognito.com";
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || "gufujh45flp7jo0c58lqvp78s";
    const logoutUri = import.meta.env.VITE_CALLBACK_URL || "http://localhost:5173";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.source} caused {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    return <div><button onClick={() => auth.signinRedirect()}>Log in</button></div>;
  }

  return (
    <>
      <div>
        Hello {auth.user?.profile.sub}{" "}
        <button onClick={() => signOutRedirect()}>Log out</button>
      </div>
      {/* withAuth injects auth prop, so no need to pass manually */}
      <DebugPanel />
      <OrderForm />
    </>
  );
}

// Convert DebugPanel to receive injected auth via withAuth
const DebugPanelBase = ({ auth }) => {
  return (<div id="debug_panel">
    <div><strong>Auth</strong>: {auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
    {auth.user && (
      <div id="container_auth_details">
        <div>
          <div>issuer: {(() => { try { const p = JSON.parse(atob(auth.user.id_token.split('.')[1])); return p.iss; } catch { return 'n/a'; } })()}</div>
          <div>expires: {(() => { try { const p = JSON.parse(atob(auth.user.id_token.split('.')[1])); return new Date(p.exp * 1000).toISOString(); } catch { return 'n/a'; } })()}</div>
        </div>
        <div>
          <div>audience: {(() => { try { const p = JSON.parse(atob(auth.user.id_token.split('.')[1])); return Array.isArray(p.aud) ? p.aud.join(',') : p.aud; } catch { return 'n/a'; } })()}</div>
          <div>has token: {auth.user?.id_token ? 'yes' : 'no'}</div>
        </div>
      </div>
    )}
  </div>
  );
};

// Wrap with withAuth HOC to inject auth prop
const DebugPanel = withAuth(DebugPanelBase);

// Keep named export local if needed in tests
// export { DebugPanelBase as DebugPanel };