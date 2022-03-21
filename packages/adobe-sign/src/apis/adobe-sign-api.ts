import {AwsSecretKey, AwsSecretName, AxiosProvider, SecretsManagerService} from "asu-core";
import { injectable } from "tsyringe";
import { Agreement } from "../models/agreement";
import {Axios, AxiosError} from "axios";
import {ApiError} from "./errors/api-error";
import {AdobeApiError} from "./errors/adobe-api-error";
import {InternalApiError} from "./errors/internal-api-error";

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
            } catch ( err ) {
                throw new InternalApiError('Could not initialize AdobeSign HTTP client. ' + err.message);
            }
        }

        return this.httpClient;
    }

    public async getAgreement(id: string): Promise<Agreement> {
        try {
            const httpClient = await this.getHttpClient();
            const agreementRes = await httpClient.get(`/agreements/${id}`);
            return new Agreement(agreementRes.data);
        } catch ( err ) {
            AdobeSignApi.handleAdobeApiErrors(err);
        }
    }

    private static handleAdobeApiErrors(error: ApiError|AxiosError) {
        if (error instanceof ApiError) {
            // If already an ApiError (e.g. InternalApiError), forward error
            throw error;
        }

        throw new AdobeApiError(error.response.status, error.response.data.message)
    }
}