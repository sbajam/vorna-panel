export interface Permission {
  module: string      // نام ماژول مثل users, products
  action: string     // نوع عملیات مثل view, edit, delete
  key: string        // کلید یکتا مثل users.view
}

export interface Role {
  name: string       // نام نقش
  permissions: string[]  // لیست کلیدهای مجوزها
}

// تعریف permission های پیش‌فرض سیستم
export const SystemPermissions = {
  USERS: {
    VIEW: 'users.view',
    EDIT: 'users.edit',
    DELETE: 'users.delete'
  },
  ROLES: {
    VIEW: 'roles.view',
    EDIT: 'roles.edit',
    DELETE: 'roles.delete'
  }
} as const

// نگاشت permission به route ها
export const RoutePermissions: Record<string, string[]> = {
  '/users': [SystemPermissions.USERS.VIEW],
  '/users/edit': [SystemPermissions.USERS.EDIT],
  '/roles': [SystemPermissions.ROLES.VIEW],
  '/roles/edit': [SystemPermissions.ROLES.EDIT]
}
