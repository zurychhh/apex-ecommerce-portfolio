import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
  // Find the shop
  const shops = await prisma.shop.findMany();
  console.log('Found shops:', shops.map(s => s.domain));
  
  for (const shop of shops) {
    // Delete all recommendations
    const deleted = await prisma.recommendation.deleteMany({
      where: { shopId: shop.id }
    });
    console.log(`Deleted ${deleted.count} recommendations for ${shop.domain}`);
    
    // Reset lastAnalysis
    await prisma.shop.update({
      where: { id: shop.id },
      data: { lastAnalysis: null }
    });
    console.log(`Reset lastAnalysis for ${shop.domain}`);
  }
  
  console.log('\n✅ Account reset complete! You can now run a fresh analysis.');
}

reset()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
