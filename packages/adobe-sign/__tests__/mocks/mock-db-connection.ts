import { Pool } from "mysql2/promise";

export function getMockDB(): jest.Mocked<Pool> {
  return {
    query: jest.fn()
  } as unknown as jest.Mocked<Pool>;
}