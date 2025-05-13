'use client';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// Role options with Directus role IDs
const ROLES = [
  { name: 'Administrator', id: 'f7fd3d0d-6879-4766-b770-0e468827b7d2' },
  { name: 'Teacher', id: '22f95f8c-c18e-41e4-91f6-e76a6135af32' },
  { name: 'Assessor', id: 'aaab3ac0-1d2a-4bd2-8a43-c7e9afbba92c' },
  { name: 'Field Officer', id: '2fc4f2fc-68e8-4115-8522-e2ed761a4332' },
];

// Zambian provinces for location field
const ZAMBIAN_PROVINCES = [
  'Central',
  'Copperbelt',
  'Eastern',
  'Luapula',
  'Lusaka',
  'Muchinga',
  'Northern',
  'North-Western',
  'Southern',
  'Western',
];

// Schema without the title field
export const NewUserSchema = zod
  .object({
    firstName: zod.string().min(1, { message: 'First name is required!' }),
    lastName: zod.string().min(1, { message: 'Last name is required!' }),
    email: zod
      .string()
      .min(1, { message: 'Email is required!' })
      .email({ message: 'Email must be a valid email address!' }),
    password: zod.string().min(6, { message: 'Password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(6, { message: 'Confirm password is required!' }),
    avatarUrl: zod.any().refine((value) => value instanceof File || value === null, {
      message: 'Avatar is required!',
    }),
    location: zod.enum(ZAMBIAN_PROVINCES, {
      message: 'Location is required and must be a valid Zambian province!',
    }),
    description: zod.string().min(1, { message: 'Description is required!' }),
    role: zod.string().min(1, { message: 'Role is required!' }), // Role ID
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
  });

export function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarUrl: null,
    location: '',
    description: '',
    role: '',
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
    values: currentUser
      ? {
          ...defaultValues,
          firstName: currentUser.first_name || '',
          lastName: currentUser.last_name || '',
          email: currentUser.email || '',
          password: '',
          confirmPassword: '',
          location: currentUser.location || '',
          description: currentUser.description || '',
          role: currentUser.role || '',
        }
      : defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Map role ID to role name for the title field
      const selectedRole = ROLES.find((r) => r.id === data.role);
      const roleName = selectedRole ? selectedRole.name : 'Unknown';

      const userData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role, // Directus role ID
        location: data.location,
        description: data.description,
        title: roleName, // Set title to the selected role name
      };

      if (data.avatarUrl instanceof File) {
        const formData = new FormData();
        formData.append('file', data.avatarUrl);
        const fileResponse = await axiosInstance.post('/files', formData);
        userData.avatar = fileResponse.data.data.id;
      }

      if (currentUser) {
        if (!data.password) {
          delete userData.password;
        }
        await axiosInstance.patch(`${endpoints.auth.signUp}/${currentUser.id}`, userData);
        toast.success('Update success!');
      } else {
        await axiosInstance.post(endpoints.auth.signUp, userData);
        toast.success('Create success!');
      }

      reset();
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error('Failed to submit user:', error);
      toast.error(error.message || 'Failed to save user');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="firstName" label="First Name" />
              <Field.Text name="lastName" label="Last Name" />
              <Field.Text name="email" label="Email" />
              <Field.Text name="password" label="Password" type="password" />
              <Field.Text name="confirmPassword" label="Confirm Password" type="password" />
              <Stack spacing={1.5}>
                <FormControl fullWidth required>
                  <InputLabel>Location</InputLabel>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Location">
                        <MenuItem value="" disabled>
                          Select a location
                        </MenuItem>
                        {ZAMBIAN_PROVINCES.map((province) => (
                          <MenuItem key={province} value={province}>
                            {province}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Stack>
              <Field.Text name="description" label="Description" />
              <Stack spacing={1.5}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Role">
                        <MenuItem value="" disabled>
                          Select a role
                        </MenuItem>
                        {ROLES.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Stack>
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                {currentUser ? 'Save changes' : 'Create user'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
