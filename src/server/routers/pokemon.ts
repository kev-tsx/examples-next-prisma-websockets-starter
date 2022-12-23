import { publicProcedure, router } from '../trpc';
import { PokemonClient } from 'pokenode-ts';
import { z } from 'zod';
import { prisma } from '../prisma';
import EventEmitter from 'events';
import { Pokemon } from '@prisma/client';
import { observable } from '@trpc/server/observable';

interface MyEvents {
  vote: (data: Pokemon) => void;
  // isTypingUpdate: () => void;
}
declare interface MyEventEmitter {
  on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  emit<TEv extends keyof MyEvents>(
    event: TEv,
    ...args: Parameters<MyEvents[TEv]>
  ): boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyEventEmitter extends EventEmitter {}

// In a real app, you'd probably use Redis or something
const ee = new MyEventEmitter();

const api = new PokemonClient();

export const pokemonRouter = router({
  get: publicProcedure.query(async () => {
    const pokemons = await api.listPokemons(100, 100);
    return pokemons;
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const pokemon = await api.getPokemonById(input.id);
      return {
        id: pokemon.id,
        name: pokemon.name,
        url: pokemon.sprites.front_default,
      };
    }),
  setVotes: publicProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const pokemon_created = await prisma.pokemon.findFirst({
        where: { name: input.name },
      });
      if (pokemon_created) {
        const pokemon = await prisma.pokemon.update({
          where: { id: pokemon_created.id },
          data: { rate: pokemon_created.rate + 1 },
        });

        ee.emit('vote', pokemon);

        return pokemon;
      }
      const poke = await api.getPokemonById(input.id);

      const pokemon = await prisma.pokemon.create({
        data: {
          id: String(input.id),
          name: poke.name,
          url: poke.sprites.front_default ?? '',
          rate: 1,
        },
      });

      ee.emit('vote', pokemon);
      return pokemon;
    }),
  getVotes: publicProcedure.query(async () => {
    return await prisma.pokemon.findMany({
      orderBy: { rate: 'desc' },
    });
  }),
  onSetVotes: publicProcedure.subscription(() => {
    return observable<Pokemon>((emit) => {
      const onVote = (data: Pokemon) => emit.next(data);
      ee.on('vote', onVote);
      return () => {
        ee.off('vote', onVote);
      };
    });
  }),
});
