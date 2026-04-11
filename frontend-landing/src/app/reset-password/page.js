'use client';

import ThemeRouter from '@/components/ThemeRouter';
import BrutalistResetPassword from '@/components/themes/brutalist/BrutalistResetPassword';
import SaaSResetPassword from '@/components/themes/saas/SaaSResetPassword';
import EditorialResetPassword from '@/components/themes/editorial/EditorialResetPassword';
import LuminousResetPassword from '@/components/themes/luminous/LuminousResetPassword';
import AzureResetPassword from '@/components/themes/azure/AzureResetPassword';

export default function ResetPasswordPage() {
    return (
        <ThemeRouter
            themes={{
                brutalist: <BrutalistResetPassword />,
                saas: <SaaSResetPassword />,
                editorial: <EditorialResetPassword />,
                luminous: <LuminousResetPassword />,
                azure: <AzureResetPassword />,
            }}
        />
    );
}
