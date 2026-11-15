/** Creator-facing identity. Keep the existing saved key so current visitors keep their bookmarks. */
export const guideConfig = {
  id: 'edas-new-york',
  title: "Eda's Travel Guide",
  creator: 'Eda',
  city: 'New York',
  signature: 'NEW YORK, WITH LOVE',
  savedStorageKey: 'edas-new-york:saved:v1',
  creatorInvite: {
    eyebrow: 'A LITTLE CITY, ALL YOUR OWN',
    heading: 'Your city. Your favorite spots.',
    description: "Have a list you’re always sending friends? I’m exploring a way to turn it into a little world they can wander through, like this one.",
  },
} as const;
