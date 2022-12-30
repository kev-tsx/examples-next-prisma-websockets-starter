import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';
import EventEmitter from 'events';
import type { Pokemon } from '@prisma/client';
import { observable } from '@trpc/server/observable';
import { TRPCError } from '@trpc/server';

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

export const pokemonRouter = router({
  get: publicProcedure.query(async () => {
    const pokemons = await prisma.pokemon.findMany({ orderBy: { id: 'desc' } });
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
            // distinct: ['votedAgainst'],
            include: { pokemonVotedFor: true, pokemonVotedAgainst: true },
          },
          votesAgainst: {
            // distinct: ['votedAgainst'],
            include: { pokemonVotedFor: true, pokemonVotedAgainst: true },
          },
        },
      });

      if(!pokemonInDB) throw new TRPCError({ code: 'NOT_FOUND' });
      
      return pokemonInDB;
    }),
  setVotes: publicProcedure
    .input(z.object({ votedFor: z.number(), votedAgainst: z.number() }))
    .mutation(async ({ input }) => {
      /* eslint-disable */
      const pokemon = await prisma.pokemon.findUnique({
        where: { id: input.votedFor },
      });

      if (!pokemon) throw new TRPCError({ code: 'NOT_FOUND' });

      const voteExist = await prisma.vote.findFirst({ where: { ...input } });
      // const voteExist = await prisma.vote.findMany({
      //   where: {
      //     ...input
      //   },
      // });

      if (voteExist) {        
        await prisma.vote.update({
          where: { id: voteExist.id },
          data: {
            count: voteExist.count + 1
          },
        })
        return { success: true };
      }

      await prisma.vote.create({
        data: {
          ...input,
        },
      });

      return { success: true };

      // const poke = await prisma.pokemon.update({
      //   where: { id: input.votedFor },
      //   data: {
      //     votesFor: { create: { votedAgainst: input.votedAgainst } },
      //     // votesAgainst: { create: { votedFor: input.votedFor } },
      //   },
      //   include: { votesFor: true, votesAgainst: true, _count: true }
      // });

      // return { success: true, vote: poke.votesFor, pokemon: poke };
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
