/* eslint-disable */
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export const Navbar = () => {
  const session = useSession();

  return (
    <nav className="flex justify-between items-center px-4 bg-red-400 rounded-b shadow-md w-screen h-10">
      <Link href="/">Home</Link>
      <div>
        <Link href="/dashboard" className='mr-4'>Dashboard</Link>
        <Link href="/room">Chat</Link>
      </div>
      <div className="flex justify-between w-[10%]">
        {
          session.status === 'unauthenticated'
            ? (
              <>
                <div>Login</div>
                <div>Register</div>
              </>
            ) : (
              <button
                className="bg-slate-400 p-1 rounded"
                onClick={() => signOut()}
              >Logout</button>
            )
        }
      </div>
    </nav>
  );
};
