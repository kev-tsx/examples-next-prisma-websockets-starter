import { publicProcedure, router } from '../trpc';
import { PokemonClient } from 'pokenode-ts';
import { z } from 'zod';
import { prisma } from '../prisma';
import EventEmitter from 'events';
import type { Pokemon } from '@prisma/client';
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
      const pokemonInDB = await prisma.pokemon.findUnique({
        where: { ...input },
        include: {
          _count: true,
          votesFor: {
            distinct: ['votedAgainst'],
            include: { pokemonVotedFor: true, pokemonVotedAgainst: true },
          },
        },
      });
      // pokemonInDB?.votesFor.map(p => p.pokemonV)
      if (pokemonInDB)
        return {
          id: pokemonInDB.id,
          name: pokemonInDB.name,
          url: pokemonInDB.url,
          votesFor: pokemonInDB.votesFor,
          _count: pokemonInDB._count,
        };
      const pokemon = await api.getPokemonById(input.id);
      return {
        id: pokemon.id,
        name: pokemon.name,
        url: pokemon.sprites.front_default,
        votesFor: [],
        _count: { vote: 0 },
      };
    }),
  setVotes: publicProcedure
    .input(z.object({ votedFor: z.number(), votedAgainst: z.number() }))
    .mutation(async ({ input }) => {
      /* eslint-disable */
      const pokemon = await prisma.pokemon.findUnique({
        where: { id: input.votedFor },
      });
      if (pokemon) {
        // {
        //   // const voteExist = await prisma.vote.findFirst({
        // //   where: {
        // //     ...input
        // //   },
        // // })
        // // if(voteExist) {
        // //   await prisma.pokemon.update({
        // //     where: { id: input.votedFor },
        // //     data: {

        // //     }
        // //   });
        // // }
        // }
        await prisma.pokemon.update({
          where: { id: input.votedFor },
          data: {
            ...input
          }
        });
        return { success: true };
      }
      const { name, sprites: { front_default }} = await api.getPokemonById(input.votedFor);
      
      const poke = await prisma.pokemon.create({
        data: {
          id: input.votedFor,
          name,
          url: front_default ?? '',
          votesFor: { create: { ...input } },
        },
        include: { votesFor: true },
      });

      return { success: true, vote: poke.votesFor, pokemon };
      // const pokemon_created = await prisma.pokemon.findFirst({
      //   where: { name: input.name },
      // });
      // if (pokemon_created) {
      //   const pokemon = await prisma.pokemon.update({
      //     where: { id: pokemon_created.id },
      //     data: { rate: pokemon_created.rate + 1 },
      //   });

      //   ee.emit('vote', pokemon);

      //   return pokemon;
      // }
      // const poke = await api.getPokemonById(input.votedFor);

      // const pokemon = await prisma.pokemon.create({
      //   data: {
      //     id: String(input.id),
      //     name: poke.name,
      //     url: poke.sprites.front_default ?? '',
      //     rate: 1,
      //   },
      // });

      // ee.emit('vote', pokemon);
      // return pokemon;
    }),
  getVotes: publicProcedure.query(async () => {
    const votes = await prisma.pokemon.findMany({
      orderBy: {
        votesFor: { _count: 'desc' },
      },
      include: { votesFor: true, votesAgainst: true, _count: true },
    });

    return votes;
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
