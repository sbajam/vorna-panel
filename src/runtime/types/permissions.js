// src/runtime/types/permission-types.js

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
};

// نگاشت permission به route ها
export const RoutePermissions = {
  '/users': [SystemPermissions.USERS.VIEW],
  '/users/edit': [SystemPermissions.USERS.EDIT],
  '/roles': [SystemPermissions.ROLES.VIEW],
  '/roles/edit': [SystemPermissions.ROLES.EDIT]
};

// ساختار یک مجوز (Permission) در جاوااسکریپت
function Permission(module, action, key) {
  this.module = module;
  this.action = action;
  this.key = key;
}

// ساختار یک نقش (Role) در جاوااسکریپت
function Role(name, permissions) {
  this.name = name;
  this.permissions = permissions;
}
