import { PrismaClient, UserRole, PropertyTypeParent, PropertyStatus, ListingType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Avvio seed LandRetrieve...");

  // ─── 1. ADMIN ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin2024!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@landretrieve.com" },
    update: { password: adminPassword },
    create: {
      username: "admin",
      email: "admin@landretrieve.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      firstName: "Admin",
      lastName: "LandRetrieve",
      displayName: "Admin",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✅ Admin creato:", admin.email);

  // ─── 2. AGENZIE ──────────────────────────────────────────────────────────
  const agency1Password = await bcrypt.hash("Agency1@Test!", 12);
  const agency1User = await prisma.user.upsert({
    where: { email: "info@tuscanyestates.it" },
    update: {},
    create: {
      username: "tuscany-estates",
      email: "info@tuscanyestates.it",
      password: agency1Password,
      role: UserRole.AGENCY,
      isVerified: true,
      isActive: true,
    },
  });

  const agency1 = await prisma.agencyProfile.upsert({
    where: { userId: agency1User.id },
    update: {},
    create: {
      userId: agency1User.id,
      name: "Tuscany Estates",
      slug: "tuscany-estates",
      taxNumber: "IT01234567890",
      licenses: "FIAIP-001234",
      phone: "+39 055 1234567",
      email: "info@tuscanyestates.it",
      website: "https://tuscanyestates.it",
      language: "Italiano, English",
      serviceArea: "Toscana, Umbria",
      bio: "Agenzia specializzata nella vendita di immobili rurali di pregio. Nata a Firenze nel 2010, operiamo su tutto il territorio italiano.",
      isVerified: true,
      isVisible: true,
    },
  });
  console.log("✅ Agenzia 1 creata:", agency1.name);

  const agency2Password = await bcrypt.hash("Agency2@Test!", 12);
  const agency2User = await prisma.user.upsert({
    where: { email: "contact@ruralitalyhomes.com" },
    update: {},
    create: {
      username: "rural-italy-homes",
      email: "contact@ruralitalyhomes.com",
      password: agency2Password,
      role: UserRole.AGENCY,
      isVerified: true,
      isActive: true,
    },
  });

  const agency2 = await prisma.agencyProfile.upsert({
    where: { userId: agency2User.id },
    update: {},
    create: {
      userId: agency2User.id,
      name: "Rural Italy Homes",
      slug: "rural-italy-homes",
      taxNumber: "IT09876543210",
      licenses: "FIAIP-005678",
      phone: "+39 06 9876543",
      email: "contact@ruralitalyhomes.com",
      website: "https://ruralitalyhomes.com",
      language: "English, Italiano, Français",
      serviceArea: "Lazio, Umbria, Marche",
      bio: "International real estate agency focused on rural Italian properties. We help international buyers find their dream home in Italy.",
      isVerified: true,
      isVisible: true,
    },
  });
  console.log("✅ Agenzia 2 creata:", agency2.name);

  // ─── 3. AGENTI ───────────────────────────────────────────────────────────
  const agentPassword = await bcrypt.hash("Agent@Test123!", 12);

  const agent1User = await prisma.user.upsert({
    where: { email: "marco.rossi@tuscanyestates.it" },
    update: {},
    create: {
      username: "marco-rossi",
      email: "marco.rossi@tuscanyestates.it",
      password: agentPassword,
      role: UserRole.AGENT,
      title: "SIG",
      firstName: "Marco",
      lastName: "Rossi",
      displayName: "Marco Rossi",
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.agentProfile.upsert({
    where: { userId: agent1User.id },
    update: {},
    create: {
      userId: agent1User.id,
      agencyId: agency1.id,
      slug: "marco-rossi",
      position: "Senior Agent",
      license: "FIAIP-A001",
      taxNumber: "RSSMRC85T20H501Z",
      mobile: "+39 333 1234567",
      email: "marco.rossi@tuscanyestates.it",
      serviceArea: "Firenze, Siena, Arezzo",
      language: "Italiano, English",
      bio: "Agente con 15 anni di esperienza nel settore degli immobili rurali toscani.",
      isVerified: true,
      isVisible: true,
    },
  });
  console.log("✅ Agente 1 creato: Marco Rossi");

  const agent2User = await prisma.user.upsert({
    where: { email: "giulia.bianchi@tuscanyestates.it" },
    update: {},
    create: {
      username: "giulia-bianchi",
      email: "giulia.bianchi@tuscanyestates.it",
      password: agentPassword,
      role: UserRole.AGENT,
      title: "SIGRA",
      firstName: "Giulia",
      lastName: "Bianchi",
      displayName: "Giulia Bianchi",
      isVerified: false,
      isActive: true,
    },
  });
  const agent2 = await prisma.agentProfile.upsert({
    where: { userId: agent2User.id },
    update: {},
    create: {
      userId: agent2User.id,
      agencyId: agency1.id,
      slug: "giulia-bianchi",
      position: "Agent",
      license: "FIAIP-A002",
      taxNumber: "BNCGLI90P45F205V",
      mobile: "+39 347 9876543",
      email: "giulia.bianchi@tuscanyestates.it",
      serviceArea: "Lucca, Pisa, Grosseto",
      language: "Italiano, Deutsch",
      bio: "Specializzata in agriturismi e aziende agricole in Maremma e Versilia.",
      isVerified: false,
      isVisible: true,
    },
  });
  console.log("✅ Agente 2 creato: Giulia Bianchi");

  const agent3User = await prisma.user.upsert({
    where: { email: "james.smith@ruralitalyhomes.com" },
    update: {},
    create: {
      username: "james-smith",
      email: "james.smith@ruralitalyhomes.com",
      password: agentPassword,
      role: UserRole.AGENT,
      title: "SIG",
      firstName: "James",
      lastName: "Smith",
      displayName: "James Smith",
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.agentProfile.upsert({
    where: { userId: agent3User.id },
    update: {},
    create: {
      userId: agent3User.id,
      agencyId: agency2.id,
      slug: "james-smith",
      position: "International Consultant",
      license: "FIAIP-A003",
      mobile: "+39 392 1112233",
      email: "james.smith@ruralitalyhomes.com",
      serviceArea: "Roma, Viterbo, Rieti",
      language: "English, Italiano, Français",
      bio: "International real estate consultant with 10 years of experience helping foreign buyers in Italy.",
      isVerified: true,
      isVisible: true,
    },
  });
  console.log("✅ Agente 3 creato: James Smith");

  const agent4User = await prisma.user.upsert({
    where: { email: "sofia.ferrari@landretrieve.com" },
    update: {},
    create: {
      username: "sofia-ferrari",
      email: "sofia.ferrari@landretrieve.com",
      password: agentPassword,
      role: UserRole.AGENT,
      title: "SIGRA",
      firstName: "Sofia",
      lastName: "Ferrari",
      displayName: "Sofia Ferrari",
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.agentProfile.upsert({
    where: { userId: agent4User.id },
    update: {},
    create: {
      userId: agent4User.id,
      slug: "sofia-ferrari",
      position: "Broker Indipendente",
      license: "FIAIP-A099",
      taxNumber: "FRRSFR88H55H501W",
      mobile: "+39 349 4445566",
      email: "sofia.ferrari@landretrieve.com",
      serviceArea: "Umbria, Marche",
      language: "Italiano, English, Español",
      bio: "Broker indipendente specializzata in casali e ville di lusso in Umbria e Marche.",
      isVerified: true,
      isVisible: true,
    },
  });
  console.log("✅ Agente 4 creato: Sofia Ferrari (broker indipendente)");

  // ─── 4. IMMOBILI ─────────────────────────────────────────────────────────
  const agent1Profile = await prisma.agentProfile.findUnique({ where: { userId: agent1User.id } });
  const agent2Profile = await prisma.agentProfile.findUnique({ where: { userId: agent2User.id } });
  const agent3Profile = await prisma.agentProfile.findUnique({ where: { userId: agent3User.id } });
  const agent4Profile = await prisma.agentProfile.findUnique({ where: { userId: agent4User.id } });

  if (!agent1Profile || !agent2Profile || !agent3Profile || !agent4Profile) {
    throw new Error("Profili agente non trovati");
  }

  const properties = [
    {
      propertyId: "LR00001",
      title: "Villa con piscina e vigneto a Greve in Chianti",
      slug: "villa-piscina-vigneto-greve-chianti",
      description:
        "Magnifica villa padronale con piscina a sfioro, vigneto di 3 ettari e uliveto. Vista panoramica sulle colline del Chianti. Completamente ristrutturata con materiali d'epoca.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 1850000,
      currency: "EUR",
      size: 450,
      landSize: 32000,
      bedrooms: 6,
      bathrooms: 5,
      garages: 3,
      rooms: 14,
      yearBuilt: 1780,
      address: "Via dei Vigneti 12",
      regione: "Toscana",
      provincia: "Firenze",
      comune: "Greve in Chianti",
      zipCode: "50022",
      country: "Italia",
      lat: 43.5847,
      lng: 11.3186,
      propertyTypeParent: PropertyTypeParent.VILLE,
      labels: ["Hot", "In Primo Piano"],
      energyClass: "G",
      agentId: agent1Profile.id,
      agencyId: agency1.id,
      isInPrimoPiano: true,
      publishedAt: new Date(),
    },
    {
      propertyId: "LR00002",
      title: "Agriturismo biologico con 8 appartamenti a Montepulciano",
      slug: "agriturismo-biologico-montepulciano",
      description:
        "Struttura agrituristica completamente funzionante con certificazione biologica. 8 appartamenti per ospiti, ristorante, cantina, 15 ettari di vigneto Vino Nobile DOCG.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 3200000,
      currency: "EUR",
      size: 1200,
      landSize: 180000,
      bedrooms: 20,
      bathrooms: 12,
      rooms: 35,
      yearBuilt: 1650,
      address: "Strada Provinciale 146",
      regione: "Toscana",
      provincia: "Siena",
      comune: "Montepulciano",
      zipCode: "53045",
      country: "Italia",
      lat: 43.0994,
      lng: 11.7811,
      propertyTypeParent: PropertyTypeParent.AGRITURISMI,
      labels: ["Nuovo"],
      energyClass: "F",
      agentId: agent1Profile.id,
      agencyId: agency1.id,
      isInPrimoPiano: false,
      publishedAt: new Date(),
    },
    {
      propertyId: "LR00003",
      title: "Casale ristrutturato con bosco e lago privato in Umbria",
      slug: "casale-ristrutturato-bosco-lago-umbria",
      description:
        "Splendido casale in pietra completamente restaurato con finiture di alta qualità. Circondato da 45 ettari di bosco e dotato di un lago privato di 2 ettari. Perfetto per turismo rurale.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 980000,
      currency: "EUR",
      size: 320,
      landSize: 450000,
      bedrooms: 4,
      bathrooms: 3,
      rooms: 10,
      yearBuilt: 1820,
      address: "Loc. Colle Verde",
      regione: "Umbria",
      provincia: "Perugia",
      comune: "Gubbio",
      zipCode: "06024",
      country: "Italia",
      lat: 43.3506,
      lng: 12.5774,
      propertyTypeParent: PropertyTypeParent.CASALE,
      propertyType: "Casale ristrutturato",
      labels: ["Hot"],
      energyClass: "D",
      agentId: agent2Profile.id,
      agencyId: agency1.id,
      isInPrimoPiano: false,
      publishedAt: new Date(),
    },
    {
      propertyId: "LR00004",
      title: "Terreno edificabile fronte lago a Bracciano",
      slug: "terreno-edificabile-lago-bracciano",
      description:
        "Terreno edificabile con affaccio diretto sul Lago di Bracciano. Superficie 8.000 mq con progetto approvato per villa unifamiliare con piscina e dependance.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 420000,
      currency: "EUR",
      size: 8000,
      landSize: 8000,
      address: "Via Lacuale Anguillarese",
      regione: "Lazio",
      provincia: "Roma",
      comune: "Bracciano",
      zipCode: "00062",
      country: "Italia",
      lat: 42.1052,
      lng: 12.1753,
      propertyTypeParent: PropertyTypeParent.TERRENO,
      propertyType: "Terreno edificabile",
      labels: ["Ridotto"],
      agentId: agent3Profile.id,
      agencyId: agency2.id,
      isInPrimoPiano: false,
      publishedAt: new Date(),
    },
    {
      propertyId: "LR00005",
      title: "Azienda agricola con oliveto e cantina nelle Marche",
      slug: "azienda-agricola-oliveto-cantina-marche",
      description:
        "Azienda agricola completa con 25 ettari di oliveto (cultivar Ascolana tenera DOP), cantina attrezzata, frantoio, e casa colonica di 600 mq. Produzione annua 30.000 litri olio extra vergine.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 1450000,
      currency: "EUR",
      size: 600,
      landSize: 250000,
      bedrooms: 5,
      bathrooms: 3,
      rooms: 12,
      yearBuilt: 1900,
      address: "C.da Sant'Angelo 45",
      regione: "Marche",
      provincia: "Ascoli Piceno",
      comune: "Offida",
      zipCode: "63073",
      country: "Italia",
      lat: 42.9337,
      lng: 13.6900,
      propertyTypeParent: PropertyTypeParent.AZIENDE_AGRICOLE,
      labels: ["Nuovo"],
      energyClass: "G",
      agentId: agent4Profile.id,
      isInPrimoPiano: false,
      publishedAt: new Date(),
    },
    {
      propertyId: "LR00006",
      title: "Casale da ristrutturare con panorama sul Val d'Orcia",
      slug: "casale-ristrutturare-val-dorcia",
      description:
        "Casale in pietra da ristrutturare con vista mozzafiato sul paesaggio UNESCO del Val d'Orcia. 180 mq su due livelli, 4 ettari di terreno agricolo. Progetto di ristrutturazione disponibile.",
      status: PropertyStatus.PUBLISHED,
      listingType: ListingType.SALE,
      price: 195000,
      currency: "EUR",
      size: 180,
      landSize: 40000,
      bedrooms: 3,
      bathrooms: 2,
      rooms: 7,
      yearBuilt: 1750,
      address: "Loc. Podere Belvedere",
      regione: "Toscana",
      provincia: "Siena",
      comune: "Pienza",
      zipCode: "53026",
      country: "Italia",
      lat: 43.0756,
      lng: 11.6789,
      propertyTypeParent: PropertyTypeParent.CASALE,
      propertyType: "Casale da ristrutturare",
      labels: ["Ridotto"],
      energyClass: "G",
      agentId: agent2Profile.id,
      agencyId: agency1.id,
      isInPrimoPiano: false,
      publishedAt: new Date(),
    },
  ];

  for (const prop of properties) {
    await prisma.property.upsert({
      where: { slug: prop.slug },
      update: {},
      create: prop as Parameters<typeof prisma.property.create>[0]["data"],
    });
    console.log(`✅ Immobile creato: ${prop.title}`);
  }

  // ─── 5. ACCOUNT TEST SEMPLICI ────────────────────────────────────────────
  const testPwd = await bcrypt.hash("Test2024!", 12);

  // Agenzia test
  const agenziaUser = await prisma.user.upsert({
    where: { email: "agenzia@test.com" },
    update: { password: testPwd },
    create: {
      username: "agenzia-test",
      email: "agenzia@test.com",
      password: testPwd,
      role: UserRole.AGENCY,
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.agencyProfile.upsert({
    where: { userId: agenziaUser.id },
    update: {},
    create: {
      userId: agenziaUser.id,
      name: "Agenzia Test",
      slug: "agenzia-test",
      taxNumber: "IT11111111111",
      licenses: "TEST-001",
      phone: "+39 000 1234567",
      email: "agenzia@test.com",
      bio: "Account test per sviluppo locale.",
      isVerified: true,
      isVisible: true,
    },
  });
  console.log("✅ Agenzia test: agenzia@test.com / Test2024!");

  // Agente test
  const agenteUser = await prisma.user.upsert({
    where: { email: "agente@test.com" },
    update: { password: testPwd },
    create: {
      username: "agente-test",
      email: "agente@test.com",
      password: testPwd,
      role: UserRole.AGENT,
      title: "SIG",
      firstName: "Test",
      lastName: "Agente",
      displayName: "Agente Test",
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.agentProfile.upsert({
    where: { userId: agenteUser.id },
    update: {},
    create: {
      userId: agenteUser.id,
      slug: "agente-test",
      position: "Agente Test",
      license: "TEST-A001",
      taxNumber: "TSTAGT85T20H501Z",
      mobile: "+39 000 9876543",
      email: "agente@test.com",
      bio: "Account test per sviluppo locale.",
      isVerified: true,
      isVisible: true,
    },
  });
  console.log("✅ Agente test: agente@test.com / Test2024!");

  // Visitatore test
  await prisma.user.upsert({
    where: { email: "visitatore@test.com" },
    update: { password: testPwd },
    create: {
      username: "visitatore-test",
      email: "visitatore@test.com",
      password: testPwd,
      role: UserRole.VISITOR,
      firstName: "Test",
      lastName: "Visitatore",
      displayName: "Visitatore Test",
      isVerified: false,
      isActive: true,
    },
  });
  console.log("✅ Visitatore test: visitatore@test.com / Test2024!");

  console.log("\n🎉 Seed completato con successo!");
  console.log("─────────────────────────────────────");
  console.log("Credenziali test:");
  console.log("  Admin:       admin@landretrieve.com        / Admin2024!");
  console.log("  Agenzia:     agenzia@test.com              / Test2024!");
  console.log("  Agente:      agente@test.com               / Test2024!");
  console.log("  Visitatore:  visitatore@test.com           / Test2024!");
  console.log("  Agenzia 1:   info@tuscanyestates.it        / Agency1@Test!");
  console.log("  Agenzia 2:   contact@ruralitalyhomes.com   / Agency2@Test!");
  console.log("  Agenti demo: [email] @ tuscanyestates.it   / Agent@Test123!");
}

main()
  .catch((e) => {
    console.error("❌ Errore durante il seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
