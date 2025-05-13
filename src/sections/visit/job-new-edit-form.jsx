import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// Define dropdown options
const SCHOOLS = [
  'Arakan Boys',
  'Bayuni Secondary',
  'Burma Road Primary',
  'Chainda Basic',
  'Chaisa Basic',
  'Chakunkula Primary',
  'Chelstone Secondary',
  'Chigwilizano',
  'Chinika High',
  'Chitanda Basic',
  'Chunga Secondary',
  'Comestar Private',
  'Diana Kaimba Primary',
  'Desai Basic',
  'Edwin Mulongoti',
  'George Central Basic',
  'Hillcrest National Technical',
  'Hillside Primary',
  'Justin Kabwe Basic',
  'Kabulonga Girls',
  'Kabulonga Primary',
  'Kadma Technical',
  'Kalundu Primary',
  'Kamanga Primary',
  'Kambule Tech',
  'Lumala Secondary',
  'Matero Girls Secondary School',
  'Mkandawire Combined',
  'Muchinga Primary',
  'Mulongoti Primary',
  'Mumana Primary',
  'Mwavi Secondary',
  'Nelson Mandela',
  'New Kanyama Primary',
  'New Matero Secondary',
  'Ngombe Primary',
  'Northmead Secondary',
  'Nyumba Yanga Secondary',
  'Olympia Park Secondary',
  'St Michael Secondary',
  'St Mulumba Special School',
  'Twatasha Primary',
  'Other',
];

const GENDERS = ['Male', 'Female'];
const SCHOOL_CATEGORIES = ['Legacy Academy', 'Government'];
const STAFF_OCCUPATIONS = ['Social Services Officer - CMS', 'Social Services Coordinator - CMS'];
const SCHOOL_TERMS = ['Term 1', 'Term 2', 'Term 3'];
const GRADES = ['Newcomer', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const COMMUNITIES = [
  'Bauleni',
  'Chaisa',
  'Chawama',
  'George',
  'Ibx John Laing',
  'Kabanana',
  'Kamanga',
  'Kanyama One',
  'Kanyama Two',
  'Lusaka West',
  'Matero',
  'Misisi',
  'Mtendere',
  'Ngombe',
];
const RELATIONSHIPS = [
  'Mother',
  'Father',
  'Brother',
  'Sister',
  'Paternal Aunt',
  'Paternal Uncle',
  'Maternal Uncle',
  'Maternal Aunt',
  'Paternal Grandfather',
  'Paternal Grandmother',
  'Maternal Grandfather',
  'Maternal Grandmother',
  'Guardian',
  'Other',
];
const HOME_VISIT_INDICATORS = [
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
  '13th',
  '14th',
  '15th',
];
const PURPOSES = ['Follow-up', 'Initial Visit', 'Special Request', 'Other'];
const INTERVENTIONS = ['Counseling', 'Medical', 'Educational', 'Financial', 'Other'];
const YES_NO = ['Yes', 'No'];

// Define the form schema
const HomeVisitSchema = z
  .object({
    // Staff Details
    staffId: z.string().min(1, { message: 'Staff ID is required' }),
    staffFirstName: z.string().min(1, { message: 'First name is required' }),
    staffLastName: z.string().min(1, { message: 'Last name is required' }),
    staffGender: z.enum(GENDERS, { message: 'Gender is required' }),
    staffOccupation: z.enum(STAFF_OCCUPATIONS, { message: 'Occupation is required' }),
    staffEmail: z
      .string()
      .email({ message: 'Invalid email address' })
      .min(1, { message: 'Staff Email is required' }),

    // Child Details
    schoolCategory: z.enum(SCHOOL_CATEGORIES, { message: 'School category is required' }),
    childId: z.string().min(1, { message: 'Child ID is required' }).optional(), // Optional if creating new child
    childFirstName: z.string().min(1, { message: 'Child first name is required' }),
    childLastName: z.string().min(1, { message: 'Child last name is required' }),
    childAge: z.number().int().positive({ message: 'Age must be a positive number' }),
    childGender: z.enum(GENDERS, { message: 'Gender is required' }),
    schoolTerm: z.enum(SCHOOL_TERMS, { message: 'School term is required' }),
    grade: z.enum(GRADES, { message: 'Grade is required' }),
    class: z.string().min(1, { message: 'Class is required' }),
    school: z.enum(SCHOOLS, { message: 'School is required' }),
    otherSchool: z.string().optional(),
    community: z.enum(COMMUNITIES, { message: 'Community is required' }),

    // Caregiver's Details
    caregiverFirstName: z.string().min(1, { message: 'Caregiver first name is required' }),
    caregiverLastName: z.string().min(1, { message: 'Caregiver last name is required' }),
    caregiverAge: z.number().int().positive().optional(),
    relationshipToChild: z.enum(RELATIONSHIPS, { message: 'Relationship to child is required' }),
    otherRelationship: z.string().optional(),
    contact1: z.string().min(1, { message: 'Contact number 1 is required' }),
    contact2: z.string().optional(),

    // Home Visit Details
    homeVisitIndicator: z.enum(HOME_VISIT_INDICATORS, {
      message: 'Home visit indicator is required',
    }),
    homeVisitDate: z.coerce.date({ message: 'Invalid date' }),
    purposeOfVisit: z.enum(PURPOSES, { message: 'Purpose of visit is required' }),
    otherPurpose: z.string().optional(),
    daysMissedSchool: z
      .number()
      .int()
      .nonnegative({ message: 'Days missed must be a non-negative number' }),
    sicknessDate: z.coerce.date().optional(),
    durationSick: z.string().optional(),
    medicalIntervention: z.string().optional(),
    keyFindings: z.string().min(1, { message: 'Key findings are required' }),

    // Prayer Request and Concerns
    hasPrayerRequest: z.enum(YES_NO, { message: 'Selection is required' }),
    prayerRequestDetails: z.string().optional(),
    hasConcern: z.enum(YES_NO, { message: 'Selection is required' }),
    concernDetails: z.string().optional(),

    // Recommendations and Interventions
    hasRecommendations: z.enum(YES_NO, { message: 'Selection is required' }),
    recommendationDetails: z.string().optional(),
    interventionConsidered: z.enum(INTERVENTIONS, {
      message: 'Intervention considered is required',
    }),
    otherIntervention: z.string().optional(),

    // Confirmation
    confirmInformation: z.enum(YES_NO, { message: 'Confirmation is required' }),
  })
  .refine(
    (data) => {
      if (data.school === 'Other' && !data.otherSchool) return false;
      if (data.relationshipToChild === 'Other' && !data.otherRelationship) return false;
      if (data.purposeOfVisit === 'Other' && !data.otherPurpose) return false;
      if (data.interventionConsidered === 'Other' && !data.otherIntervention) return false;
      if (data.hasPrayerRequest === 'Yes' && !data.prayerRequestDetails) return false;
      if (data.hasConcern === 'Yes' && !data.concernDetails) return false;
      if (data.hasRecommendations === 'Yes' && !data.recommendationDetails) return false;
      return true;
    },
    { message: 'Please fill in the required fields' }
  );

export function JobNewEditForm({ currentHomeVisit }) {
  const router = useRouter();

  const [staffList, setStaffList] = useState([]);
  const [childList, setChildList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(true);

  const openStaff = useBoolean(true);
  const openChild = useBoolean(true);
  const openCaregiver = useBoolean(true);
  const openVisit = useBoolean(true);
  const openPrayer = useBoolean(true);
  const openRecommendations = useBoolean(true);
  const openConfirmation = useBoolean(true);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(HomeVisitSchema),
    defaultValues: {
      staffId: '',
      staffFirstName: '',
      staffLastName: '',
      staffGender: '',
      staffOccupation: '',
      staffEmail: '',
      schoolCategory: '',
      childId: '',
      childFirstName: '',
      childLastName: '',
      childAge: null,
      childGender: '',
      schoolTerm: '',
      grade: '',
      class: '',
      school: '',
      otherSchool: '',
      community: '',
      caregiverFirstName: '',
      caregiverLastName: '',
      caregiverAge: null,
      relationshipToChild: '',
      otherRelationship: '',
      contact1: '',
      contact2: '',
      homeVisitIndicator: '',
      homeVisitDate: null,
      purposeOfVisit: '',
      otherPurpose: '',
      daysMissedSchool: null,
      sicknessDate: null,
      durationSick: '',
      medicalIntervention: '',
      keyFindings: '',
      hasPrayerRequest: '',
      prayerRequestDetails: '',
      hasConcern: '',
      concernDetails: '',
      hasRecommendations: '',
      recommendationDetails: '',
      interventionConsidered: '',
      otherIntervention: '',
      confirmInformation: '',
    },
    values: currentHomeVisit,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        const response = await axiosInstance.get('/users', {
          params: { fields: 'id,first_name,last_name', filter: { status: 'active' } },
        });
        setStaffList(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        toast.error('Failed to load staff list');
      } finally {
        setLoadingStaff(false);
      }
    };

    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        const response = await axiosInstance.get('/items/children', {
          params: { fields: 'id,first_name,last_name' },
        });
        setChildList(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch children:', error);
        toast.error('Failed to load children list');
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchStaff();
    fetchChildren();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Create or update child record in the children collection
      const childData = {
        first_name: data.childFirstName,
        last_name: data.childLastName,
        age: data.childAge,
        gender: data.childGender,
        school_category: data.schoolCategory,
        school_term: data.schoolTerm,
        grade: data.grade,
        class: data.class,
        school: data.school === 'Other' ? data.otherSchool : data.school,
        community: data.community,
      };
      let childResponse;
      if (data.childId) {
        // Update existing child if childId is provided
        childResponse = await axiosInstance.patch(`/items/children/${data.childId}`, childData);
      } else {
        // Create new child if no childId
        childResponse = await axiosInstance.post(endpoints.children.create, childData);
      }
      const childId = childResponse.data.data.id;

      // Create or update caregiver record
      const caregiverData = {
        first_name: data.caregiverFirstName,
        last_name: data.caregiverLastName,
        age: data.caregiverAge,
        relationship_to_child: data.relationshipToChild,
        other_relationship: data.otherRelationship,
        contact_number_1: data.contact1,
        contact_number_2: data.contact2,
      };
      const caregiverResponse = await axiosInstance.post('/items/caregivers', caregiverData);
      const caregiverId = caregiverResponse.data.data.id;

      // Create home visit record
      const homeVisitData = {
        staff_id: data.staffId,
        child_id: childId,
        caregiver_id: caregiverId,
        home_visit_date: data.homeVisitDate,
        purpose_of_visit: data.purposeOfVisit,
        other_purpose: data.otherPurpose,
        days_missed_school: data.daysMissedSchool,
        sickness_date: data.sicknessDate,
        duration_sick: data.durationSick,
        medical_intervention: data.medicalIntervention,
        key_findings: data.keyFindings,
        has_prayer_request: data.hasPrayerRequest,
        prayer_request_details: data.prayerRequestDetails,
        has_concern: data.hasConcern,
        concern_details: data.concernDetails,
        has_recommendations: data.hasRecommendations,
        recommendation_details: data.recommendationDetails,
        intervention_considered: data.interventionConsidered,
        other_intervention: data.otherIntervention,
        confirm_information: data.confirmInformation,
        home_visit_indicator: data.homeVisitIndicator,
      };
      await axiosInstance.post('/items/home_visits', homeVisitData);

      reset();
      toast.success(currentHomeVisit ? 'Home Visit Updated!' : 'Home Visit Created!');
      // Safeguard for router.push
      if (router && paths.dashboard && paths.dashboard.learners) {
        router.push(paths.dashboard.learners);
      } else {
        console.warn(
          'Navigation failed: router or paths.dashboard.home_visits is undefined. Falling back to root.'
        );
        window.location.href = '/dashboard/learners'; // Fallback to root or a known route
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit home visit form');
    }
  });

  const renderCollapseButton = (value, onToggle) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  const renderStaffDetails = () => (
    <Card>
      <CardHeader
        title="Staff Details"
        action={renderCollapseButton(openStaff.value, openStaff.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openStaff.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Staff ID</Typography>
            <FormControl fullWidth required>
              <InputLabel>Staff ID</InputLabel>
              <Controller
                name="staffId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Staff ID" disabled={loadingStaff}>
                    {loadingStaff ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : staffList.length === 0 ? (
                      <MenuItem disabled>No staff available</MenuItem>
                    ) : (
                      staffList.map((staff) => (
                        <MenuItem
                          key={staff.id}
                          value={staff.id}
                        >{`${staff.id}: ${staff.first_name} ${staff.last_name}`}</MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">First Name</Typography>
              <Field.Text name="staffFirstName" placeholder="Enter First Name" required />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Last Name</Typography>
              <Field.Text name="staffLastName" placeholder="Enter Last Name" required />
            </Stack>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Gender</Typography>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Controller
                name="staffGender"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Gender">
                    {GENDERS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Occupation</Typography>
            <FormControl fullWidth required>
              <InputLabel>Occupation</InputLabel>
              <Controller
                name="staffOccupation"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Occupation">
                    {STAFF_OCCUPATIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Email</Typography>
            <Field.Text name="staffEmail" type="email" placeholder="example@example.com" required />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderChildDetails = () => (
    <Card>
      <CardHeader
        title="Child Details"
        action={renderCollapseButton(openChild.value, openChild.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openChild.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">School Category</Typography>
            <FormControl fullWidth required>
              <InputLabel>School Category</InputLabel>
              <Controller
                name="schoolCategory"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="School Category">
                    {SCHOOL_CATEGORIES.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Child ID</Typography>
            <FormControl fullWidth required>
              <InputLabel>Child ID</InputLabel>
              <Controller
                name="childId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Child ID" disabled={loadingChildren}>
                    {loadingChildren ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : childList.length === 0 ? (
                      <MenuItem disabled>No children available</MenuItem>
                    ) : (
                      childList.map((child) => (
                        <MenuItem
                          key={child.id}
                          value={child.id}
                        >{`${child.id}: ${child.first_name} ${child.last_name}`}</MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">First Name</Typography>
              <Field.Text name="childFirstName" placeholder="Enter First Name" required />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Last Name</Typography>
              <Field.Text name="childLastName" placeholder="Enter Last Name" required />
            </Stack>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Age</Typography>
            <Field.Text name="childAge" type="number" placeholder="Enter Age" required />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Gender</Typography>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Controller
                name="childGender"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Gender">
                    {GENDERS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">School Term</Typography>
            <FormControl fullWidth required>
              <InputLabel>School Term</InputLabel>
              <Controller
                name="schoolTerm"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="School Term">
                    {SCHOOL_TERMS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Grade</Typography>
            <FormControl fullWidth required>
              <InputLabel>Grade</InputLabel>
              <Controller
                name="grade"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Grade">
                    {GRADES.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Class</Typography>
            <Field.Text name="class" placeholder="Enter Class" required />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">School</Typography>
            <FormControl fullWidth required>
              <InputLabel>School</InputLabel>
              <Controller
                name="school"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="School">
                    {SCHOOLS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {watch('school') === 'Other' && (
              <Field.Text name="otherSchool" placeholder="Specify Other School" required />
            )}
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Community</Typography>
            <FormControl fullWidth required>
              <InputLabel>Community</InputLabel>
              <Controller
                name="community"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Community">
                    {COMMUNITIES.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderCaregiverDetails = () => (
    <Card>
      <CardHeader
        title="Caregiver's Details"
        action={renderCollapseButton(openCaregiver.value, openCaregiver.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openCaregiver.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack direction="row" spacing={2}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">First Name</Typography>
              <Field.Text name="caregiverFirstName" placeholder="Enter First Name" required />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Last Name</Typography>
              <Field.Text name="caregiverLastName" placeholder="Enter Last Name" required />
            </Stack>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Age</Typography>
            <Field.Text name="caregiverAge" type="number" placeholder="Enter Age" />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Relationship to the Child</Typography>
            <FormControl fullWidth required>
              <InputLabel>Relationship to Child</InputLabel>
              <Controller
                name="relationshipToChild"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Relationship to Child">
                    {RELATIONSHIPS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {watch('relationshipToChild') === 'Other' && (
              <Field.Text
                name="otherRelationship"
                placeholder="Specify Other Relationship"
                required
              />
            )}
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Contact Number 1</Typography>
            <Field.Text name="contact1" placeholder="Enter Contact Number" required />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Contact Number 2</Typography>
            <Field.Text name="contact2" placeholder="Enter Alternative Contact Number" />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderHomeVisitDetails = () => (
    <Card>
      <CardHeader
        title="Home Visit Details"
        action={renderCollapseButton(openVisit.value, openVisit.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openVisit.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Indicate Home Visit</Typography>
            <FormControl fullWidth required>
              <InputLabel>Indicate Home Visit</InputLabel>
              <Controller
                name="homeVisitIndicator"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Indicate Home Visit">
                    {HOME_VISIT_INDICATORS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Date of Home Visit</Typography>
            <Field.DatePicker name="homeVisitDate" required />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Purpose of Visit</Typography>
            <FormControl fullWidth required>
              <InputLabel>Purpose of Visit</InputLabel>
              <Controller
                name="purposeOfVisit"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Purpose of Visit">
                    {PURPOSES.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {watch('purposeOfVisit') === 'Other' && (
              <Field.Text name="otherPurpose" placeholder="Specify Other Purpose" required />
            )}
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Days Missed School This Week</Typography>
            <Field.Text
              name="daysMissedSchool"
              type="number"
              placeholder="Enter Number of Days"
              required
            />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Date of Sickness</Typography>
            <Field.DatePicker name="sicknessDate" />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Duration of Sickness</Typography>
            <Field.Text name="durationSick" placeholder="Enter Duration" />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Medical Intervention</Typography>
            <Field.Text name="medicalIntervention" placeholder="Enter Medical Intervention" />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Key Findings</Typography>
            <Field.Text
              name="keyFindings"
              placeholder="Enter Key Findings"
              multiline
              rows={4}
              required
            />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderPrayerAndConcerns = () => (
    <Card>
      <CardHeader
        title="Prayer Request and Concerns"
        action={renderCollapseButton(openPrayer.value, openPrayer.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openPrayer.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Do you have any prayer request?</Typography>
            <FormControl fullWidth required>
              <InputLabel>Prayer Request</InputLabel>
              <Controller
                name="hasPrayerRequest"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Prayer Request">
                    {YES_NO.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {watch('hasPrayerRequest') === 'Yes' && (
              <Field.Text
                name="prayerRequestDetails"
                placeholder="What would you like us to pray for?"
                multiline
                rows={4}
                required
              />
            )}
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Do you have any question or concern?</Typography>
            <FormControl fullWidth required>
              <InputLabel>Question or Concern</InputLabel>
              <Controller
                name="hasConcern"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Question or Concern">
                    {YES_NO.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {watch('hasConcern') === 'Yes' && (
              <Field.Text
                name="concernDetails"
                placeholder="What question or concern do you have?"
                multiline
                rows={4}
                required
              />
            )}
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderRecommendationsAndInterventions = () => (
    <Card>
      <CardHeader
        title="Recommendations and Interventions"
        action={renderCollapseButton(openRecommendations.value, openRecommendations.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openRecommendations.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Are there any recommendations?</Typography>
            <FormControl fullWidth required>
              <InputLabel>Recommendations</InputLabel>
              <Controller
                name="hasRecommendations"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Recommendations">
                    {YES_NO.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {watch('hasRecommendations') === 'Yes' && (
              <Field.Text
                name="recommendationDetails"
                placeholder="Specify the recommendation(s)"
                multiline
                rows={4}
                required
              />
            )}
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">What intervention have you considered?</Typography>
            <FormControl fullWidth required>
              <InputLabel>Intervention Considered</InputLabel>
              <Controller
                name="interventionConsidered"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Intervention Considered">
                    {INTERVENTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {watch('interventionConsidered') === 'Other' && (
              <Field.Text
                name="otherIntervention"
                placeholder="Specify Other Intervention"
                required
              />
            )}
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderConfirmation = () => (
    <Card>
      <CardHeader
        title="Kindly confirm if the information captured is correct and accurate before making your submission? If fully persuaded click, 'yes' and then submit."
        action={renderCollapseButton(openConfirmation.value, openConfirmation.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openConfirmation.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Confirm Information</Typography>
            <FormControl fullWidth required>
              <InputLabel>Confirm Information</InputLabel>
              <Controller
                name="confirmInformation"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Confirm Information">
                    {YES_NO.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack
        spacing={{ xs: 3, md: 5 }}
        sx={{ width: '100%', minHeight: '100vh', p: 3, boxSizing: 'border-box' }}
      >
        {renderStaffDetails()}
        {renderChildDetails()}
        {renderCaregiverDetails()}
        {renderHomeVisitDetails()}
        {renderPrayerAndConcerns()}
        {renderRecommendationsAndInterventions()}
        {renderConfirmation()}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting || loadingStaff || loadingChildren}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : currentHomeVisit ? (
              'Save Changes'
            ) : (
              'Submit Home Visit'
            )}
          </Button>
        </Box>
      </Stack>
    </Form>
  );
}
