export const formatCommanderWithDiscord = (profile: any, fallbackName: string = 'Commander'): string => {
  if (!profile) return fallbackName;
  const name = profile.commander_name || fallbackName;
  let discord = profile.discord_name;
  if (!discord && profile.private_profiles) {
    if (Array.isArray(profile.private_profiles)) {
      discord = profile.private_profiles[0]?.discord_name;
    } else {
      discord = profile.private_profiles.discord_name;
    }
  }
  if (discord && typeof discord === 'string' && discord.trim() !== '') {
    const formattedDiscord = `(${discord.trim()})`;
    if (name.includes(formattedDiscord)) return name;
    return `${name} ${formattedDiscord}`;
  }
  return name;
};
