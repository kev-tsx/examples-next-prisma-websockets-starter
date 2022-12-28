/* eslint-disable */
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, useSession } from 'next-auth/react';

const schema = z.object({
  email: z.string().min(1), name: z.string().min(1), password: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

const LoginPage = () => {
  const session = useSession();
  const { register, formState: { errors }, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'all',
    shouldFocusError: true,
  });

  const handleAuth: SubmitHandler<FormValues> = async (data) => {
    const res = await signIn('credentials', { redirect: false, callbackUrl: '/room', ...data });
    console.log(res)
    console.log(res?.error)
    // console.log(session)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(handleAuth)} className='flex flex-col justify-center items-center'>
        <label className='text-gray-400'>
          <p>Email</p>
          <input className="bg-gray-400 rounded text-white" {...register('email')} />
        </label>
        <label className='text-gray-400'>
          <p>Name</p>
          <input className="bg-gray-400 rounded text-white"  {...register('name')} />
        </label>
        <label className='text-gray-400'>
          <p>Password</p>
          <input className="bg-gray-400 rounded text-white"  {...register('password')} />
        </label>

        <button className='bg-red-400 mt-2 rounded p-1 text-white'>Login</button>
      </form>
    </div>
  )
}

export default LoginPage