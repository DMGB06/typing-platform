import { PaginationDto } from '../../common/pagination.dto';
import { TypingSessionsController } from './typing-sessions.controller';
import { TypingSessionsService } from './typing-sessions.service';

describe('TypingSessionsController', () => {
  const service = {
    start: jest.fn(),
    create: jest.fn(),
    findMyRecent: jest.fn(),
    findByText: jest.fn(),
    findById: jest.fn(),
  };
  const controller = new TypingSessionsController(
    service as unknown as TypingSessionsService,
  );

  it('passes the authenticated owner to start and finalize', () => {
    const start = { textId: 3 };
    const finish = { attemptId: 'attempt', events: ['a'] };
    void controller.start(2, start);
    void controller.create(2, finish);
    expect(service.start).toHaveBeenCalledWith(2, start);
    expect(service.create).toHaveBeenCalledWith(2, finish);
  });

  it('passes the authenticated owner and page to history', () => {
    const pagination = new PaginationDto();
    void controller.getMySessions(2);
    void controller.getByText(2, 3, pagination);
    void controller.getOne(2, 4);
    expect(service.findMyRecent).toHaveBeenCalledWith(2);
    expect(service.findByText).toHaveBeenCalledWith(3, 2, pagination);
    expect(service.findById).toHaveBeenCalledWith(2, 4);
  });
});
