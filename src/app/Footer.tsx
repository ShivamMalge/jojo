export default function Footer() {
  return (
    <footer style={{
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      color: 'var(--text-muted, #66758f)',
      backgroundColor: 'var(--bg, #f1f4f8)',
      borderTop: '1px solid var(--border, #d9dee8)',
    }}>
      Developed with ❤️ by students at Atria IT |&nbsp;
      <a href="https://www.linkedin.com/in/dev0root/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #3159c9)', textDecoration: 'none', margin: '0 4px', fontWeight: '500' }}>Deva Kumar</a> &amp;&nbsp;
      <a href="https://www.linkedin.com/in/shivam-malge-12523a293/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #3159c9)', textDecoration: 'none', margin: '0 4px', fontWeight: '500' }}>Shivam Malge</a>
    </footer>
  );
}
