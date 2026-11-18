import { LuShieldCheck, LuLogOut } from "react-icons/lu";
import { BrandLogo } from "./sidenav";
import TwoStepCard from "./twostepcard";
import Watermark from "./watermark";
import { btnSecondary } from "./ui";

// Shown instead of the CMS to a staff member who has not set up two-step verification. The server refuses
// everything else for them as well, so this is the only way forward.
export default function MfaGate({ onDone, onSignOut }) {
  return (
    <div className="relative min-h-screen bg-bgcolor px-4 py-8 flex flex-col items-center gap-6 overflow-y-auto">
      <Watermark />
      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo width={150} />
          <button type="button" onClick={onSignOut} className={btnSecondary}><LuLogOut /> Sign out</button>
        </div>
        <div className="rounded-2xl border border-[#e4d3ea] bg-lilac p-5 md:p-6 flex gap-4">
          <LuShieldCheck className="mt-1 shrink-0 text-3xl text-purple" />
          <div>
            <h1 className="text-xl font-extrabold text-purple">Set up two-step verification to continue</h1>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink/80">
              Every staff account needs a code from an authenticator app (Google Authenticator, Microsoft Authenticator or
              Authy) as well as the password. It protects the orders and customer details in this CMS even if a password
              is stolen. It takes about a minute, and you only do it once.
            </p>
          </div>
        </div>
        <TwoStepCard onEnabled={onDone} />
      </div>
    </div>
  );
}
