/* eslint-disable */
import { useState } from 'react';
import { getOptionsForVote } from '../utils/getRandomPokemon';
import { trpc } from '../utils/trpc';
import { RootLayout } from '../components/layouts';
import Image from 'next/image';
import { Loading } from '../components/ui/index';
import type { RouterOutputs } from '../utils/trpc';

type Voted = { voted: number; notVoted: number };

const Home = () => {
  const [{ firstId, secondId }, updateIds] = useState<{ firstId: number; secondId: number }>(() => getOptionsForVote());

  const firstPokemon = trpc.pokemon.getById.useQuery({ id: firstId });
  const secondPokemon = trpc.pokemon.getById.useQuery({ id: secondId });
  const { mutate } = trpc.pokemon.setVotes.useMutation();

  const handleVote = (selected: number, name: string) => {
    updateIds(getOptionsForVote());
    const pokeVoted = (): Voted => selected === firstId 
      ? { voted: firstId, notVoted: secondId } : { voted: secondId, notVoted: firstId };
    mutate({ votedFor: pokeVoted().voted, votedAgainst: pokeVoted().notVoted });
  };

  return (
    <RootLayout>
      <div className='flex flex-col justify-center items-center w-screen h-screen'>
        <h1 className="text-center mb-5">Who's the most rounder?</h1>
        {
          !firstPokemon.data || !secondPokemon.data
            ? (
              <div className='flex'>
                <Loading position='left' />
                <Loading position='right' />
              </div>
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
  return (
    <div className='flex flex-col items-center p-10'>
      <p className='capitalize'>{pokemon.data.name}</p>
      <Image src={pokemon.data.url ?? ''} alt='pokeDex' width={100} height={100} priority />
      <button className='bg-red-400/70 rounded hover:bg-red-500 transition-all w-full' onClick={vote}>Vote</button>
    </div>
  )
}

export default Home;