import React from 'react';
import { RootLayout } from '../../components';
import { trpc } from '../../utils/trpc';
import Image from 'next/image';
import Link from 'next/link';

const Dashboard = () => {
  // const utils = trpc.useContext();
  const res = trpc.pokemon.getVotes.useQuery();
  // trpc.pokemon.onSetVotes.useSubscription(undefined, {
  //   onData: () => {
  //     res.refetch();
  //   },
  // });
  return (
    <RootLayout>
      <div className="bg-dark-500 h-screen flex flex-col items-center">
        <h1>Dashboard</h1>
        <div>
          {
            /* eslint-disable */
            // res.data?.map(p => (
            //   <div key={p.id}>
            //     <div className='border mb-2'>{p.name}
            //       {
            //         p.vote.map(v => (
            //           <div className='flex'>
            //             <p className='mr-4'>{v.votedFor}</p>
            //             <p>{v.votedAgainst}</p>
            //           </div>
            //         ))
            //       }
            //     </div>
            //   </div>
            // ))
          }
        </div>
        <div className="">
          {
            /* eslint-disable */
            res.data?.map(p => (
              <div key={p.id} className='flex justify-evenly border-y border-x w-screen items-center'>
                <div className='mr-2 border-r w-[50%] flex items-center'>
                  <Image src={p.url} alt='poke' width={100} height={100} priority />
                  <Link href={`/pokemon/${p.id}`} className='capitalize hover:text-blue-500 transition-all'>{p.name}</Link>
                </div>
                <p className='w-[30%]'>{p._count.votesFor} votes</p>
              </div>
            ))
          }
        </div>
      </div>
    </RootLayout>
  );
};

export default Dashboard;
