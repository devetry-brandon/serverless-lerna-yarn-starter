import { Pool } from "mysql2";

export function getMockDB(): jest.Mocked<Pool> {
  return {
    execute: jest.fn()
  } as unknown as jest.Mocked<Pool>;
}