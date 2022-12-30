/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';
import { PokemonClient } from 'pokenode-ts';

const prisma = new PrismaClient();
const api = new PokemonClient();

async function main() {
  const pokemons = await (await api.listPokemons(0, 493)).results.map((p, i) => ({ 
    id: i+1, 
    name: p.name, 
    url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png` }));

  await prisma.pokemon.deleteMany();

  await prisma.pokemon.createMany({
    data: [...pokemons]
  })
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
