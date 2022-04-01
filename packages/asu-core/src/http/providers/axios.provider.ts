import {Axios, AxiosRequestConfig, default as axios} from "axios";

export class AxiosProvider {
  public resolve(config: AxiosRequestConfig): Axios {
    return axios.create(config);
  }
}