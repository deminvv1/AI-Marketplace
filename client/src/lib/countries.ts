/**
 * Country list and flag lookup.
 *
 * Split out of the old `mock-data` module: its sample projects, freelancers,
 * solutions, forum threads and conversations were left over from the pre-API
 * prototype and were no longer imported anywhere.
 */
export const COUNTRIES = [
  "Argentina","Australia","Austria","Belgium","Brazil","Canada","Chile","China","Colombia","Czech Republic",
  "Denmark","Egypt","Estonia","Finland","France","Germany","Greece","Hungary","Iceland","India",
  "Indonesia","Ireland","Israel","Italy","Japan","Kazakhstan","Kenya","Latvia","Lithuania","Luxembourg",
  "Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines",
  "Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa",
  "South Korea","Spain","Sweden","Switzerland","Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Vietnam"
];

export const FLAGS: Record<string,string> = {
  "United States":"🇺🇸","United Kingdom":"🇬🇧","Germany":"🇩🇪","France":"🇫🇷","Japan":"🇯🇵",
  "Spain":"🇪🇸","Italy":"🇮🇹","Canada":"🇨🇦","Brazil":"🇧🇷","Australia":"🇦🇺",
  "Netherlands":"🇳🇱","Sweden":"🇸🇪","Switzerland":"🇨🇭","Singapore":"🇸🇬","India":"🇮🇳",
  "Russia":"🇷🇺","South Korea":"🇰🇷","Ukraine":"🇺🇦","Poland":"🇵🇱","Israel":"🇮🇱","Mexico":"🇲🇽",
};
export const flag = (c: string) => FLAGS[c] ?? "🌐";
