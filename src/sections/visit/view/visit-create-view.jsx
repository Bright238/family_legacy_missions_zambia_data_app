'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { JobNewEditForm } from '../job-new-edit-form';

// ----------------------------------------------------------------------

export function VisitCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create New Home Visit"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Children Home Visits', href: paths.dashboard.learners.root },
          { name: 'Create New Home Vist' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <JobNewEditForm />
    </DashboardContent>
  );
}
