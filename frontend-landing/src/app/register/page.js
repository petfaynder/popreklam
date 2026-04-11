'use client';

import ThemeRouter from '@/components/ThemeRouter';
import BrutalistRegister from '@/components/themes/brutalist/BrutalistRegister';
import SaaSRegister from '@/components/themes/saas/SaaSRegister';
import EditorialRegister from '@/components/themes/editorial/EditorialRegister';
import LuminousRegister from '@/components/themes/luminous/LuminousRegister';
import AzureRegister from '@/components/themes/azure/AzureRegister';

export default function RegisterPage() {
    return (
        <ThemeRouter
            themes={{
                brutalist: <BrutalistRegister />,
                saas: <SaaSRegister />,
                editorial: <EditorialRegister />,
                luminous: <LuminousRegister />,
                azure: <AzureRegister />,
            }}
        />
    );
}
