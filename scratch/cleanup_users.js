
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const keepEmails = ['admin@traderbox.com', 'analyst@traderbox.com', 'user@traderbox.com'];
  
  console.log("Starting database cleanup...");

  // 1. Get IDs of users to keep
  const usersToKeep = await prisma.user.findMany({
    where: { email: { in: keepEmails } },
    select: { id: true }
  });
  const keepIds = usersToKeep.map(u => u.id);

  if (keepIds.length < 2) {
    console.error("Critical: Could not find all users to keep. Aborting.");
    return;
  }

  // 2. Delete related data for users NOT in keepIds
  // We'll delete data that belongs to the users we are removing.
  
  const deleteWhere = { NOT: { userId: { in: keepIds } } };
  const deleteWhereSender = { NOT: { senderId: { in: keepIds } } };
  const deleteWhereAnalyst = { NOT: { analystId: { in: keepIds } } };
  const deleteWhereProvider = { NOT: { providerId: { in: keepIds } } };
  const deleteWhereAdmin = { NOT: { adminId: { in: keepIds } } };

  console.log("Deleting notifications...");
  await prisma.notification.deleteMany({ where: deleteWhere });

  console.log("Deleting ticket messages...");
  // TicketMessage has senderId, and is linked to Ticket which has userId.
  // First delete messages from users we are deleting.
  await prisma.ticketMessage.deleteMany({ where: deleteWhereSender });

  console.log("Deleting tickets...");
  await prisma.ticket.deleteMany({ where: deleteWhere });

  console.log("Deleting admin messages...");
  await prisma.adminMessage.deleteMany({ where: deleteWhere });

  console.log("Deleting audit logs...");
  await prisma.auditLog.deleteMany({ where: deleteWhereAdmin });

  console.log("Deleting analyses...");
  await prisma.analysis.deleteMany({ where: deleteWhereAnalyst });

  console.log("Deleting recommendations...");
  await prisma.recommendation.deleteMany({ where: { OR: [deleteWhereProvider] } });

  console.log("Deleting subscriptions...");
  await prisma.subscription.deleteMany({ where: { OR: [deleteWhere, deleteWhereProvider] } });

  console.log("Deleting withdrawals...");
  await prisma.withdrawal.deleteMany({ where: deleteWhere });

  console.log("Deleting deposits...");
  await prisma.deposit.deleteMany({ where: deleteWhere });

  console.log("Deleting ledger entries...");
  // Ledger entries are linked to wallets.
  const walletsToDelete = await prisma.wallet.findMany({
    where: deleteWhere,
    select: { id: true }
  });
  const walletIdsToDelete = walletsToDelete.map(w => w.id);
  await prisma.ledgerEntry.deleteMany({ where: { walletId: { in: walletIdsToDelete } } });

  console.log("Deleting wallets...");
  await prisma.wallet.deleteMany({ where: { id: { in: walletIdsToDelete } } });

  console.log("Deleting users...");
  await prisma.user.deleteMany({ where: { id: { notIn: keepIds } } });

  console.log("Cleanup complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
