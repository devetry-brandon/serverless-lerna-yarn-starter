import {AwsSecretKey, AwsSecretName, AxiosProvider, NotFoundError, SecretsManagerService} from "asu-core";
import {injectable} from "tsyringe";
import {Agreement} from "../../models/adobe-sign/agreement";
import {Axios} from "axios";
import * as csvtojson from "csvtojson";

@injectable()
export class AdobeSignApi {
  private httpClient: Axios;

  constructor(private secretsManagerService: SecretsManagerService, private axiosProvider: AxiosProvider) {
  }

  private async getHttpClient(): Promise<Axios> {
    if (!this.httpClient) {
      const integrationKey = await this.secretsManagerService.getSecret(
          AwsSecretName.AdobeSign,
          AwsSecretKey.AdobeSignIntegrationKey
      );

      this.httpClient = this.axiosProvider.resolve({
        //@todo get Base URL from cache/secretsManager
        baseURL: 'https://api.na3.adobesign.com/api/rest/v6',
        headers: {
          Authorization: `Bearer ${integrationKey}`
        }
      });
    }

    return this.httpClient;
  }

  public async getAgreement(id: string): Promise<Agreement> {
    try {
      const httpClient = await this.getHttpClient();
      const agreementRes = await httpClient.get(`/agreements/${id}`);
      return new Agreement(agreementRes.data);
    } catch (error) {
      this.handleApiError(error, 'getAgreement');
    }
  }

  public async createAgreement(data: object): Promise<string> {
    try {
      const httpClient = await this.getHttpClient();
      const createResponse = await httpClient.post('/agreements', data);
      return createResponse.data.id;
    } catch (error) {
      this.handleApiError(error, 'createAgreement');
    }
  }

  public async getAgreementSigningUrls(id: string): Promise<string> {
    let retryCount = 0;
    try {
      const httpClient = await this.getHttpClient();
      /* istanbul ignore next */
      httpClient.interceptors.response.use(successfulRes => successfulRes, async error => {
        if (error.response.data.code === 'AGREEMENT_NOT_EXPOSED' && retryCount < 5) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await httpClient.request(error.config);
        }

        return Promise.reject(error);
      });
      const linksResponse = await httpClient.get(`/agreements/${id}/signingUrls`);
      return linksResponse.data.signingUrlSetInfos[0].signingUrls[0].esignUrl;
    } catch (error) {
      this.handleApiError(error, 'getAgreementSigningUrls');
    }
  }

  public async getAgreementFormData(id: string): Promise<{[name: string]: string}> {
    try {
      const httpClient = await this.getHttpClient();
      const result = await httpClient.get(`/agreements/${id}/formData`);
      const jsonFromCsv = await csvtojson({
        delimiter: ',',
        flatKeys: true
      }).fromString(result.data);

      return jsonFromCsv[0];
    } catch (error) {
      this.handleApiError(error, 'getAgreementFormData');
    }
  }

  public async getAgreementPdf(id: string): Promise<Buffer> {
    try {
      const httpClient = await this.getHttpClient();
      const result = await httpClient.get(`/agreements/${id}/combinedDocument`, {responseType: 'arraybuffer'});
      return result.data;
    } catch (error) {
      this.handleApiError(error, 'getAgreementFormData');
    }
  }

  private handleApiError(error: any, fromMethod: string): void {
    if (error.response) {
      console.log(`AdobeSignAPI.${fromMethod} error: ${error.response.data.code} - ${error.response.data.message}`);
      switch (error.response.data.code) {
        case 'INVALID_AGREEMENT_ID':
          throw new NotFoundError('The AdobeSign agreement ID specified is invalid');
        default:
          throw new Error('Internal server error');
      }
    } else {
      console.log(`AdobeSignAPI.${fromMethod} error: ${error.message}`);
      throw error;
    }
  }
}