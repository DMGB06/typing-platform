import {
  Controller,
  Post,
  Get,
  Header,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TypingSessionsService } from './typing-sessions.service';
import { JwtAuthGuard } from '../auth/guards/wt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/pagination.dto';
import {
  CreateTypingSessionDto,
  StartTypingSessionDto,
} from './dto/typing.dto';

@Controller('typing-sessions')
@UseGuards(JwtAuthGuard)
export class TypingSessionsController {
  constructor(private readonly typingSessionsService: TypingSessionsService) {}

  @Post('start')
  @Header('Cache-Control', 'private, no-store')
  start(@CurrentUser('id') userId: number, @Body() dto: StartTypingSessionDto) {
    return this.typingSessionsService.start(userId, dto);
  }

  @Post()
  @Header('Cache-Control', 'private, no-store')
  create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateTypingSessionDto,
  ) {
    return this.typingSessionsService.create(userId, dto);
  }

  // GET /typing-sessions
  @Get()
  @Header('Cache-Control', 'private, no-store')
  getMySessions(@CurrentUser('id') userId: number) {
    return this.typingSessionsService.findMyRecent(userId);
  }

  // GET /typing-sessions/text/:textId  ← debe ir ANTES de /:id para no colisionar
  @Get('text/:textId')
  @Header('Cache-Control', 'private, no-store')
  getByText(
    @CurrentUser('id') userId: number,
    @Param('textId', ParseIntPipe) textId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.typingSessionsService.findByText(textId, userId, pagination);
  }

  // GET /typing-sessions/:id
  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  getOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.typingSessionsService.findById(userId, id);
  }
}
