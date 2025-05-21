import React, { useState } from 'react';

const TestComponent: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modern color scheme
  const colors = {
    background: isDarkMode ? '#121212' : '#ffffff',
    surface: isDarkMode ? '#1e1e1e' : '#f8f9fa',
    primary: '#4f46e5', // Indigo
    secondary: '#ec4899', // Pink
    text: isDarkMode ? '#e5e7eb' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      transition: 'all 0.3s ease',
      padding: 0,
      margin: 0,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 2rem',
      borderBottom: `1px solid ${colors.border}`,
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 700,
      background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    themeToggle: {
      background: 'none',
      border: `1px solid ${colors.border}`,
      borderRadius: '9999px',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: colors.text,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 2rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 800,
      marginBottom: '1.5rem',
      background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: '0.75rem',
      boxShadow: isDarkMode 
        ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '2rem',
      marginBottom: '2rem',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      border: `1px solid ${colors.border}`,
      cursor: 'pointer',
    },
    hoverCard: {
      transform: 'translateY(-4px)',
      boxShadow: isDarkMode 
        ? '0 10px 15px rgba(0, 0, 0, 0.4)' 
        : '0 10px 15px rgba(0, 0, 0, 0.1)',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
      color: colors.text,
    },
    cardText: {
      color: colors.textSecondary,
      lineHeight: 1.6,
      marginBottom: '1.5rem',
    },
    button: {
      backgroundColor: colors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    buttonHover: {
      backgroundColor: isDarkMode ? '#4338ca' : '#4f46e5',
      transform: 'translateY(-1px)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem',
    },
  };

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState(false);

  const cards = [
    {
      title: 'Project Notes',
      text: 'Create and organize notes for all your projects in one place.',
      buttonText: 'Create Project',
    },
    {
      title: 'Image Support',
      text: 'Paste images directly into your notes for better visual documentation.',
      buttonText: 'Try It',
    },
    {
      title: 'Modern Interface',
      text: 'Enjoy a clean, modern interface designed for productivity.',
      buttonText: 'Explore',
    },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>NotePro</h1>
        <button 
          style={styles.themeToggle}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </header>

      <main style={styles.content}>
        <h2 style={styles.title}>Welcome to NotePro</h2>
        
        <p style={{ ...styles.cardText, fontSize: '1.125rem', marginBottom: '2rem' }}>
          Your modern solution for project notes and documentation. Organize your thoughts, paste images,
          and boost your productivity with our intuitive interface.
        </p>

        <div style={styles.grid}>
          {cards.map((card, index) => (
            <div 
              key={index}
              style={{
                ...styles.card,
                ...(hoveredCard === index ? styles.hoverCard : {})
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardText}>{card.text}</p>
              <button 
                style={{
                  ...styles.button,
                  ...(hoveredButton && hoveredCard === index ? styles.buttonHover : {})
                }}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                onClick={() => alert(`${card.buttonText} clicked!`)}
              >
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TestComponent; 