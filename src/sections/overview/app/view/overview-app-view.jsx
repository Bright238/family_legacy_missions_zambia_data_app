'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';

import { AppWelcome } from '../app-welcome';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppAreaInstalled } from '../app-area-installed';

export function OverviewAppView() {
  const { user, loading } = useAuthContext();
  const theme = useTheme();

  const [metrics, setMetrics] = useState({
    totalVisits: 0,
    literacyAssessments: 0,
    childrenCount: 0,
    vulnerabilityAssessments: 0,
  });
  const [userProfile, setUserProfile] = useState(null);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get(endpoints.auth.me);
        setUserProfile(response.data.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load user profile');
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    console.log('User object:', user);
    console.log('User profile:', userProfile);
  }, [user, userProfile]);

  let displayName = '';
  if (userProfile?.displayName) {
    displayName = userProfile.displayName;
  } else if (userProfile?.first_name) {
    displayName = `${userProfile.first_name}`;
  } else if (userProfile?.name) {
    displayName = userProfile.name;
  } else if (userProfile?.email) {
    displayName = userProfile.email.split('@')[0];
  } else if (user) {
    if (user.first_name && user.last_name) {
      displayName = `${user.first_name} ${user.last_name}`;
    } else if (user.name) {
      displayName = user.name;
    } else if (user.email) {
      displayName = user.email.split('@')[0];
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.warn('User object is undefined, skipping fetchData');
        return;
      }

      try {
        const totalVisitsResponse = await axiosInstance.get(endpoints.home_visits.list);
        console.log('Total Home Visits Response:', totalVisitsResponse);

        const literacyAssessmentsResponse = await axiosInstance.get(endpoints.literacy.list);
        console.log('Literacy Assessments Response:', literacyAssessmentsResponse);

        const childrenCountResponse = await axiosInstance.get(endpoints.children.list);
        console.log('Children Count Response:', childrenCountResponse);

        const vulnerabilityAssessmentsResponse = await axiosInstance.get(
          endpoints.vulnerability.list
        );
        console.log('Vulnerability Assessments Response:', vulnerabilityAssessmentsResponse);

        setMetrics({
          totalVisits: totalVisitsResponse.data.data?.length || 0,
          literacyAssessments: literacyAssessmentsResponse.data.data?.length || 0,
          childrenCount: childrenCountResponse.data.data?.length || 0,
          vulnerabilityAssessments: vulnerabilityAssessmentsResponse.data.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <DashboardContent maxWidth="xl">
      {loading ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          <Typography variant="body1">Loading user data...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12 }}>
            <AppWelcome
              title={`Hi there👋 ${displayName}, ${getTimeBasedGreeting()}!\n Welcome to Family Legacy Missions Zambia\n Data Quality Assurance Platform`}
              description={`As a ${userProfile?.occupation || 'Staff'}, monitor child welfare and take action. Get started by learning useful tools within the platform.`}
              action={
                <Button
                  variant="contained"
                  color="primary"
                  href="https://analytics.sadcgrains.com/superset/dashboard/1/?native_filters_key=kKYZH6FM6fjPrIunTcSYu3p6gKWqPND0x0EkeusWvElmNgt41PH0vrYMtv4RVUN6"
                >
                  View Realtime Visualizations
                </Button>
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppWidgetSummary
                  title="Children Assessed"
                  percent={-0.5}
                  total={metrics.childrenCount}
                  chart={{
                    colors: [theme.palette.error.main],
                    categories: [],
                    series: [],
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppWidgetSummary
                  title="Total Home Visits"
                  percent={5.2}
                  total={metrics.totalVisits}
                  chart={{
                    categories: [],
                    series: [],
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppWidgetSummary
                  title="Vulnerabilities"
                  percent={2.3}
                  total={metrics.vulnerabilityAssessments}
                  chart={{
                    colors: [theme.palette.warning.main],
                    categories: [],
                    series: [],
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppWidgetSummary
                  title="Literacy Assessments"
                  percent={1.8}
                  total={metrics.literacyAssessments}
                  chart={{
                    colors: [theme.palette.info.main],
                    categories: [],
                    series: [],
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            <AppAreaInstalled title="Insights" subheader="Children Enrollment Trends" />
          </Grid> */}
        </Grid>
      )}
    </DashboardContent>
  );
}