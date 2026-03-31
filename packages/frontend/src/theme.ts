import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Pretendard, -apple-system, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: { defaultProps: { size: 'sm' } },
    TextInput: { defaultProps: { size: 'sm' } },
    Select: { defaultProps: { size: 'sm' } },
  },
});
