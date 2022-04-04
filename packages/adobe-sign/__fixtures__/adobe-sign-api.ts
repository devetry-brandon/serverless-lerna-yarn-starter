import {FormDataMappingSource} from "../src/enums/form-data-mapping-source";
import {AgreementStatus} from "../src/enums/agreement-status";

export const mockAgreementId = "CBJCHBCAABAAN24SWUnGHW-o_NaT5i3O5lKuHiccQ2GP";
export const mockTemplateId = "CBJCHBCAABAAA7v8YWZkc2LRy8nh4m_p5C_XFmZkw4tO";
export const mockAsuUserId = 'testuser';
export const mockSigningUrl = "https://secure.na3.adobesign.com/public/apiesign?pid=CBFCIBAA3AAABLblqZhD";
export const mockUserData = {
  id: mockAsuUserId,
  email: "fake.user@deptagency.com",
  firstName: 'Fake',
  lastName: 'User',
  customField: 'test'
}

export const mockTemplateData = {
  id: '123-abc-456-def',
  name: 'Agreement Title',
  adobeSignId: mockTemplateId,
  formDataMappings: [
      {
        source: FormDataMappingSource.UserInfo,
        sourceField: 'firstName',
        targetField: 'First.Name',
        defaultValue: '',
      },
      {
        source: FormDataMappingSource.UserInfo,
        sourceField: 'lastName',
        targetField: 'Last.Name',
        defaultValue: '',
      }
  ]
}

export const mockAgreementCreationData = {
  "fileInfos": [
    {
      "libraryDocumentId": mockTemplateId
    }
  ],
  "name": "Agreement Title",
  "participantSetsInfo": [
    {
      "memberInfos": [
        {
          "email": "fake.user@deptagency.com",
          "name": "Fake User"
        }
      ],
      "order": 1,
      "role": "SIGNER"
    }
  ],
  "mergeFieldInfo": [
    {
      "fieldName": "First.Name",
      "defaultValue": "Fake"
    },
    {
      "fieldName": "Last.Name",
      "defaultValue": "User"
    }
  ],
  "emailOption": {
    "sendOptions": {
      "completionEmails": "NONE",
      "inFlightEmails": "NONE",
      "initEmails": "NONE"
    }
  },
  "signatureType": "ESIGN",
  "state": "IN_PROCESS",
  "status": "OUT_FOR_SIGNATURE"
}

export const mockAsuAgreementData = {
  id: undefined,
  adobeSignId: mockAgreementId,
  adobeSignTemplateId: mockTemplateId,
  asuriteId: mockAsuUserId,
  status: AgreementStatus.InProgress
}