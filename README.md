# ASU Specific Notes

## Project Setup


## Adding a local package reference

``` bash
$ lerna add adobe-sign --scope=adobe-sign-controller
```

## Adding a dev dependency

In the directory of the dependent
``` bash
$ yarn add @types/aws-lambda --dev
```

## Adding a new package

**Lerna Create**

To add a new package run the following and follow the prompts. You can accept all the defaults by pressing enter for each one.

``` bash
$ lerna create some-package
```

**Create src directory**

Create a `src` directory in the root of the package directory.  This is where we will put our typescript code.  You can see this directory is referenced below in our `tsconfig.json` file.

**Add tsconfig**

We are developing in typescript, so you want to add a `tsconfig.json` file. The contents can simply be:

``` json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./lib"
  },
  "include": [
    "./src"
  ]
}
```

**Add tsc command**

We need to add a `tsc` command to the `scripts` node of the `package.json` file in the package so that lerna can compile typscript along with all other packages that have this command

``` json
...

"scripts": {
  "tsc": "tsc",
  "test": "echo \"Error: run tests from root\" && exit 1"
},

...
```

**Add typescript entry point**

Create a `some-package.ts` script in the `src` directory of the package. This script will be where we export any resources that we want to be visible to consumers of the package.

You currently don't have anything to put there so let's put a random function that exports the name of the package.

``` typescript
export function packageName(): string {
  return 'some-package';
}
```

Let's say in the future you have a service that you want to make available to consumers of this package, `AdobeSignService`.

`some-package/src/services/adobe-sign.service.ts`

``` typescript
export service AdobeService {
  public getAgreement(id: string): Agreement {
    ...
  }
}
```

You should export it from the `some-package.ts` file like so. Probably a good time to get rid of `packageName` as well.

``` typescript
export function packageName(): string {
  return 'some-package';
}

export * from "./services/adobe-sign.service";
```

**Compile**
Running the following command will generate the necessary javascript files that are needed for other packages to consume the exported memebers of your new package.

``` bash
$ lerna run tsc
```

**Add package as dependency to another package**

Run the following command, where `some-other-package` is the name of the directory of the package that you are adding the dependncy to.

``` bash
$ lerna add adobe-sign --scope=some-other-package
```

The package will now be included in the package.json of the dependent package.

``` json
...

"dependencies": {
  "some-package": "^1.0.0",
  "sample": "^0.0.1"
},

...
```

**Using exported resources**

You can now use the exported resources of your package in the dependent.

``` typescript
import { AdobeSignService } from "adobe-sign";

export async function main(event, context) {
  let service = new AdobeSignService();
  let agreement = service.getAgreement("e4bhsk1288281");

  return {
    statusCode: 200,
    body: JSON.stringify(agreement)
  };
}
```

## Adding a new lambda

If you need another lambda function that relates to others that already exist, first see if you can add a new handler to an existing lambda package.

If this is a new package all together, create a new directory in the `/lambdas` directory and add the following files:

`lambdas/new-lambda/src/handler.ts`

``` typescript
export async function main(event, context) {
  return {
    statusCode: 200,
    body: `Hello World! This is a typescript handler.`
  };
}
```

`lambdas/new-lambda/package.json`

``` json
{
  "name": "new-lambda",
  "version": "0.0.1",
  "main": "lib/handler.js",
  "license": "MIT",
  "scripts": {
    "tsc": "tsc",
    "compileTS": "lerna run tsc",
    "test": "serverless-bundle test",
    "postinstall": "yarn run compileTS"
  },
  "devDependencies": {
    "serverless-bundle": "^1.9.0"
  }
}
```

`lambdas/new-lambda/serverless.yml`

``` yaml
service: new-lambda

plugins:
  - serverless-bundle

provider:
  name: aws
  runtime: nodejs12.x
  region: us-east-1
  stage: dev

functions:
  get:
    handler: lib/handler.main
    events:
      - http: GET /
```

`lambdas/new-lambda/tsconfig.json`

``` json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./lib",
    "baseUrl": "."
  },
  "include": [
      "./src"
  ]
}
```

**Build and compile**

Run `yarn` in the `new-lambda` directory to install any dependencies and compile typescript files.

``` bash
$ yarn
```

**Test lambda locally**

``` bash
$ serverless invoke local -f get --data '{ "queryStringParameters": {"id":"P50WXIl6PUlonrSH"}}'
```