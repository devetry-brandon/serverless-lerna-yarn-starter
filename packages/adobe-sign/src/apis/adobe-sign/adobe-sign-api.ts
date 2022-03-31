import {AwsSecretKey, AwsSecretName, AxiosProvider, SecretsManagerService} from "asu-core";
import { injectable } from "tsyringe";
import { Agreement } from "./models/agreement";
import {Axios} from "axios";
import {AdobeApiError} from "../errors/adobe-api-error";

@injectable()
export class AdobeSignApi {
    private httpClient: Axios;
    constructor(private secretsManagerService: SecretsManagerService, private axiosProvider: AxiosProvider) {}

    private async getHttpClient(): Promise<Axios> {
        if (!this.httpClient) {
            try {
                const integrationKey = await this.secretsManagerService.getSecret(
                    AwsSecretName.AdobeSign,
                    AwsSecretKey.AdobeSignIntegrationKey
                );

                this.httpClient = this.axiosProvider.resolve({
                    //@todo get Base URL from cache/secretsManager
                    baseURL: 'https://api.na3.adobesign.com/api/rest/v6',
                    headers: {
                        Authorization : `Bearer ${integrationKey}`
                    }
                });
            } catch (error) {
                throw new Error('Could not initialize AdobeSign HTTP client. ' + error.message);
            }
        }

        return this.httpClient;
    }

    public async getAgreement(id: string): Promise<Agreement> {
        try {
            const httpClient = await this.getHttpClient();
            const agreementRes = await httpClient.get(`/agreements/${id}`);
            return new Agreement(agreementRes.data);
        } catch (error) {
            this.handleErrors(error);
        }
    }

    public async createAgreement(data: object): Promise<string> {
        try {
            const httpClient = await this.getHttpClient();
            const createResponse = await httpClient.post('/agreements', data)
            return createResponse.data.id;
        } catch (error) {
            this.handleErrors(error);
        }
    }

    public async getAgreementSigningUrls(id: string): Promise<string> {
        let retryCount = 0;
        try {
            const httpClient = await this.getHttpClient();
            httpClient.interceptors.response.use(successfulRes => successfulRes, async error => {
                if (error.response.data.code === 'AGREEMENT_NOT_EXPOSED' && retryCount < 3) {
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return await httpClient.request(error.config);
                }

                return Promise.reject(error);
            });
            const linksResponse = await httpClient.get(`/agreements/${id}/signingUrls`);
            return linksResponse.data.signingUrlSetInfos[0].signingUrls[0].esignUrl;
        } catch (error) {
            this.handleErrors(error);
        }
    }

    private handleErrors(error: any): AdobeSignApi {
        let message;
        if (error.response) {
            message = error.response.data.code + " - " + error.response.data.message;
        } else {
            message = error.message;
        }

        console.log('AdobeSignAPI error: ' + message);
        throw new AdobeApiError(500, message);
    }
}