import nav from "../locales/nav.js";
import landing from "../locales/landing.js";
import auth from "../locales/auth.js";
import catalog from "../locales/catalog.js";
import builder from "../locales/builder.js";
import community from "../locales/community.js";
import profile from "../locales/profile.js";
import admin from "../locales/admin.js";
import chat from "../locales/chat.js";
import misc from "../locales/misc.js";

export const LANGUAGE_KEY = "lang";
export const SUPPORTED_LANGS = ["en", "ar"];

const namespaces = [misc, nav, landing, auth, catalog, builder, community, profile, admin, chat];

const en = {};
const ar = {};
for (const ns of namespaces) {
    Object.assign(en, ns.en || {});
    Object.assign(ar, ns.ar || {});
}

export function translate(lang, key, params) {
    const table = lang === "ar" ? ar : en;
    let str = table[key] ?? en[key] ?? key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            str = str.split(`{${k}}`).join(String(v));
        }
    }
    return str;
}

export function formatNumber(lang, value) {
    if (value == null || Number.isNaN(Number(value))) return String(value ?? "");
    return Number(value).toLocaleString("en-US");
}

export function formatDate(lang, value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}