import bannerDates from "./en_banners.json";

export function getCurrentBanner() {
    let latestBanner = bannerDates[0];
    for (let i = 1; i < bannerDates.length; i++) {
        if (bannerDates[i].en_start_date > latestBanner.en_start_date) {
            latestBanner = bannerDates[i];
        }
    }
    return latestBanner;
}

export function calculateAcceleration() {
    const JP_LAUNCH = 1614124800
    const EN_LAUNCH = 1750896000
    let latestBanner = getCurrentBanner();

    return (latestBanner.en_end_date - EN_LAUNCH) / (latestBanner.jp_end_date - JP_LAUNCH);
}