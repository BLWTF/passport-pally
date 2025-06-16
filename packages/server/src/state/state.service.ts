/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { uniqueId } from 'lodash';
import GeminiService from 'src/gemini/gemini.service';
import { State } from 'src/types/users';
import {
  AnyActorRef,
  assign,
  createActor,
  EventObject,
  fromCallback,
  log,
  setup,
  stopChild,
} from 'xstate';

@Injectable()
export default class StateService {
  constructor(private readonly geminiService: GeminiService) {
    this.appActor = createActor(this.stateMachine);
    this.appActor.start();
  }

  initUser(id: string) {
    const actor = this.activeUser(id);
    if (!actor) {
      this.appActor.send({ type: 'USER_INIT', id });
    }
  }

  activeUser(id: string) {
    const actor = this.activeUsers()[id];
    return actor;
  }

  activeUsers(): Record<string, AnyActorRef> {
    return this.appActor.getSnapshot().children;
  }

  appActor: AnyActorRef;

  private stateMachine = setup({}).createMachine({
    on: {
      USER_INIT: {
        actions: [
          assign({
            ref: ({ spawn, event }) =>
              spawn(this.userMachine, { id: event.id, systemId: event.id }),
          }),
          log(({ event }) => `${event.id} init`),
        ],
      },
    },
  });

  private generatePassport = fromCallback<
    EventObject,
    { image: Express.Multer.File }
  >(({ input, sendBack, self }) => {
    this.geminiService
      .generateImageFromTextAndImage(input.image)
      .then((imageString) =>
        sendBack({
          type: 'GENERATION_COMPLETE',
          requestId: self.id,
          photo: imageString,
        }),
      )
      .catch((error) => {
        sendBack({
          type: 'GENERATION_ERROR',
          requestId: self.id,
          error,
        });
      });
  });

  // private generatePassport = fromPromise<
  //   void,
  //   { image: Express.Multer.File; parentId: string }
  // >(async ({ input, system, self }) => {
  //   const parent = system.get(input.parentId) as AnyActorRef;

  //   try {
  //     const imageString =
  //       await this.geminiService.generateImageFromTextAndImage(input.image);

  //     parent.send({
  //       type: 'GENERATION_COMPLETE',
  //       requestId: self.id,
  //       photo: imageString,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     parent.send({
  //       type: 'GENERATION_ERROR',
  //       requestId: self.id,
  //       error,
  //     });
  //   }
  // });

  private userMachine = setup({
    actors: { generatePassport: this.generatePassport },
    actions: {},
    types: {
      context: {} as State,
    },
  }).createMachine({
    id: 'passportPhoto',
    context: {
      userPhoto: null,
      generatedPhotos: [],
      generationRequests: [],
      error: null,
      selectedPhoto: null,
      parameters: {
        backgroundColor: '#FFFFFF',
        facePosition: 'centered',
        photoSize: '2x2', // inches
        countryFormat: 'US',
      },
    },
    on: {
      ADJUST_PARAMETERS: {
        actions: assign({
          parameters: ({ context, event }) => ({
            ...context.parameters,
            ...event.parameters,
          }),
        }),
      },
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          UPLOAD_PHOTO: {
            target: 'photoUploaded',
            actions: assign({
              userPhoto: ({ event }) => event.photo,
              error: null,
            }),
          },
        },
      },
      photoUploaded: {
        on: {
          GENERATE_PHOTO: {
            target: 'generating',
          },
          UPLOAD_PHOTO: {
            target: 'photoUploaded',
            actions: assign({
              userPhoto: ({ event }) => event.photo,
            }),
          },
          RESET: {
            target: 'idle',
            actions: assign({
              userPhoto: null,
              error: null,
            }),
          },
        },
      },
      generating: {
        initial: 'generationStart',
        states: {
          generationStart: {
            entry: assign({
              generationRequests: ({ context, spawn }) => {
                const newRequests: any[] = [];
                for (let i = 0; i < 5; i++) {
                  const requestId = `req-${Date.now()}-${uniqueId()}`;
                  const requestActor = spawn('generatePassport', {
                    id: requestId,
                    input: { image: context.userPhoto! },
                  });
                  newRequests.push({ id: requestId, actor: requestActor });
                }

                return [...context.generationRequests, ...newRequests];
              },
              error: null,
            }),
          },
          generationComplete: {
            guard: ({ context }) => {
              return context.generationRequests.length === 0;
            },
            on: {
              SELECT_PHOTO: {
                actions: assign({
                  selectedPhoto: ({ event }) => event.photo,
                }),
              },
              GENERATE_ANOTHER: {
                target: 'generationStart',
              },
              DOWNLOAD_PHOTO: {},
            },
          },
          generationError: {
            entry: log(''),
            guard: ({ context }) => {
              return (
                context.generationRequests.length === 0 &&
                context.generatedPhotos.length === 0
              );
            },
          },
          generationReset: {
            entry: assign({
              userPhoto: null,
              generatedPhotos: [],
              selectedPhoto: null,
              error: null,
            }),
            target: 'idle',
          },
        },
        on: {
          GENERATION_COMPLETE: {
            actions: [
              stopChild(({ event }) => event.requestId),
              assign({
                generatedPhotos: ({ context, event }) => [
                  ...context.generatedPhotos,
                  { id: event.requestId, data: event.photo },
                ],
                generationRequests: ({ context, event }) =>
                  context.generationRequests.filter(
                    (req) => req.id !== event.requestId,
                  ),
              }),
            ],
            target: '.generationComplete',
          },
          GENERATION_ERROR: {
            actions: [
              assign({
                error: ({ event }) => event.error,
                generationRequests: ({ context, event }) =>
                  context.generationRequests.filter(
                    (req) => req.id !== event.requestId,
                  ),
              }),
              log(({ event }) => `Error: ${event.error}`),
            ],
            target: '.generationError',
          },
          CANCEL_GENERATION: {
            actions: assign({
              generationRequests: ({ context, event }) => {
                if (event.requestId) {
                  return context.generationRequests.filter(
                    (req) => req.id !== event.requestId,
                  );
                }
                return [];
              },
            }),
            target: 'photoUploaded',
            guard: ({ context }) => context.generationRequests.length === 0,
          },
        },
        // always: {
        //   target: 'photoUploaded',
        //   guard: ({ context }) => context.generationRequests.length === 0,
        // },
      },
    },
  });
}
