import type { Request as RequestServer } from 'express';
import type { UserTokenInfo } from './user';
import type { JwtPayload } from 'jsonwebtoken';
export type { Application, Response, NextFunction } from 'express';

export type TokenData = JwtPayload & {
  user: UserTokenInfo;
};

export type RequestMetadata<T extends object, S extends string> = {
  user?: UserTokenInfo;
  operation?: 'RESET_PASSWORD' | 'AUTH';
  page?: number;
  pageSize?: number;
  // This is calculated in the middleware and can be used in the services
  pagination?: {
    skip: number;
    take: number;
  };
  search?: string;
  filters?: T;
  sort?: {
    key: S;
    order: 'ascend' | 'descend';
  }[];
};

type Request<Filter extends object, SortKey extends string> = RequestServer &
  RequestMetadata<Filter, SortKey>;
type GenericRequest = Request<{}, string>;
export { Request, GenericRequest };
