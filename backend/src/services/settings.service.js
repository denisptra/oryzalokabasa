const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SettingsService {
  // SAVE SETTING - Simpan atau update setting (upsert by key)
  async saveSetting(data) {
    const { key, value } = data;

    // Validasi input
    if (!key || !value) {
      throw new Error("Field key dan value tidak boleh kosong");
    }

    // Validasi key format (alphanumeric, underscore, hyphen)
    const keyRegex = /^[a-z0-9_-]+$/i;
    if (!keyRegex.test(key)) {
      throw new Error(
        "Key hanya boleh mengandung huruf, angka, underscore, dan hyphen",
      );
    }

    // Cek apakah setting sudah ada
    const existing = await prisma.setting.findUnique({
      where: { key },
    });

    let setting;

    if (existing) {
      // Update yang ada
      setting = await prisma.setting.update({
        where: { key },
        data: { value },
      });
    } else {
      // Buat baru
      setting = await prisma.setting.create({
        data: { key, value },
      });
    }

    return setting;
  }

  // GET ALL SETTINGS - Ambil semua setting
  async getAllSettings() {
    const settings = await prisma.setting.findMany({
      orderBy: {
        key: "asc",
      },
    });

    return settings;
  }

  // GET SETTING BY KEY - Ambil satu setting
  async getSettingByKey(key) {
    if (!key) {
      throw new Error("Key tidak boleh kosong");
    }

    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new Error(`Setting dengan key '${key}' tidak ditemukan`);
    }

    return setting;
  }

  // GET MULTIPLE SETTINGS - Ambil beberapa setting sekaligus
  async getMultipleSettings(keys) {
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      throw new Error("Keys harus berupa array dengan minimal 1 item");
    }

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    // Format response sebagai object key-value untuk kemudahan
    const result = {};
    settings.forEach((setting) => {
      result[setting.key] = setting.value;
    });

    return result;
  }

  // DELETE SETTING - Hapus satu setting
  async deleteSetting(key) {
    if (!key) {
      throw new Error("Key tidak boleh kosong");
    }

    // Validasi setting ada
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new Error(`Setting dengan key '${key}' tidak ditemukan`);
    }

    await prisma.setting.delete({
      where: { key },
    });

    return true;
  }

  // RESET ALL SETTINGS - Hapus semua setting
  async resetAllSettings() {
    const result = await prisma.setting.deleteMany();

    return result.count;
  }

  // GET SETTINGS SUMMARY - Ringkasan setting untuk frontend
  // Fetch common settings yang biasa dibutuhkan frontend
  async getSettingsSummary() {
    // Daftar key yang umum dibutuhkan frontend
    const commonKeys = [
      "blog_title",
      "blog_description",
      "blog_logo",
      "blog_favicon",
      "footer_text",
      "footer_copyright",
      "contact_email",
      "contact_phone",
      "address",
      "social_facebook",
      "social_instagram",
      "social_twitter",
      "social_youtube",
      "google_analytics",
    ];

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: commonKeys,
        },
      },
    });

    // Format sebagai object
    const result = {};
    settings.forEach((setting) => {
      result[setting.key] = setting.value;
    });

    // Set default values jika tidak ada
    const defaults = {
      blog_title: "Oryza Lokabasah",
      blog_description: "Blog tentang teknologi dan informasi manarik",
      footer_copyright: "© 2024 Oryza Lokabasah. All rights reserved.",
    };

    // Merge dengan defaults
    return { ...defaults, ...result };
  }
}

module.exports = new SettingsService();
