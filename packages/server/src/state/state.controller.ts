/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import StateService from './state.service';
import { Response } from 'express';
import { UserState } from 'src/types/users';

@Controller()
export default class StateController {
  constructor(private readonly stateService: StateService) {}

  @Get('/state')
  userState(@Req() req: any, @Res() res: Response) {
    const userActor = this.stateService.activeUser(req.user.sub);
    console.log('state', userActor.getSnapshot().value);
    const state = userActor.getSnapshot().context as UserState;
    const statePreview = {
      ...state,
      // userPhoto: state.userPhoto !== null ? 'preview' : null,
      generatedPhotos: state.generatedPhotos.map((e) => ({
        id: e.id,
        data: 'preview',
      })),
    };

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    res.write('retry: 10000\n\n');

    res.write(`data: ${JSON.stringify(statePreview)}\n\n`);
    res.write(`data: ${JSON.stringify(state)}\n\n`);

    const subscription = userActor.subscribe((state) => {
      const userState = state.context as UserState;
      console.log('state', state.value);
      const userStatePreview = {
        ...userState,
        // userPhoto: userState.userPhoto !== null ? 'preview' : null,
        generatedPhotos: userState.generatedPhotos.map((e) => ({
          id: e.id,
          data: 'preview',
        })),
      };
      res.write(`data: ${JSON.stringify(userStatePreview)}\n\n`);
      res.write(`data: ${JSON.stringify(userState)}\n\n`);
    });

    res.on('close', () => {
      subscription.unsubscribe();
      res.end();
    });
  }

  @Get('/state/preview')
  userStatePreview(@Req() req: any) {
    const userActor = this.stateService.activeUser(req.user.sub);
    const userState = userActor.getSnapshot().context;
    const state = {
      ...userState,
      userPhoto: userState.userPhoto !== null ? 'preview' : null,
      generatedPhotos: userState.generatedPhotos.map((e) => ({
        id: e.id,
        data: 'preview',
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return state;
  }

  @Get('/generate')
  generate(@Req() req: any) {
    this.stateService.activeUser(req.user.sub).send({ type: 'GENERATE_PHOTO' });
    return {};
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    this.stateService
      .activeUser(req.user.sub)
      .send({ type: 'UPLOAD_PHOTO', photo: file });

    return {};
  }
}
