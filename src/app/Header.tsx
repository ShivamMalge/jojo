import atriaLogo from '../assets/logos/atria.webp';
import iseLogo from '../assets/logos/ise.jpg';

export default function Header() {
  return (
    <header className="global-header">
      <div className="logos">
        <img src={atriaLogo} alt="ATRIA Logo" className="logo" />
        <img src={iseLogo} alt="ISE Logo" className="logo" />
      </div>
      <span className="header-title">Jojo</span>
    </header>
  );
}
