export type Lang = "ru" | "kz" | "en";
export type Text = [string, string, string];
export type Item = {
  id: string;
  title: Text;
  category: number;
  type: "free" | "exchange" | "sale";
  price: number;
  image: string;
  description: Text;
  owner: string;
  grade: string;
  condition: number;
  status: "available" | "pending" | "reserved" | "transferred" | "removed";
  mine?: boolean;
};
export type Booking = {
  id: string;
  itemId: string;
  status: "pending" | "confirmed" | "done" | "cancelled";
  date: string;
  place: number;
};
export const categories: Text[] = [
  ["Все категории", "Барлық санаттар", "All categories"],
  ["Учебники и книги", "Оқулықтар мен кітаптар", "Textbooks & books"],
  ["Музыкальные инструменты", "Музыкалық аспаптар", "Musical instruments"],
  ["Электроника и техника", "Электроника мен техника", "Electronics"],
  ["Наука и оборудование", "Ғылым және жабдықтар", "Science & equipment"],
  ["Спорт", "Спорт", "Sports"],
  ["Канцелярия", "Кеңсе тауарлары", "Stationery"],
  ["Одежда и аксессуары", "Киім мен аксессуарлар", "Clothing & accessories"],
  ["Другое", "Басқа", "Other"],
];
export const conditions: Text[] = [
  ["Новое", "Жаңа", "New"],
  ["Хорошее", "Жақсы", "Good"],
  ["Удовлетворительное", "Қанағаттанарлық", "Fair"],
];
export const seed: Item[] = [
  {
    id: "dombra",
    title: ["Домбра с чехлом", "Қапшығы бар домбыра", "Dombra with case"],
    category: 2,
    type: "exchange",
    price: 0,
    image: "/images/dombra.jpg",
    description: [
      "Учился играть три года. Домбра в хорошем состоянии, струны недавно заменены. Передам вместе с чехлом. Обменяю на книги или настольную игру.",
      "Үш жыл ойнауды үйрендім. Домбыра жақсы күйде, ішектері жақында ауыстырылды. Қапшығымен бірге беремін. Кітаптарға немесе үстел ойынына айырбастаймын.",
      "I played for three years. In good condition with recently replaced strings. Includes a case. Happy to exchange for books or a board game.",
    ],
    owner: "Алихан",
    grade: "10 A",
    condition: 1,
    status: "available",
  },
  {
    id: "calculator",
    title: ["Калькулятор Casio", "Casio калькуляторы", "Casio scientific calculator"],
    category: 3,
    type: "sale",
    price: 3000,
    image: "/images/calculator.jpg",
    description: [
      "Научный калькулятор Casio. Все функции работают, подойдёт для математики и физики.",
      "Casio ғылыми калькуляторы. Барлық функциялары жұмыс істейді, математика мен физикаға жарайды.",
      "A Casio scientific calculator. Fully working, great for mathematics and physics.",
    ],
    owner: "Аружан",
    grade: "11 B",
    condition: 1,
    status: "available",
  },
  {
    id: "physics",
    title: ["Книга «Физика»", "«Физика» кітабы", "The Physics Book"],
    category: 1,
    type: "free",
    price: 0,
    image: "/images/physics.jpg",
    description: [
      "Наглядная книга о физике на английском языке. Без пометок, все страницы на месте. Пусть пригодится следующему ученику!",
      "Ағылшын тіліндегі физика туралы көрнекі кітап. Белгілер жоқ, барлық беттер орнында. Келесі оқушыға пайдалы болсын!",
      "An illustrated guide to physics in English. No notes, all pages intact. Ready for the next curious student!",
    ],
    owner: "Дана",
    grade: "9 C",
    condition: 1,
    status: "available",
  },
  {
    id: "microscope",
    title: ["Учебный микроскоп", "Оқу микроскопы", "Student microscope"],
    category: 4,
    type: "exchange",
    price: 0,
    image: "/images/microscope.jpg",
    description: [
      "Микроскоп для школьных исследований. Работает отлично. Обменяю на набор для научных экспериментов.",
      "Мектеп зерттеулеріне арналған микроскоп. Жақсы жұмыс істейді. Ғылыми тәжірибе жинағына айырбастаймын.",
      "A microscope for school research. In excellent working order. Would exchange for a science experiment kit.",
    ],
    owner: "Мирас",
    grade: "10 B",
    condition: 1,
    status: "available",
  },
];
export function stored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
