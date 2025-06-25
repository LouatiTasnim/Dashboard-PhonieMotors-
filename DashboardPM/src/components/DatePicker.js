import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import dayjs from 'dayjs';
import 'dayjs/locale/fr'; // Import de la langue française

dayjs.locale('fr'); // Appliquer le français globalement

const ResponsiveDateRangePickers = ({ onChange }) => {
  const [value, setValue] = React.useState([null, null]);

  const handleChange = (newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <DateRangePicker
        startText="Début"
        endText="Fin"
        value={value}
        onChange={handleChange}
        renderInput={(startProps, endProps) => (
          <>
            <TextField {...startProps} />
            <Box sx={{ mx: 2 }}>à</Box>
            <TextField {...endProps} />
          </>
        )}
      />
    </LocalizationProvider>
  );
};

export default ResponsiveDateRangePickers;
