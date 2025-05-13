import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Main Dashboard',
    items: [{ title: 'Dashboard Overview', path: paths.dashboard.root, icon: ICONS.dashboard }],
  },
  {
    subheader: 'Field Officers Overview',
    items: [
      { title: 'Create New Visit', path: paths.dashboard.visit.new, icon: ICONS.job },
      { title: 'View All Home Visits', path: paths.dashboard.learners.root, icon: ICONS.job },
      { title: 'Create Vulnerability', path: paths.dashboard.vulnerability.new, icon: ICONS.job },
      { title: 'View Vulnerabilities', path: paths.dashboard.vulnerability.root, icon: ICONS.job },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Teachers Overview',
    items: [
      // { title: 'Dashboard', path: paths.dashboard.general.booking, icon: ICONS.booking },
      { title: 'View Home Visits', path: paths.dashboard.learners.root, icon: ICONS.job },
      { title: 'Create Literacy Assessment', path: paths.dashboard.literacy.new, icon: ICONS.job }, // Fixed to use literacy.new
      { title: 'View Literacy Assessments', path: paths.dashboard.literacy.root, icon: ICONS.job },
    ],
  },
  {
    subheader: 'Administrators Overview',
    items: [
      // { title: 'Dashboard', path: paths.dashboard.general.booking, icon: ICONS.booking },
      {
        title: 'Progress Tracking',
        path: paths.dashboard.issueTracking.root, // Fixed to use new issueTracking.root
        icon: ICONS.order,
        children: [
          { title: 'View All Home Visits', path: paths.dashboard.learners.root, icon: ICONS.job}, // Fixed to use issueTracking.root
          { title: 'View Literacies', path: paths.dashboard.literacy.root, icon: ICONS.job },
          {
            title: 'View Vulnerabilities',
            path: paths.dashboard.vulnerability.root,
            icon: ICONS.job,
          },
        ],
      },
      {
        title: 'User Management',
        path: paths.dashboard.user.root,
        icon: ICONS.user,
        children: [
          // { title: 'Profile', path: paths.dashboard.user.root },
          { title: 'Add New User', path: paths.dashboard.user.new },
          { title: 'Users List', path: paths.dashboard.user.list },
          // { title: 'My Account Settings', path: paths.dashboard.user.account },
        ],
      },
    ],
  },
];
