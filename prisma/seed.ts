import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seedData = [
  { company: 'Digikala',   role: 'React Developer',       status: 'APPLIED',       location: 'Tehran', salary: '120M Toman', jobUrl: 'https://careers.digikala.com' },
  { company: 'Snapp',      role: 'Frontend Engineer',     status: 'APPLIED',       location: 'Tehran', salary: '140M Toman' },
  { company: 'Norovision', role: 'Next.js Developer',     status: 'PHONE_SCREEN',  location: 'Tehran' },
  { company: 'XPay',       role: 'Frontend Developer',    status: 'INTERVIEW',     location: 'Remote', salary: '160M Toman' },
  { company: 'Alibaba IR', role: 'Senior React Dev',      status: 'WISHLIST',      location: 'Tehran', salary: '180M Toman' },
  { company: 'Faraz',      role: 'Front-End Engineer',    status: 'REJECTED',      location: 'Tehran', notes: 'No feedback given.' },
  { company: 'Bime Bazar', role: 'Frontend Developer',    status: 'APPLIED',       location: 'Tehran' },
  { company: 'Transis',    role: 'React Developer',       status: 'WISHLIST',      location: 'Tehran' },
]

async function main() {
  console.log('Seeding database...')
  await prisma.application.deleteMany()
  for (const app of seedData) {
    await prisma.application.create({ data: app })
  }
  console.log(`Seeded ${seedData.length} applications.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
