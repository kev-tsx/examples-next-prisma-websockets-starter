/* eslint-disable */

import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { prisma } from "../prisma";
import { TRPCError } from "@trpc/server";
import EventEmitter from 'events';
import type { Msj } from '@prisma/client';
import { observable } from '@trpc/server/observable';

type Status = 'typing' | 'idle'
type EventData = { status: Status; whoIsTyping?: string | null }

interface MyEvents {
  chat: (data: Msj) => void;
  isTypingUpdate: (data: EventData) => void;
}
declare interface MyEventEmitter {
  on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  emit<TEv extends keyof MyEvents>(
    event: TEv,
    ...args: Parameters<MyEvents[TEv]>
  ): boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyEventEmitter extends EventEmitter {}

// In a real app, you'd probably use Redis or something
const ee = new MyEventEmitter();

export const chatRouter = router({
  addMsj: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      if(!user) throw new TRPCError({ message: 'Can\'t send a msj without authenticate', code: 'UNAUTHORIZED' })
      const msj = await prisma.msj.create({
        data: {
          ...input, user: user.name as string
        },
      }) as Msj;

      ee.emit('chat', msj)

      return msj;
    }),
  getMsj: publicProcedure.query(async () => {
    const msjs = await prisma.msj.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return msjs;
    }),
  setStatus: publicProcedure
    .input(z.object({ status: z.enum(['typing', 'idle']), whoIsTyping: z.string().min(1).nullish() }))
    .mutation(async ({ input, ctx }) => {
      ee.emit('isTypingUpdate', input)
      return { status: input.status, whoIsTyping: input.whoIsTyping }
    }),
  // getStatus: publicProcedure.query(),
  onSetStatus: publicProcedure.subscription(async () => {
    return observable<EventData>((emit) => {
      const onSetStatus = (data: EventData) => {
        emit.next(data)
      }
      
      ee.on('isTypingUpdate', onSetStatus);

      return () => ee.off('isTypingUpdate', onSetStatus);
    })
  }),    
  onAddMsj: publicProcedure.subscription(async () => {
    return observable<Msj>((emit) => {
      const onAddMsj = (data: Msj) => {
        emit.next(data);
      }

      ee.on('chat', onAddMsj);

      return () => ee.off('chat', onAddMsj)
    })
  })
})