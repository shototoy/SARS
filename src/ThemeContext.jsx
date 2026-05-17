import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const colors = {
  bg: '#006750',
  shadow: '#007863',
  main: '#008B76',
  highlight: '#7AB4AD',
  white: '#ffffff',
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
};

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
