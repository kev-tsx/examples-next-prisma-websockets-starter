/* eslint-disable */
const MAX_ID = 5;

export const getRandomPokemon = (notThisOne?: number): number => {  
  const pokeId = Math.floor(Math.random() * MAX_ID + 1);
  if(pokeId !== notThisOne) return pokeId;
  return getRandomPokemon(notThisOne);
};

export const getOptionsForVote = (): {firstId: number; secondId: number} => {
  const firstId = getRandomPokemon();
  const secondId = getRandomPokemon(firstId);

  return { firstId, secondId };
};