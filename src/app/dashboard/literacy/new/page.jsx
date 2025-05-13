import { CONFIG } from 'src/global-config';

import { JobCreateView } from 'src/sections/literacy/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Create a new literacy | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <JobCreateView />;
}
