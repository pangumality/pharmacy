const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.product.deleteMany({})
  await prisma.user.deleteMany({})

  // Add sample products
  const products = [
    {
      name: 'Paracetamol 500mg',
      description: 'Effective pain relief and fever reducer. Suitable for headaches, muscle aches, and colds.',
      price: 50.00,
      quantity: 1000,
      image: 'https://placehold.co/400x300?text=Paracetamol',
      category: 'Pain Relief'
    },
    {
      name: 'Ibuprofen 400mg',
      description: 'Anti-inflammatory medication for relief of pain, fever, and inflammation.',
      price: 75.00,
      quantity: 500,
      image: 'https://placehold.co/400x300?text=Ibuprofen',
      category: 'Pain Relief'
    },
    {
      name: 'Amoxicillin 500mg',
      description: 'Broad-spectrum antibiotic for bacterial infections. Prescription required.',
      price: 120.00,
      quantity: 200,
      image: 'https://placehold.co/400x300?text=Amoxicillin',
      category: 'Antibiotics'
    },
    {
      name: 'Vitamin C 1000mg',
      description: 'Immune system support. High potency Vitamin C supplement.',
      price: 150.00,
      quantity: 300,
      image: 'https://placehold.co/400x300?text=Vitamin+C',
      category: 'Vitamins'
    },
    {
      name: 'Multivitamin Complex',
      description: 'Daily essential vitamins and minerals for overall health and vitality.',
      price: 200.00,
      quantity: 150,
      image: 'https://placehold.co/400x300?text=Multivitamins',
      category: 'Vitamins'
    },
    {
      name: 'First Aid Kit',
      description: 'Comprehensive first aid kit for home and travel. Includes bandages, antiseptics, and tools.',
      price: 450.00,
      quantity: 50,
      image: 'https://placehold.co/400x300?text=First+Aid+Kit',
      category: 'First Aid'
    },
    {
      name: 'Bandages (Pack of 20)',
      description: 'Sterile adhesive bandages for minor cuts and scrapes.',
      price: 35.00,
      quantity: 500,
      image: 'https://placehold.co/400x300?text=Bandages',
      category: 'First Aid'
    },
    {
      name: 'Cough Syrup',
      description: 'Soothing relief for dry and chesty coughs. Non-drowsy formula.',
      price: 85.00,
      quantity: 200,
      image: 'https://placehold.co/400x300?text=Cough+Syrup',
      category: 'Medicine'
    },
    {
      name: 'Antiseptic Cream',
      description: 'Prevents infection in minor cuts, scrapes, and burns.',
      price: 45.00,
      quantity: 300,
      image: 'https://placehold.co/400x300?text=Antiseptic',
      category: 'First Aid'
    },
    {
      name: 'Hand Sanitizer 500ml',
      description: 'Alcohol-based hand sanitizer. Kills 99.9% of germs.',
      price: 60.00,
      quantity: 1000,
      image: 'https://placehold.co/400x300?text=Sanitizer',
      category: 'Personal Care'
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  // Create Super Admin User
  const hashedPassword = await bcrypt.hash('Admin@123', 10)
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      username: 'admin@system.com',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('Database seeded successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
