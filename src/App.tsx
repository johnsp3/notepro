import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import { SearchProvider } from './context/SearchContext';
import { ChatGPTProvider } from './context/ChatGPTContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <AppProvider>
          <SearchProvider>
            <ChatGPTProvider>
              <Layout />
            </ChatGPTProvider>
          </SearchProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
