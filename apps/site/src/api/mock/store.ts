// In-memory demo data store — no database, no auth.
// Everything lives in the server process and resets on cold start.
// Shapes mirror the old drizzle rows so the web client keeps working unchanged.

export type Text3 = [string, string, string];

export interface MockUser {
  id: string;
  name: string;
  email: string;
}

export interface ListingRow {
  id: string;
  ownerId: string | null;
  ownerName: string;
  grade: string;
  title: Text3;
  description: Text3;
  category: number;
  condition: number;
  type: string;
  price: number;
  image: string;
  status: string;
  demo: boolean;
  createdAt: number;
}

export interface ProfileRow {
  userId: string;
  school: string;
  grade: string;
  role: string;
}

export interface FavoriteRow {
  id: string;
  userId: string;
  itemId: string;
}

export interface ReservationRow {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  date: string;
  place: string;
  status: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  createdAt: number;
}

export interface HistoryRow {
  id: string;
  itemId: string;
  kind: string;
  createdAt: number;
}

export interface ConversationRow {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  buyerReadAt: number;
  sellerReadAt: number;
  createdAt: number;
}

export interface MessageRow {
  id: string;
  chatId: string;
  senderId: string;
  body: string;
  image: string | null;
  createdAt: number;
}

/** The single demo account every request is treated as. */
export const mockUser: MockUser = {
  id: "u-guest",
  name: "Гость",
  email: "guest@mura.kz",
};

/** Seed listings shown in the catalog. */
const seed: ListingRow[] = [
  {
    id: "dombra",
    ownerId: null,
    ownerName: "Алихан",
    grade: "10 A",
    title: ["Домбра с чехлом", "Қапшығы бар домбыра", "Dombra with case"],
    description: [
      "Учился играть три года. Домбра в хорошем состоянии, струны недавно заменены. Передам вместе с чехлом.",
      "Үш жыл ойнауды үйрендім. Домбыра жақсы күйде, ішектері жақында ауыстырылды. Қапшығымен бірге беремін.",
      "Played for three years. Good condition, recently restrung. Comes with a case.",
    ],
    category: 2,
    condition: 1,
    type: "exchange",
    price: 0,
    image: "/images/dombra.jpg",
    status: "available",
    demo: true,
    createdAt: 1791806400000,
  },
  {
    id: "calculator",
    ownerId: null,
    ownerName: "Аружан",
    grade: "11 B",
    title: ["Калькулятор Casio", "Casio калькуляторы", "Casio scientific calculator"],
    description: [
      "Научный калькулятор Casio. Все функции работают, подойдёт для математики и физики.",
      "Casio ғылыми калькуляторы. Барлық функциялары жұмыс істейді.",
      "A Casio scientific calculator. Fully working, great for maths and physics.",
    ],
    category: 3,
    condition: 1,
    type: "sale",
    price: 3000,
    image: "/images/calculator.jpg",
    status: "available",
    demo: true,
    createdAt: 1791806340000,
  },
  {
    id: "physics",
    ownerId: null,
    ownerName: "Дана",
    grade: "9 C",
    title: ["Книга «Физика»", "«Физика» кітабы", "The Physics Book"],
    description: [
      "Наглядная книга о физике на английском языке. Без пометок, все страницы на месте.",
      "Ағылшын тіліндегі физика туралы көрнекі кітап. Белгілер жоқ.",
      "An illustrated physics book in English. No notes, all pages intact.",
    ],
    category: 1,
    condition: 1,
    type: "free",
    price: 0,
    image: "/images/physics.jpg",
    status: "available",
    demo: true,
    createdAt: 1791806280000,
  },
  {
    id: "microscope",
    ownerId: null,
    ownerName: "Мирас",
    grade: "10 B",
    title: ["Учебный микроскоп", "Оқу микроскопы", "Student microscope"],
    description: [
      "Микроскоп для школьных исследований. Работает отлично.",
      "Мектеп зерттеулеріне арналған микроскоп. Жақсы жұмыс істейді.",
      "A microscope for school research. Works perfectly.",
    ],
    category: 4,
    condition: 1,
    type: "exchange",
    price: 0,
    image: "/images/microscope.jpg",
    status: "available",
    demo: true,
    createdAt: 1791806220000,
  },
];

export const store = {
  users: [mockUser] as MockUser[],
  listings: [...seed] as ListingRow[],
  profiles: [] as ProfileRow[],
  favorites: [] as FavoriteRow[],
  reservations: [] as ReservationRow[],
  history: [] as HistoryRow[],
  conversations: [] as ConversationRow[],
  messages: [] as MessageRow[],
};

export function findUser(id: string): MockUser | undefined {
  return store.users.find((u) => u.id === id);
}

/** The account used for the current request. */
export function currentUser(): MockUser {
  return store.users[0];
}

export function uid(): string {
  return crypto.randomUUID();
}
