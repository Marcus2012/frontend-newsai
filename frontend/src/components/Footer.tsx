import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} asi es el futbol. Todos los derechos reservados.</p>
      <style jsx>{`
        .site-footer {
          border-top: 1px solid rgba(0, 255, 200, 0.1);
          padding: 30px 40px;
          text-align: center;
          color: #888;
          font-size: 0.85em;
          margin-top: 40px;
          background: none;
        }
      `}</style>
    </footer>
  );
}
