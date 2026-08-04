'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PrintProtection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin') || (typeof window !== 'undefined' && localStorage.getItem('py_admin_authorized') === 'true')) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (isAdmin) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        alert('🔒 Printing & Saving is restricted to Platform Administration (peopleandyouth.org).');
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert('🔒 Content copying is disabled to protect intellectual property.');
      return false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, [isAdmin]);

  return (
    <div className={!isAdmin ? 'select-none' : ''}>
      <style jsx global>{`
        @media print {
          ${!isAdmin ? `
            body * {
              display: none !important;
            }
            html::after {
              content: "🔒 UNAUTHORIZED PRINT ATTEMPT\\A\\A Official publications and user records on peopleandyouth.org are protected under institutional copyright.\\A Printing and PDF export rights rest exclusively with Platform Administration.";
              white-space: pre-wrap;
              display: block !important;
              text-align: center;
              font-family: Georgia, serif;
              font-size: 16pt;
              font-weight: bold;
              color: #0B192C;
              padding: 50mm 20mm;
              border: 4px solid #C59B27;
              margin: 20mm auto;
            }
          ` : `
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          `}
        }
      `}</style>
      {children}
    </div>
  );
}