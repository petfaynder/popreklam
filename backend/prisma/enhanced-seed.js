/**
 * PopReklam - Ad Network Platform
 * 
 * @file enhanced-seed.js
 * @description Comprehensive database seeding script for demo/development
 * @version 1.0.0
 * @license Regular License
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration
const DEMO_PASSWORD = 'Ta170104894*';
const DAYS_OF_HISTORY = 30;

// Helper: Random date within last N days
const randomDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    return date;
};

// Helper: Random number between min and max
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Random element from array
const randomElement = (arr) => arr[random(0, arr.length - 1)];

async function main() {
    console.log('🌱 Starting enhanced database seeding...\n');

    // Hash password once
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    // ==================== PUBLISHERS ====================
    console.log('👤 Creating Publisher users...');

    const publisher1 = await prisma.user.upsert({
        where: { email: 'akartolga0@gmail.com' },
        update: {
            passwordHash: hashedPassword,
            status: 'ACTIVE',
            balance: 450.75
        },
        create: {
            email: 'akartolga0@gmail.com',
            passwordHash: hashedPassword,
            role: 'PUBLISHER',
            status: 'ACTIVE',
            balance: 450.75,
            lastLogin: new Date(),
            publisher: {
                create: {
                    companyName: 'TechMedia Publishing',
                    totalRevenue: 2540.50,
                    totalPayout: 2000.00
                }
            }
        },
        include: { publisher: true }
    });

    const publisher2 = await prisma.user.upsert({
        where: { email: 'publisher01@popreklam.com' },
        update: {},
        create: {
            email: 'publisher02@popreklam.com',
            passwordHash: hashedPassword,
            role: 'PUBLISHER',
            status: 'ACTIVE',
            balance: 125.30,
            publisher: {
                create: {
                    companyName: 'Game Sites Network',
                    totalRevenue: 890.20,
                    totalPayout: 750.00
                }
            }
        },
        include: { publisher: true }
    });

    console.log(`✅ Created ${2} Publishers`);

    // ==================== SITES ====================
    console.log('\n🌐 Creating Publisher Sites...');

    const sitesData = [
        // Publisher 1 sites
        { publisherId: publisher1.publisher.id, name: 'Tech News Daily', url: 'https://technewsdaily.com', category: 'Technology', status: 'ACTIVE' },
        { publisherId: publisher1.publisher.id, name: 'Code Tutorial Hub', url: 'https://codetutorials.io', category: 'Education', status: 'ACTIVE' },
        { publisherId: publisher1.publisher.id, name: 'Startup Insider', url: 'https://startupinsider.net', category: 'News', status: 'ACTIVE' },
        { publisherId: publisher1.publisher.id, name: 'AI Weekly', url: 'https://aiweekly.org', category: 'Technology', status: 'PENDING' },

        // Publisher 2 sites  
        { publisherId: publisher2.publisher.id, name: 'Gaming Arena Pro', url: 'https://gamingarena.pro', category: 'Gaming', status: 'ACTIVE' },
        { publisherId: publisher2.publisher.id, name: 'Esports Today', url: 'https://esportstoday.net', category: 'Gaming', status: 'ACTIVE' },
        { publisherId: publisher2.publisher.id, name: 'Game Reviews Central', url: 'https://gamereviews.io', category: 'Gaming', status: 'REJECTED' },
    ];

    const sites = [];
    for (const siteData of sitesData) {
        const site = await prisma.site.create({
            data: {
                ...siteData,
                description: `Premium ${siteData.category.toLowerCase()} content`,
                createdAt: randomDate(60)
            }
        });
        sites.push(site);

        // Create zones for each site
        const formats = ['POPUNDER', 'IN_PAGE_PUSH', 'NATIVE'];
        for (const format of formats) {
            await prisma.zone.create({
                data: {
                    siteId: site.id,
                    name: `${format} Zone`,
                    adFormat: format,
                    dimensions: format === 'POPUNDER' ? null : '300x250',
                    createdAt: randomDate(50)
                }
            });
        }
    }

    console.log(`✅ Created ${sites.length} Sites with ${sites.length * 3} Zones`);

    // ==================== ADVERTISERS ====================
    console.log('\n💼 Creating Advertiser users...');

    const advertiser1 = await prisma.user.upsert({
        where: { email: 'akartolga0+advertiser@gmail.com' },
        update: {
            passwordHash: hashedPassword,
            status: 'ACTIVE',
            balance: 1250.00
        },
        create: {
            email: 'akartolga0+advertiser@gmail.com',
            passwordHash: hashedPassword,
            role: 'ADVERTISER',
            status: 'ACTIVE',
            balance: 1250.00,
            lastLogin: new Date(),
            advertiser: {
                create: {
                    companyName: 'Digital Marketing Pro',
                    totalSpent: 3450.80,
                    totalDeposit: 5000.00
                }
            }
        },
        include: { advertiser: true }
    });

    const advertiser2 = await prisma.user.upsert({
        where: { email: 'advertiser02@popreklam.com' },
        update: {},
        create: {
            email: 'advertiser02@popreklam.com',
            passwordHash: hashedPassword,
            role: 'ADVERTISER',
            status: 'ACTIVE',
            balance: 580.50,
            advertiser: {
                create: {
                    companyName: 'E-commerce Ads Inc',
                    totalSpent: 1890.30,
                    totalDeposit: 2500.00
                }
            }
        },
        include: { advertiser: true }
    });

    console.log(`✅ Created ${2} Advertisers`);

    // ==================== CAMPAIGNS ====================
    console.log('\n📢 Creating Ad Campaigns...');

    const campaignsData = [
        // Advertiser 1 campaigns
        { advertiserId: advertiser1.advertiser.id, name: 'Summer Sale 2026', targetUrl: 'https://shop.example.com/sale', adFormat: 'POPUNDER', status: 'ACTIVE', totalBudget: 1000, dailyBudget: 50, bidAmount: 2.50 },
        { advertiserId: advertiser1.advertiser.id, name: 'New Product Launch', targetUrl: 'https://product.example.com', adFormat: 'IN_PAGE_PUSH', status: 'ACTIVE', totalBudget: 800, dailyBudget: 40, bidAmount: 3.20 },
        { advertiserId: advertiser1.advertiser.id, name: 'Brand Awareness Q2', targetUrl: 'https://brand.example.com', adFormat: 'NATIVE', status: 'PAUSED', totalBudget: 1500, dailyBudget: null, bidAmount: 4.00 },
        { advertiserId: advertiser1.advertiser.id, name: 'Mobile App Install', targetUrl: 'https://app.example.com/download', adFormat: 'IN_PAGE_PUSH', status: 'PENDING_APPROVAL', totalBudget: 500, dailyBudget: 25, bidAmount: 2.80 },

        // Advertiser 2 campaigns
        { advertiserId: advertiser2.advertiser.id, name: 'Flash Deal Weekend', targetUrl: 'https://deals.shop.com', adFormat: 'POPUNDER', status: 'ACTIVE', totalBudget: 600, dailyBudget: 30, bidAmount: 2.20 },
        { advertiserId: advertiser2.advertiser.id, name: 'Holiday Special', targetUrl: 'https://holiday.shop.com', adFormat: 'NATIVE', status: 'COMPLETED', totalBudget: 1200, dailyBudget: null, bidAmount: 3.50 },
    ];

    const campaigns = [];
    for (const campaignData of campaignsData) {
        const campaign = await prisma.campaign.create({
            data: {
                ...campaignData,
                totalSpent: campaignData.status === 'ACTIVE' ? random(100, 500) : 0,
                totalImpressions: campaignData.status === 'ACTIVE' ? random(50000, 150000) : 0,
                totalClicks: campaignData.status === 'ACTIVE' ? random(500, 3000) : 0,
                targeting: {
                    countries: ['US', 'UK', 'CA'],
                    devices: ['Desktop', 'Mobile'],
                    os: ['Windows', 'Mac', 'Android', 'iOS']
                },
                createdAt: randomDate(45),
                updatedAt: new Date()
            }
        });
        campaigns.push(campaign);
    }

    console.log(`✅ Created ${campaigns.length} Campaigns`);

    // ==================== IMPRESSIONS ====================
    console.log('\n📊 Generating Impression Data...');

    const zones = await prisma.zone.findMany();
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');

    let totalImpressions = 0;
    const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT'];
    const devices = ['Desktop', 'Mobile', 'Tablet'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const oses = ['Windows', 'Mac', 'Linux', 'Android', 'iOS'];

    // Generate impressions for last 30 days
    for (let day = 0; day < DAYS_OF_HISTORY; day++) {
        const impressionsPerDay = random(200, 400);

        for (let i = 0; i < impressionsPerDay; i++) {
            const campaign = randomElement(activeCampaigns);
            const zone = randomElement(zones);
            const clicked = Math.random() < 0.025; // 2.5% CTR
            const cost = parseFloat(campaign.bidAmount);
            const revenue = cost * 0.7; // Publisher gets 70%

            await prisma.impression.create({
                data: {
                    campaignId: campaign.id,
                    zoneId: zone.id,
                    ip: `${random(1, 255)}.${random(1, 255)}.${random(1, 255)}.${random(1, 255)}`,
                    userAgent: `Mozilla/5.0 (${randomElement(oses)})`,
                    country: randomElement(countries),
                    city: 'Demo City',
                    device: randomElement(devices),
                    browser: randomElement(browsers),
                    os: randomElement(oses),
                    clicked,
                    cost,
                    revenue,
                    createdAt: randomDate(DAYS_OF_HISTORY)
                }
            });
            totalImpressions++;
        }
    }

    console.log(`✅ Generated ${totalImpressions.toLocaleString()} Impressions`);

    // ==================== TRANSACTIONS ====================
    console.log('\n💰 Creating Transactions...');

    const transactions = [
        // Publisher withdrawals
        { userId: publisher1.id, type: 'WITHDRAWAL', status: 'COMPLETED', amount: 500, description: 'PayPal withdrawal', completedAt: randomDate(20) },
        { userId: publisher1.id, type: 'WITHDRAWAL', status: 'PENDING', amount: 300, description: 'Wire transfer request' },
        { userId: publisher2.id, type: 'WITHDRAWAL', status: 'COMPLETED', amount: 200, description: 'PayPal withdrawal', completedAt: randomDate(15) },

        // Advertiser deposits
        { userId: advertiser1.id, type: 'DEPOSIT', status: 'COMPLETED', amount: 2000, description: 'Credit card deposit', completedAt: randomDate(25) },
        { userId: advertiser1.id, type: 'DEPOSIT', status: 'COMPLETED', amount: 1500, description: 'PayPal deposit', completedAt: randomDate(40) },
        { userId: advertiser2.id, type: 'DEPOSIT', status: 'COMPLETED', amount: 1000, description: 'Credit card deposit', completedAt: randomDate(30) },
        { userId: advertiser2.id, type: 'DEPOSIT', status: 'COMPLETED', amount: 500, description: 'Bitcoin deposit', completedAt: randomDate(10) },
    ];

    for (const txData of transactions) {
        await prisma.transaction.create({
            data: {
                ...txData,
                metadata: { method: txData.description.split(' ')[0] },
                createdAt: txData.completedAt || new Date()
            }
        });
    }

    console.log(`✅ Created ${transactions.length} Transactions`);

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(65));
    console.log('🎉 Enhanced Seed Complete!');
    console.log('='.repeat(65));
    console.log(`
📊 DATABASE SUMMARY:
├─ 👥 Users: ${2} Publishers, ${2} Advertisers
├─ 🌐 Sites: ${sites.length}
├─ 📍 Zones: ${sites.length * 3}
├─ 📢 Campaigns: ${campaigns.length} (${activeCampaigns.length} active)
├─ 📊 Impressions: ${totalImpressions.toLocaleString()}
└─ 💰 Transactions: ${transactions.length}

🔐 TEST CREDENTIALS:
┌─────────────────────────────────────────────────────────────┐
│ Publisher Account                                            │
│ Email: akartolga0@gmail.com                                 │
│ Password: Ta170104894*                                      │
│ Dashboard: http://localhost:3000/publisher                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Advertiser Account                                           │
│ Email: akartolga0+advertiser@gmail.com                      │
│ Password: Ta170104894*                                      │
│ Dashboard: http://localhost:3000/advertiser                 │
└─────────────────────────────────────────────────────────────┘

✨ Ready for testing and demo!
    `);
}

main()
    .catch((e) => {
        console.error('\n❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
