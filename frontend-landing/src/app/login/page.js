'use client';

import ThemeRouter from '@/components/ThemeRouter';
import BrutalistLogin from '@/components/themes/brutalist/BrutalistLogin';
import SaaSLogin from '@/components/themes/saas/SaaSLogin';
import EditorialLogin from '@/components/themes/editorial/EditorialLogin';
import LuminousLogin from '@/components/themes/luminous/LuminousLogin';
import AzureLogin from '@/components/themes/azure/AzureLogin';

export default function LoginPage() {
    return (
        <ThemeRouter
            themes={{
                brutalist: <BrutalistLogin />,
                saas: <SaaSLogin />,
                editorial: <EditorialLogin />,
                luminous: <LuminousLogin />,
                azure: <AzureLogin />,
            }}
        />
    );
}
