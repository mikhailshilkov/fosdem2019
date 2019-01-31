import * as aws from "@pulumi/aws";
import { Lambda } from "./lambda";
import { Endpoint } from "./api";

// A DynamoDB table with a single primary key
const counterTable = new aws.dynamodb.Table("urls", {
    attributes: [
        { name: "name", type: "S" },
    ],
    hashKey: "name",
    readCapacity: 1,
    writeCapacity: 1
});

// Lambda Function
const func = new Lambda("mylambda", {
    path: "./app",
    file: "read",
    environment: { 
       "COUNTER_TABLE": counterTable.name
    },
});

// API Gateway Rest API
const api = new Endpoint("myapi", {
    path: "/{proxy+}",
    lambda: func.lambda
});

// Export the https endpoint of the running Rest API
export let endpoint = api.invokeUrl;
