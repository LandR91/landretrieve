import { PrismaClient, UserRole, PropertyCategory, ListingType, PropertyStatus, CatasterType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@landretrieve.com' },
    update: {},
    create: {
      email: 'admin@landretrieve.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'LandRetrieve',
      role: UserRole.ADMIN,
      emailVerified: true,
      locale: 'it',
    },
  })
  console.log('✓ Admin user created:', admin.email)

  // Demo agency
  const agency = await prisma.agency.upsert({
    where: { slug: 'demo-agency' },
    update: {},
    create: {
      name: 'Demo Agenzia Immobiliare',
      slug: 'demo-agency',
      description: 'Agenzia specializzata in immobili rurali',
      phone: '+39 055 123456',
      email: 'info@demo-agency.it',
      city: 'Firenze',
      province: 'FI',
      isVerified: true,
    },
  })
  console.log('✓ Demo agency created:', agency.name)

  // Demo agent
  const agentPassword = await bcrypt.hash('Agent123!', 12)
  const agent = await prisma.user.upsert({
    where: { email: 'agent@landretrieve.com' },
    update: {},
    create: {
      email: 'agent@landretrieve.com',
      passwordHash: agentPassword,
      firstName: 'Marco',
      lastName: 'Rossi',
      role: UserRole.AGENT,
      emailVerified: true,
      locale: 'it',
      agencyId: agency.id,
      agentProfile: {
        create: {
          bio: 'Agente specializzato in casali e ville rurali. 10 anni di esperienza.',
          yearsExperience: 10,
          languages: ['it', 'en', 'de'],
          specializations: ['CASALE', 'VILLA', 'AGRITURISMO'],
        },
      },
    },
  })
  console.log('✓ Demo agent created:', agent.email)

  // Demo buyer
  const buyerPassword = await bcrypt.hash('Buyer123!', 12)
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@landretrieve.com' },
    update: {},
    create: {
      email: 'buyer@landretrieve.com',
      passwordHash: buyerPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.BUYER,
      emailVerified: true,
      locale: 'en',
      country: 'GB',
    },
  })
  console.log('✓ Demo buyer created:', buyer.email)

  // Demo properties
  const properties = [
    {
      slug: 'casale-colline-senesi-001',
      title: 'Casale nelle Colline Senesi con Vigna',
      description: 'Splendido casale in pietra completamente restaurato, immerso in 5 ettari di vigneto e oliveto. La proprietà offre 4 camere da letto, 3 bagni, cucina professionale e ampi spazi esterni con piscina. Vista panoramica sulle colline circostanti.',
      listingType: ListingType.SALE,
      category: PropertyCategory.CASALE,
      status: PropertyStatus.PUBLISHED,
      price: 850000,
      region: 'Siena',
      province: 'SI',
      comune: 'Montalcino',
      latitude: 43.0548,
      longitude: 11.4899,
      surfaceSqm: 320,
      landHectares: 5.2,
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      buildYear: 1750,
      catasterType: CatasterType.FABBRICATI,
      catasterProvincia: 'SI',
      catasterComune: 'Montalcino',
      catasterFoglio: '42',
      catasterParticella: '187',
      features: ['PISCINA', 'VIGNA', 'OLIVETO', 'CANTINA', 'FIENILE', 'DEPENDANCE'],
      agentId: agent.id,
      agencyId: agency.id,
      isFeatured: true,
    },
    {
      slug: 'villa-rustica-chianti-001',
      title: 'Villa Rustica nel Cuore del Chianti',
      description: 'Elegante villa rurale di 450 mq con parco di 2 ettari nel cuore della regione del Chianti. La proprietà include 6 camere, 4 bagni, studio, dépendance per ospiti e piscina panoramica. Cantina attrezzata per la produzione vinicola.',
      listingType: ListingType.SALE,
      category: PropertyCategory.VILLA,
      status: PropertyStatus.PUBLISHED,
      price: 1450000,
      region: 'Firenze',
      province: 'FI',
      comune: 'Greve in Chianti',
      latitude: 43.5836,
      longitude: 11.3116,
      surfaceSqm: 450,
      landHectares: 2.0,
      bedrooms: 6,
      bathrooms: 4,
      floors: 3,
      buildYear: 1890,
      catasterType: CatasterType.FABBRICATI,
      catasterProvincia: 'FI',
      catasterComune: 'Greve in Chianti',
      catasterFoglio: '15',
      catasterParticella: '234',
      features: ['PISCINA', 'PARCO', 'CANTINA', 'DEPENDANCE', 'GARAGE', 'TERMOCAMINO'],
      agentId: agent.id,
      agencyId: agency.id,
      isFeatured: false,
    },
    {
      slug: 'agriturismo-val-dorcia-001',
      title: 'Agriturismo in Attività - Val d\'Orcia',
      description: 'Agriturismo completamente operativo con 8 appartamenti turistici, ristorante da 60 coperti, piscina e 15 ettari di terreno coltivato a olivi e lavanda. Ottimo reddito annuale documentato. Posizione eccezionale nel cuore della Val d\'Orcia.',
      listingType: ListingType.SALE,
      category: PropertyCategory.AGRITURISMO,
      status: PropertyStatus.PUBLISHED,
      price: 2200000,
      region: 'Siena',
      province: 'SI',
      comune: 'Pienza',
      latitude: 43.0769,
      longitude: 11.6794,
      surfaceSqm: 1200,
      landHectares: 15.0,
      bedrooms: 16,
      bathrooms: 12,
      floors: 2,
      buildYear: 1680,
      catasterType: CatasterType.FABBRICATI,
      catasterProvincia: 'SI',
      catasterComune: 'Pienza',
      catasterFoglio: '08',
      catasterParticella: '056',
      features: ['RISTORANTE', 'PISCINA', 'OLIVETO', 'LAVANDA', 'APPARTAMENTI_TURISTICI', 'ENOTURISMO'],
      agentId: agent.id,
      agencyId: agency.id,
      isFeatured: true,
    },
    {
      slug: 'terreno-agricolo-maremma-001',
      title: 'Terreno Agricolo 8 Ettari - Maremma Grossetana',
      description: 'Terreno agricolo di 8 ettari nella Maremma Grossetana, con vigneto DOC di 3 ettari e oliveto di 200 piante. Presente fabbricato rurale di 80 mq da ristrutturare. Acqua di pozzo, elettricità disponibile. Ottima posizione panoramica.',
      listingType: ListingType.SALE,
      category: PropertyCategory.TERRENO,
      status: PropertyStatus.PUBLISHED,
      price: 320000,
      region: 'Grosseto',
      province: 'GR',
      comune: 'Scansano',
      latitude: 42.6847,
      longitude: 11.3326,
      surfaceSqm: 80,
      landHectares: 8.3,
      bedrooms: null,
      bathrooms: null,
      catasterType: CatasterType.TERRENI,
      catasterProvincia: 'GR',
      catasterComune: 'Scansano',
      catasterFoglio: '31',
      catasterParticella: '412',
      features: ['VIGNA', 'OLIVETO', 'POZZO', 'FABBRICATO_RURALE'],
      agentId: agent.id,
      agencyId: agency.id,
      isFeatured: false,
    },
    {
      slug: 'casale-umbria-affitto-001',
      title: 'Casale Umbro - Affitto Lungo Termine',
      description: 'Casale ristrutturato di 200 mq in Umbria, disponibile per affitto annuale. 3 camere, 2 bagni, cucina attrezzata, giardino privato di 2000 mq con piscina condivisa. Ideale per smart working o famiglia.',
      listingType: ListingType.RENT,
      category: PropertyCategory.CASALE,
      status: PropertyStatus.PUBLISHED,
      price: 1800,
      rentMonthly: 1800,
      rentDeposit: 5400,
      region: 'Perugia',
      province: 'PG',
      comune: 'Spello',
      latitude: 42.9887,
      longitude: 12.6724,
      surfaceSqm: 200,
      landHectares: 0.2,
      bedrooms: 3,
      bathrooms: 2,
      floors: 2,
      buildYear: 1820,
      features: ['PISCINA_CONDIVISA', 'GIARDINO', 'CUCINA_ATTREZZATA', 'WIFI', 'POSTO_AUTO'],
      agentId: agent.id,
      agencyId: agency.id,
      isFeatured: false,
    },
  ]

  for (const propertyData of properties) {
    const { agentId, agencyId, ...data } = propertyData
    await prisma.property.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        price: data.price,
        rentMonthly: 'rentMonthly' in data ? data.rentMonthly : undefined,
        rentDeposit: 'rentDeposit' in data ? data.rentDeposit : undefined,
        landHectares: 'landHectares' in data ? data.landHectares : undefined,
        agentId,
        agencyId,
      } as any,
    })
  }
  console.log(`✓ ${properties.length} demo properties created`)

  console.log('\n✅ Seed completed!')
  console.log('\nDemo credentials:')
  console.log('  Admin:  admin@landretrieve.com / Admin123!')
  console.log('  Agent:  agent@landretrieve.com / Agent123!')
  console.log('  Buyer:  buyer@landretrieve.com / Buyer123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
