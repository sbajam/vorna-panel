import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const DEFAULT_PERMISSIONS = [
  // Users permissions
  { module: 'users', action: 'view', key: 'users.view' },
  { module: 'users', action: 'edit', key: 'users.edit' },
  { module: 'users', action: 'delete', key: 'users.delete' },
  
  // Roles permissions
  { module: 'roles', action: 'view', key: 'roles.view' },
  { module: 'roles', action: 'edit', key: 'roles.edit' },
  { module: 'roles', action: 'delete', key: 'roles.delete' },
  
  // Products permissions (نمونه)
  { module: 'products', action: 'view', key: 'products.view' },
  { module: 'products', action: 'edit', key: 'products.edit' },
  { module: 'products', action: 'delete', key: 'products.delete' },
]

const DEFAULT_ROLES = [
  {
    name: 'admin',
    permissions: ['users.view', 'users.edit', 'roles.view', 'products.view', 'products.edit']
  },
  {
    name: 'editor',
    permissions: ['products.view', 'products.edit']
  },
  {
    name: 'viewer',
    permissions: ['products.view']
  }
]

async function main() {

  // Create permissions
  for (const permission of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: permission,
      create: permission
    })
  }

  // Create roles
  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        permissions: {
          connect: role.permissions.map(key => ({ key }))
        }
      },
      create: {
        name: role.name,
        permissions: {
          connect: role.permissions.map(key => ({ key }))
        }
      }
    })
  }

}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
