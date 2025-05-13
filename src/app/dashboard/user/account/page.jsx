import { CONFIG } from 'src/global-config';

import { AccountGeneralView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Account general settings | Dashboard - ${CONFIG.appName}`,
};

export default function Page({ params }) {
  return <AccountGeneralView params={params} />;
}