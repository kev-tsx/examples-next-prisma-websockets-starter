/* eslint-disable */
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import type { GetStaticPaths, GetStaticProps, GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import React, { useEffect } from 'react';
import { appRouter } from '../../server/routers/_app';
import superjson from 'superjson';
import { prisma } from '../../server/prisma';
import { trpc } from '../../utils/trpc';
import { RootLayout } from '../../components';
import Image from 'next/image';
import clsx from 'clsx';

const Pokemon: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ id }) => {
  const res = trpc.pokemon.getById.useQuery({ id: Number(id) }, {
    // onSuccess: p => {
    //   const votes = p.votesFor.map(v => {
    //     return {
    //       vs: {

    //       }
    //     }
    //   })
    // }
  });

  return (
    <RootLayout>
      <div className='h-screen flex flex-col justify-evenly'>
        <div>
          <h1 className='text-center text-xl'>Wins</h1>
          <div className='flex'>
            {res.data?.votesFor.map(v => {
              return (
                <div key={v.id} className='flex justify-center items-center border'>
                  <div className="flex flex-col items-center">
                    <div className={clsx({ "text-red-500": v.votedFor > v.votedAgainst })}>{v.pokemonVotedFor.name}</div>
                    <Image src={v.pokemonVotedFor.url} width={200} height={200} alt='pokeF' priority />
                    <div>{v.count} votes</div>
                  </div>
                  <div>vs</div>
                  <div className="flex flex-col items-center">
                    <div className={clsx({ "text-red-500": v.votedFor < v.votedAgainst })}>{v.pokemonVotedAgainst.name}</div>
                    <Image src={v.pokemonVotedAgainst.url} width={200} height={200} alt='pokeA' priority />
                    <div>{0} votes</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <h1 className='text-center text-xl'>Lost</h1>
          <div className='flex'>
            {res.data?.votesAgainst.map(v => {
              return (
                <div key={v.id} className='flex justify-center items-center border'>
                  <div className="flex flex-col items-center">
                    <div className={clsx({ "text-red-500": v.votedFor > v.votedAgainst })}>{v.pokemonVotedAgainst.name}</div>
                    <Image src={v.pokemonVotedAgainst.url} width={200} height={200} alt='pokeF' priority />
                    <div>{0} votes</div>
                  </div>
                  <div>vs</div>
                  <div className="flex flex-col items-center">
                    <div className={clsx({ "text-red-500": v.votedFor < v.votedAgainst })}>{v.pokemonVotedFor.name}</div>
                    <Image src={v.pokemonVotedFor.url} width={200} height={200} alt='pokeA' priority />
                    <div>{v.count} votes</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </RootLayout>
  )
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pokemons = await (await prisma.pokemon.findMany({ select: { id: true } })).map(p => ({ params: { id: p.id.toString() } }));
  return {
    paths: pokemons,
    fallback: 'blocking'
  }
}

export const getStaticProps = async (ctx: GetStaticPropsContext<{ id: string }>) => {
  const id = ctx.params?.id;
  if (!id) return { redirect: { destination: '/', permanent: false, statusCode: 404 } }
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { session: null },
    transformer: superjson,
  });

  await ssg.pokemon.getById.prefetch({ id: Number(id) });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 1,
  };
};

export default Pokemon;
