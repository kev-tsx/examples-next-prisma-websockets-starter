import React from 'react';
import { RootLayout } from '../../components';
import { trpc } from '../../utils/trpc';
import Image from 'next/image';

const Dashboard = () => {
  // const utils = trpc.useContext();
  const res = trpc.pokemon.getVotes.useQuery();
  trpc.pokemon.onSetVotes.useSubscription(undefined, {
    onData: () => {
      res.refetch();
    },
  });
  return (
    <RootLayout>
      <div className="">
        <div className="bg-dark-500 h-screen flex flex-col items-center">
          <h1>Dashboard</h1>
          <div className="">
            {
              /* eslint-disable */
              res.data?.map(p => (
                <div key={p.id} className='flex justify-evenly border-y border-x w-screen items-center'>
                  <div className='mr-2 border-r w-[50%] flex items-center'>
                    <Image src={p.url} alt='poke' width={100} height={100} priority />
                    <p className='capitalize'>{p.name}</p>
                  </div>
                  <p className='w-[30%]'>{p.rate} votes</p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default Dashboard;
