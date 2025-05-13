import { CONFIG } from 'src/global-config';

import { VisitCreateView } from 'src/sections/visit/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Create a new home visit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <VisitCreateView />;
}
