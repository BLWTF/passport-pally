/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { uniqueId } from 'lodash';
import AiService from 'src/ai/ai.service';
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
  constructor(private readonly aiService: AiService) {
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
    id: 'main',
    context: {
      prompt: `Create a realistic, studio-quality passport photograph using the provided face. Use the following exact specifications and constraints:

      1. Composition & Layout:

      The subject’s face must be centered and occupy 70–80% of the photo height.

      Head is facing forward with a neutral expression and closed mouth.

      Eyes are open, clearly visible, and horizontally aligned.

      Entire head and the top of shoulders must be visible.

      2. Background:

      Use a plain, uniform white or very light gray background.

      Ensure no patterns, shadows, textures, or objects are present.

      3. Lighting:

      Use even, diffused lighting with no harsh shadows or reflections.

      Avoid red-eye or overexposure. The skin tone must appear natural.

      4. Quality:

      High resolution, crisp image with no blurring, noise, or filters.

      No digital enhancements or cosmetic retouching on the face.

      5. Attire:

      Subject should appear in simple, dark-colored clothing (e.g., shirt or blouse) with no uniform, hat, scarf, or accessories (unless for religious or medical reasons).

      Neck and shoulder area should be subtly visible—no cropping at the neck.

      6. Realism Constraints:

      Do not alter facial structure, symmetry, skin tone, or hair.

      Do not stylize or cartoonify.

      Match natural head proportions, spacing, and placement as captured in the original photo.

      Ensure the final result looks exactly like a real studio passport photograph, as accepted by government authorities.

      7. Output Format:

      Portrait orientation, 35mm x 45mm framing.

      Head positioned at 32–36mm from chin to crown.

      Neutral white balance and flat lighting for consistent tone.

      Final image must be indistinguishable from a real photograph taken in a passport photo studio.`,
    },
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
    { image: Express.Multer.File; prompt: string }
  >(({ input, sendBack, self }) => {
    this.aiService
      .generateImageFromTextAndImage(input.image, input.prompt)
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
        noToGenerate: 3,
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
              error: null,
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
              generationRequests: ({ context, spawn, self }) => {
                const parent = self._parent;
                const prompt = parent?.getSnapshot().context.prompt as string;

                const newRequests: any[] = [];
                for (
                  let i = 0;
                  i < (context.parameters?.noToGenerate ?? 3);
                  i++
                ) {
                  const requestId = `req-${Date.now()}-${uniqueId()}`;
                  const requestActor = spawn('generatePassport', {
                    id: requestId,
                    input: { image: context.userPhoto!, prompt },
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
