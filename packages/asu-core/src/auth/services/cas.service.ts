import {singleton} from "tsyringe";
import {AxiosProvider} from "../../http/providers/axios.provider";
import {Axios} from "axios";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {UnauthenticatedError} from "../../errors/unauthenticated.error";
import {lambdaRedirect} from "../../aws/lambda/response-handler";
import {lambdaHandleError} from "../../aws/lambda/error-handler";
import {EnvironmentVariable} from "../../enums/environment-variable";

const CAS_HOST = 'https://weblogin.asu.edu/cas';

@singleton()
export class CasService {
  private httpClient: Axios;
  private authUser: string;

  constructor(private axiosProvider: AxiosProvider) {
  }

  private async getHttpClient(): Promise<Axios> {
    if (!this.httpClient) {
      this.httpClient = this.axiosProvider.resolve({
        baseURL: CAS_HOST
      });
    }

    return this.httpClient;
  }

  public async authenticate(event: APIGatewayProxyEvent, callback: ()=>Promise<APIGatewayProxyResult>): Promise<APIGatewayProxyResult> {
    // Bypass auth on dev
    if (process.env[EnvironmentVariable.Stage] === 'dev') {
      if (event.queryStringParameters && event.queryStringParameters.skip_auth === 'y') {
        this.authUser = 'skipped_auth';
        return await callback();
      }
    }

    try {
      //@todo get app host from env
      const serviceUrl = 'https://localhost.asu.edu' + event.path;
      if (!event.queryStringParameters || !event.queryStringParameters.ticket) {
        return lambdaRedirect(`${CAS_HOST}/login?service=${serviceUrl}`);
      }

      const httpClient = await this.getHttpClient();
      const authResponse = await httpClient.get('/serviceValidate', {
        params: {
          format: 'JSON',
          service: serviceUrl,
          ticket: event.queryStringParameters.ticket
        }
      });

      const {authenticationSuccess, authenticationFailure} = authResponse.data.serviceResponse;

      if (authenticationSuccess) {
        this.authUser = authenticationSuccess.user;
        return await callback();
      }

      console.log(`CasService.authenticate error: ${authenticationFailure.code} - ${authenticationFailure.description}`);
      return lambdaHandleError(new UnauthenticatedError('Authentication request failed'));
    } catch (error) {
      return lambdaHandleError(error);
    }
  }

  public async getCasUser(): Promise<string> {
    if (!this.authUser) {
      throw new UnauthenticatedError('No authenticated user is set in CAS Service');
    }

    return this.authUser;
  }

}