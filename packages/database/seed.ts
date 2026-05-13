import { PrismaClient, UserRole, PropertyStatus, ListingType, SubscriptionStatus, SubscriptionPlan } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── CLEANUP ──────────────────────────────────────────────────────────────
  await prisma.$transaction([
    prisma.propertyImage.deleteMany(),
    prisma.propertyFeature.deleteMany(),
    prisma.savedProperty.deleteMany(),
    prisma.savedSearch.deleteMany(),
    prisma.insight.deleteMany(),
    prisma.review.deleteMany(),
    prisma.crmActivity.deleteMany(),
    prisma.crmNote.deleteMany(),
    prisma.crmEnquiry.deleteMany(),
    prisma.crmDeal.deleteMany(),
    prisma.crmLead.deleteMany(),
    prisma.message.deleteMany(),
    prisma.thread.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.property.deleteMany(),
    prisma.agentProfile.deleteMany(),
    prisma.agencyProfile.deleteMany(),
    prisma.user.deleteMany(),
  ])

  const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10)

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@landretrieve.com',
      password: hashPassword('Admin123!'),
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'LandRetrieve',
      displayName: 'Admin',
      isVerified: true,
      isActive: true,
    },
  })
  console.log(`  ✅ Admin: ${admin.email}`)

  // ─── AGENZIA 1 — Toscana Immobili ─────────────────────────────────────────
  const agencyUser1 = await prisma.user.create({
    data: {
      username: 'toscana-immobili',
      email: 'info@toscanaimmobili.it',
      password: hashPassword('Agency123!'),
      role: UserRole.AGENCY,
      firstName: 'Marco',
      lastName: 'Bianchi',
      displayName: 'Marco Bianchi',
      isVerified: true,
      isActive: true,
    },
  })

  const agency1 = await prisma.agencyProfile.create({
    data: {
      userId: agencyUser1.id,
      name: 'Toscana Immobili Rurali',
      slug: 'toscana-immobili-rurali',
      taxNumber: 'IT01234567890',
      licenses: 'IT-AG-12345',
      phone: '+39 055 1234567',
      mobile: '+39 333 1234567',
      email: 'info@toscanaimmobili.it',
      website: 'https://toscanaimmobili.it',
      address: 'Via della Repubblica, 12',
      city: 'Firenze',
      country: 'Italia',
      language: 'Italiano, English',
      serviceArea: 'Toscana, Umbria',
      specialties: 'Casali, Ville, Agriturismi',
      bio: 'Agenzia specializzata in immobili rurali di pregio. Operiamo nel settore da oltre 20 anni con un team di professionisti certificati.',
      facebook: 'https://facebook.com/toscanaimmobili',
      instagram: 'https://instagram.com/toscanaimmobili',
      linkedin: 'https://linkedin.com/company/toscanaimmobili',
      isVerified: true,
      isVisible: true,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    },
  })
  console.log(`  ✅ Agenzia 1: ${agency1.name}`)

  // ─── AGENZIA 2 — Rural Properties ─────────────────────────────────────────
  const agencyUser2 = await prisma.user.create({
    data: {
      username: 'rural-properties-it',
      email: 'hello@ruralproperties.it',
      password: hashPassword('Agency123!'),
      role: UserRole.AGENCY,
      firstName: 'Sofia',
      lastName: 'Rossi',
      displayName: 'Sofia Rossi',
      isVerified: true,
      isActive: true,
    },
  })

  const agency2 = await prisma.agencyProfile.create({
    data: {
      userId: agencyUser2.id,
      name: 'Rural Properties Italy',
      slug: 'rural-properties-italy',
      taxNumber: 'IT09876543210',
      licenses: 'IT-AG-67890',
      phone: '+39 0577 987654',
      mobile: '+39 347 9876543',
      email: 'hello@ruralproperties.it',
      website: 'https://ruralproperties.it',
      address: 'Piazza del Campo, 5',
      city: 'Siena',
      country: 'Italia',
      language: 'Italiano, English, Deutsch',
      serviceArea: 'Chianti, Montalcino, Val d\'Orcia',
      specialties: 'Aziende Agricole, Vigneti, Oliveti',
      bio: 'Specializziamo nella vendita di proprietà rurali con vocazione agricola. Esperti di aziende vitivinicole e olivicole.',
      whatsapp: '+393479876543',
      linkedin: 'https://linkedin.com/company/ruralproperties',
      isVerified: true,
      isVisible: true,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    },
  })
  console.log(`  ✅ Agenzia 2: ${agency2.name}`)

  // ─── AGENTI ───────────────────────────────────────────────────────────────
  const agentData = [
    {
      user: {
        username: 'luca-ferrari',
        email: 'luca.ferrari@toscanaimmobili.it',
        firstName: 'Luca',
        lastName: 'Ferrari',
        displayName: 'Luca Ferrari',
      },
      profile: {
        agencyId: agency1.id,
        slug: 'luca-ferrari',
        position: 'Senior Agent',
        mobile: '+39 338 1112233',
        serviceArea: 'Chianti, Valdarno',
        specialties: 'Casali ristrutturati, Ville',
        language: 'Italiano, English',
        bio: 'Agente immobiliare con 10 anni di esperienza nel settore rurale. Specializzato in casali di pregio e proprietà storiche.',
        isVerified: true,
      },
    },
    {
      user: {
        username: 'giulia-moretti',
        email: 'giulia.moretti@toscanaimmobili.it',
        firstName: 'Giulia',
        lastName: 'Moretti',
        displayName: 'Giulia Moretti',
      },
      profile: {
        agencyId: agency1.id,
        slug: 'giulia-moretti',
        position: 'Property Finder',
        mobile: '+39 339 4445566',
        serviceArea: 'Val di Chiana, Arezzo',
        specialties: 'Terreni, Agriturismi',
        language: 'Italiano, Français',
        bio: 'Property finder specializzata nella ricerca di immobili rurali per clienti internazionali. Madrelingua italiana e francese.',
        isVerified: true,
      },
    },
    {
      user: {
        username: 'andrea-conti',
        email: 'andrea.conti@ruralproperties.it',
        firstName: 'Andrea',
        lastName: 'Conti',
        displayName: 'Andrea Conti',
      },
      profile: {
        agencyId: agency2.id,
        slug: 'andrea-conti',
        position: 'Broker',
        mobile: '+39 347 7778899',
        serviceArea: 'Montalcino, Montepulciano',
        specialties: 'Aziende Agricole, Vigneti',
        language: 'Italiano, English, Deutsch',
        bio: 'Broker con focus su aziende vinicole e olivicole. Gestisco trattative con acquirenti europei e americani.',
        isVerified: true,
      },
    },
    {
      user: {
        username: 'elena-russo',
        email: 'elena.russo@ruralproperties.it',
        firstName: 'Elena',
        lastName: 'Russo',
        displayName: 'Elena Russo',
      },
      profile: {
        agencyId: agency2.id,
        slug: 'elena-russo',
        position: 'Agent',
        mobile: '+39 333 0001122',
        serviceArea: 'Val d\'Orcia, Pienza',
        specialties: 'Ville, Casali da ristrutturare',
        language: 'Italiano, English',
        bio: 'Agente immobiliare specializzata in proprietà con potenziale di ristrutturazione nella splendida Val d\'Orcia.',
        isVerified: false,
      },
    },
  ]

  const createdAgents: { user: typeof admin; profile: typeof agency1 }[] = []

  for (const data of agentData) {
    const agentUser = await prisma.user.create({
      data: {
        ...data.user,
        password: hashPassword('Agent123!'),
        role: UserRole.AGENT,
        isActive: true,
      },
    })
    const agentProfile = await prisma.agentProfile.create({
      data: {
        userId: agentUser.id,
        ...data.profile,
        isVisible: true,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    })
    createdAgents.push({ user: agentUser as typeof admin, profile: agentProfile as typeof agency1 })
    console.log(`  ✅ Agente: ${data.user.displayName}`)
  }

  // ─── VISITATORE ───────────────────────────────────────────────────────────
  const visitor = await prisma.user.create({
    data: {
      username: 'john-buyer',
      email: 'john.buyer@gmail.com',
      password: hashPassword('Visitor123!'),
      role: UserRole.VISITOR,
      firstName: 'John',
      lastName: 'Buyer',
      displayName: 'John Buyer',
      isActive: true,
    },
  })
  console.log(`  ✅ Visitatore: ${visitor.email}`)

  // ─── IMMOBILI ─────────────────────────────────────────────────────────────
  const propertiesData = [
    {
      propertyId: 'LR00001',
      title: 'Villa con piscina e vigneto nel Chianti',
      slug: 'villa-piscina-vigneto-chianti',
      description: 'Splendida villa di 450 mq immersa nelle colline del Chianti. La proprietà include un vigneto di 3 ettari, piscina panoramica, oliveto e annesso colonico. Perfetta per chi cerca un\'investimento nel settore vitivinicolo con un\'abitazione di lusso.',
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 1850000,
      currency: 'EUR',
      size: 450,
      landSize: 45000,
      bedrooms: 5,
      bathrooms: 4,
      garages: 2,
      rooms: 10,
      yearBuilt: 1780,
      country: 'Italia',
      city: 'Greve in Chianti',
      area: 'Chianti',
      zipCode: '50022',
      propertyType: 'Ville',
      propertyStatus: 'Vendita',
      labels: ['Hot', 'In Evidenza'],
      energyClass: 'D',
      isFeatured: true,
      agentId: createdAgents[0]?.profile?.id,
      agencyId: agency1.id,
      userId: agentData[0]?.user ? (await prisma.user.findUnique({ where: { username: agentData[0].user.username } }))?.id : undefined,
      features: ['Piscina', 'Vigneto', 'Oliveta', 'Wi-Fi', 'Camino', 'BBQ', 'Equitazione'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ],
    },
    {
      propertyId: 'LR00002',
      title: 'Casale ristrutturato con oliveto a Montalcino',
      slug: 'casale-ristrutturato-oliveto-montalcino',
      description: 'Magnifico casale del 1600 completamente ristrutturato con materiali di pregio. La proprietà si estende su 12 ettari con oliveto di 800 piante e bosco privato. Finiture di lusso, travi a vista, pavimenti in cotto originale.',
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 980000,
      currency: 'EUR',
      size: 280,
      landSize: 120000,
      bedrooms: 4,
      bathrooms: 3,
      rooms: 8,
      yearBuilt: 1620,
      country: 'Italia',
      city: 'Montalcino',
      area: 'Val d\'Orcia',
      zipCode: '53024',
      propertyType: 'Casali ristrutturati',
      propertyStatus: 'Vendita',
      labels: ['Nuovo'],
      energyClass: 'E',
      isFeatured: false,
      agentId: createdAgents[2]?.profile?.id,
      agencyId: agency2.id,
      userId: agentData[2]?.user ? (await prisma.user.findUnique({ where: { username: agentData[2].user.username } }))?.id : undefined,
      features: ['Oliveta', 'Bosco', 'Camino', 'Piscina', 'Wi-Fi'],
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
      ],
    },
    {
      propertyId: 'LR00003',
      title: 'Agriturismo funzionante con 8 appartamenti in Val d\'Orcia',
      slug: 'agriturismo-funzionante-8-appartamenti-val-orcia',
      description: 'Raro agriturismo funzionante con 8 appartamenti attrezzati, ristorante da 60 coperti, piscina e area benessere. Posizione strategica sulla Via Francigena. Ottima redditività. Perfetto per investitori nel turismo rurale.',
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 3200000,
      currency: 'EUR',
      size: 1200,
      landSize: 250000,
      bedrooms: 16,
      bathrooms: 12,
      rooms: 35,
      yearBuilt: 1850,
      country: 'Italia',
      city: 'Pienza',
      area: 'Val d\'Orcia',
      zipCode: '53026',
      propertyType: 'Agriturismi',
      propertyStatus: 'Vendita',
      labels: ['Hot'],
      energyClass: 'D',
      isFeatured: true,
      agentId: createdAgents[3]?.profile?.id,
      agencyId: agency2.id,
      userId: agentData[3]?.user ? (await prisma.user.findUnique({ where: { username: agentData[3].user.username } }))?.id : undefined,
      features: ['Piscina', 'Wi-Fi', 'Ristorante', 'Area Benessere', 'Parcheggio', 'Equitazione', 'Escursioni'],
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
      ],
    },
    {
      propertyId: 'LR00004',
      title: 'Azienda agricola con vigneto Brunello di Montalcino',
      slug: 'azienda-agricola-vigneto-brunello-montalcino',
      description: 'Straordinaria azienda agricola con 8 ettari di vigneto a Brunello DOCG, cantina attrezzata, 2 case coloniche e attrezzature incluse. Produzione media annua: 40.000 bottiglie. Un\'opportunità unica nel mondo del vino di lusso.',
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 5500000,
      currency: 'EUR',
      size: 800,
      landSize: 180000,
      bedrooms: 6,
      bathrooms: 5,
      rooms: 15,
      yearBuilt: 1920,
      country: 'Italia',
      city: 'Montalcino',
      area: 'Montalcino',
      zipCode: '53024',
      propertyType: 'Aziende agricole',
      propertyStatus: 'Vendita',
      labels: ['In Evidenza'],
      energyClass: 'F',
      isFeatured: true,
      agentId: createdAgents[2]?.profile?.id,
      agencyId: agency2.id,
      userId: agentData[2]?.user ? (await prisma.user.findUnique({ where: { username: agentData[2].user.username } }))?.id : undefined,
      features: ['Vigneto', 'Cantina', 'Frutteto', 'Edificabile', 'Agricolo'],
      images: [
        'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800',
        'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?w=800',
      ],
    },
    {
      propertyId: 'LR00005',
      title: 'Casale da ristrutturare con terreno panoramico',
      slug: 'casale-da-ristrutturare-terreno-panoramico',
      description: 'Casale in pietra da ristrutturare su terreno di 5 ettari con vista panoramica mozzafiato. Permesso di costruzione già ottenuto. Ideale per chi vuole creare la casa dei sogni nel cuore della campagna.',
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 320000,
      currency: 'EUR',
      size: 180,
      landSize: 50000,
      bedrooms: 3,
      bathrooms: 1,
      rooms: 6,
      yearBuilt: 1890,
      country: 'Italia',
      city: 'Castelnuovo Berardenga',
      area: 'Chianti',
      zipCode: '53019',
      propertyType: 'Casali da ristrutturare',
      propertyStatus: 'Vendita',
      labels: ['Ridotto'],
      energyClass: 'G',
      isFeatured: false,
      agentId: createdAgents[0]?.profile?.id,
      agencyId: agency1.id,
      userId: agentData[0]?.user ? (await prisma.user.findUnique({ where: { username: agentData[0].user.username } }))?.id : undefined,
      features: ['Edificabile', 'Agricolo', 'Bosco', 'Acqua', 'Elettricità'],
      images: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      ],
    },
    {
      propertyId: 'LR00006',
      title: 'Terreno agricolo edificabile con vista sul mare',
      slug: 'terreno-agricolo-edificabile-vista-mare',
      description: 'Terreno di 10 ettari con destinazione agricola ed edificabile. Vista panoramica sul Mar Tirreno. Ideale per la realizzazione di una tenuta privata o struttura ricettiva. Servizi a 500 metri.',
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 450000,
      currency: 'EUR',
      size: 100000,
      landSize: 100000,
      country: 'Italia',
      city: 'Castiglione della Pescaia',
      area: 'Maremma',
      zipCode: '58043',
      propertyType: 'Terreni',
      propertyStatus: 'Vendita',
      labels: [],
      energyClass: undefined,
      isFeatured: false,
      agentId: createdAgents[1]?.profile?.id,
      agencyId: agency1.id,
      userId: agentData[1]?.user ? (await prisma.user.findUnique({ where: { username: agentData[1].user.username } }))?.id : undefined,
      features: ['Edificabile', 'Agricolo', 'Fronte mare', 'Acqua', 'Elettricità'],
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      ],
    },
  ]

  for (const propData of propertiesData) {
    const { features, images, userId, agentId, agencyId, ...rest } = propData
    const property = await prisma.property.create({
      data: {
        ...rest,
        ...(userId ? { userId } : {}),
        ...(agentId ? { agentId } : {}),
        ...(agencyId ? { agencyId } : {}),
        publishedAt: new Date(),
        images: {
          create: images.map((url, idx) => ({ url, order: idx, alt: rest.title })),
        },
        features: {
          create: features.map((f) => ({ feature: f })),
        },
      },
    })
    console.log(`  ✅ Immobile: ${property.propertyId} — ${property.title}`)
  }

  // ─── CRM LEAD DI TEST ─────────────────────────────────────────────────────
  await prisma.crmLead.create({
    data: {
      userId: agencyUser1.id,
      firstName: 'James',
      lastName: 'Henderson',
      displayName: 'James Henderson',
      email: 'james.henderson@gmail.com',
      mobile: '+44 7700 900123',
      country: 'United Kingdom',
      city: 'London',
      source: 'Sito web',
      status: 'new',
    },
  })

  await prisma.crmLead.create({
    data: {
      userId: agencyUser1.id,
      firstName: 'Hans',
      lastName: 'Müller',
      displayName: 'Hans Müller',
      email: 'hans.muller@web.de',
      mobile: '+49 170 1234567',
      country: 'Germania',
      city: 'Munich',
      source: 'Referral',
      status: 'contacted',
    },
  })
  console.log(`  ✅ CRM Leads creati`)

  // ─── PREFERITI ────────────────────────────────────────────────────────────
  const firstProperty = await prisma.property.findFirst({ where: { propertyId: 'LR00001' } })
  const secondProperty = await prisma.property.findFirst({ where: { propertyId: 'LR00002' } })

  if (firstProperty) {
    await prisma.savedProperty.create({
      data: { userId: visitor.id, propertyId: firstProperty.id },
    })
  }
  if (secondProperty) {
    await prisma.savedProperty.create({
      data: { userId: visitor.id, propertyId: secondProperty.id },
    })
  }
  console.log(`  ✅ Preferiti visitatore creati`)

  // ─── RICERCHE SALVATE ─────────────────────────────────────────────────────
  await prisma.savedSearch.create({
    data: {
      userId: visitor.id,
      name: 'Casali Chianti budget 1M',
      filters: {
        propertyType: 'Casali ristrutturati',
        area: 'Chianti',
        priceMax: 1000000,
        listingType: 'SALE',
      },
    },
  })
  console.log(`  ✅ Ricerca salvata creata`)

  console.log('\n✨ Seed completato!\n')
  console.log('Credenziali test:')
  console.log('  Admin:     admin@landretrieve.com     / Admin123!')
  console.log('  Agenzia 1: info@toscanaimmobili.it   / Agency123!')
  console.log('  Agenzia 2: hello@ruralproperties.it  / Agency123!')
  console.log('  Agenti:    [nome]@[agenzia].it       / Agent123!')
  console.log('  Visitatore: john.buyer@gmail.com     / Visitor123!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
