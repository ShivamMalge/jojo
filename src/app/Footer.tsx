export default function Footer() {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '32px',
      backgroundColor: 'var(--bg, #f1f4f8)',
      borderTop: '1px solid var(--border, #d9dee8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      color: 'var(--text-muted, #66758f)',
      zIndex: 2147483647
    }}>
      Developed with ❤️ by students at Atria IT |&nbsp;
      <a href="https://www.linkedin.com/in/dev0root/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #3159c9)', textDecoration: 'none', margin: '0 4px', fontWeight: 'bold' }}>Deva Kumar</a> &amp;&nbsp;
      <a href="https://www.linkedin.com/in/shivam-malge-12523a293/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #3159c9)', textDecoration: 'none', margin: '0 4px', fontWeight: 'bold' }}>Shivam Malge</a>
    </footer>
  );
}
