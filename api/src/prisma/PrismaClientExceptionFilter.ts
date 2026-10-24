import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const RESPONSE_BY_CODE: Record<string, { statusCode: HttpStatus; message: string }> = {
  P2002: { statusCode: HttpStatus.CONFLICT, message: 'A record with these values already exists' },
  P2003: { statusCode: HttpStatus.BAD_REQUEST, message: 'Related record does not exist' },
  P2023: { statusCode: HttpStatus.BAD_REQUEST, message: 'Malformed identifier' },
  P2025: { statusCode: HttpStatus.NOT_FOUND, message: 'Record not found' },
};

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const mapped =
      exception instanceof Prisma.PrismaClientKnownRequestError ? RESPONSE_BY_CODE[exception.code] : undefined;

    if (!mapped) {
      this.logger.error(`Unhandled Prisma exception on ${request.url}`, exception);
    }

    const statusCode = mapped ? mapped.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(statusCode).json({
      statusCode,
      message: mapped ? mapped.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
