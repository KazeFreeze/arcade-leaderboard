// lib/generateName.ts
const adjectives = ['Cyber', 'Robo', 'Giga', 'Mega', 'Hyper', 'Atomic', 'Cosmic', 'Galactic', 'Quantum', 'Zero'];
const nouns = ['Striker', 'Blaster', 'Hunter', 'Raptor', 'Viper', 'Shadow', 'Knight', 'Ninja', 'Phantom', 'Spectre'];

export function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${noun}${num}`;
}
