import { BadRequestException } from '@nestjs/common';
import { typingEventPattern } from './dto/typing.dto';

export function replayTyping(
  content: string,
  events: string[],
  elapsedMilliseconds: number,
) {
  const target = Array.from(content.replace(/\r\n?/g, '\n'));
  if (events.length > target.length * 10) {
    throw new BadRequestException('Demasiados eventos de tecleo');
  }

  const input: string[] = [];
  const errors: { wrongWord: string; correctWord: string; position: number }[] =
    [];
  let insertions = 0;
  for (const event of events) {
    if (input.length === target.length || !typingEventPattern.test(event)) {
      throw new BadRequestException('Secuencia de tecleo inválida');
    }

    if (event === 'Backspace') {
      if (input.length === 0) {
        throw new BadRequestException('Retroceso sin un carácter previo');
      }
      input.pop();
      continue;
    }

    const position = input.length;
    const correctWord = target[position];
    if (event !== correctWord)
      errors.push({ wrongWord: event, correctWord, position });
    input.push(event);
    insertions++;
  }

  if (input.length !== target.length || insertions === 0) {
    throw new BadRequestException('El texto está incompleto');
  }

  const elapsedSeconds = Math.max(1, elapsedMilliseconds / 1000);
  const correct = input.filter(
    (char, position) => char === target[position],
  ).length;
  const accuracy = ((insertions - errors.length) / insertions) * 100;
  return {
    wpm: Math.round((correct / 5) * (60 / elapsedSeconds)),
    accuracy,
    errorRate: 100 - accuracy,
    timeSeconds: Math.ceil(elapsedSeconds),
    errors,
  };
}
