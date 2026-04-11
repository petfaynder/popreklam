'use client';

import ThemeRouter from '@/components/ThemeRouter';
import BrutalistForgotPassword from '@/components/themes/brutalist/BrutalistForgotPassword';
import SaaSForgotPassword from '@/components/themes/saas/SaaSForgotPassword';
import EditorialForgotPassword from '@/components/themes/editorial/EditorialForgotPassword';
import LuminousForgotPassword from '@/components/themes/luminous/LuminousForgotPassword';
import AzureForgotPassword from '@/components/themes/azure/AzureForgotPassword';

export default function ForgotPasswordPage() {
    return (
        <ThemeRouter
            themes={{
                brutalist: <BrutalistForgotPassword />,
                saas: <SaaSForgotPassword />,
                editorial: <EditorialForgotPassword />,
                luminous: <LuminousForgotPassword />,
                azure: <AzureForgotPassword />,
            }}
        />
    );
}
