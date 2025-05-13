import { CONFIG } from 'src/global-config';

import { JobListView } from 'src/sections/literacy/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Literacy | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <JobListView />;
}
