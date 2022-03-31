import {Axios, AxiosError, AxiosRequestConfig, default as axios} from "axios";

export class AxiosProvider {
  public resolve(config: AxiosRequestConfig): Axios {
    return axios.create(config);
  }

  public isAxiosError(payload: any): payload is AxiosError {
    return axios.isAxiosError(payload);
  }
}