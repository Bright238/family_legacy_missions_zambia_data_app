import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// Utility function to capitalize the first letter of a string
const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '');

// ----------------------------------------------------------------------

export function OrderTableToolbar({ filters, onResetPage, onImport, tableData = [] }) {
  const fileInputRef = useRef(null);
  const exportMenuRef = useRef(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file);
      event.target.value = ''; // Reset file input
    }
  };

  const handlePrintClick = () => {
    console.log('Print button clicked - triggering window.print()');
    if (!Array.isArray(tableData) || tableData.length === 0) {
      alert(
        'No data available to print. Please ensure there are literacy assessments in the table.'
      );
      return;
    }
    window.print(); // Trigger browser print dialog
  };

  const handleExportClick = (event) => {
    setExportMenuOpen(true);
    exportMenuRef.current = event.currentTarget;
  };

  const handleExportClose = () => {
    setExportMenuOpen(false);
    exportMenuRef.current = null;
  };

  const handleExportCSV = () => {
    console.log('Export CSV button clicked');
    if (!Array.isArray(tableData) || tableData.length === 0) {
      alert(
        'No data available to export as CSV. Please ensure there are literacy assessments in the table.'
      );
      handleExportClose();
      return;
    }

    try {
      const csvData = tableData.map((row) => {
        const [firstName, ...lastNameParts] = (row.child_name || '').split(' ');
        const lastName = lastNameParts.join(' ');
        return {
          'First Name': firstName || '',
          'Last Name': lastName || '',
          'Assessment Date': row.assessment_date || '',
          'Assessment Score': row.assessment_score || '',
          'Assessor Name': row.assessor_name || '',
          Grade: row.grade || '',
          Class: row.class || '',
          School: row.school || '',
          Status: row.status ? capitalize(row.status) : '',
        };
      });
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'literacy_assessments.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export as CSV. Please try again.');
    }
    handleExportClose();
  };

  const handleExportPDF = () => {
    console.log('Export PDF button clicked');
    if (!Array.isArray(tableData) || tableData.length === 0) {
      alert(
        'No data available to export as PDF. Please ensure there are literacy assessments in the table.'
      );
      handleExportClose();
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Literacy Assessments Export', 20, 20);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          'First Name',
          'Last Name',
          'Assessment Date',
          'Assessment Score',
          'Assessor Name',
          'Grade',
          'Class',
          'School',
          'Status',
        ],
      ],
      body: tableData.map((row) => {
        const [firstName, ...lastNameParts] = (row.child_name || '').split(' ');
        const lastName = lastNameParts.join(' ');
        return [
          firstName || '',
          lastName || '',
          row.assessment_date || '',
          row.assessment_score || '',
          row.assessor_name || '',
          row.grade || '',
          row.class || '',
          row.school || '',
          row.status ? capitalize(row.status) : '',
        ];
      }),
    });

    doc.save('literacy_assessments_export.pdf');
    handleExportClose();
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .printable-table-container, .printable-table-container * { visibility: visible; }
            .printable-table-container { position: absolute; top: 0; left: 0; width: 100%; }
            .MuiTable-root { display: table !important; width: 100% !important; overflow: visible !important; }
            .MuiTableCell-root { overflow: visible !important; white-space: normal !important; }
            .MuiTableCell-root:first-child, .MuiTableCell-root:last-child { display: none; }
            .MuiTabs-root, .MuiBox-root:has(> .MuiTextField-root), .MuiTablePagination-root { display: none !important; }
            .MuiTableHead-root { background-color: #f5f5f5; }
            .MuiTableRow-root { page-break-inside: avoid; }
          }
        `}
      </style>
      <Box
        sx={{
          p: 2.5,
          gap: 2,
          display: 'flex',
          pr: { xs: 2.5, md: 1 },
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        <Box sx={{ width: 1, flexGrow: 1 }}>
          <TextField
            fullWidth
            value={currentFilters.name}
            onChange={handleFilterName}
            placeholder="Search a learner..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              mt: 2,
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
              onClick={handlePrintClick}
            >
              Print
            </Button>

            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:import-bold" />}
              onClick={handleImportClick}
            >
              Import
            </Button>

            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={handleExportClick}
            >
              Export
            </Button>
          </Box>
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Menu anchorEl={exportMenuRef.current} open={exportMenuOpen} onClose={handleExportClose}>
          <MenuItem onClick={handleExportCSV}>Export as CSV</MenuItem>
          <MenuItem onClick={handleExportPDF}>Export as PDF</MenuItem>
        </Menu>
      </Box>
    </>
  );
}
