import SecurityCard from "../component/securitycard";
import TwoStepCard from "../component/twostepcard";
import { PageHeader } from "../component/ui";

// What a regular admin can manage for themselves. Site settings stay with the super admin.
function Account() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="My account" subtitle="Change your password and turn on two-step sign-in." />
      <SecurityCard />
      <TwoStepCard />
    </div>
  );
}

export default Account;
