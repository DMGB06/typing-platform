import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TypingSessionsService } from './typing-sessions.service';
import { JwtAuthGuard } from '../auth/guards/wt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTypingSessionDto } from './dto/typing.dto';

@Controller('typing-sessions')
@UseGuards(JwtAuthGuard)
export class TypingSessionsController {
  constructor(private readonly typingSessionsService: TypingSessionsService) {}

  // POST /typing-sessions
  @Post()
  create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateTypingSessionDto,
  ) {
    return this.typingSessionsService.create(userId, dto);
  }

  // GET /typing-sessions
  @Get()
  getMySessions(@CurrentUser('id') userId: number) {
    return this.typingSessionsService.findMyRecent(userId);
  }

  // GET /typing-sessions/text/:textId  ← debe ir ANTES de /:id para no colisionar
  @Get('text/:textId')
  getByText(
    @CurrentUser('id') userId: number,
    @Param('textId', ParseIntPipe) textId: number,
  ) {
    return this.typingSessionsService.findByText(textId, userId);
  }

  // GET /typing-sessions/:id
  @Get(':id')
  getOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.typingSessionsService.findById(userId, id);
  }
}
