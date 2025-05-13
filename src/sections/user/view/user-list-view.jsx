'use client';

import { useBoolean } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar'; // Added import
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow'; // Added import
import Checkbox from '@mui/material/Checkbox'; // Added import
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell'; // Added import
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography'; // Added import

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

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
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

// UserTableRow component with proper imports
function UserTableRow({ row, selected, onSelectRow, onDeleteRow, editHref }) {
  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={(event) => onSelectRow(event.target.checked)} />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={row.firstName} />
          <Typography variant="subtitle2" sx={{ ml: 1 }}>
            {row.firstName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{row.lastName}</TableCell>
      <TableCell>{row.title}</TableCell>
      <TableCell>{row.location}</TableCell>
      <TableCell>{row.description}</TableCell>
      {/* <TableCell align="right">
        <IconButton color="inherit" href={editHref} component={RouterLink}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
        <IconButton color="inherit" onClick={() => onDeleteRow(row.id)}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </TableCell> */}
    </TableRow>
  );
}

// Table headers matching the requested fields
const TABLE_HEAD = [
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'title', label: 'Title' },
  { id: 'location', label: 'Location' },
  { id: 'description', label: 'Description' },
  { id: '', width: 88 }, // Keep the empty column for actions
];

// Apply sorting to table data
function applySort({ inputData, comparator }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

export function UserListView() {
  const table = useTable();
  const confirmDialog = useBoolean();
  const [tableData, setTableData] = useState([]);

  // Fetch only the requested fields from Directus
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(endpoints.auth.signUp, {
          params: {
            fields: 'id,first_name,last_name,title,location,description', // Fetch only requested fields
          },
        });
        console.log('API Response:', response.data); // Log the response for debugging
        const users = response.data.data.map((user) => ({
          id: user.id,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          title: user.title || '',
          location: user.location || '',
          description: user.description || '',
        }));
        console.log('Mapped Users:', users); // Log the mapped data
        setTableData(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error(
          error.message || 'Failed to load users. Please check your connection or permissions.'
        );
      }
    };
    fetchUsers();
  }, []);

  const dataSorted = applySort({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const dataInPage = rowInPage(dataSorted, table.page, table.rowsPerPage);

  const notFound = !dataSorted.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await axiosInstance.delete(`${endpoints.auth.signUp}/${id}`);
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);
        toast.success('Delete success!');
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user');
      }
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map((id) => axiosInstance.delete(`${endpoints.auth.signUp}/${id}`))
      );
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
      setTableData(deleteRows);
      toast.success('Delete success!');
      table.onUpdatePageDeleteRows(dataInPage.length, dataSorted.length);
    } catch (error) {
      console.error('Failed to delete users:', error);
      toast.error('Failed to delete users');
    }
  }, [dataSorted.length, dataInPage.length, table, tableData]);

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure you want to delete <strong>{table.selected.length}</strong> items?
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
    <DashboardContent>
      <CustomBreadcrumbs
        heading="User List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.user.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New user
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ position: 'relative' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={dataSorted.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                dataSorted.map((row) => row.id)
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

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={dataSorted.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataSorted.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {dataSorted
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      editHref={paths.dashboard.user.edit(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={table.dense ? 56 : 76}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataSorted.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={dataSorted.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {renderConfirmDialog()}
    </DashboardContent>
  );
}
