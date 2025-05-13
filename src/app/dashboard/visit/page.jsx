import { CONFIG } from 'src/global-config';

import { VisitCreateView } from 'src/sections/visit/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Visits | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <VisitCreateView />;
}
