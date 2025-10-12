# TODO: Add Missing Imports to Vue Files

This file tracks the progress of adding necessary imports to all .vue files with `<script setup>` in the project.

## Files to Process (56 total)

- [ ] test/fixtures/basic/app.vue
- [x] src/runtime/pages/roles.vue
- [x] src/runtime/pages/permissions.vue
- [x] src/runtime/pages/login.vue
- [ ] src/runtime/pages/formBuilder.vue
- [ ] src/runtime/pages/formBuilder copy.vue
- [ ] src/runtime/layouts/modal.vue
- [ ] src/runtime/layouts/admin.vue
- [ ] src/runtime/components/widgets/WidgetHeader.vue
- [ ] src/runtime/components/ui/Header.vue
- [ ] src/runtime/components/ui/Sidebar.vue
- [ ] src/runtime/components/widgets/StatCard.vue
- [ ] src/runtime/components/ui/Breadcrumb.vue
- [ ] src/runtime/components/widgets/RecordList.vue
- [ ] src/runtime/components/widgets/ChartWidget.client.vue
- [ ] src/runtime/components/Spinner.vue
- [ ] src/runtime/components/SmartTable.vue
- [ ] src/runtime/components/PreviewP.vue
- [ ] src/runtime/components/login/LoginV2.vue
- [ ] src/runtime/components/form/Editor.vue
- [ ] src/runtime/components/form/ImageP.vue
- [ ] src/runtime/components/form/TagsField.vue
- [ ] src/runtime/components/form/RichTextField.vue
- [ ] src/runtime/components/form/ImageUploader.vue
- [ ] src/runtime/components/form/FileField.vue
- [ ] src/runtime/components/login/LoginV1.vue
- [ ] src/runtime/components/dashboard/DashboardSwitcher.vue
- [ ] src/runtime/components/dashboard/DashboardWidget.vue
- [ ] src/runtime/components/dashboard/DashboardView.vue
- [ ] src/runtime/components/dashboard/DashboardGrid.vue
- [ ] src/runtime/components/dashboard/DashboardFavorites.vue
- [ ] src/runtime/components/dashboard/BaseCard.vue
- [ ] src/runtime/components/Button.vue
- [ ] playground/pages/customers.vue
- [ ] playground/pages/information.vue
- [ ] playground/pages/texts.vue
- [ ] playground/pages/support/[id].vue
- [ ] playground/pages/testimonies/add.vue
- [ ] playground/pages/testimonies/[id].vue
- [ ] playground/pages/support/support.vue
- [ ] playground/pages/support/index.vue
- [ ] playground/pages/stats.vue
- [ ] playground/pages/projects/[id].vue
- [ ] playground/pages/services/[id].vue
- [ ] playground/pages/projects/add.vue
- [ ] playground/pages/services/add.vue
- [ ] playground/pages/index.vue
- [ ] playground/pages/faqs/[id].vue
- [ ] playground/pages/feedbacks/[id].vue
- [ ] playground/pages/faqs/add.vue
- [ ] playground/pages/feedbacks/index.vue
- [ ] playground/pages/clients.vue
- [ ] playground/pages/blog/index.vue
- [ ] playground/components/TicketCard.vue
- [ ] playground/components/StoreProduct.vue
- [ ] playground/app.vue

## Progress Summary
- Total files: 56
- Completed: 3
- Remaining: 53

## Next Steps
- Read each file to identify missing imports.
- Add imports for Vue functions (ref, reactive, computed, onMounted, etc.), Nuxt composables (useRoute, useRouter, useStore, useNuxtApp, useApi, etc.), and components used in template (e.g., Icon, Spinner, Button, InputField, NuxtLink).
- Use relative paths for local components, Nuxt paths for globals.
- Update this file after processing each file.
- After all edits, run the Nuxt app to verify no import errors.
