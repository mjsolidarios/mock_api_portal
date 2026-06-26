import { UnlockTester } from "@/app/developer/UnlockTester";

export default function DeveloperPage() {
  return (
    <div className="page">
      <p className="eyebrow">Developer API</p>
      <h1 className="page-title">Museum handshake tester</h1>
      <p className="lead">
        Games call this portal endpoint when a player discovers a hidden artifact. The
        endpoint validates the developer key, player session, game, and artifact, then
        permanently attaches the collectible to the portal profile.
      </p>
      <UnlockTester />
    </div>
  );
}
