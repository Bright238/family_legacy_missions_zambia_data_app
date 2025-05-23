import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Item params | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Item active has params" />;
}
