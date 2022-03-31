# ASU Specific Notes

## Project Setup

### Dependencies

**Node**

Install Node version 14, or install [Node Version Manager](https://github.com/nvm-sh/nvm) and use version 14 for installing project dependencies.

Having trouble with npm after installing nvm? Do you have a new Apple M1 chip? You may need to update `install-rosetta`. [For reference](https://apple.stackexchange.com/questions/408375/zsh-bad-cpu-type-in-executable).

``` bash
softwareupdate --install-rosetta
```

**Serverless**

Use npm to install serverless globally.

``` bash
$ npm install -g serverless
```

**Repo**

Clone [this repo](https://github.com/devetry-brandon/serverless-lerna-yarn-starter.git) to a local directory.

Move to that directory and install dependencies with yarn.

``` bash
$ yarn
```

Run test to make sure project is setup correctly:

``` bash
$ cd lambdas/adobe-sign-api
$ serverless invoke local -f getTemplate --data '{ "pathParameters": {"id":"1be3f61a-e9fe-4247-9463-98856a6bf6ad"}}' --region us-west-2
$ serverless invoke local -f createTemplate --data '{ "body": "{\"name\":\"test\", \"adobeSignId\": \"asdf\", \"formDataMappings\": [{\"source\":\"UserInfo\", \"sourceField\":\"firstName\", \"targetField\":\"First.Name\", \"defaultValue\":\"Brandon\"}]}"}' --region us-west-2
```

You should see the following output, or similar:

``` bash
Debugger attached.
WARNING: More than one matching handlers found for 'lib/agreements-controller'. Using 'lib/agreements-controller.js'.
Bundling with Webpack...
{
    "statusCode": 200,
    "body": "{\"id\":\"P50WXIl6PUlonrSH\"}"
}
```

## Deploying
Navigate to a directory with a serverless.yml file and run the following command.

``` bash
$ serverless deploy --stage dev --region us-west-2
```

## Testing

We are using jest to run our unit tests.  It is configured in the top level directory, so you need to run the following command from the top level project directory to run tests:

``` bash
$ yarn test
```

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

**Add tsyringe dependency**
This is used for dependency injection.

``` json
"dependencies": {
  "tsyringe": "^4.6.0"
}
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

**Change directory**

``` bash
$ cd packages/some-package
```

**Install Dependencies**

``` bash
$ yarn
```

**Compile**
Running the following command will generate the necessary javascript files that are needed for other packages to consume the exported memebers of your new package.

``` bash
$ yarn tsc
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

## Database Migrations

We use npm package `db-migrate` to deploy changes to our various databases.

### Create migration

Use this command to generate a migration script in `../packages/adobe-sign/migrations`.

``` bash
$ cd packages/adobe-sign
$ yarn run db-migrate create migration-name
```

You can now fill that migration with the changes that you want to execute against the databse.

``` javascript
exports.up = function(db) {
  return db.createTable('templates', {
    columns: {
      id: {
        type: 'int',
        notNull: true,
        length: 11,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: 'string',
        notNull: true,
        length: 255
      },
      adobeSignId: {
        type: 'string',
        notNull: true,
        length: 50
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable('templates');
};
```

### Apply migrations

Set environment variables

``` bash
$ set -a
$ source .env
```

This will apply all migrations that have not yet been run.  Status is tracked in the target database.

``` bash
# default env is `dev`
$ yarn run db-migrate up
# Or pass env explicitly
$ yarn run db-migrate up -e dev
```

