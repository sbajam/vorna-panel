<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="max-w-4xl mx-auto py-8">
        <Header class="text-3xl font-bold mb-6">
          نمونه صفحه فرم با تمام قابلیت‌ها
        </Header>

        <FormBuilder
          :config="formConfig"
          :initialValues="initialValues"
          @validationError="onValidationError"
          @submitForm="onSubmitForm"
        />
      </Box>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
// مقادیر اولیهٔ فرم
const initialValues = {}

// کانفیگِ نهاییِ فرم
const formConfig    = {
  "formProps": {
    "title": "فرم نمونهٔ پیشرفته (تک‌سکشن)",
    "columns": {
      "base": 1,
      "md": 1,
      "lg": 1
    },
    "disabledAll": false,
    "loading": false,
    "loadingMode": "skeleton",
    "showErrorsAs": "inline",
    "autoSaveKey": "advancedFormDraft"
  },
  "sections": [
    {
      "title": "اطلاعات فرم",
      "collapsible": true,
      "fields": [
        {
          "key": "firstName",
          "type": "text",
          "label": "نام",
          "placeholder": "نام خود را وارد کنید",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "icon": "fa6-solid:user",
          "tooltip": "نام شما در سیستم",
          "validators": [
            {
              "type": "required",
              "message": "نام را وارد کنید"
            },
            {
              "type": "minLength",
              "value": 3,
              "message": "حداقل ۳ حرف وارد کنید"
            },
            {
              "type": "persianLetters",
              "message": "فقط حروف فارسی مجاز است"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "lastName",
          "type": "text",
          "label": "نام خانوادگی",
          "placeholder": "نام خانوادگی را وارد کنید",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "validators": [
            {
              "type": "required",
              "message": "نام خانوادگی را وارد کنید"
            },
            {
              "type": "persianLetters",
              "message": "فقط حروف فارسی مجاز است"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "email",
          "type": "email",
          "label": "ایمیل",
          "placeholder": "example@domain.com",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "validators": [
            {
              "type": "required",
              "message": "ایمیل الزامی است"
            },
            {
              "type": "email",
              "message": "ایمیل نامعتبر است"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 2
            }
          }
        },
        {
          "key": "password",
          "type": "password",
          "label": "رمز عبور",
          "placeholder": "حداقل ۸ کاراکتر",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "passwordOptions": true,
          "validators": [
            {
              "type": "required",
              "message": "رمز الزامی است"
            },
            {
              "type": "minLength",
              "value": 8,
              "message": "حداقل ۸ کاراکتر"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "confirmPassword",
          "type": "password",
          "label": "تکرار رمز",
          "placeholder": "رمز را مجدداً وارد کنید",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "passwordOptions": false,
          "validators": [
            {
              "type": "required",
              "message": "تکرار رمز الزامی است"
            },
            {
              "type": "matchField",
              "field": "password",
              "message": "رمزها مطابقت ندارند"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "phone",
          "type": "text",
          "label": "شماره تماس",
          "placeholder": "09123456789",
          "mask": "mobile",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "validators": [
            {
              "type": "required",
              "message": "شماره تماس الزامی است"
            },
            {
              "type": "mobile",
              "message": "شماره موبایل نامعتبر است"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "birthdate",
          "type": "date",
          "label": "تاریخ تولد",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "calendarType": "persian",
          "clearable": true,
          "inputFormat": "jYYYY/jMM/jDD",
          "displayFormat": "jYYYY/jMM/jDD",
          "validators": [
            {
              "type": "required",
              "message": "تاریخ تولد الزامی است"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "gender",
          "type": "radioGroup",
          "groupLabel": "جنسیت",
          "options": [
            {
              "label": "مرد",
              "value": "male"
            },
            {
              "label": "زن",
              "value": "female"
            }
          ],
          "direction": {
            "sm": "vertical",
            "md": "horizontal"
          },
          "labelPosition": {
            "sm": "top",
            "md": "right"
          },
          "validators": [
            {
              "type": "required",
              "message": "انتخاب جنسیت الزامی است"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "interests",
          "type": "checkboxGroup",
          "groupLabel": "علاقه‌مندی‌ها",
          "options": [
            {
              "label": "کتاب",
              "value": "book"
            },
            {
              "label": "سینما",
              "value": "movie"
            },
            {
              "label": "ورزش",
              "value": "sport"
            }
          ],
          "direction": {
            "sm": "vertical",
            "md": "horizontal"
          },
          "labelPosition": {
            "sm": "top",
            "lg": "right",
            "md": "right"
          },
          "validators": [
            {
              "type": "required",
              "message": "حداقل یک گزینه را انتخاب کنید"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 2
            }
          }
        },
        {
          "key": "subscribe",
          "type": "toggle",
          "label": "اشتراک خبرنامه",
          "size": "md",
          "onColor": "bg-green-500",
          "offColor": "bg-gray-300",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "phones",
          "type": "array",
          "label": "شماره‌های تماس اضطراری",
          "itemFields": [
            {
              "key": "label",
              "type": "text",
              "label": "عنوان",
              "validators": [
                {
                  "type": "required",
                  "message": "عنوان لازم است"
                }
              ],
              "layout": {
                "colSpan": {
                  "base": 1,
                  "md": 1
                }
              }
            },
            {
              "key": "number",
              "type": "text",
              "label": "شماره",
              "mask": "mobile",
              "validators": [
                {
                  "type": "required",
                  "message": "شماره لازم است"
                },
                {
                  "type": "mobile",
                  "message": "شماره معتبر نیست"
                }
              ],
              "layout": {
                "colSpan": {
                  "base": 1,
                  "md": 1
                }
              }
            }
          ],
          "minItems": 1,
          "maxItems": 5,
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 2
            }
          }
        },
        {
          "key": "country",
          "type": "select",
          "label": "کشور",
          "placeholder": "انتخاب کنید",
          "items": [
            {
              "label": "ایران",
              "value": "ir"
            },
            {
              "label": "آمریکا",
              "value": "us"
            },
            {
              "label": "فرانسه",
              "value": "fr"
            }
          ],
          "multiple": false,
          "searchable": true,
          "clearableSelect": true,
          "labelField": "label",
          "valueField": "value",
          "displayField": "",
          "validators": [
            {
              "type": "required",
              "message": "کشور را انتخاب کنید"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "avatar",
          "type": "file",
          "label": "عکس پروفایل",
          "accept": "image/*",
          "multipleFile": false,
          "maxFiles": 1,
          "maxSize": 2000000,
          "isImageUploader": true,
          "watermark": true,
          "watermarkImage": "/assets/logo.png",
          "uploadUrl": null,
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 1
            }
          }
        },
        {
          "key": "bio",
          "type": "richtext",
          "label": "درباره من",
          "placeholder": "چند خط درباره خود بنویس...",
          "validators": [
            {
              "type": "maxLength",
              "value": 500,
              "message": "حداکثر ۵۰۰ کاراکتر"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 2
            }
          }
        },
        {
          "key": "extraInfo",
          "type": "text",
          "label": "اطلاعات تکمیلی",
          "placeholder": "",
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 2
            }
          }
        }
      ],
      "_open": true
    },
    {
      "title": "سکشن دوم",
      "collapsible": true,
      "fields": [
        {
          "key": "exampleField",
          "type": "text",
          "label": "مثال فیلد",
          "placeholder": "این یک فیلد نمونه است",
          "labelPosition": {
            "base": "top",
            "md": "right"
          },
          "validators": [
            {
              "type": "required",
              "message": "این فیلد الزامی است"
            }
          ],
          "layout": {
            "colSpan": {
              "base": 1,
              "md": 2
            }
          }
        }
      ],
      "_open": true
    }
  ],
  "submitButton": {
    "text": "ثبت نهایی",
    "variant": "solid",
    "color": "primary-100",
    "pending": false
  }
}

function onValidationError({
  field,
  message,
}: {
  field: string
  message: string
}) {
  alert('خطا در فیلد «' + field + '»: ' + message)
}

async function onSubmitForm(values: Record<string, any>) {
  // TODO: منطق ارسال فرم
}
</script>