'use client';

import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateBorder } from 'src/components/animate';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export function AccountDrawer({ data = [], sx, ...other }) {
  const pathname = usePathname();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const [directusUser, setDirectusUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(endpoints.auth.me);
        console.log('Fetched Directus user:', response);
        setDirectusUser(response.data.data);
      } catch (error) {
        console.error('Failed to fetch Directus user:', error);
      }
    };

    fetchUser();
  }, []);

  const renderAvatar = () => {
    console.log('Rendering avatar with user:', directusUser);

    if (!directusUser) return null;

    const initials = `${directusUser?.first_name?.[0] || ''}${directusUser?.last_name?.[0] || ''}`.toUpperCase();

    return (
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <AnimateBorder
          sx={{ p: '6px', width: 96, height: 96, borderRadius: '50%', mx: 'auto' }}
          slotProps={{
            primaryBorder: { size: 120, sx: { color: 'primary.main' } },
          }}
        >
          <Avatar
            sx={{
              width: 1,
              height: 1,
              fontSize: 32,
              fontWeight: 'bold',
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            {initials}
          </Avatar>
        </AnimateBorder>

        <Typography variant="subtitle1" noWrap sx={{ mt: 2 }}>
          {directusUser?.first_name} {directusUser?.last_name}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
          {directusUser?.email}
        </Typography>
      </Box>
    );
  };

  const renderList = () => (
    <MenuList
      disablePadding
      sx={[
        (theme) => ({
          py: 3,
          px: 2.5,
          borderTop: `dashed 1px ${theme.vars.palette.divider}`,
          borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
          '& li': { p: 0 },
        }),
      ]}
    >
      {data.map((option) => {
        const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';
        const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;

        return (
          <MenuItem key={option.label}>
            <Link
              component={RouterLink}
              href={option.label === 'Home' ? rootHref : option.href}
              color="inherit"
              underline="none"
              onClick={onClose}
              sx={{
                p: 1,
                width: 1,
                display: 'flex',
                typography: 'body2',
                alignItems: 'center',
                color: 'text.secondary',
                '& svg': { width: 24, height: 24 },
                '&:hover': { color: 'text.primary' },
              }}
            >
              {option.icon}

              <Box component="span" sx={{ ml: 2 }}>
                {option.label === 'Home' ? rootLabel : option.label}
              </Box>

              {option.info && (
                <Label color="error" sx={{ ml: 1 }}>
                  {option.info}
                </Label>
              )}
            </Link>
          </MenuItem>
        );
      })}
    </MenuList>
  );

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={null}
        displayName={`${directusUser?.first_name || ''} ${directusUser?.last_name || ''}`}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 320 } },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            top: 12,
            left: 12,
            zIndex: 9,
            position: 'absolute',
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Box
            sx={{
              pt: 8,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            {renderAvatar()}
          </Box>

          <Box
            sx={{
              p: 3,
              gap: 1,
              flexWrap: 'wrap',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* Add account switchers or profile icons here */}
          </Box>

          {renderList()}
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={onClose} />
        </Box>
      </Drawer>
    </>
  );
}
