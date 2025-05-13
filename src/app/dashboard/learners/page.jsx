import { CONFIG } from 'src/global-config';

import { OrderListView } from 'src/sections/learners/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Learners list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OrderListView />;
}
