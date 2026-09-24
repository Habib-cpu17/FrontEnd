export const Achievements = {
    FIRST_BUILD:      { labelKey: "profile.ach.firstBuild",         descKey: "profile.ach.firstBuildDesc",         icon: "spark", color: "#22d3ee" },
    BUILDER:          { labelKey: "profile.ach.builder",           descKey: "profile.ach.builderDesc",           icon: "cube",  color: "#8b2ff7" },
    ARCHITECT:        { labelKey: "profile.ach.architect",         descKey: "profile.ach.architectDesc",         icon: "grid",  color: "#ff1e79" },
    ENTHUSIAST:       { labelKey: "profile.ach.enthusiast",        descKey: "profile.ach.enthusiastDesc",        icon: "flame", color: "#f59e0b" },
    PUBLIC_VOICE:     { labelKey: "profile.ach.publicVoice",       descKey: "profile.ach.publicVoiceDesc",       icon: "megaphone", color: "#10b981" },
    COMMUNITY_SHARER: { labelKey: "profile.ach.communitySharer",   descKey: "profile.ach.communitySharerDesc",   icon: "users", color: "#06b6d4" },
    COMMENTATOR:      { labelKey: "profile.ach.commentator",       descKey: "profile.ach.commentatorDesc",       icon: "chat",  color: "#a855f7" },
    WELL_KNOWN:       { labelKey: "profile.ach.wellKnown",         descKey: "profile.ach.wellKnownDesc",         icon: "star",  color: "#f97316" },
    SITE_ADMIN:       { labelKey: "profile.ach.siteAdmin",         descKey: "profile.ach.siteAdminDesc",         icon: "shield", color: "#ef4444" },
};

export function getAchievement(key, t) {
    const a = Achievements[key];
    if (!a) return { label: t ? t("profile.ach.unknown") : key, desc: "", icon: "spark", color: "#8b2ff7" };
    const translate = t || ((s) => s);
    return { ...a, label: translate(a.labelKey), desc: translate(a.descKey) };
}

export const ACHIEVEMENT_ICONS = {
    spark: <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />,
    cube:  <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    grid:  <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    megaphone: <><path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 5a1 1 0 0 0 1.7-.6V5.6a1 1 0 0 0-1.7-.6L6 10H4a1 1 0 0 0-1 1z" /><path d="M16 6s2 1.5 2 6-2 6-2 6" /><path d="M20 4s4 3 4 8-4 8-4 8" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chat:  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    star:  <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
};