import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Hash password
    const hashedPassword = await bcrypt.hash('Ta170104894*', 10);

    // Create Publisher user
    const publisher = await prisma.user.upsert({
        where: { email: 'akartolga0@gmail.com' },
        update: {
            passwordHash: hashedPassword,
            status: 'ACTIVE'
        },
        create: {
            email: 'akartolga0@gmail.com',
            passwordHash: hashedPassword,
            role: 'PUBLISHER',
            status: 'ACTIVE',
            publisher: {
                create: {
                    companyName: 'My Publishing Company'
                }
            }
        }
    });

    console.log('✅ Publisher user created:', publisher.email);

    // Create second user with ADVERTISER role (same email but different role is not allowed)
    // So we need to check if we want same email for both or different
    // Based on user request, seems like they want same credentials for both dashboards
    // But a user can only have one role in current schema
    // Let me create a second user with slightly different email for advertiser

    // For advertiser, we'll create a separate account
    const advertiserUser = await prisma.user.upsert({
        where: { email: 'advertiser@mrpop.io' },
        update: {
            passwordHash: hashedPassword,
            status: 'ACTIVE'
        },
        create: {
            email: 'advertiser@mrpop.io',
            passwordHash: hashedPassword,
            role: 'ADVERTISER',
            status: 'ACTIVE',
            advertiser: {
                create: {
                    companyName: 'My Advertising Company'
                }
            }
        }
    });

    console.log('✅ Advertiser user created:', advertiserUser.email);

    // Create Admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@mrpop.io' },
        update: {
            passwordHash: hashedPassword,
            status: 'ACTIVE'
        },
        create: {
            email: 'admin@mrpop.io',
            passwordHash: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE'
        }
    });

    console.log('✅ Admin user created:', adminUser.email);

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  🎉 Seed Complete!                        ║
╠═══════════════════════════════════════════════════════════╣
║  Publisher Account:                                       ║
║  📧 Email: akartolga0@gmail.com                          ║
║  🔑 Password: Ta170104894*                               ║
║  👤 Role: PUBLISHER                                       ║
║  🔗 Login: http://localhost:3000/publisher-login         ║
║                                                           ║
║  Advertiser Account:                                      ║
║  📧 Email: advertiser@mrpop.io                      ║
║  🔑 Password: Ta170104894*                               ║
║  👤 Role: ADVERTISER                                      ║
║  🔗 Login: http://localhost:3000/advertiser-login        ║
║                                                           ║
║  Admin Account:                                           ║
║  📧 Email: admin@mrpop.io                           ║
║  🔑 Password: Ta170104894*                               ║
║  👤 Role: ADMIN                                           ║
║  🔗 Login: http://localhost:3000/admin-login             ║
╚═══════════════════════════════════════════════════════════╝
    `);

    // ── SEED PRIORITY SYSTEM SETTINGS ──
    console.log('👑 Seeding Priority System Settings...');
    const prioritySettings = [
        // ── Spend thresholds ──
        { key: 'priority_starter_max_spend', value: '500', type: 'number', group: 'priority', label: 'Starter Tier Max Spend ($)' },
        { key: 'priority_pro_max_spend', value: '2000', type: 'number', group: 'priority', label: 'Pro Tier Max Spend ($)' },
        { key: 'priority_elite_max_spend', value: '10000', type: 'number', group: 'priority', label: 'Elite Tier Max Spend ($)' },
        // ── Daily campaign limits ──
        { key: 'priority_starter_daily_campaigns', value: '3', type: 'number', group: 'priority', label: 'Starter Daily Campaign Limit' },
        { key: 'priority_pro_daily_campaigns', value: '10', type: 'number', group: 'priority', label: 'Pro Daily Campaign Limit' },
        { key: 'priority_elite_daily_campaigns', value: '30', type: 'number', group: 'priority', label: 'Elite Daily Campaign Limit' },
        { key: 'priority_vip_daily_campaigns', value: '100', type: 'number', group: 'priority', label: 'VIP Daily Campaign Limit' },
        // ── Delivery weights ──
        { key: 'priority_starter_weight', value: '1.0', type: 'number', group: 'priority', label: 'Starter Delivery Weight' },
        { key: 'priority_pro_weight', value: '1.3', type: 'number', group: 'priority', label: 'Pro Delivery Weight' },
        { key: 'priority_elite_weight', value: '1.6', type: 'number', group: 'priority', label: 'Elite Delivery Weight' },
        { key: 'priority_vip_weight', value: '2.0', type: 'number', group: 'priority', label: 'VIP Delivery Weight' },
        // ── Support SLA ──
        { key: 'priority_starter_sla', value: '48', type: 'number', group: 'priority', label: 'Starter Support SLA (hours)' },
        { key: 'priority_pro_sla', value: '24', type: 'number', group: 'priority', label: 'Pro Support SLA (hours)' },
        { key: 'priority_elite_sla', value: '12', type: 'number', group: 'priority', label: 'Elite Support SLA (hours)' },
        { key: 'priority_vip_sla', value: '4', type: 'number', group: 'priority', label: 'VIP Support SLA (hours)' },
        // ── Feature flags — API Access ──
        { key: 'priority_starter_api_access', value: 'false', type: 'boolean', group: 'priority', label: 'Starter: API Access' },
        { key: 'priority_pro_api_access', value: 'true', type: 'boolean', group: 'priority', label: 'Pro: API Access' },
        { key: 'priority_elite_api_access', value: 'true', type: 'boolean', group: 'priority', label: 'Elite: API Access' },
        { key: 'priority_vip_api_access', value: 'true', type: 'boolean', group: 'priority', label: 'VIP: API Access' },
        // ── Detailed Geo Reports ──
        { key: 'priority_starter_geo_reports', value: 'false', type: 'boolean', group: 'priority', label: 'Starter: Detailed Geo Reports' },
        { key: 'priority_pro_geo_reports', value: 'false', type: 'boolean', group: 'priority', label: 'Pro: Detailed Geo Reports' },
        { key: 'priority_elite_geo_reports', value: 'true', type: 'boolean', group: 'priority', label: 'Elite: Detailed Geo Reports' },
        { key: 'priority_vip_geo_reports', value: 'true', type: 'boolean', group: 'priority', label: 'VIP: Detailed Geo Reports' },
        // ── Credit Line ──
        { key: 'priority_vip_credit_line', value: 'true', type: 'boolean', group: 'priority', label: 'VIP: Temporary Credit Line' },
        // ── Account Manager ──
        { key: 'priority_vip_account_manager', value: 'true', type: 'boolean', group: 'priority', label: 'VIP: Dedicated Account Manager' },
        // ── Early Feature Access ──
        { key: 'priority_vip_early_access', value: 'true', type: 'boolean', group: 'priority', label: 'VIP: Early Feature Access' },
        // ── Auto Approve ──
        { key: 'priority_elite_auto_approve', value: 'true', type: 'boolean', group: 'priority', label: 'Elite: Auto-Approve Campaigns (AI pass)' },
        { key: 'priority_vip_instant_approve', value: 'true', type: 'boolean', group: 'priority', label: 'VIP: Instant Campaign Approval' },
    ];

    for (const setting of prioritySettings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log('✅ Priority settings seeded.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
