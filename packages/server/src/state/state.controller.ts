/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { parseState } from 'src/helpers';
import { UserState } from 'src/types/users';

@Controller()
export default class StateController {
  constructor(private readonly stateService: StateService) {}

  @Get('/state')
  userState(@Req() req: any, @Res() res: Response) {
    const userActor = this.stateService.activeUser(req.user.sub);
    const userState = userActor.getSnapshot();

    const state: UserState = {
      ...userState.context,
      userPhoto: userState.context.userPhoto?.originalname ?? null,
      value: parseState(userState.value),
    };

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    res.write('retry: 10000\n\n');

    res.write(`data: ${JSON.stringify(state)}\n\n`);

    const subscription = userActor.subscribe((state) => {
      const userState = {
        ...state.context,
        userPhoto: state.context.userPhoto?.originalname ?? null,
        value: parseState(state.value),
      };

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
    const userState: UserState = {
      ...userActor.getSnapshot().context,
      value: parseState(userActor.getSnapshot().value),
    };
    const userStatePreview = {
      ...userState,
      userPhoto: userState.userPhoto?.originalname ?? null,
      generatedPhotos: userState.generatedPhotos.map((e) => ({
        id: e.id,
        data: 'preview',
      })),
    };

    return userStatePreview;
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
