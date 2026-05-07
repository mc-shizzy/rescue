export interface AvatarCategory {
  label: string
  avatars: string[]
}

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    label: "Adventurers",
    avatars: [
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Jasper&backgroundColor=d1d4f9",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Titan&backgroundColor=ffdfba",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka&backgroundColor=c0aede",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Orion&backgroundColor=b6e3f4",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Lyra&backgroundColor=ffd5dc",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Drake&backgroundColor=d1d4f9",
    ],
  },
  {
    label: "Characters",
    avatars: [
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Midnight&backgroundColor=0ea5e9",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Shadow&backgroundColor=e11d48",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Storm&backgroundColor=8b5cf6",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Phoenix&backgroundColor=f97316",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Viper&backgroundColor=10b981",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Blaze&backgroundColor=f59e0b",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Nova&backgroundColor=ec4899",
      "https://api.dicebear.com/9.x/avataaars/svg?seed=Rex&backgroundColor=6366f1",
    ],
  },
  {
    label: "Artistic",
    avatars: [
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Sage&backgroundColor=b6e3f4",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Nova&backgroundColor=ffd5dc",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Echo&backgroundColor=d1d4f9",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Blaze&backgroundColor=ffdfba",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Aria&backgroundColor=c0aede",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Cleo&backgroundColor=b6e3f4",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Iris&backgroundColor=ffd5dc",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Zara&backgroundColor=d1d4f9",
    ],
  },
  {
    label: "Robots",
    avatars: [
      "https://api.dicebear.com/9.x/bottts/svg?seed=R2D2&backgroundColor=0ea5e9",
      "https://api.dicebear.com/9.x/bottts/svg?seed=C3PO&backgroundColor=f97316",
      "https://api.dicebear.com/9.x/bottts/svg?seed=Wall-E&backgroundColor=8b5cf6",
      "https://api.dicebear.com/9.x/bottts/svg?seed=HAL&backgroundColor=e11d48",
      "https://api.dicebear.com/9.x/bottts/svg?seed=Data&backgroundColor=10b981",
      "https://api.dicebear.com/9.x/bottts/svg?seed=Borg&backgroundColor=6366f1",
      "https://api.dicebear.com/9.x/bottts/svg?seed=Unit7&backgroundColor=f59e0b",
      "https://api.dicebear.com/9.x/bottts/svg?seed=Nexus&backgroundColor=ec4899",
    ],
  },
  {
    label: "Minimalist",
    avatars: [
      "https://api.dicebear.com/9.x/notionists/svg?seed=Ace&backgroundColor=c0aede",
      "https://api.dicebear.com/9.x/notionists/svg?seed=Rex&backgroundColor=b6e3f4",
      "https://api.dicebear.com/9.x/notionists/svg?seed=Max&backgroundColor=ffd5dc",
      "https://api.dicebear.com/9.x/notionists/svg?seed=Zara&backgroundColor=d1d4f9",
      "https://api.dicebear.com/9.x/notionists/svg?seed=Kai&backgroundColor=ffdfba",
      "https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=c0aede",
      "https://api.dicebear.com/9.x/notionists/svg?seed=Maya&backgroundColor=b6e3f4",
      "https://api.dicebear.com/9.x/notionists/svg?seed=Finn&backgroundColor=ffd5dc",
    ],
  },
  {
    label: "Fun",
    avatars: [
      "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Cool&backgroundColor=ffdfba",
      "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Happy&backgroundColor=65c9ff",
      "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Chill&backgroundColor=c0aede",
      "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Wink&backgroundColor=ffd5dc",
      "https://api.dicebear.com/9.x/big-smile/svg?seed=Star&backgroundColor=ffd5dc",
      "https://api.dicebear.com/9.x/big-smile/svg?seed=Flash&backgroundColor=65c9ff",
      "https://api.dicebear.com/9.x/big-smile/svg?seed=Sunny&backgroundColor=ffdfba",
      "https://api.dicebear.com/9.x/big-smile/svg?seed=Ziggy&backgroundColor=c0aede",
    ],
  },
]

export const AVATAR_OPTIONS = AVATAR_CATEGORIES.flatMap((c) => c.avatars)

export default AVATAR_OPTIONS
