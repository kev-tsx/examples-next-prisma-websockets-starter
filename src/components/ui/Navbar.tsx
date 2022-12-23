import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-4 w-full bg-red-400 h-9 rounded-b shadow-md">
      <Link href="/">Home</Link>
      <Link href="/dashboard">Dashboard</Link>
      <div className="flex justify-between w-[10%]">
        <div>Login</div>
        <div>Register</div>
      </div>
    </nav>
  );
};
