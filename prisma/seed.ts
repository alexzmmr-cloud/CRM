import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const accounts = await Promise.all([
    prisma.account.create({
      data: { name: "ООО Экспо Стенд", website: "https://expostend.example" },
    }),
    prisma.account.create({
      data: { name: "АртДизайн Групп", website: "https://artdesign.example" },
    }),
    prisma.account.create({
      data: { name: "СтройВыставка", website: "https://stroyvistavka.example" },
    }),
    prisma.account.create({
      data: { name: "БрендЗона Плюс" },
    }),
  ]);
  const [accExpo, accArt, accStroy, accBrand] = accounts;

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        name: "Иванов Пётр",
        email: "ivanov@expostend.example",
        phone: "+7 900 100-00-01",
        role: "Директор",
        accountId: accExpo.id,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Смирнова Анна",
        email: "smirnova@artdesign.example",
        phone: "+7 900 100-00-02",
        role: "Менеджер проектов",
        accountId: accArt.id,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Кузнецов Дмитрий",
        email: "kuznetsov@stroyvistavka.example",
        role: "Закупки",
        accountId: accStroy.id,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Волкова Ольга",
        phone: "+7 900 100-00-04",
        role: "Маркетинг",
        accountId: accBrand.id,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Новиков Сергей",
        email: "novikov@expostend.example",
        role: "Технический директор",
        accountId: accExpo.id,
      },
    }),
  ]);
  const [contIvanov, contSmirnova, contKuznetsov, contVolkova, contNovikov] =
    contacts;

  const now = new Date();
  const daysFromNow = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const leadNew = await prisma.lead.create({
    data: {
      name: "Захарова Мария",
      company: "Новый клиент ООО",
      contact: "zaharova@newclient.example",
      note: "Интересует стенд на осеннюю выставку",
      source: "site",
      status: "new",
    },
  });

  const leadEmailConverted = await prisma.lead.create({
    data: {
      name: "Иванов Пётр",
      company: "ООО Экспо Стенд",
      contact: "ivanov@expostend.example",
      note: "Запрос через почту на постоянный стенд",
      source: "email",
      status: "converted",
    },
  });

  const leadPhoneConverted = await prisma.lead.create({
    data: {
      name: "Смирнова Анна",
      company: "АртДизайн Групп",
      contact: "+7 900 100-00-02",
      note: "Звонок по рекламе на выставке",
      source: "phone",
      status: "converted",
    },
  });

  const leadReferral = await prisma.lead.create({
    data: {
      name: "Кузнецов Дмитрий",
      company: "СтройВыставка",
      contact: "kuznetsov@stroyvistavka.example",
      note: "Рекомендация от партнёра",
      source: "referral",
      status: "new",
    },
  });

  const leadManualDisqualified = await prisma.lead.create({
    data: {
      name: "Петров Иван",
      company: "Тестовая компания",
      note: "Ручной ввод, оказался нецелевым запросом",
      source: "manual",
      status: "disqualified",
    },
  });

  const leadSiteConverted = await prisma.lead.create({
    data: {
      name: "Волкова Ольга",
      company: "БрендЗона Плюс",
      contact: "+7 900 100-00-04",
      note: "Заявка с сайта на брендзону",
      source: "site",
      status: "converted",
    },
  });

  const opportunities = await Promise.all([
    prisma.opportunity.create({
      data: {
        title: "Стенд для ООО Экспо Стенд",
        amount: 850000,
        venue: "Крокус Экспо",
        timeline: "сентябрь 2026",
        format: "Индивидуальный стенд 30 м²",
        stage: "negotiation",
        accountId: accExpo.id,
        contactId: contIvanov.id,
        leadId: leadEmailConverted.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        title: "Брендзона для АртДизайн Групп",
        amount: 420000,
        venue: "Экспоцентр",
        timeline: "октябрь 2026",
        format: "Брендзона 15 м²",
        stage: "proposal",
        accountId: accArt.id,
        contactId: contSmirnova.id,
        leadId: leadPhoneConverted.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        title: "Выставочный стенд БрендЗона Плюс",
        amount: 300000,
        venue: "Сокольники",
        timeline: "ноябрь 2026",
        format: "Стандартный стенд 20 м²",
        stage: "won",
        accountId: accBrand.id,
        contactId: contVolkova.id,
        leadId: leadSiteConverted.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        title: "Повторный стенд для ООО Экспо Стенд",
        amount: 600000,
        venue: "Крокус Экспо",
        timeline: "март 2027",
        format: "Индивидуальный стенд 25 м²",
        stage: "qualified",
        accountId: accExpo.id,
        contactId: contNovikov.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        title: "Стенд для СтройВыставка",
        amount: 250000,
        venue: "Экспоцентр",
        timeline: "апрель 2027",
        format: "Стандартный стенд 12 м²",
        stage: "new",
        accountId: accStroy.id,
        contactId: contKuznetsov.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        title: "Архивная сделка АртДизайн Групп",
        amount: 180000,
        venue: "Сокольники",
        timeline: "январь 2026",
        format: "Стандартный стенд 10 м²",
        stage: "lost",
        accountId: accArt.id,
        contactId: contSmirnova.id,
      },
    }),
  ]);
  const [
    oppExpoNegotiation,
    oppArtProposal,
    oppBrandWon,
    oppExpoQualified,
    oppStroyNew,
    oppArtLost,
  ] = opportunities;

  await Promise.all([
    prisma.activity.create({
      data: {
        type: "note",
        content: "Клиент попросил уточнить смету по материалам стенда.",
        opportunityId: oppExpoNegotiation.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        content: "Отправить обновлённую смету клиенту",
        dueDate: daysFromNow(-2),
        done: false,
        opportunityId: oppExpoNegotiation.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        content: "Согласовать дату монтажа стенда",
        dueDate: daysFromNow(5),
        done: false,
        opportunityId: oppExpoNegotiation.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "note",
        content: "Обсудили дизайн-концепцию брендзоны, ждём макет.",
        opportunityId: oppArtProposal.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        content: "Получить макет от дизайнера",
        dueDate: daysFromNow(-1),
        done: false,
        opportunityId: oppArtProposal.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "note",
        content: "Сделка закрыта успешно, стенд смонтирован в срок.",
        opportunityId: oppBrandWon.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        content: "Подготовить коммерческое предложение",
        dueDate: daysFromNow(7),
        done: false,
        opportunityId: oppExpoQualified.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        content: "Уточнить бюджет у закупок",
        dueDate: daysFromNow(3),
        done: true,
        opportunityId: oppStroyNew.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "note",
        content: "Сделка не состоялась, клиент выбрал другого подрядчика.",
        opportunityId: oppArtLost.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        content: "Позвонить клиенту и уточнить причину отказа",
        dueDate: daysFromNow(0),
        done: false,
        opportunityId: oppArtLost.id,
      },
    }),
    prisma.activity.create({
      data: {
        type: "task",
        content: "Обновить карточку сделки статусом отказа",
        dueDate: daysFromNow(0),
        done: false,
        opportunityId: oppExpoQualified.id,
      },
    }),
  ]);

  console.log("Seed завершён:");
  console.log("- Leads: 6");
  console.log("- Accounts: 4");
  console.log("- Contacts: 5");
  console.log("- Opportunities: 6");
  console.log("- Activities: 11");
  console.log(
    `- Оставлены без сделки (для сценария convert lead): ${leadNew.name} (new), ${leadReferral.name} (new), ${leadManualDisqualified.name} (disqualified)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
