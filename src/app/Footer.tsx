export default function Footer() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '8px 24px',
      backgroundColor: 'var(--accent, #3159c9)',
      borderRadius: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      color: '#ffffff',
      zIndex: 2147483647,
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      whiteSpace: 'nowrap'
    }}>
      Developed with ❤️ by students at Atria IT &nbsp;|&nbsp;&nbsp;
      <a href="https://www.linkedin.com/in/dev0root/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline', margin: '0 4px', fontWeight: 'bold' }}>Deva Kumar</a> &amp;&nbsp;
      <a href="https://www.linkedin.com/in/shivam-malge-12523a293/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline', margin: '0 4px', fontWeight: 'bold' }}>Shivam Malge</a>
    </div>
  );
}
