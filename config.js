// BC Track Hub settings.
// Paste your Supabase project's URL and anon (public) key here.
// Find them in Supabase: Project Settings > API.
// The anon key is meant to be public. The database rules decide who can save.
window.HUB_CONFIG = {
  url: "YOUR_SUPABASE_URL",          // e.g. https://abcdefghijk.supabase.co
  anonKey: "YOUR_SUPABASE_ANON_KEY",
  publicInitials: false              // true = show "Lillian W." to anyone not signed in as a coach
};
