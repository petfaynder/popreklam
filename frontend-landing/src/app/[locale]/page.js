'use client';

import ThemeRouter from '@/components/ThemeRouter';
import BrutalistLayout from '@/components/themes/brutalist/BrutalistLayout';
import SaaSLayout from '@/components/themes/saas/SaaSLayout';
import EditorialLayout from '@/components/themes/editorial/EditorialLayout';
import LuminousLayout from '@/components/themes/luminous/LuminousLayout';
import AzureLayout from '@/components/themes/azure/AzureLayout';

export default function HomePage() {
  return (
    <ThemeRouter
      themes={{
        brutalist: <BrutalistLayout />,
        saas: <SaaSLayout />,
        editorial: <EditorialLayout />,
        luminous: <LuminousLayout />,
        azure: <AzureLayout />,
      }}
    />
  );
}
