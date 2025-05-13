'use client';

import { useBoolean } from 'minimal-shared/hooks';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';

import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export function OrderTableRow({ row, selected, onSelectRow, onDeleteRow, detailsHref }) {
  const confirmDialog = useBoolean();

  const renderPrimaryRow = () => (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          slotProps={{
            input: {
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            },
          }}
        />
      </TableCell>

      <TableCell>{row.first_name}</TableCell>
      <TableCell>{row.last_name}</TableCell>
      <TableCell>{fDateTime(row.assessment_date)}</TableCell>
      <TableCell>{row.assessment_score}</TableCell>
      <TableCell>{row.assessor_name}</TableCell>
      <TableCell>{row.grade}</TableCell>
      <TableCell>{row.class}</TableCell>
      <TableCell>{row.school}</TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status === 'published' && 'success') ||
            (row.status === 'draft' && 'warning') ||
            (row.status === 'archived' && 'error') ||
            'default'
          }
        >
          {row.status}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          component={RouterLink}
          href={detailsHref}
          sx={{ mr: 1 }}
        >
          View
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={confirmDialog.onTrue}
          sx={{ mr: 1 }}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete this literacy assessment?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      {renderPrimaryRow()}
      {renderConfirmDialog()}
    </>
  );
}
