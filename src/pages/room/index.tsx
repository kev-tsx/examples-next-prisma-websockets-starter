import { useState } from "react";
import { RootLayout } from "../../components";
import clsx from "clsx";
import { useRouter } from "next/router";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { trpc } from "../../utils/trpc";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import moment from 'moment';
import Link from "next/link";
import { Navbar } from "@ui";

let timer: NodeJS.Timeout;

const Chat: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ session }) => {
  const router = useRouter();

  const { data: dataS } = useSession();
  const { register, handleSubmit, resetField } = useForm<{ text: string }>({
    mode: 'all',
    resolver: zodResolver(z.object({ text: z.string().min(1) })),
    criteriaMode: 'all',
    shouldFocusError: true,
  });

  // const [text, setText] = useState<string>('');
  const [isTyping, setStatus] = useState<'typing' | 'idle'>('idle');
  const [whoIsTyping, setWhoIsTyping] = useState<string | undefined | null>(undefined);

  const res = trpc.chat.getMsj.useQuery();
  const mutation = trpc.chat.addMsj.useMutation();
  trpc.chat.onAddMsj.useSubscription(undefined, {
    onData: () => {
      res.refetch();
    }
  });
  const status_mutation = trpc.chat.setStatus.useMutation();
  trpc.chat.onSetStatus.useSubscription(undefined, {
    onData: data => {
      setWhoIsTyping(data.whoIsTyping);
      setStatus(data.status);
    },
  });

  const handleSend: SubmitHandler<{ text: string }> = async (data) => {
    await mutation.mutateAsync(data);
    status_mutation.mutate({ status: 'idle' });
    resetField('text');
  };

  const handleMsj = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTyping === 'idle') status_mutation['mutate']({ status: 'typing', whoIsTyping: dataS?.user?.name });
    /* eslint-disable */
    if (
      // @ts-ignore
      e.nativeEvent.inputType === 'deleteContentBackward' ||
      // @ts-ignore
      e.nativeEvent.inputType === 'deleteContentForward'
    ) {
      return status_mutation.mutate({ status: 'idle' })
    }
    /* eslint-enable */
    clearTimeout(timer);
    timer = setTimeout(() => {
      status_mutation['mutate']({ status: 'idle' });
    }, 1000);
  };

  const handleAuth = () => {
    if (!session?.user) router.push('/auth/login');
  };

  const [rooms, setRooms] = useState<string[]>([
    "general"
  ]);
  const handleRoom = () => {
    setRooms(prev => [...prev, 'vips'])
  }

  return (
    <div className="flex flex-col h-screen text-white">
      <Navbar />
      <div className="flex h-screen bg-slate-500 overflow-hidden">
        <aside className="bg-slate-700 w-[15%]">
          <button
            className="border w-full rounded"
            onClick={handleRoom}
          >+</button>
          <div className="flex flex-col">
            {
              rooms.map(r => (
                <Link
                  key={r}
                  href={`/room/${r === 'general' ? '' : r}`}
                  className="hover:text-purple-500"
                >
                  #{r}
                </Link>
              ))
            }
          </div>
        </aside>
        <div className="flex flex-col justify-between overflow-hidden">
          <div className="overflow-auto">
            <div className="flex flex-col p-4">
              {res.data?.map((m) => {
                return (
                  <div
                    key={m.id}
                    /* eslint-disable */ // @ts-ignore
                    before={moment(m.createdAt).calendar()}
                    // @ts-check /* eslint-enable */
                    className={clsx(
                      "mt-4 flex", {
                      "justify-end before:content-[attr(before)] before:mr-4 before:text-slate-400 before:text-xs": m.user === session?.user?.name,
                      "after:content-[attr(before)] after:ml-4 after:text-slate-400 after:text-xs": m.user !== session?.user?.name
                    }
                    )}>
                    <div className={clsx(
                      "border rounded p-2 flex flex-col w-[50%]", {
                      "bg-blue-500 text-white": m.user === session?.user?.name
                    }
                    )}>
                      <p>{m.user}</p>
                      <div
                        ref={e => e?.scrollIntoView({ behavior: 'smooth', inline: 'start' })}
                        className="break-words"
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div
                className="absolute top-[96%]"
              >
                {whoIsTyping && `${whoIsTyping} is typing...`}
              </div>
            </div>
          </div>
          <form className="flex p-5" onSubmit={handleSubmit(handleSend)}>
            <input
              type='text'
              className={clsx(
                "outline-none black p-2.5 w-full text-gray-700 bg-gray-50 rounded-md border border-gray-700",
                { "hover:cursor-not-allowed": !session?.user }
              )}
              disabled={!session?.user}
              {...register('text', { onChange: handleMsj })}
            />
            <button
              className="flex-1 text-white bg-gray-900 p-2.5"
              type="submit"
              onClick={handleAuth}
            >{!session?.user ? 'Sign in' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { props: { session: null } }
  }

  return {
    props: {
      session: { user: session.user }
    }
  }
}

export default Chat;
