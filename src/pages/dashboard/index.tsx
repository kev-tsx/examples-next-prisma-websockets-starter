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
      <div className="bg-dark-500 h-screen flex flex-col items-center overflow-auto">
        <h1>Dashboard</h1>
        <div>
          {
            res.data?.map(p => {
              if (p._count.votesFor > 0) {

                return (
                  <div key={p.id} className='flex justify-evenly border-y border-x w-screen items-center'>
                    <div className='mr-2 border-r w-[50%] flex items-center'>
                      <Image src={p.url} alt='poke' width={100} height={100} priority />
                      <Link href={`/pokemon/${p.id}`} className='capitalize hover:text-blue-500 transition-all'>{p.name}</Link>
                    </div>
                    <p className='w-[30%]'>{
                      p.votesFor.reduce((prev, current) => prev + current.count, 0)
                    } votes</p>
                  </div>
                )
              }
            }
            )
          }
        </div>
      </div>
    </RootLayout>
  );
};

export default Dashboard;
