import {
  Controller,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../common/public.decorator';

@Controller('sse')
export class SseController {
  constructor(
    private sseService: SseService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Sse('board/:id')
  streamBoard(
    @Param('id') id: string,
    @Query('token') token: string,
  ): Observable<MessageEvent> {
    try {
      this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return this.sseService.getObservable(Number(id));
  }
}
