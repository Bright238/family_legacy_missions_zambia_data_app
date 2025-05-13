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
import CircularProgress from '@mui/material/CircularProgress'; // Added for loading spinner

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
import { OrderTableToolbar } from '../order-table-toolbar';
import { OrderTableFiltersResult } from '../order-table-filters-result';

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
  { id: 'status', label: 'Status', width: 110 },
  { id: 'age', label: 'Age', width: 80 },
  { id: 'gender', label: 'Gender', width: 100 },
  { id: 'school_category', label: 'School Category' },
  { id: 'school_term', label: 'School Term' },
  { id: 'grade', label: 'Grade', width: 100 },
  { id: 'class', label: 'Class', width: 100 },
  { id: 'school', label: 'School' },
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
    first_name: [
      'first_name',
      'firstname',
      'first name',
      'given name',
      'given_name',
      'first',
      'name',
      'f_name',
      'fname',
      'field officer',
      'field_officer',
      'field officers',
      'field_officers',
      'field officers o',
      'field_officers_o',
      'field officers only',
      'field_officers_only',
      'field officers org',
      'field_officers_org',
      'officer',
      'officers',
      'fieldofficer',
      'fieldofficers',
      'field',
      'officer name',
      'officer_name',
    ],
    last_name: [
      'last_name',
      'lastname',
      'last name',
      'surname',
      'family name',
      'family_name',
      'last',
      'l_name',
      'lname',
    ],
    status: ['status', 'risk', 'category', 'state', 'risk_level'],
    age: ['age', 'years', 'yrs', 'age_years'],
    gender: ['gender', 'sex', 'male_female'],
    school_category: [
      'school_category',
      'schoolcategory',
      'school category',
      'school type',
      'schooltype',
      'category',
      'school_cat',
      'school cat',
      'school type category',
      'type',
      'schooltypecategory',
    ],
    school_term: [
      'school_term',
      'schoolterm',
      'school term',
      'term',
      'semester',
      'schooltermcategory',
    ],
    grade: ['grade', 'level', 'year', 'class_level', 'class level', 'grade level', 'gradelevel'],
    class: [
      'class',
      'section',
      'group',
      'classroom',
      'class room',
      'class_room',
      'class name',
      'classname',
    ],
    school: [
      'school',
      'school name',
      'schoolname',
      'institution',
      'school_name',
      'school name category',
    ],
  };

  for (const [field, variations] of Object.entries(fieldVariations)) {
    if (variations.includes(normalizedHeader)) {
      return field;
    }
  }

  return null;
};

// ----------------------------------------------------------------------

export function OrderListView() {
  const table = useTable({ defaultOrderBy: 'first_name' });

  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false); // Added for import loading state

  const filters = useSetState({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetcher(endpoints.children.list);
      console.log('Fetched Children (Raw Response):', response);
      setTableData(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleImport = useCallback(
    (file) => {
      setImportLoading(true); // Start loading
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
          const hasSchoolCategory = Object.values(headerMapping).includes('school_category');
          const hasClass = Object.values(headerMapping).includes('class');
          if (!hasFirstName) {
            console.error('Required field "first_name" missing in mapping.');
            toast.error('CSV must include a First Name column.');
            setImportLoading(false);
            return;
          }

          if (!result.data.length) {
            console.error('No data rows found in CSV.');
            toast.error('No data to import: CSV is empty.');
            setImportLoading(false);
            return;
          }

          console.log('School Category Header Detected:', hasSchoolCategory);
          console.log('Class Header Detected:', hasClass);

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

            if (mappedRow.age) {
              mappedRow.age = parseInt(mappedRow.age, 10) || null;
            }

            console.log(`Row ${index + 1} - School Category:`, mappedRow.school_category);
            console.log(`Row ${index + 1} - Class:`, mappedRow.class);
            console.log(`Row ${index + 1} After Mapping:`, mappedRow);
            return mappedRow;
          });

          console.log('Mapped Data for Import:', mappedData);

          const validData = mappedData.filter((item) => {
            if (!item.first_name || !item.last_name) {
              console.warn('Skipping row due to missing required fields:', item);
              return false;
            }
            if (
              item.status &&
              !['published', 'draft', 'archived'].includes(item.status.toLowerCase())
            ) {
              console.warn('Invalid status, setting to default "published":', item.status);
              item.status = 'published';
            } else if (!item.status) {
              item.status = 'published';
            }
            return true;
          });

          if (validData.length === 0) {
            console.error('No valid data after validation. All rows were skipped.');
            toast.error('No valid data to import. Ensure First Name and Last Name are provided.');
            setImportLoading(false);
            return;
          }

          try {
            const importPromises = validData.map((item) =>
              axiosInstance.post(endpoints.children.create, item)
            );
            const responses = await Promise.all(importPromises);
            console.log('Import API Responses:', responses);

            toast.success(`Successfully imported ${validData.length} children`);
            await fetchChildren();
          } catch (error) {
            console.error('Failed to import data:', error);
            toast.error('Failed to import data');
          } finally {
            setImportLoading(false); // Stop loading
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast.error('Failed to parse CSV file');
          setImportLoading(false);
        },
      });
    },
    [fetchChildren]
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
        await axiosInstance.delete(`${endpoints.children.list}/${id}`);
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);
        toast.success('Delete success!');
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        toast.error('Failed to delete');
        console.error('Error deleting child:', error);
      }
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map((id) => axiosInstance.delete(`${endpoints.children.list}/${id}`))
      );
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
      setTableData(deleteRows);
      toast.success('Delete success!');
      table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
    } catch (error) {
      toast.error('Failed to delete');
      console.error('Error deleting children:', error);
    }
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

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
          heading="Learners Visitations"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Create New Visit', href: paths.dashboard.visit.root },
            { name: 'Learners Visitations' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          {/* Show loading spinner during import */}
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
            <OrderTableFiltersResult
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
                          detailsHref={paths.dashboard.user.account}
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
