import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { graphql } from './formats/graphql';

@Injectable()
export class GraphqlLoggingInterceptor implements NestInterceptor {
  private logger = new Logger(GraphqlLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req?.url || req?.url !== '/graphql') return next.handle();
    const ctx = GqlExecutionContext.create(context);

    return next.handle().pipe(
      tap(data => {
        this.logger.log({
          data,
          duration: 0,
          graphql: graphql(ctx),
          message: 'Access Log',
        });
      }),
    );
  }
}