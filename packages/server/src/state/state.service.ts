/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { uniqueId } from 'lodash';
import AiService from 'src/ai/ai.service';
import { State } from 'src/types/users';
import { Repository } from 'typeorm';
import {
  AnyActorRef,
  assign,
  createActor,
  EventObject,
  fromCallback,
  fromPromise,
  log,
  setup,
  stopChild,
} from 'xstate';
import AppStateEntity from './state.entity';
import { InjectRepository } from '@nestjs/typeorm';
import UserService from 'src/user/user.service';

@Injectable()
export default class StateService implements OnModuleInit {
  constructor(
    @InjectRepository(AppStateEntity)
    private readonly appStateRepository: Repository<AppStateEntity>,
    private readonly aiService: AiService,
    private readonly userService: UserService,
  ) {}

  onModuleInit() {
    this.appActor = createActor(this.stateMachine);
    this.appActor.start();
  }

  async persistState() {
    const state = JSON.stringify(this.appActor.getPersistedSnapshot());
    await this.saveAppState(state);
  }

  async getAppState() {
    const state = (await this.appStateRepository.findOne({ where: { id: 1 } }))
      ?.state;

    return state;
  }

  async saveAppState(state: string) {
    await this.appStateRepository.upsert({ id: 1, state }, ['id']);
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

  private initializeUsers = fromPromise(async ({ self }) => {
    const ids = await this.userService.getUserIds();
    self._parent!.send({ type: 'INIT_USERS', ids });
  });

  private stateMachine = setup({
    actors: { initializeUsers: this.initializeUsers },
  }).createMachine({
    id: 'main',
    context: {
      prompt: `Create a realistic, studio-quality passport photograph using the provided face. 
      
      Use the following exact specifications and constraints:

      1. Composition & Layout:

      The subject’s face must be centered and occupy 70–80% of the photo height.

      Head is facing forward with a neutral expression and closed mouth.

      Eyes are open, clearly visible, and horizontally aligned.

      Entire head and the top of shoulders must be visible.

      2. Lighting:

      Use even, diffused lighting with no harsh shadows or reflections.

      Avoid red-eye or overexposure. The skin tone must appear natural.

      3. Quality:

      High resolution, crisp image with no blurring, noise, or filters.

      No digital enhancements or cosmetic retouching on the face.

      4. Attire:

      Subject should appear in simple, dark-colored clothing (e.g., shirt or blouse) with no uniform, hat, scarf, or accessories (unless for religious or medical reasons).

      Neck and shoulder area should be subtly visible—no cropping at the neck.

      5. Realism Constraints:

      Do not alter facial structure, symmetry, skin tone, or hair.

      Do not stylize or cartoonify.

      Match natural head proportions, spacing, and placement as captured in the original photo.

      Ensure the final result looks exactly like a real studio passport photograph, as accepted by government authorities.`,
    },
    initial: 'init',
    states: {
      init: {
        invoke: {
          id: 'initUsers',
          src: 'initializeUsers',
          onDone: {
            target: 'ready',
          },
        },
        on: {
          INIT_USERS: {
            actions: [
              assign({
                ref: ({ spawn, event }) =>
                  (event.ids as []).map((id) =>
                    spawn(this.userMachine, { id, systemId: id }),
                  ),
              }),
              log(({ event }) => `${(event.ids as []).join(', ')} init`),
            ],
          },
        },
      },
      ready: {
        on: {
          USER_INIT: {
            actions: [
              assign({
                ref: ({ spawn, event }) =>
                  spawn(this.userMachine, { id: event.id }),
              }),
              log(({ event }) => `${event.id} init`),
            ],
          },
        },
      },
    },
  });

  private parsePromptWithParameters(
    prompt: string,
    parameters: State['parameters'],
  ) {
    const map: Record<string, string> = {
      backgroundColor: `- Background color: ${parameters.backgroundColor.join(' or ')}`,
      size: `- Size: ${parameters.size}`,
      headHeight: `- Head size: ${parameters.headHeight}`,
    };

    const userAddition = `7. User Customizations (must still comply with all above passport requirements):
   ${Object.keys(parameters)
     .map((e) => map[e])
     .join('\n')}

    CRITICAL: All customizations must maintain strict compliance with passport photo standards above. 
    If any user request conflicts with passport requirements, prioritize the passport specifications.`;

    return `${prompt} ${userAddition}`;
  }

  private generatePassport = fromCallback<
    EventObject,
    {
      image: Express.Multer.File;
      prompt: string;
      parameters: State['parameters'];
    }
  >(({ input, sendBack, self }) => {
    this.aiService
      .generateImageFromTextAndImage(
        input.image,
        this.parsePromptWithParameters(input.prompt, input.parameters),
      )
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
      noToGenerate: 2,
      limit: 6,
      parameters: {
        country: undefined,
        size: undefined,
        headHeight: undefined,
        eyePosition: undefined,
        backgroundColor: [],
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
            }),
          },
        },
      },
      photoUploaded: {
        on: {
          GENERATE_PHOTO: {
            target: 'generating',
            actions: assign({
              parameters: ({ event, context }) => ({
                ...context,
                ...event.parameters,
              }),
            }),
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
            }),
          },
        },
      },
      generating: {
        initial: 'generationStart',
        states: {
          generationStart: {
            entry: assign({
              limit: ({ context }) => context.limit--,
              generationRequests: ({ context, spawn, self }) => {
                const parent = self._parent;
                const prompt = parent?.getSnapshot().context.prompt as string;

                const noToGenerate =
                  context.generatedPhotos.length === 0
                    ? context.noToGenerate
                    : 2;

                const newRequests: any[] = [];
                for (let i = 0; i < noToGenerate; i++) {
                  const requestId = `req-${Date.now()}-${uniqueId()}`;
                  const requestActor = spawn('generatePassport', {
                    id: requestId,
                    input: {
                      image: context.userPhoto!,
                      prompt,
                      parameters: context.parameters,
                    },
                  });
                  newRequests.push({ id: requestId, actor: requestActor });
                }

                return [...context.generationRequests, ...newRequests];
              },
            }),
            guard: ({ context }) => {
              return context.limit !== 0;
            },
          },
          generationComplete: {
            guard: ({ context }) => {
              return context.generationRequests.length === 0;
            },
            on: {
              GENERATE_MORE: {
                actions: [
                  assign({
                    generationRequests: ({ context }) =>
                      context.generationRequests.filter((e) => !e.error),
                  }),
                ],
                target: 'generationStart',
              },
              DOWNLOAD_PHOTO: {},
            },
          },
          generationReset: {
            entry: assign({
              userPhoto: null,
              generatedPhotos: [],
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
                generationRequests: ({ context, event }) => [
                  ...context.generationRequests.filter(
                    (req) => req.id !== event.requestId,
                  ),
                  {
                    ...context.generationRequests.find(
                      (e) => e.id === event.requestId,
                    )!,
                    error: event.error,
                  },
                ],
              }),
              log(({ event }) => `Error: ${event.error}`),
            ],
            target: '.generationComplete',
          },
          STOP_GENERATION: {
            actions: assign({
              generationRequests: ({ context }) => {
                context.generationRequests.forEach((request) => {
                  request.actor.stop();
                });
                return [];
              },
            }),
            guard: ({ context }) => context.generationRequests.length !== 0,
          },
          CANCEL_GENERATION: {
            actions: assign({
              generationRequests: ({ context }) => {
                context.generationRequests.forEach((request) => {
                  request.actor.stop();
                });
                return [];
              },
              generatedPhotos: [],
            }),
            target: 'photoUploaded',
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
