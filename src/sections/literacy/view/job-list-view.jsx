'use client';

import Papa from 'papaparse';
import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { OrderTableRow } from '../order-table-row';
import { JobFiltersResult } from '../job-filters-result';
import { OrderTableToolbar } from '../order-table-toolbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const TABLE_HEAD = [
  { id: 'first_name', label: 'First Name' },
  { id: 'last_name', label: 'Last Name' },
  { id: 'assessment_date', label: 'Assessment Date', width: 120 },
  { id: 'assessment_score', label: 'Assessment Score', width: 150 },
  { id: 'assessor_name', label: 'Assessor Name', width: 150 },
  { id: 'grade', label: 'Grade', width: 80 },
  { id: 'class', label: 'Class', width: 80 },
  { id: 'school', label: 'School', width: 150 },
  { id: 'status', label: 'Status', width: 110 },
  { id: '', width: 88 },
];

// Column mapping function
const mapColumnToField = (csvHeader) => {
  const normalizedHeader = csvHeader
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_');

  const fieldVariations = {
    first_name: ['first_name', 'firstname', 'first name', 'given name', 'given_name', 'child_name'],
    last_name: ['last_name', 'lastname', 'last name', 'surname', 'family name', 'family_name'],
    assessment_date: ['assessment_date', 'date', 'assess_date'],
    assessment_score: ['assessment_score', 'score', 'assess_score'],
    assessor_name: ['assessor_name', 'assessor', 'teacher_name'],
    grade: ['grade', 'level', 'year', 'class_level'],
    class: ['class', 'section', 'group', 'classroom'],
    school: ['school', 'school_name', 'institution'],
    status: ['status', 'risk', 'category', 'state'],
  };

  for (const [field, variations] of Object.entries(fieldVariations)) {
    if (variations.includes(normalizedHeader)) {
      return field;
    }
  }

  return null;
};

// ----------------------------------------------------------------------

export function JobListView() {
  const table = useTable({ defaultOrderBy: 'first_name' });

  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);

  const filters = useSetState({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const fetchLiteracy = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetcher(endpoints.literacy.list);
      console.log('Fetched literacy (Raw Response):', response);
      const formattedData = response.data.map((item) => {
        const [firstName, ...lastNameParts] = (item.child_name || '').split(' ');
        return {
          ...item,
          first_name: firstName || '',
          last_name: lastNameParts.join(' ') || '',
        };
      });
      setTableData(formattedData || []);
    } catch (error) {
      toast.error('Failed to fetch literacy assessments');
      console.error('Error fetching literacy:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiteracy();
  }, [fetchLiteracy]);

  const handleImport = useCallback(
    (file) => {
      setImportLoading(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          console.log('Imported CSV Data (Raw):', result.data);

          const csvHeaders = result.meta.fields || [];
          console.log('Detected CSV Headers (Raw):', csvHeaders);

          if (!csvHeaders.length) {
            console.error('No headers detected in CSV. Please ensure the CSV has headers.');
            toast.error('Invalid CSV format: No headers detected.');
            setImportLoading(false);
            return;
          }

          const headerMapping = {};
          const normalizedHeaders = csvHeaders.map((header) =>
            header
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9\s_]/g, '')
              .replace(/\s+/g, '_')
          );
          console.log('Normalized Headers:', normalizedHeaders);

          csvHeaders.forEach((header, index) => {
            const mappedField = mapColumnToField(header);
            if (mappedField) {
              headerMapping[header] = mappedField;
            } else {
              console.warn(
                `Header "${header}" (normalized: "${normalizedHeaders[index]}") could not be mapped to any field.`
              );
            }
          });
          console.log('Header Mapping:', headerMapping);

          const hasFirstName = Object.values(headerMapping).includes('first_name');
          const hasLastName = Object.values(headerMapping).includes('last_name');
          const hasAssessmentDate = Object.values(headerMapping).includes('assessment_date');
          const hasAssessmentScore = Object.values(headerMapping).includes('assessment_score');
          const hasAssessorName = Object.values(headerMapping).includes('assessor_name');
          const hasClass = Object.values(headerMapping).includes('class');
          if (
            !hasFirstName ||
            !hasLastName ||
            !hasAssessmentDate ||
            !hasAssessmentScore ||
            !hasAssessorName ||
            !hasClass
          ) {
            console.error(
              'Required fields missing in mapping: first_name, last_name, assessment_date, assessment_score, assessor_name, class'
            );
            toast.error(
              'CSV must include First Name, Last Name, Assessment Date, Assessment Score, Assessor Name, and Class columns.'
            );
            setImportLoading(false);
            return;
          }

          if (!result.data.length) {
            console.error('No data rows found in CSV.');
            toast.error('No data to import: CSV is empty.');
            setImportLoading(false);
            return;
          }

          const mappedData = result.data.map((row, index) => {
            const mappedRow = {};

            TABLE_HEAD.forEach((head) => {
              if (head.id) {
                mappedRow[head.id] = '';
              }
            });

            Object.keys(row).forEach((csvHeader) => {
              const field = headerMapping[csvHeader];
              if (field) {
                mappedRow[field] = row[csvHeader] || '';
              }
            });

            if (mappedRow.first_name && !hasLastName) {
              const nameParts = mappedRow.first_name.trim().split(/\s+/);
              if (nameParts.length > 1) {
                mappedRow.first_name = nameParts[0];
                mappedRow.last_name = nameParts.slice(1).join(' ');
              } else {
                mappedRow.last_name = '';
              }
            }

            console.log(`Row ${index + 1} After Mapping:`, mappedRow);
            return mappedRow;
          });

          console.log('Mapped Data for Import:', mappedData);

          const validData = mappedData.filter((item) => {
            if (
              !item.first_name ||
              !item.last_name ||
              !item.assessment_date ||
              !item.assessment_score ||
              !item.assessor_name ||
              !item.class
            ) {
              console.warn('Skipping row due to missing required fields:', item);
              return false;
            }
            if (
              item.status &&
              !['published', 'draft', 'archived'].includes(item.status.toLowerCase())
            ) {
              console.warn('Invalid status, setting to default "draft":', item.status);
              item.status = 'draft';
            } else if (!item.status) {
              item.status = 'draft';
            }
            return true;
          });

          if (validData.length === 0) {
            console.error('No valid data after validation. All rows were skipped.');
            toast.error('No valid data to import. Ensure required fields are provided.');
            setImportLoading(false);
            return;
          }

          try {
            const importPromises = validData.map((item) =>
              axiosInstance.post(endpoints.literacy.create, item)
            );
            const responses = await Promise.all(importPromises);
            console.log('Import API Responses:', responses);

            toast.success(`Successfully imported ${validData.length} literacy assessments`);
            await fetchLiteracy();
          } catch (error) {
            console.error('Failed to import data:', error);
            toast.error('Failed to import data');
          } finally {
            setImportLoading(false);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast.error('Failed to parse CSV file');
          setImportLoading(false);
        },
      });
    },
    [fetchLiteracy]
  );

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await axiosInstance.delete(`${endpoints.literacy.list}/${id}`);
        await fetchLiteracy(); // Refetch data to sync with API
        toast.success('Delete success!');
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        toast.error('Failed to delete');
        console.error('Error deleting literacy assessment:', error);
      }
    },
    [dataInPage.length, table, fetchLiteracy]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map((id) => axiosInstance.delete(`${endpoints.literacy.list}/${id}`))
      );
      await fetchLiteracy(); // Refetch data to sync with API
      toast.success('Delete success!');
      table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
    } catch (error) {
      toast.error('Failed to delete');
      console.error('Error deleting literacy assessments:', error);
    }
  }, [dataFiltered.length, dataInPage.length, table, fetchLiteracy]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Literacy Assessments"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Create New Literacy Assessment', href: paths.dashboard.literacy.root },
            { name: 'Literacy Assessments' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          {importLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={(theme) => ({
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            })}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === currentFilters.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'published' && 'success') ||
                      (tab.value === 'draft' && 'warning') ||
                      (tab.value === 'archived' && 'error') ||
                      'default'
                    }
                  >
                    {['published', 'draft', 'archived'].includes(tab.value)
                      ? tableData.filter((user) => user.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            dateError={dateError}
            onImport={handleImport}
            tableData={tableData}
          />

          {canReset && (
            <JobFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : (
                    dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <OrderTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          detailsHref={paths.dashboard.literacy.details(row.id)}
                        />
                      ))
                  )}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el, index) => el[0]);

  if (name) {
    filteredData = filteredData.filter((item) =>
      `${item.first_name} ${item.last_name}`.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((item) => item.status === status);
  }

  if (!dateError && startDate && endDate) {
    filteredData = filteredData.filter((item) =>
      fIsBetween(new Date(item.date_created), startDate, endDate)
    );
  }

  return filteredData;
}
