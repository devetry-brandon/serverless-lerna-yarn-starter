export const mockAgreementId = "CBJCHBCAABAAN24SWUnGHW-o_NaT5i3O5lKuHiccQ2GP";
export const mockTemplateId = "CBJCHBCAABAAA7v8YWZkc2LRy8nh4m_p5C_XFmZkw4tO";
export const mockAsuUserId = 'testuser';
export const mockSigningUrl = "https://secure.na3.adobesign.com/public/apiesign?pid=CBFCIBAA3AAABLblqZhD";
export const mockUserData = {
  id: mockAsuUserId,
  email: "fake.user@deptagency.com",
  firstName: 'Fake',
  lastName: 'User',
}

export const mockTemplateData = {
  id: mockTemplateId,
  title: 'Agreement Title',
  options: {
    silenceEmails: true
  },
  mappings: [
    {
      source: 'ods',
      sourceField: 'firstName',
      targetField: 'First.Name',
      defaultValue: '',
    },
    {
      source: 'ods',
      sourceField: 'lastName',
      targetField: 'Last.Name',
      defaultValue: '',
    },
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