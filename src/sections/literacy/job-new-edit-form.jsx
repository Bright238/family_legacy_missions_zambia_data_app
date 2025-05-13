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
const GENDERS = ['Male', 'Female'];
const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SCHOOLS = [
  'Arakan Boys',
  'Arakan Girls',
  'Bayuni Secondary',
  'Burma Road Primary',
  'Chainda Basic',
  'Chaisa Basic',
  'Chakunkula Combined',
  'Chawama Combined',
  'Chelstone Secondary',
  'Chigwilizano',
  'Chinika Secondary',
  'Chitanda Basic',
  'Chunga Secondary',
  'Cornerstar Private',
  'Desai Basic',
  'Diana Kaimba Primary',
  'Edwin Mulongoti Primary',
  'Equatorial Education House',
  'George Central Basic',
  'Highland High School',
  'Hillcrest National Technical',
  'Hillside Primary',
  'JM Academy',
  'Justin Kabwe Basic',
  'Kabulonga Boys',
  'Kabulonga Girls',
  'Kabulonga Primary',
  'Kadma Technical Secondary',
  'Kalomo Secondary',
  'Kalundu Primary',
  'Kamanga Primary',
  'Kambule Technical Secondary',
  'Kamulanga High',
  'Kamwala Primary',
  'Kamwala Secondary',
  'Kaoma Stem Secondary School',
  'Kaunda Square Primary',
  'Libala Secondary',
  'Lotus Combined',
  'Lusaka Girls',
  'Matero Girls Secondary School',
  'Mkandawire Combined',
  'Muchinga Primary',
  'Mulongoti Primary',
  'Mumana Primary',
  'Munali Boys',
  'Munali Girls',
  'Mwavi Secondary',
  'Nelson Mandela',
  'New Kanyama Primary',
  'New Matero Secondary',
  'Ngaso Education Center',
  'Ngombe Primary',
  'Northmead Secondary',
  'Nyumba Yanga Secondary',
  'Olympia Park Secondary',
  'St Michael Secondary',
  'St Mulumba Special School',
  'St. Christopher Skills Centre',
  'Twatasha Primary',
  'Twashuka Secondary School',
  'Twin Palm Secondary',
  'Other',
];
const CLASSES = ['A', 'B', 'C', 'D'];
const CRITERION_RATINGS = ['✔️', '〇'];
const OCCUPATIONS = ['Teacher', 'Other'];

// Role IDs for filtering
const ASSESSOR_ROLE_ID = 'aaab3ac0-1d2a-4bd2-8a43-c7e9afbba92c';
const TEACHER_ROLE_ID = '22f95f8c-c18e-41e4-91f6-e76a6135af32';

// Define the form schema
const AssessmentSchema = z
  .object({
    assessmentDate: z.coerce.date({ message: 'Invalid assessment date' }),
    assessorId: z.string().min(1, { message: 'Assessor ID is required' }),
    assessorName: z.string().min(1, { message: 'Assessor name is required' }),
    assessorGender: z.enum(GENDERS, { message: 'Assessor gender is required' }),
    assessorOccupation: z.enum(OCCUPATIONS, { message: 'Assessor occupation is required' }),
    supervisorName: z.string().min(1, { message: 'Supervisor name is required' }),
    teacherId: z.string().min(1, { message: 'Teacher ID is required' }),
    teacherName: z.string().min(1, { message: 'Teacher name is required' }),
    teacherGender: z.enum(GENDERS, { message: 'Teacher gender is required' }),
    teacherSupervisorName: z.string().min(1, { message: 'Teacher supervisor name is required' }),
    childId: z.string().min(1, { message: 'Child ID is required' }),
    childName: z.string().min(1, { message: 'Child name is required' }),
    childGender: z.enum(GENDERS, { message: 'Child gender is required' }),
    grade: z.enum(GRADES, { message: 'Grade is required' }),
    class: z.enum(CLASSES, { message: 'Class is required' }),
    school: z.enum(SCHOOLS, { message: 'School is required' }),
    otherSchool: z.string().optional(),
    criterion1Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 1 rating is required' }),
    criterion2Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 2 rating is required' }),
    criterion3Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 3 rating is required' }),
    criterion4Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 4 rating is required' }),
    criterion5Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 5 rating is required' }),
    criterion6Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 6 rating is required' }),
    criterion7Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 7 rating is required' }),
    criterion8Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 8 rating is required' }),
    criterion9Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 9 rating is required' }),
    criterion10Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 10 rating is required' }),
    criterion11Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 11 rating is required' }),
    criterion12Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 12 rating is required' }),
    criterion13Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 13 rating is required' }),
    criterion14Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 14 rating is required' }),
    criterion15Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 15 rating is required' }),
    criterion16Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 16 rating is required' }),
    criterion17Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 17 rating is required' }),
    criterion18Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 18 rating is required' }),
    criterion19Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 19 rating is required' }),
    criterion20Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 20 rating is required' }),
    criterion21Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 21 rating is required' }),
    criterion22Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 22 rating is required' }),
    criterion23Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 23 rating is required' }),
    criterion24Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 24 rating is required' }),
    criterion25Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 25 rating is required' }),
    criterion26Rating: z.enum(CRITERION_RATINGS, { message: 'Criterion 26 rating is required' }),
    totalSightWords: z
      .number()
      .int()
      .nonnegative({ message: 'Total sight words must be a non-negative number' }),
    totalTicks: z
      .number()
      .int()
      .min(0)
      .max(26, { message: 'Total ticks must be between 0 and 26' }),
    assessmentScore: z.string().min(1, { message: 'Assessment score is required' }),
  })
  .refine(
    (data) => {
      if (data.school === 'Other' && !data.otherSchool) return false;
      return true;
    },
    { message: 'Please specify the other school name' }
  );

export function JobNewEditForm({ currentAssessment }) {
  const router = useRouter();

  const [assessorList, setAssessorList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [childList, setChildList] = useState([]);
  const [loadingAssessors, setLoadingAssessors] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(true);

  const openAssessor = useBoolean(true);
  const openTeacher = useBoolean(true);
  const openChild = useBoolean(true);
  const openAssessment = useBoolean(true);
  const openTotals = useBoolean(true);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(AssessmentSchema),
    defaultValues: {
      assessmentDate: null,
      assessorId: '',
      assessorName: '',
      assessorGender: '',
      assessorOccupation: '',
      supervisorName: '',
      teacherId: '',
      teacherName: '',
      teacherGender: '',
      teacherSupervisorName: '',
      childId: '',
      childName: '',
      childGender: '',
      grade: '',
      class: '',
      school: '',
      otherSchool: '',
      criterion1Rating: '',
      criterion2Rating: '',
      criterion3Rating: '',
      criterion4Rating: '',
      criterion5Rating: '',
      criterion6Rating: '',
      criterion7Rating: '',
      criterion8Rating: '',
      criterion9Rating: '',
      criterion10Rating: '',
      criterion11Rating: '',
      criterion12Rating: '',
      criterion13Rating: '',
      criterion14Rating: '',
      criterion15Rating: '',
      criterion16Rating: '',
      criterion17Rating: '',
      criterion18Rating: '',
      criterion19Rating: '',
      criterion20Rating: '',
      criterion21Rating: '',
      criterion22Rating: '',
      criterion23Rating: '',
      criterion24Rating: '',
      criterion25Rating: '',
      criterion26Rating: '',
      totalSightWords: 0,
      totalTicks: 0,
      assessmentScore: '',
    },
    values: currentAssessment,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const assessorId = watch('assessorId');
  const teacherId = watch('teacherId');
  const childId = watch('childId');
  const criteria = watch([
    'criterion1Rating',
    'criterion2Rating',
    'criterion3Rating',
    'criterion4Rating',
    'criterion5Rating',
    'criterion6Rating',
    'criterion7Rating',
    'criterion8Rating',
    'criterion9Rating',
    'criterion10Rating',
    'criterion11Rating',
    'criterion12Rating',
    'criterion13Rating',
    'criterion14Rating',
    'criterion15Rating',
    'criterion16Rating',
    'criterion17Rating',
    'criterion18Rating',
    'criterion19Rating',
    'criterion20Rating',
    'criterion21Rating',
    'criterion22Rating',
    'criterion23Rating',
    'criterion24Rating',
    'criterion25Rating',
    'criterion26Rating',
  ]);

  useEffect(() => {
    const fetchAssessors = async () => {
      try {
        setLoadingAssessors(true);
        const response = await axiosInstance.get('/users', {
          params: {
            fields: 'id,first_name,last_name',
            filter: { role: { _eq: ASSESSOR_ROLE_ID } },
          },
        });
        setAssessorList(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch assessors:', error);
        toast.error('Failed to load assessors list');
      } finally {
        setLoadingAssessors(false);
      }
    };

    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const response = await axiosInstance.get('/users', {
          params: {
            fields: 'id,first_name,last_name',
            filter: { role: { _eq: TEACHER_ROLE_ID } },
          },
        });
        setTeacherList(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        toast.error('Failed to load teachers list');
      } finally {
        setLoadingTeachers(false);
      }
    };

    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        const response = await axiosInstance.get(endpoints.children.list, {
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

    fetchAssessors();
    fetchTeachers();
    fetchChildren();
  }, []);

  useEffect(() => {
    if (assessorId && assessorList.length > 0) {
      const selectedAssessor = assessorList.find((assessor) => assessor.id === assessorId);
      if (selectedAssessor) {
        const fullName = `${selectedAssessor.first_name} ${selectedAssessor.last_name}`;
        setValue('assessorName', fullName, { shouldValidate: true });
      } else {
        setValue('assessorName', '', { shouldValidate: true });
      }
    }
  }, [assessorId, assessorList, setValue]);

  useEffect(() => {
    if (teacherId && teacherList.length > 0) {
      const selectedTeacher = teacherList.find((teacher) => teacher.id === teacherId);
      if (selectedTeacher) {
        const fullName = `${selectedTeacher.first_name} ${selectedTeacher.last_name}`;
        setValue('teacherName', fullName, { shouldValidate: true });
      } else {
        setValue('teacherName', '', { shouldValidate: true });
      }
    }
  }, [teacherId, teacherList, setValue]);

  useEffect(() => {
    if (childId && childList.length > 0) {
      const selectedChild = childList.find((child) => child.id === childId);
      if (selectedChild) {
        const fullName = `${selectedChild.first_name} ${selectedChild.last_name}`;
        setValue('childName', fullName, { shouldValidate: true });
      } else {
        setValue('childName', '', { shouldValidate: true });
      }
    }
  }, [childId, childList, setValue]);

  // Real-time calculation of totalTicks and assessmentScore
  useEffect(() => {
    const totalTicks = criteria.filter((rating) => rating === '✔️').length;
    setValue('totalTicks', totalTicks, { shouldValidate: true });

    let assessmentScore = '';
    if (totalTicks >= 0 && totalTicks <= 5) {
      assessmentScore = 'NOT YET WORKING; REVIEW AGAINST STANDARD 5';
    } else if (totalTicks >= 6 && totalTicks <= 12) {
      assessmentScore = 'DEVELOPING (OXFORD LEVEL 16)';
    } else if (totalTicks >= 13 && totalTicks <= 21) {
      assessmentScore = 'SECURE (OXFORD LEVEL 17)';
    } else if (totalTicks === 22) {
      assessmentScore = 'ADVANCED (OXFORD LEVEL 18)';
    } else if (totalTicks >= 23 && totalTicks <= 26) {
      assessmentScore = 'ASSESSMENT POINT: ASSESS AGAINST STANDARD 7';
    }
    setValue('assessmentScore', assessmentScore, { shouldValidate: true });
  }, [criteria, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Recalculate for submission to ensure accuracy
      const criteriaValues = [
        data.criterion1Rating,
        data.criterion2Rating,
        data.criterion3Rating,
        data.criterion4Rating,
        data.criterion5Rating,
        data.criterion6Rating,
        data.criterion7Rating,
        data.criterion8Rating,
        data.criterion9Rating,
        data.criterion10Rating,
        data.criterion11Rating,
        data.criterion12Rating,
        data.criterion13Rating,
        data.criterion14Rating,
        data.criterion15Rating,
        data.criterion16Rating,
        data.criterion17Rating,
        data.criterion18Rating,
        data.criterion19Rating,
        data.criterion20Rating,
        data.criterion21Rating,
        data.criterion22Rating,
        data.criterion23Rating,
        data.criterion24Rating,
        data.criterion25Rating,
        data.criterion26Rating,
      ];
      const totalTicks = criteriaValues.filter((rating) => rating === '✔️').length;
      data.totalTicks = totalTicks;

      let assessmentScore = '';
      if (totalTicks >= 0 && totalTicks <= 5) {
        assessmentScore = 'NOT YET WORKING; REVIEW AGAINST STANDARD 5';
      } else if (totalTicks >= 6 && totalTicks <= 12) {
        assessmentScore = 'DEVELOPING (OXFORD LEVEL 16)';
      } else if (totalTicks >= 13 && totalTicks <= 21) {
        assessmentScore = 'SECURE (OXFORD LEVEL 17)';
      } else if (totalTicks === 22) {
        assessmentScore = 'ADVANCED (OXFORD LEVEL 18)';
      } else if (totalTicks >= 23 && totalTicks <= 26) {
        assessmentScore = 'ASSESSMENT POINT: ASSESS AGAINST STANDARD 7';
      }
      data.assessmentScore = assessmentScore;

      const assessmentData = {
        assessment_date: data.assessmentDate,
        assessor_id: data.assessorId,
        assessor_name: data.assessorName,
        assessor_gender: data.assessorGender,
        assessor_occupation: data.assessorOccupation,
        supervisor_name: data.supervisorName,
        teacher_id: data.teacherId,
        teacher_name: data.teacherName,
        teacher_gender: data.teacherGender,
        teacher_supervisor_name: data.teacherSupervisorName,
        child_id: data.childId,
        child_name: data.childName,
        child_gender: data.childGender,
        grade: data.grade,
        class: data.class,
        school: data.school === 'Other' ? data.otherSchool : data.school,
        criterion_1_rating: data.criterion1Rating,
        criterion_2_rating: data.criterion2Rating,
        criterion_3_rating: data.criterion3Rating,
        criterion_4_rating: data.criterion4Rating,
        criterion_5_rating: data.criterion5Rating,
        criterion_6_rating: data.criterion6Rating,
        criterion_7_rating: data.criterion7Rating,
        criterion_8_rating: data.criterion8Rating,
        criterion_9_rating: data.criterion9Rating,
        criterion_10_rating: data.criterion10Rating,
        criterion_11_rating: data.criterion11Rating,
        criterion_12_rating: data.criterion12Rating,
        criterion_13_rating: data.criterion13Rating,
        criterion_14_rating: data.criterion14Rating,
        criterion_15_rating: data.criterion15Rating,
        criterion_16_rating: data.criterion16Rating,
        criterion_17_rating: data.criterion17Rating,
        criterion_18_rating: data.criterion18Rating,
        criterion_19_rating: data.criterion19Rating,
        criterion_20_rating: data.criterion20Rating,
        criterion_21_rating: data.criterion21Rating,
        criterion_22_rating: data.criterion22Rating,
        criterion_23_rating: data.criterion23Rating,
        criterion_24_rating: data.criterion24Rating,
        criterion_25_rating: data.criterion25Rating,
        criterion_26_rating: data.criterion26Rating,
        total_sight_words: data.totalSightWords,
        total_ticks: data.totalTicks,
        assessment_score: data.assessmentScore,
      };

      if (currentAssessment && currentAssessment.id) {
        await axiosInstance.patch(
          `${endpoints.literacy.list}/${currentAssessment.id}`,
          assessmentData
        );
      } else {
        await axiosInstance.post(endpoints.literacy.create, assessmentData);
      }

      reset();
      toast.success(currentAssessment ? 'Assessment Updated!' : 'Assessment Created!');
      if (router && paths.dashboard && paths.dashboard.learners) {
        router.push(paths.dashboard.learners);
      } else {
        console.warn(
          'Navigation failed: router or paths.dashboard.literacy_assessments is undefined. Falling back to root.'
        );
        window.location.href = '/dashboard/learners';
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit assessment form');
    }
  });

  const renderCollapseButton = (value, onToggle) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  const renderAssessorDetails = () => (
    <Card>
      <CardHeader
        title="Assessor's Details"
        action={renderCollapseButton(openAssessor.value, openAssessor.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openAssessor.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Date of Assessment</Typography>
            <Field.DatePicker name="assessmentDate" required />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Assessor ID</Typography>
            <FormControl fullWidth required>
              <InputLabel>Assessor ID</InputLabel>
              <Controller
                name="assessorId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Assessor ID" disabled={loadingAssessors}>
                    {loadingAssessors ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : assessorList.length === 0 ? (
                      <MenuItem disabled>No assessors available</MenuItem>
                    ) : (
                      assessorList.map((assessor) => (
                        <MenuItem key={assessor.id} value={assessor.id}>
                          {`${assessor.id}: ${assessor.first_name} ${assessor.last_name}`}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Assessor Name</Typography>
            <Field.Text name="assessorName" placeholder="Select Assessor ID to autofill" disabled />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Gender</Typography>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Controller
                name="assessorGender"
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
                name="assessorOccupation"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Occupation">
                    {OCCUPATIONS.map((option) => (
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
            <Typography variant="subtitle2">Supervisor Name</Typography>
            <Field.Text name="supervisorName" placeholder="Enter Supervisor Name" required />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderTeacherDetails = () => (
    <Card>
      <CardHeader
        title="Class Teacher's Details"
        action={renderCollapseButton(openTeacher.value, openTeacher.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openTeacher.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Teacher ID</Typography>
            <FormControl fullWidth required>
              <InputLabel>Teacher ID</InputLabel>
              <Controller
                name="teacherId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Teacher ID" disabled={loadingTeachers}>
                    {loadingTeachers ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : teacherList.length === 0 ? (
                      <MenuItem disabled>No teachers available</MenuItem>
                    ) : (
                      teacherList.map((teacher) => (
                        <MenuItem key={teacher.id} value={teacher.id}>
                          {`${teacher.id}: ${teacher.first_name} ${teacher.last_name}`}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Teacher Name</Typography>
            <Field.Text name="teacherName" placeholder="Select Teacher ID to autofill" disabled />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Gender</Typography>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Controller
                name="teacherGender"
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
            <Typography variant="subtitle2">Supervisor Name</Typography>
            <Field.Text name="teacherSupervisorName" placeholder="Enter Supervisor Name" required />
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
                        <MenuItem key={child.id} value={child.id}>
                          {`${child.id}: ${child.first_name} ${child.last_name}`}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Child Name</Typography>
            <Field.Text name="childName" placeholder="Select Child ID to autofill" disabled />
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
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Controller
                name="class"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Class">
                    {CLASSES.map((option) => (
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
        </Stack>
      </Collapse>
    </Card>
  );

  const renderAssessmentDetails = () => (
    <Card>
      <CardHeader
        title="Assessment Details"
        action={renderCollapseButton(openAssessment.value, openAssessment.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openAssessment.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          {Array.from({ length: 26 }, (_, i) => i + 1).map((criterion) => (
            <Stack spacing={1.5} key={criterion}>
              <Typography variant="subtitle2">{`Criterion ${criterion} Rating`}</Typography>
              <FormControl fullWidth required>
                <InputLabel>{`Criterion ${criterion} Rating`}</InputLabel>
                <Controller
                  name={`criterion${criterion}Rating`}
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label={`Criterion ${criterion} Rating`}>
                      {CRITERION_RATINGS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Stack>
          ))}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Total Number of Sight Words Read</Typography>
            <Field.Text
              name="totalSightWords"
              type="number"
              placeholder="Enter Total Sight Words"
              required
            />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderTotals = () => (
    <Card>
      <CardHeader
        title="Totals"
        action={renderCollapseButton(openTotals.value, openTotals.onToggle)}
        sx={{ mb: 3 }}
      />
      <Collapse in={openTotals.value}>
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Total Ticks</Typography>
            <Field.Text name="totalTicks" type="number" placeholder="Total Ticks" disabled />
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Assessment Score</Typography>
            <Field.Text name="assessmentScore" placeholder="Assessment Score" disabled />
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
        {renderAssessorDetails()}
        {renderTeacherDetails()}
        {renderChildDetails()}
        {renderAssessmentDetails()}
        {renderTotals()}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting || loadingAssessors || loadingTeachers || loadingChildren}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : currentAssessment ? (
              'Save Changes'
            ) : (
              'Submit Assessment'
            )}
          </Button>
        </Box>
      </Stack>
    </Form>
  );
}
