/* eslint-disable */
import { useState } from 'react';
import { getOptionsForVote } from '../utils/getRandomPokemon';
import { trpc } from '../utils/trpc';
import { RootLayout } from '../components/layouts';
import Image from 'next/image';
import { Loading } from '../components/ui/index';
import type { RouterOutputs } from '../utils/trpc';

const Home = () => {
  // trpc.ws.onHello.useSubscription(undefined, {
  //   onData: console.log
  // });
  // const mutation = trpc.hello.useMutation();

  const [{ firstId, secondId }, updateIds] = useState<{ firstId: number; secondId: number }>(() => getOptionsForVote());

  const firstPokemon = trpc.pokemon.getById.useQuery({ id: firstId });
  const secondPokemon = trpc.pokemon.getById.useQuery({ id: secondId });
  const { mutate } = trpc.pokemon.setVotes.useMutation();

  const handleVote = (selected: number, name: string) => {
    updateIds(getOptionsForVote());
    mutate({ id: selected, name });
  }

  return (
    <RootLayout>
      <h1 className="text-center">Vote</h1>
      {/* <button onClick={() => mutation.mutate()}>Say hello</button> */}
      <div className='flex justify-center items-center w-screen h-screen'>
        {
          !firstPokemon.data || !secondPokemon.data
            ? (
              <>
                <Loading position='left' />
                <Loading position='right' />
              </>
            )
            : (
              <div className='border rounded flex justify-center items-center'>
                <Pokemon pokemon={firstPokemon} vote={() => handleVote(firstId, firstPokemon.data.name)} />
                <div className='text-white'>vs</div>
                <Pokemon pokemon={secondPokemon} vote={() => handleVote(secondId, secondPokemon.data.name)} />
              </div>
            )
        }
      </div>
    </RootLayout>
  );
};

type PokemonData = { data: RouterOutputs['pokemon']['getById'] }

const Pokemon: React.FC<{ pokemon: PokemonData; vote: () => void }> = ({ pokemon, vote }) => {
  console.log({pokemon});
  return (
    <div className='flex flex-col items-center p-10'>
      <p className='capitalize'>{pokemon.data.name}</p>
      <Image src={pokemon.data.url ?? ''} alt='pokeDex' width={100} height={100} priority />
      <button className='bg-red-400/70 rounded hover:bg-red-500 transition-all w-full' onClick={vote}>Vote</button>
    </div>
  )
}

export default Home;