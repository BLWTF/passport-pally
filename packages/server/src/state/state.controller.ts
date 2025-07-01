/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Post,
  Req,
  Res,
  Sse,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import StateService from './state.service';
import { parseAdminState, parseStateValue } from 'src/helpers';
import { State, UserState } from 'src/types/users';
import { Observable, from, map } from 'rxjs';
import AdminGuard from 'src/auth/admin.guard';
import { Response } from 'express';

@Controller()
export default class StateController {
  constructor(private readonly stateService: StateService) {}

  @Sse('/state')
  sse(@Req() req: any): Observable<MessageEvent> {
    const userActor = this.stateService.activeUser(req.user.sub);

    return from(userActor).pipe(
      map((state) => {
        const userState = {
          ...state.context,
          userPhoto: state.context.userPhoto?.originalname ?? null,
          value: parseStateValue(state.value),
        };

        return { id: new Date().getTime().toString(), data: userState };
      }),
    );
  }

  // @Sse('/admin/state')
  // @UseGuards(new AdminGuard())
  // adminSse(): Observable<MessageEvent> {
  //   return from(this.stateService.appActor).pipe(
  //     map((state) => {
  //       return { id: new Date().getTime().toString(), data: state };
  //     }),
  //   );
  // }

  @Get('/admin/state')
  @UseGuards(new AdminGuard())
  userState(@Res() res: Response) {
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    res.write('retry: 10000\n\n');

    res.write(
      `data: ${JSON.stringify(parseAdminState(this.stateService.appActor.getSnapshot()))}\n\n`,
    );

    const subscription = this.stateService.appActor.subscribe((state) => {
      res.write(`data: ${JSON.stringify(parseAdminState(state))}\n\n`);
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
      value: parseStateValue(userActor.getSnapshot().value),
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

  @Post('/generate')
  generate(@Req() req: any, @Body() body: State['parameters']) {
    this.stateService
      .activeUser(req.user.sub)
      .send({ type: 'GENERATE_PHOTO', parameters: body });
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

  @Get('/reset-user-photo')
  reset(@Req() req: any) {
    this.stateService.activeUser(req.user.sub).send({ type: 'RESET' });
    return {};
  }

  @Get('/generate-more')
  generateMore(@Req() req: any) {
    this.stateService.activeUser(req.user.sub).send({ type: 'GENERATE_MORE' });
    return {};
  }

  @Get('/cancel-generation')
  cancelGeneration(@Req() req: any) {
    this.stateService
      .activeUser(req.user.sub)
      .send({ type: 'CANCEL_GENERATION' });
    return {};
  }
}
